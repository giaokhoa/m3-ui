import { readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import ts from '@typescript/typescript6';

function unwrapExpression(node) {
  let current = node;
  while (
    ts.isAsExpression(current) ||
    ts.isSatisfiesExpression(current) ||
    ts.isParenthesizedExpression(current)
  ) {
    current = current.expression;
  }
  return current;
}

function importedLocalNames(node) {
  const names = [];
  const clause = node.importClause;
  if (!clause) return names;
  if (clause.name) names.push(clause.name.text);
  const bindings = clause.namedBindings;
  if (bindings && ts.isNamespaceImport(bindings)) {
    names.push(bindings.name.text);
  } else if (bindings && ts.isNamedImports(bindings)) {
    for (const element of bindings.elements) names.push(element.name.text);
  }
  return names;
}

function identifierNames(node) {
  const names = new Set();
  const visit = (child) => {
    if (ts.isIdentifier(child)) names.add(child.text);
    ts.forEachChild(child, visit);
  };
  visit(node);
  return names;
}

function registryEntries(sourceFile) {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.name.text !== 'liveExampleRegistry') {
        continue;
      }
      if (!declaration.initializer) throw new Error('liveExampleRegistry must have an initializer');
      const initializer = unwrapExpression(declaration.initializer);
      if (!ts.isObjectLiteralExpression(initializer)) {
        throw new Error('liveExampleRegistry must be an object literal');
      }
      return initializer.properties.map((property) => {
        if (!ts.isPropertyAssignment(property)) {
          throw new Error('liveExampleRegistry entries must be property assignments');
        }
        const name = property.name;
        const id =
          ts.isStringLiteral(name) || ts.isNoSubstitutionTemplateLiteral(name)
            ? name.text
            : ts.isIdentifier(name)
              ? name.text
              : null;
        const component = unwrapExpression(property.initializer);
        if (!id || !ts.isIdentifier(component)) {
          throw new Error('liveExampleRegistry entries must map an id to a component identifier');
        }
        return { id, component: component.text };
      });
    }
  }
  throw new Error('Missing liveExampleRegistry export');
}

export function buildLiveExampleModel({ sourcePath, repoRoot = process.cwd() }) {
  const absoluteSourcePath = resolve(sourcePath);
  const sourceText = readFileSync(absoluteSourcePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    absoluteSourcePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );

  const imports = sourceFile.statements
    .filter(ts.isImportDeclaration)
    .map((node) => ({
      node,
      locals: importedLocalNames(node),
    }));
  const functions = new Map();
  for (const statement of sourceFile.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name) {
      functions.set(statement.name.text, statement);
    }
  }

  const examples = {};
  for (const { id, component } of registryEntries(sourceFile).sort((a, b) =>
    a.id.localeCompare(b.id),
  )) {
    const declaration = functions.get(component);
    if (!declaration) {
      throw new Error(`Live example "${id}" points to missing function ${component}`);
    }
    const used = identifierNames(declaration);
    const importText = imports
      .map(({ node, locals }) => {
        if (!locals.some((name) => used.has(name))) return null;
        const clause = node.importClause;
        if (!clause) return node.getText(sourceFile);

        const parts = [];
        if (clause.name && used.has(clause.name.text)) parts.push(clause.name.text);
        const bindings = clause.namedBindings;
        if (bindings && ts.isNamespaceImport(bindings) && used.has(bindings.name.text)) {
          parts.push(`* as ${bindings.name.text}`);
        } else if (bindings && ts.isNamedImports(bindings)) {
          const selected = bindings.elements.filter((element) => used.has(element.name.text));
          if (selected.length) {
            parts.push(
              `{ ${selected
                .map((element) => {
                  const binding = element.propertyName
                    ? `${element.propertyName.text} as ${element.name.text}`
                    : element.name.text;
                  return element.isTypeOnly ? `type ${binding}` : binding;
                })
                .join(', ')} }`,
            );
          }
        }
        if (!parts.length) return null;
        const typePrefix = clause.isTypeOnly ? 'type ' : '';
        return `import ${typePrefix}${parts.join(', ')} from ${node.moduleSpecifier.getText(sourceFile)};`;
      })
      .filter(Boolean);
    examples[id] = {
      component,
      source: [...importText, declaration.getText(sourceFile)].join('\n\n'),
    };
  }

  return {
    schemaVersion: 1,
    sourcePath: relative(repoRoot, absoluteSourcePath).replaceAll('\\', '/'),
    examples,
  };
}

export function stableLiveExampleJson(model) {
  return `${JSON.stringify(model, null, 2)}\n`;
}
