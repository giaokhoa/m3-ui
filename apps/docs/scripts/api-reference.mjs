import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const TYPE_FORMAT_FLAGS =
  ts.TypeFormatFlags.NoTruncation |
  ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope |
  ts.TypeFormatFlags.WriteTypeArgumentsOfSignature;

function normalizePath(value) {
  return value.replace(/\\/g, '/');
}

function formatDiagnostics(diagnostics) {
  return ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCanonicalFileName: (fileName) => fileName,
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getNewLine: () => ts.sys.newLine,
  });
}

function readProjectConfig(tsconfigPath) {
  const configResult = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  if (configResult.error) throw new Error(formatDiagnostics([configResult.error]));

  const parsed = ts.parseJsonConfigFileContent(
    configResult.config,
    ts.sys,
    dirname(tsconfigPath),
    undefined,
    tsconfigPath,
  );
  if (parsed.errors.length > 0) throw new Error(formatDiagnostics(parsed.errors));
  return parsed;
}

function resolveAlias(symbol, checker) {
  let current = symbol;
  const visited = new Set();
  while ((current.flags & ts.SymbolFlags.Alias) !== 0) {
    if (visited.has(current)) break;
    visited.add(current);
    current = checker.getAliasedSymbol(current);
  }
  return current;
}

function documentationFor(symbol, checker) {
  return ts.displayPartsToString(symbol.getDocumentationComment(checker)).trim();
}

function tagText(tag) {
  if (typeof tag.text === 'string') return tag.text.trim();
  if (!Array.isArray(tag.text)) return '';
  return tag.text.map((part) => part.text).join('').trim();
}

function defaultFromTags(symbol, checker) {
  const tag = symbol
    .getJsDocTags(checker)
    .find(({ name }) => name === 'default' || name === 'defaultValue');
  return tag ? tagText(tag) || null : null;
}

function annotationsFor(symbol, checker) {
  const supported = new Set([
    'source',
    'provenance',
    'material',
    'compose',
    'web',
    'adaptation',
  ]);

  return symbol
    .getJsDocTags(checker)
    .filter(({ name }) => supported.has(name))
    .map((tag) => ({ kind: tag.name, value: tagText(tag) }))
    .filter(({ value }) => value.length > 0)
    .sort((left, right) =>
      left.kind === right.kind
        ? left.value.localeCompare(right.value)
        : left.kind.localeCompare(right.kind),
    );
}

function packageNameFromNodeModulesPath(fileName) {
  const normalized = normalizePath(fileName);
  const marker = '/node_modules/';
  const markerIndex = normalized.lastIndexOf(marker);
  if (markerIndex === -1) return null;
  const parts = normalized.slice(markerIndex + marker.length).split('/');
  if (parts[0]?.startsWith('@')) return parts.slice(0, 2).join('/');
  return parts[0] ?? null;
}

function originForDeclaration(declaration, repoRoot, uiRoot) {
  if (!declaration) return { kind: 'unknown', label: 'Unknown', path: null };

  const sourcePath = resolve(declaration.getSourceFile().fileName);
  const normalizedSource = normalizePath(sourcePath);
  const normalizedUiRoot = `${normalizePath(resolve(uiRoot))}/`;
  if (normalizedSource.startsWith(normalizedUiRoot)) {
    return {
      kind: 'm3-ui',
      label: '@m3-ui/ui',
      path: normalizePath(relative(repoRoot, sourcePath)),
    };
  }

  const packageName = packageNameFromNodeModulesPath(sourcePath);
  if (packageName) return { kind: 'package', label: packageName, path: null };

  const path = normalizePath(relative(repoRoot, sourcePath));
  return { kind: 'workspace', label: path, path };
}

function propertyNameFromBindingElement(element) {
  if (element.propertyName && ts.isIdentifier(element.propertyName)) {
    return element.propertyName.text;
  }
  if (ts.isIdentifier(element.name)) return element.name.text;
  return null;
}

function defaultsFromParameter(parameter, target) {
  const defaults = new Map();
  if (!parameter || !ts.isObjectBindingPattern(parameter.name)) return defaults;
  for (const element of parameter.name.elements) {
    if (!element.initializer) continue;
    const name = propertyNameFromBindingElement(element);
    if (name) defaults.set(name, element.initializer.getText(target.getSourceFile()));
  }
  return defaults;
}

function callableNodeFromInitializer(initializer) {
  if (!initializer) return null;
  if (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer)) return initializer;
  if (ts.isParenthesizedExpression(initializer)) {
    return callableNodeFromInitializer(initializer.expression);
  }
  if (ts.isCallExpression(initializer)) {
    for (const argument of initializer.arguments) {
      const callable = callableNodeFromInitializer(argument);
      if (callable) return callable;
    }
  }
  return null;
}

