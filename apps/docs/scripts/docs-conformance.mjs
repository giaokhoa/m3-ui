import { access, readFile, readdir } from 'node:fs/promises';
import { dirname, extname, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';
import { buildApiReferenceModel } from './api-reference.mjs';

export const RULES = Object.freeze({
  PUBLIC_MDX_ONLY: 'public-mdx-only',
  META_NAV_ONLY: 'meta-nav-only',
  COMPONENT_ROUTE: 'component-route',
  ACCESSIBILITY: 'accessibility-section',
  MATERIAL_SOURCE: 'material-source',
  API_EXPORT: 'api-export',
  FIDELITY_DISCLOSURE: 'fidelity-disclosure',
  CANONICAL_SPEC_VALUES: 'canonical-spec-values',
  MDX_RUNTIME_IMPORT: 'mdx-runtime-import',
});

const META_CONTENT_KEYS = new Set(['body', 'content', 'markdown', 'mdx', 'pageContent', 'render']);
const A11Y_EXEMPTION = /<!--\s*docs-conformance:\s*accessibility-exempt\s+issue=#\d+\s+reason="[^"]+"\s*-->/i;
const MATERIAL_EXEMPTION = /<!--\s*docs-conformance:\s*material-link-exempt\s+issue=#\d+\s+reason="[^"]+"\s*-->/i;

const normalizePath = (value) => value.split(sep).join('/');
const repoPath = (root, path) => normalizePath(relative(root, path));
const violation = (rule, file, message, subject = null) => ({ rule, file, message, subject });

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function walk(root) {
  if (!(await exists(root))) return [];
  const entries = await readdir(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const path = resolve(root, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}

function unwrap(node) {
  while (
    ts.isAsExpression(node) ||
    ts.isSatisfiesExpression(node) ||
    ts.isParenthesizedExpression(node)
  ) node = node.expression;
  return node;
}

function propertyName(node) {
  if (!node) return null;
  if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) return node.text;
  return null;
}

async function localModule(fromPath, specifier) {
  if (!specifier.startsWith('.')) return null;
  const base = resolve(dirname(fromPath), specifier);
  for (const candidate of [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    resolve(base, 'index.ts'),
    resolve(base, 'index.tsx'),
  ]) {
    if (await exists(candidate)) return candidate;
  }
  return null;
}

async function parse(path, cache) {
  if (!cache.has(path)) {
    cache.set(
      path,
      ts.createSourceFile(
        path,
        await readFile(path, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
        extname(path) === '.tsx' ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
      ),
    );
  }
  return cache.get(path);
}

async function findBinding(path, name, cache) {
  const source = await parse(path, cache);
  for (const statement of source.statements) {
    if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
      const bindings = statement.importClause?.namedBindings;
      if (!bindings || !ts.isNamedImports(bindings)) continue;
      for (const item of bindings.elements) {
        if (item.name.text !== name) continue;
        const target = await localModule(path, statement.moduleSpecifier.text);
        return target ? { path: target, name: item.propertyName?.text ?? item.name.text } : null;
      }
    }
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (
        ts.isIdentifier(declaration.name) &&
        declaration.name.text === name &&
        declaration.initializer
      ) return { path, initializer: declaration.initializer };
    }
  }
  return null;
}

async function objectEntries(path, name, cache, seen = new Set()) {
  const marker = `${path}#${name}`;
  if (seen.has(marker)) throw new Error(`Circular docs metadata spread: ${marker}`);
  seen.add(marker);
  const binding = await findBinding(path, name, cache);
  if (!binding) throw new Error(`Unable to resolve docs metadata binding ${name} from ${path}`);
  if (!binding.initializer) return objectEntries(binding.path, binding.name, cache, seen);

  const object = unwrap(binding.initializer);
  if (!ts.isObjectLiteralExpression(object)) {
    throw new Error(`Docs metadata ${name} is not an object literal in ${path}`);
  }

  const entries = new Map();
  for (const property of object.properties) {
    if (ts.isSpreadAssignment(property)) {
      const spread = unwrap(property.expression);
      if (!ts.isIdentifier(spread)) throw new Error(`Unsupported docs metadata spread in ${path}`);
      for (const [key, value] of await objectEntries(path, spread.text, cache, seen)) {
        entries.set(key, value);
      }
      continue;
    }
    if (!ts.isPropertyAssignment(property)) continue;
    const key = propertyName(property.name);
    const value = unwrap(property.initializer);
    if (key && ts.isObjectLiteralExpression(value)) entries.set(key, { path, node: value });
  }
  seen.delete(marker);
  return entries;
}

function field(object, name) {
  for (const property of object.properties) {
    if (ts.isPropertyAssignment(property) && propertyName(property.name) === name) {
      return unwrap(property.initializer);
    }
  }
  return null;
}

function stringValue(node) {
  return node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
    ? node.text
    : null;
}

async function componentInventory(repoRoot) {
  const entry = resolve(repoRoot, 'apps/docs/src/allComponentDocs.ts');
  if (!(await exists(entry))) return new Map();
  const raw = await objectEntries(entry, 'allComponentDocs', new Map());
  return new Map(
    [...raw].map(([id, record]) => [
      id,
      {
        sourcePath: record.path,
        materialUrl: stringValue(field(record.node, 'materialUrl')),
        referenceUrl: stringValue(field(record.node, 'referenceUrl')),
        contractLabel: stringValue(field(record.node, 'contractLabel')),
        webAdaptation: stringValue(field(record.node, 'webAdaptation')),
      },
    ]),
  );
}

function routeFromMdx(contentRoot, path) {
  let value = normalizePath(relative(contentRoot, path)).replace(/\.mdx$/i, '');
  if (value === 'index') return '/docs';
  if (value.endsWith('/index')) value = value.slice(0, -6);
  return `/docs/${value}`;
}

function componentBinding(source) {
  const match = source.match(
    /<(?:MaterialParity|FidelitySummary|ParitySummary)\b[^>]*\bcomponent=["']([^"']+)["'][^>]*>/,
  );
  return match?.[1] ?? null;
}

function hasAccessibility(source) {
  return /^#{2,3}\s+Accessibility(?:\s+boundary)?\s*$/im.test(source) || A11Y_EXEMPTION.test(source);
}

function validateUrl(url, material = false) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return 'must use https';
    if (material && parsed.hostname !== 'm3.material.io') return 'must use m3.material.io';
    return null;
  } catch {
    return 'is not a valid URL';
  }
}

