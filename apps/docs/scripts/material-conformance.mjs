import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import {
  buildApiReferenceModel,
  defaultRepositoryRoot,
} from './api-reference.mjs';
import {
  CONFORMANCE_DIMENSIONS,
  materialConformanceRegistry,
} from './interaction-utilities-conformance-registry.mjs';

const PROVENANCE_REGISTRIES = [
  ['apps/docs/src/componentDocs.ts', 'componentDocs'],
  ['apps/docs/src/smallPrimitiveDocs.ts', 'smallPrimitiveDocs'],
  ['apps/docs/src/appBarToolbarDocs.ts', 'appBarToolbarDocs'],
  ['apps/docs/src/actionOverflowDocs.ts', 'actionOverflowDocs'],
];

function normalizePath(value) {
  return value.replaceAll('\\', '/');
}

function propertyNameText(name) {
  if (!name) return null;
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text;
  }
  return null;
}

function unwrapObjectLiteral(expression) {
  let current = expression;
  while (
    current &&
    (ts.isAsExpression(current) ||
      ts.isSatisfiesExpression(current) ||
      ts.isParenthesizedExpression(current) ||
      ts.isTypeAssertionExpression(current))
  ) {
    current = current.expression;
  }
  return current && ts.isObjectLiteralExpression(current) ? current : null;
}

function topLevelObjectKeys(sourceText, fileName, variableName) {
  const sourceFile = ts.createSourceFile(
    fileName,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.name.text !== variableName) continue;
      const objectLiteral = declaration.initializer
        ? unwrapObjectLiteral(declaration.initializer)
        : null;
      if (!objectLiteral) {
        throw new Error(`${fileName}: ${variableName} must resolve to an object literal`);
      }
      return objectLiteral.properties
        .map((property) => {
          if (ts.isPropertyAssignment(property) || ts.isMethodDeclaration(property)) {
            return propertyNameText(property.name);
          }
          if (ts.isShorthandPropertyAssignment(property)) return property.name.text;
          return null;
        })
        .filter(Boolean);
    }
  }

  throw new Error(`${fileName}: unable to find ${variableName} object literal`);
}

export function loadComponentProvenanceIds(repoRoot = defaultRepositoryRoot()) {
  const ids = new Set();
  for (const [relativePath, variableName] of PROVENANCE_REGISTRIES) {
    const sourceText = readFileSync(resolve(repoRoot, relativePath), 'utf8');
    for (const id of topLevelObjectKeys(sourceText, relativePath, variableName)) ids.add(id);
  }
  return ids;
}

function matchesSource(entry, classifier) {
  const sourcePath = normalizePath(entry?.source?.path ?? '');
  return classifier.sourcePrefixes.some((prefix) => sourcePath.startsWith(prefix));
}

function evidencePaths(value) {
  return Array.isArray(value?.evidence) ? value.evidence : [];
}

function validateEvidencePaths({ paths, label, pathExists, errors }) {
  for (const evidencePath of paths) {
    if (typeof evidencePath !== 'string' || evidencePath.trim() === '') {
      errors.push(`${label}: evidence paths must be non-empty repository-relative strings`);
    } else if (!pathExists(evidencePath)) {
      errors.push(`${label}: evidence path does not exist: ${evidencePath}`);
    }
  }
}

function validateDimensions({ family, pathExists, errors }) {
  const dimensions = family.dimensions ?? {};
  for (const dimension of CONFORMANCE_DIMENSIONS) {
    if (!(dimension in dimensions)) errors.push(`${family.id}: missing conformance dimension "${dimension}"`);
  }
  for (const dimension of Object.keys(dimensions)) {
    if (!CONFORMANCE_DIMENSIONS.includes(dimension)) {
      errors.push(`${family.id}: unknown conformance dimension "${dimension}"`);
    }
  }

  for (const dimension of CONFORMANCE_DIMENSIONS) {
    const contract = dimensions[dimension];
    if (!contract) continue;
    const label = `${family.id}.${dimension}`;
    const status = contract.status;
    const paths = evidencePaths(contract);

    if (!['required', 'adapted', 'not-applicable'].includes(status)) {
      errors.push(`${label}: invalid status "${String(status)}"`);
      continue;
    }
    if (status === 'required') {
      const hasGap = Number.isInteger(contract.gapIssue) && contract.gapIssue > 0;
      if (paths.length === 0 && !hasGap) {
        errors.push(`${label}: required dimensions need automated evidence or a tracked gapIssue`);
      }
    }
    if (status === 'adapted') {
      if (typeof contract.reason !== 'string' || contract.reason.trim() === '') {
        errors.push(`${label}: adapted dimensions need a documented adaptation reason`);
      }
      if (paths.length === 0) {
        errors.push(`${label}: adapted dimensions need automated/provenance evidence`);
      }
    }
    if (
      status === 'not-applicable' &&
      (typeof contract.reason !== 'string' || contract.reason.trim() === '')
    ) {
      errors.push(`${label}: not-applicable dimensions need a documented reason`);
    }
    validateEvidencePaths({ paths, label, pathExists, errors });
  }
}