function staticallyKnownDefaults(declarations) {
  const defaults = new Map();
  for (const declaration of declarations) {
    let parameter = null;
    if (ts.isFunctionDeclaration(declaration)) {
      parameter = declaration.parameters[0] ?? null;
    } else if (ts.isVariableDeclaration(declaration)) {
      parameter = callableNodeFromInitializer(declaration.initializer)?.parameters[0] ?? null;
    }
    if (!parameter) continue;
    for (const [name, value] of defaultsFromParameter(parameter, declaration)) {
      if (!defaults.has(name)) defaults.set(name, value);
    }
  }
  return defaults;
}

function signatureText(signature, exportName, checker, declaration) {
  return `${exportName}${checker.signatureToString(
    signature,
    declaration,
    TYPE_FORMAT_FLAGS,
    ts.SignatureKind.Call,
  )}`;
}

function headerSignature(exportName, declaration, checker, valueType) {
  if (!declaration) {
    return valueType
      ? `${exportName}: ${checker.typeToString(valueType, undefined, TYPE_FORMAT_FLAGS)}`
      : exportName;
  }
  if (ts.isInterfaceDeclaration(declaration)) {
    const typeParameters = declaration.typeParameters?.length
      ? `<${declaration.typeParameters.map((item) => item.getText()).join(', ')}>`
      : '';
    const heritage = declaration.heritageClauses?.length
      ? ` ${declaration.heritageClauses.map((item) => item.getText()).join(' ')}`
      : '';
    return `interface ${exportName}${typeParameters}${heritage}`;
  }
  if (ts.isTypeAliasDeclaration(declaration)) {
    const typeParameters = declaration.typeParameters?.length
      ? `<${declaration.typeParameters.map((item) => item.getText()).join(', ')}>`
      : '';
    return `type ${exportName}${typeParameters} = ${declaration.type.getText()}`;
  }
  if (ts.isEnumDeclaration(declaration)) return `enum ${exportName}`;
  if (ts.isClassDeclaration(declaration)) return `class ${exportName}`;
  if (valueType) {
    return `const ${exportName}: ${checker.typeToString(valueType, declaration, TYPE_FORMAT_FLAGS)}`;
  }
  return exportName;
}

function exportKind(symbol, callSignatures) {
  if ((symbol.flags & ts.SymbolFlags.Interface) !== 0) return 'interface';
  if ((symbol.flags & ts.SymbolFlags.TypeAlias) !== 0) return 'type';
  if ((symbol.flags & ts.SymbolFlags.Enum) !== 0) return 'enum';
  if ((symbol.flags & ts.SymbolFlags.Class) !== 0) return 'class';
  if ((symbol.flags & ts.SymbolFlags.Function) !== 0) return 'function';
  if (callSignatures.length > 0) return 'callable';
  if ((symbol.flags & ts.SymbolFlags.Variable) !== 0) return 'value';
  return 'symbol';
}

function looksLikeProps(parameter, parameterType, signature, checker) {
  const parameterName = parameter.getName();
  const parameterTypeName = checker.typeToString(
    parameterType,
    parameter.valueDeclaration,
    TYPE_FORMAT_FLAGS,
  );
  const returnTypeName = checker.typeToString(
    signature.getReturnType(),
    parameter.valueDeclaration,
    TYPE_FORMAT_FLAGS,
  );
  return (
    parameterName === 'props' ||
    /(?:^|[.<])\w*Props(?:[>,]|$)/.test(parameterTypeName) ||
    /(?:JSX\.)?Element|ReactElement/.test(returnTypeName)
  );
}

function serializeProps({ signatures, checker, defaults, repoRoot, uiRoot }) {
  const properties = new Map();
  for (const signature of signatures) {
    const parameter = signature.getParameters()[0];
    if (!parameter) continue;
    const declaration = parameter.valueDeclaration ?? parameter.declarations?.[0];
    const parameterType = checker.getTypeOfSymbolAtLocation(
      parameter,
      declaration ?? signature.declaration,
    );
    if (!looksLikeProps(parameter, parameterType, signature, checker)) continue;

    for (const property of checker.getPropertiesOfType(parameterType)) {
      const propertyDeclaration =
        property.valueDeclaration ?? property.declarations?.[0] ?? null;
      const propertyType = checker.getTypeOfSymbolAtLocation(
        property,
        propertyDeclaration ?? declaration ?? signature.declaration,
      );
      const origin = originForDeclaration(propertyDeclaration, repoRoot, uiRoot);
      const next = {
        name: property.getName(),
        type: checker.typeToString(
          propertyType,
          propertyDeclaration ?? declaration ?? signature.declaration,
          TYPE_FORMAT_FLAGS,
        ),
        required: (property.flags & ts.SymbolFlags.Optional) === 0,
        defaultValue: defaults.get(property.getName()) ?? defaultFromTags(property, checker),
        description: documentationFor(property, checker),
        origin,
      };
      const existing = properties.get(property.getName());
      if (!existing || (existing.origin.kind !== 'm3-ui' && origin.kind === 'm3-ui')) {
        properties.set(property.getName(), next);
      }
    }
  }
  return [...properties.values()].sort((left, right) => left.name.localeCompare(right.name));
}