function apiReferences(source) {
  return [...source.matchAll(/<ApiReference\b[^>]*\bname=["']([^"']+)["'][^>]*>/g)]
    .map((match) => match[1]);
}

function mdxImports(source) {
  return [...source.matchAll(/^\s*import\s+(?:[^'"\n]+?\s+from\s+)?['"]([^'"]+)['"]\s*;?/gm)]
    .map((match) => match[1]);
}

async function isAppModuleImport(mdxPath, specifier, docsRoot) {
  const target = await localModule(mdxPath, specifier);
  if (!target) return false;
  const srcRoot = resolve(docsRoot, 'src');
  return (
    (target === srcRoot || target.startsWith(`${srcRoot}${sep}`)) &&
    ['.ts', '.tsx'].includes(extname(target))
  );
}

function handwrittenSpecLines(source) {
  if (!/<MaterialSpecTable\b/.test(source)) return [];
  const lines = source.replace(/```[\s\S]*?```/g, '').split(/\r?\n/);
  const hits = [];
  let inSpecSection = false;
  lines.forEach((line, index) => {
    const heading = line.match(/^#{2,3}\s+(.+)$/);
    if (heading) {
      inSpecSection = /\b(spec(?:ification)?|token|dimension|measurement|typography|shape|elevation)\b/i
        .test(heading[1]);
      return;
    }
    if (
      inSpecSection &&
      line.trim().startsWith('|') &&
      (/\b\d+(?:\.\d+)?\s*(?:px|dp|sp|rem|em|ms)\b/i.test(line) || /#[0-9a-f]{3,8}\b/i.test(line))
    ) hits.push(index + 1);
  });
  return hits;
}

async function readAllowlist(path) {
  if (!(await exists(path))) return { version: 1, entries: [] };
  const value = JSON.parse(await readFile(path, 'utf8'));
  if (value.version !== 1 || !Array.isArray(value.entries)) {
    throw new Error(`Invalid docs conformance allowlist: ${path}`);
  }
  for (const entry of value.entries) {
    if (
      typeof entry.rule !== 'string' ||
      typeof entry.file !== 'string' ||
      !/^#\d+$/.test(entry.issue ?? '')
    ) throw new Error(`Every allowlist entry needs rule, file, and tracked issue: ${path}`);
  }
  return value;
}

function applyAllowlist(diagnostics, allowlist) {
  const active = [];
  const allowed = [];
  for (const item of diagnostics) {
    const match = allowlist.entries.find(
      (entry) =>
        entry.rule === item.rule &&
        entry.file === item.file &&
        (entry.subject === undefined || entry.subject === item.subject),
    );
    if (match) allowed.push({ ...item, issue: match.issue, reason: match.reason ?? '' });
    else active.push(item);
  }
  return { diagnostics: active, allowlisted: allowed };
}

export async function validateDocsConformance({
  repoRoot,
  apiReferenceModel = null,
  allowlistPath = null,
} = {}) {
  repoRoot = resolve(
    repoRoot ?? resolve(dirname(fileURLToPath(import.meta.url)), '../../..'),
  );
  const docsRoot = resolve(repoRoot, 'apps/docs');
  const contentRoot = resolve(docsRoot, 'content/docs');
  const diagnostics = [];
  const mdxFiles = [];
  const routes = new Map();

  for (const path of await walk(contentRoot)) {
    const file = repoPath(repoRoot, path);
    if (extname(path).toLowerCase() === '.mdx') {
      mdxFiles.push(path);
      routes.set(routeFromMdx(contentRoot, path), path);
      continue;
    }
    if (path.endsWith(`${sep}meta.json`)) {
      try {
        const meta = JSON.parse(await readFile(path, 'utf8'));
        const contentKey = Object.keys(meta).find((key) => META_CONTENT_KEYS.has(key));
        if (contentKey) {
          diagnostics.push(violation(
            RULES.META_NAV_ONLY,
            file,
            `meta.json is navigation metadata only; move "${contentKey}" page content into .mdx.`,
          ));
        }
      } catch (error) {
        diagnostics.push(violation(RULES.META_NAV_ONLY, file, `meta.json must be valid JSON: ${error.message}`));
      }
      continue;
    }
    diagnostics.push(violation(
      RULES.PUBLIC_MDX_ONLY,
      file,
      'Public docs content must be .mdx; TS/TSX/JS/JSON cannot replace a guide/reference page.',
    ));
  }

  const inventory = await componentInventory(repoRoot);
  const sources = new Map(
    await Promise.all(mdxFiles.map(async (path) => [path, await readFile(path, 'utf8')])),
  );
  const pagesByComponent = new Map();
  for (const [path, source] of sources) {
    if (!routeFromMdx(contentRoot, path).startsWith('/docs/components/')) continue;
    const id = componentBinding(source);
    if (id) pagesByComponent.set(id, [...(pagesByComponent.get(id) ?? []), path]);
  }

  for (const [id, metadata] of inventory) {
    const pages = pagesByComponent.get(id) ?? [];
    if (pages.length !== 1) {
      diagnostics.push(violation(
        RULES.COMPONENT_ROUTE,
        'apps/docs/src/allComponentDocs.ts',
        pages.length === 0
          ? `Documented component "${id}" has no MDX guide bound through MaterialParity/FidelitySummary/ParitySummary.`
          : `Documented component "${id}" is bound by multiple MDX guides: ${pages.map((path) => repoPath(repoRoot, path)).join(', ')}.`,
        id,
      ));
    }

    if (metadata.materialUrl) {
      const error = validateUrl(metadata.materialUrl, true);
      if (error) diagnostics.push(violation(
        RULES.MATERIAL_SOURCE,
        repoPath(repoRoot, metadata.sourcePath),
        `Material source for "${id}" ${error}: ${metadata.materialUrl}`,
        id,
      ));
    } else if (!metadata.referenceUrl && !metadata.contractLabel) {
      const pageSource = pages[0] ? sources.get(pages[0]) : '';
      if (!MATERIAL_EXEMPTION.test(pageSource)) {
        diagnostics.push(violation(
          RULES.MATERIAL_SOURCE,
          repoPath(repoRoot, metadata.sourcePath),
          `"${id}" needs an authoritative Material source, explicit Compose/reference contract, or tracked exemption.`,
          id,
        ));
      }
    }
    if (!metadata.materialUrl && metadata.referenceUrl?.includes('m3.material.io')) {
      diagnostics.push(violation(
        RULES.MATERIAL_SOURCE,
        repoPath(repoRoot, metadata.sourcePath),
        `Compose/reference-only "${id}" must not invent an m3.material.io reference URL.`,
        id,
      ));
    }
  }

  let apiModel = apiReferenceModel;
  if (!apiModel && [...sources.values()].some((source) => /<ApiReference\b/.test(source))) {
    apiModel = buildApiReferenceModel({ repoRoot });
  }

  for (const [path, source] of sources) {
    const file = repoPath(repoRoot, path);
    for (const specifier of mdxImports(source)) {
      if (await isAppModuleImport(path, specifier, docsRoot)) {
        diagnostics.push(violation(
          RULES.MDX_RUNTIME_IMPORT,
          file,
          `Content MDX must not import app TS/TSX module "${specifier}"; register runtime UI through MDXComponents.`,
          specifier,
        ));
      }
    }

    for (const url of [...source.matchAll(/https?:\/\/[^\s<>"')\]]+/g)].map((match) => match[0].replace(/[.,;:]+$/, ''))) {
      if (!url.includes('m3.material.io')) continue;
      const error = validateUrl(url, true);
      if (error) diagnostics.push(violation(RULES.MATERIAL_SOURCE, file, `Material link ${error}: ${url}`, url));
    }

    for (const name of apiReferences(source)) {
      if (!apiModel?.exports?.[name]) {
        diagnostics.push(violation(
          RULES.API_EXPORT,
          file,
          `<ApiReference name="${name}" /> is not exported by the public @m3-ui/ui entrypoint.`,
          name,
        ));
      }
    }

    if (routeFromMdx(contentRoot, path).startsWith('/docs/components/')) {
      const id = componentBinding(source);
      if (id && inventory.has(id)) {
        if (!hasAccessibility(source)) {
          diagnostics.push(violation(
            RULES.ACCESSIBILITY,
            file,
            `Component guide "${id}" needs an Accessibility section or tracked exemption.`,
            id,
          ));
        }
        if (inventory.get(id).webAdaptation) {
          const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const hasFidelity = new RegExp(
            `<(?:MaterialParity|FidelitySummary|ParitySummary)\\b[^>]*\\bcomponent=["']${escapedId}["']`,
          ).test(source);
          if (!hasFidelity) {
            diagnostics.push(violation(
              RULES.FIDELITY_DISCLOSURE,
              file,
              `"${id}" declares adaptation metadata and must embed its fidelity/provenance widget.`,
              id,
            ));
          }
        }
      }
    }

    for (const line of handwrittenSpecLines(source)) {
      diagnostics.push(violation(
        RULES.CANONICAL_SPEC_VALUES,
        file,
        `Line ${line} handwrites canonical-looking values beside MaterialSpecTable support; keep canonical values generated from tokens.`,
        `line:${line}`,
      ));
    }
  }

  const allowlist = await readAllowlist(
    allowlistPath ?? resolve(docsRoot, 'scripts/docs-conformance.allowlist.json'),
  );
  return { ...applyAllowlist(diagnostics, allowlist), inventory, routes };
}

export function formatDiagnostic(item) {
  return `[${item.rule}] ${item.file}${item.subject ? ` (${item.subject})` : ''}: ${item.message}`;
}

async function main() {
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
  const result = await validateDocsConformance({ repoRoot });
  for (const item of result.allowlisted) {
    console.warn(`[allowlisted ${item.issue}] ${formatDiagnostic(item)}${item.reason ? ` — ${item.reason}` : ''}`);
  }
  if (result.diagnostics.length > 0) {
    console.error(`Docs conformance failed with ${result.diagnostics.length} violation(s):`);
    result.diagnostics.forEach((item) => console.error(`- ${formatDiagnostic(item)}`));
    process.exitCode = 1;
    return;
  }
  console.log(
    `Docs conformance passed: ${result.routes.size} MDX route(s), ${result.inventory.size} documented component(s), ${result.allowlisted.length} tracked exception(s).`,
  );
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) await main();