function validateProvenance({ family, componentProvenanceIds, pathExists, errors }) {
  const provenance = family.provenance;
  if (!provenance || typeof provenance !== 'object') {
    errors.push(`${family.id}: missing authoritative/audited provenance`);
    return;
  }
  if (provenance.kind === 'component-docs') {
    if (!componentProvenanceIds.has(provenance.id)) {
      errors.push(
        `${family.id}: component docs provenance id "${String(provenance.id)}" is not present in allComponentDocs registries`,
      );
    }
    return;
  }
  if (provenance.kind !== 'direct') {
    errors.push(`${family.id}: unsupported provenance kind "${String(provenance.kind)}"`);
    return;
  }
  if (typeof provenance.family !== 'string' || provenance.family.trim() === '') {
    errors.push(`${family.id}: direct provenance needs a family label`);
  }
  if (
    (typeof provenance.materialUrl !== 'string' || provenance.materialUrl.trim() === '') &&
    (typeof provenance.contractLabel !== 'string' || provenance.contractLabel.trim() === '')
  ) {
    errors.push(`${family.id}: direct provenance needs a Material URL or audited contract label`);
  }
  const paths = evidencePaths(provenance);
  if (paths.length === 0) errors.push(`${family.id}: direct provenance needs repository evidence`);
  validateEvidencePaths({ paths, label: `${family.id}.provenance`, pathExists, errors });
}

function classifyExport(entry, classifiers) {
  return classifiers.filter((classifier) => matchesSource(entry, classifier));
}

function symbolRecord(name, entry) {
  return { name, kind: entry.kind, source: entry.source };
}

/**
 * Validate a registry against API models produced by api-reference.mjs.
 * Public symbol names are deliberately derived here instead of being copied
 * into material-conformance-registry.mjs.
 */