function sourceLocation(declaration, repoRoot) {
  if (!declaration) return { path: null, line: null };
  const sourceFile = declaration.getSourceFile();
  const position = sourceFile.getLineAndCharacterOfPosition(declaration.getStart(sourceFile));
  return {
    path: normalizePath(relative(repoRoot, sourceFile.fileName)),
    line: position.line + 1,
  };
}

function serializeExport(exportedSymbol, checker, repoRoot, uiRoot) {
  const target = resolveAlias(exportedSymbol, checker);
  const exportName = exportedSymbol.getName();
  const declarations = target.getDeclarations() ?? exportedSymbol.getDeclarations() ?? [];
  const declaration =
    declarations.find((item) => !item.getSourceFile().isDeclarationFile) ??
    declarations[0] ??
    null;
  const valueType =
    (target.flags & ts.SymbolFlags.Value) !== 0 && declaration
      ? checker.getTypeOfSymbolAtLocation(target, declaration)
      : null;
  const callSignatures = valueType?.getCallSignatures() ?? [];
  const defaults = staticallyKnownDefaults(declarations);
  const signatures =
    callSignatures.length > 0
      ? callSignatures.map((signature) =>
          signatureText(signature, exportName, checker, declaration),
        )
      : [headerSignature(exportName, declaration, checker, valueType)];

  return {
    name: exportName,
    kind: exportKind(target, callSignatures),
    description: documentationFor(target, checker),
    signatures,
    props: serializeProps({
      signatures: callSignatures,
      checker,
      defaults,
      repoRoot,
      uiRoot,
    }),
    annotations: annotationsFor(target, checker),
    source: sourceLocation(declaration, repoRoot),
  };
}

export function defaultRepositoryRoot() {
  return resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
}

export function buildApiReferenceModel({
  repoRoot = defaultRepositoryRoot(),
  packageName = '@m3-ui/ui',
  entrypoint = 'packages/ui/src/index.ts',
  tsconfig = 'packages/ui/tsconfig.json',
} = {}) {
  const absoluteRepoRoot = resolve(repoRoot);
  const uiRoot = resolve(absoluteRepoRoot, 'packages/ui');
  const parsed = readProjectConfig(resolve(absoluteRepoRoot, tsconfig));
  const program = ts.createProgram({
    rootNames: parsed.fileNames,
    options: parsed.options,
    projectReferences: parsed.projectReferences,
  });
  const syntacticDiagnostics = program.getSyntacticDiagnostics();
  if (syntacticDiagnostics.length > 0) throw new Error(formatDiagnostics(syntacticDiagnostics));

  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(resolve(absoluteRepoRoot, entrypoint));
  if (!sourceFile) {
    throw new Error(`API reference entrypoint not found in TypeScript program: ${entrypoint}`);
  }
  const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
  if (!moduleSymbol) throw new Error(`Unable to resolve TypeScript module symbol for ${entrypoint}`);

  const exports = {};
  for (const exportedSymbol of checker
    .getExportsOfModule(moduleSymbol)
    .filter((symbol) => symbol.getName() !== 'default')
    .sort((left, right) => left.getName().localeCompare(right.getName()))) {
    const serialized = serializeExport(exportedSymbol, checker, absoluteRepoRoot, uiRoot);
    exports[serialized.name] = serialized;
  }

  return {
    schemaVersion: 1,
    packageName,
    entrypoint: normalizePath(entrypoint),
    exports,
  };
}

export function requirePublicApiExport(model, name) {
  const entry = model.exports[name];
  if (!entry) {
    throw new Error(
      `Unknown public ${model.packageName} export "${name}". ` +
        'Regenerate the docs API reference and use a symbol exported by the public package entrypoint.',
    );
  }
  return entry;
}

export function stableApiReferenceJson(model) {
  return `${JSON.stringify(model, null, 2)}\n`;
}