export function validateMaterialConformance({
  rootModel,
  layoutModel,
  registry = materialConformanceRegistry,
  componentProvenanceIds = new Set(),
  pathExists = () => true,
}) {
  const errors = [];
  const families = registry.families ?? [];
  const nonComponents = registry.nonComponents ?? [];
  const classifiers = [...families, ...nonComponents];

  if (registry.schemaVersion !== 1) {
    errors.push(`Unsupported conformance registry schema: ${registry.schemaVersion}`);
  }
  if (!Number.isInteger(registry.parentIssue) || registry.parentIssue <= 0) {
    errors.push('Conformance registry needs a positive parentIssue');
  }

  const ids = new Set();
  for (const classifier of classifiers) {
    if (typeof classifier.id !== 'string' || classifier.id.trim() === '') {
      errors.push('Every conformance classifier needs a non-empty id');
      continue;
    }
    if (ids.has(classifier.id)) errors.push(`Duplicate conformance classifier id: ${classifier.id}`);
    ids.add(classifier.id);
    if (!Array.isArray(classifier.sourcePrefixes) || classifier.sourcePrefixes.length === 0) {
      errors.push(`${classifier.id}: sourcePrefixes must contain at least one source-module prefix`);
    }
  }

  for (const family of families) {
    if (!['component', 'layout'].includes(family.kind)) {
      errors.push(`${family.id}: family kind must be "component" or "layout"`);
    }
    validateProvenance({ family, componentProvenanceIds, pathExists, errors });
    validateDimensions({ family, pathExists, errors });
  }
  for (const classification of nonComponents) {
    if (typeof classification.reason !== 'string' || classification.reason.trim() === '') {
      errors.push(`${classification.id}: non-component classifications need a reason`);
    }
  }

  const familySymbols = new Map(families.map((family) => [family.id, []]));
  const nonComponentSymbols = new Map(nonComponents.map((item) => [item.id, []]));
  const rootExports = Object.entries(rootModel?.exports ?? {});

  for (const [name, entry] of rootExports) {
    const owners = classifyExport(entry, classifiers);
    const sourcePath = entry?.source?.path ?? '<unknown source>';
    if (owners.length === 0) {
      errors.push(`Unclassified public root export "${name}" from ${sourcePath}`);
      continue;
    }
    if (owners.length > 1) {
      errors.push(
        `Public root export "${name}" from ${sourcePath} matches multiple classifiers: ${owners
          .map((owner) => owner.id)
          .join(', ')}`,
      );
      continue;
    }
    const owner = owners[0];
    const target = familySymbols.get(owner.id) ?? nonComponentSymbols.get(owner.id);
    target?.push(symbolRecord(name, entry));
  }

  for (const family of families) {
    if ((familySymbols.get(family.id) ?? []).length === 0) {
      errors.push(`${family.id}: classifier owns no public root exports`);
    }
  }
  for (const classification of nonComponents) {
    if ((nonComponentSymbols.get(classification.id) ?? []).length === 0) {
      errors.push(`${classification.id}: non-component classifier owns no public root exports`);
    }
  }

  const layoutExports = Object.entries(layoutModel?.exports ?? {});
  const rootExportNames = new Set(rootExports.map(([name]) => name));
  const layoutSymbolNamesByFamily = new Map(
    families.filter((family) => family.kind === 'layout').map((family) => [family.id, []]),
  );

  for (const [name, entry] of layoutExports) {
    if (!rootExportNames.has(name)) {
      errors.push(`Public layout export "${name}" is missing from the root @m3-ui/ui entrypoint`);
    }
    const owners = classifyExport(entry, classifiers);
    const sourcePath = entry?.source?.path ?? '<unknown source>';
    if (owners.length !== 1) {
      errors.push(
        owners.length === 0
          ? `Unclassified public layout export "${name}" from ${sourcePath}`
          : `Public layout export "${name}" from ${sourcePath} matches multiple classifiers: ${owners
              .map((owner) => owner.id)
              .join(', ')}`,
      );
      continue;
    }
    if (owners[0].kind !== 'layout') {
      errors.push(
        `Public layout export "${name}" is classified as ${owners[0].kind ?? 'non-component'} (${owners[0].id})`,
      );
      continue;
    }
    layoutSymbolNamesByFamily.get(owners[0].id)?.push(name);
  }

  for (const family of families.filter((item) => item.kind === 'layout')) {
    if ((layoutSymbolNamesByFamily.get(family.id) ?? []).length === 0) {
      errors.push(`${family.id}: layout classifier owns no @m3-ui/ui/layout exports`);
    }
  }

  return {
    report: {
      schemaVersion: 1,
      parentIssue: registry.parentIssue,
      generatedFrom: {
        root: rootModel?.entrypoint ?? registry.rootEntrypoint,
        layout: layoutModel?.entrypoint ?? registry.layoutEntrypoint,
      },
      dimensions: [...CONFORMANCE_DIMENSIONS],
      families: families.map((family) => ({
        id: family.id,
        kind: family.kind,
        provenance: family.provenance,
        publicSymbols: familySymbols.get(family.id) ?? [],
        dimensions: family.dimensions,
      })),
      nonComponents: nonComponents.map((classification) => ({
        id: classification.id,
        reason: classification.reason,
        publicSymbols: nonComponentSymbols.get(classification.id) ?? [],
      })),
    },
    errors,
  };
}

export function buildMaterialConformanceReport(repoRoot = defaultRepositoryRoot()) {
  const rootModel = buildApiReferenceModel({ repoRoot });
  const layoutModel = buildApiReferenceModel({
    repoRoot,
    packageName: '@m3-ui/ui/layout',
    entrypoint: 'packages/ui/src/layout/index.ts',
  });
  return validateMaterialConformance({
    rootModel,
    layoutModel,
    componentProvenanceIds: loadComponentProvenanceIds(repoRoot),
    pathExists: (relativePath) => existsSync(resolve(repoRoot, relativePath)),
  });
}

function runCli() {
  const { report, errors } = buildMaterialConformanceReport();
  if (errors.length > 0) {
    console.error('[docs] Material conformance inventory failed:');
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }
  if (process.argv.includes('--json')) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return;
  }
  const symbolCount = report.families.reduce(
    (total, family) => total + family.publicSymbols.length,
    0,
  );
  const nonComponentCount = report.nonComponents.reduce(
    (total, classification) => total + classification.publicSymbols.length,
    0,
  );
  console.log(
    `[docs] Material conformance inventory: ${report.families.length} families, ` +
      `${symbolCount} component/layout symbols, ${nonComponentCount} explicitly classified non-component symbols.`,
  );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) runCli();
