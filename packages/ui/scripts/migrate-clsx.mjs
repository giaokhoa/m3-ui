import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const uiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcRoot = path.join(uiRoot, 'src');
const architectureTest = path.join(uiRoot, 'scripts/class-name-architecture.node-tests.mjs');

async function walk(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(fullPath)));
    else files.push(fullPath);
  }
  return files;
}

function escapeSingle(value) {
  return value.replaceAll('\\', '\\\\').replaceAll("'", "\\'");
}

function convertArrayJoin(source) {
  return source.replace(
    /\[([^\]]*?)\]\s*\.filter\(Boolean\)\s*\.join\((['"]) \2\)/gs,
    (_match, entries) => `clsx(${entries.trim()})`,
  );
}

function convertClassNameTernary(source) {
  return source.replace(
    /className\s*\?\s*`([^`$]*)\$\{className\}`\s*:\s*(['"])([^'"]+)\2/g,
    (match, prefix, _quote, fallback) => {
      if (prefix !== `${fallback} `) return match;
      return `clsx('${escapeSingle(fallback)}', className)`;
    },
  );
}

function convertCardClassName(source) {
  return source.replace(
    "  const baseClassName = `card ${variantClassName(variant)}`;\n  const resolvedClassName = className ? `${baseClassName} ${className}` : baseClassName;",
    "  const resolvedClassName = clsx('card', variantClassName(variant), className);",
  );
}

function convertProgressIndicatorClasses(source) {
  let next = source.replace(
    `function classes(\n  kind: 'linear' | 'circular',\n  wavy: boolean,\n  userClassName: string | undefined,\n): string {\n  const names = [\n    'progress-indicator',\n    \`progress-indicator--\${kind}\`,\n    wavy ? 'progress-indicator--wavy' : 'progress-indicator--standard',\n  ];\n  if (userClassName) names.push(userClassName);\n  return names.join(' ');\n}`,
    `function classes(\n  kind: 'linear' | 'circular',\n  wavy: boolean,\n  userClassName: string | undefined,\n): string {\n  return clsx(\n    'progress-indicator',\n    \`progress-indicator--\${kind}\`,\n    wavy ? 'progress-indicator--wavy' : 'progress-indicator--standard',\n    userClassName,\n  );\n}`,
  );

  next = next.replace(
    `className={\`progress-indicator__linear-indeterminate\${\n        fourColor\n          ? ' progress-indicator__linear-indeterminate--four-color'\n          : ''\n      }\`}`,
    `className={clsx(\n        'progress-indicator__linear-indeterminate',\n        fourColor && 'progress-indicator__linear-indeterminate--four-color',\n      )}`,
  );

  return next;
}

function convertSimpleInterpolatedClassName(source) {
  return source.replace(/className=\{`([^`]+)`\}/g, (match, template) => {
    if (!template.includes(' ') || !/\$\{[A-Za-z_$][\w$.]*\}/.test(template)) return match;
    const tokens = template.trim().split(/\s+/);
    if (tokens.length < 2 || tokens.some((token) => /\$\{[^}]*\s+[^}]*\}/.test(token))) {
      return match;
    }
    const args = tokens.map((token) =>
      token.includes('${') ? `\`${token}\`` : `'${escapeSingle(token)}'`,
    );
    return `className={clsx(${args.join(', ')})}`;
  });
}

function ensureClsxImport(source) {
  if (!source.includes('clsx(') || /from ['"]clsx['"]/.test(source)) return source;
  const directive = source.match(/^(?:'use (?:client|server)';|"use (?:client|server)";)\n/);
  if (directive) {
    return `${directive[0]}import clsx from 'clsx';\n${source.slice(directive[0].length)}`;
  }
  return `import clsx from 'clsx';\n${source}`;
}

const sourceFiles = (await walk(srcRoot)).filter((file) =>
  ['.js', '.jsx', '.ts', '.tsx'].includes(path.extname(file)),
);

const changed = [];
for (const file of sourceFiles) {
  const before = await readFile(file, 'utf8');
  let after = convertArrayJoin(before);
  after = convertClassNameTernary(after);
  after = convertCardClassName(after);
  after = convertProgressIndicatorClasses(after);
  after = convertSimpleInterpolatedClassName(after);
  after = ensureClsxImport(after);
  if (after !== before) {
    await writeFile(file, after);
    changed.push(path.relative(uiRoot, file));
  }
}

let testSource = await readFile(architectureTest, 'utf8');
if (!testSource.includes("path.join(uiRoot, 'src/layout'),")) {
  testSource = testSource.replace(
    "    path.join(uiRoot, 'src/internal'),\n",
    "    path.join(uiRoot, 'src/internal'),\n    path.join(uiRoot, 'src/layout'),\n",
  );
}

if (!testSource.includes("test('dynamic CSS class composition uses clsx'")) {
  testSource += `\n\ntest('dynamic CSS class composition uses clsx', async () => {\n  const codeRoots = [\n    path.join(uiRoot, 'src/components'),\n    path.join(uiRoot, 'src/internal'),\n    path.join(uiRoot, 'src/layout'),\n  ];\n  const codeFiles = (await Promise.all(codeRoots.map((root) => walk(root))))\n    .flat()\n    .filter((file) => ['.js', '.jsx', '.ts', '.tsx'].includes(path.extname(file)));\n  const violations = [];\n\n  for (const file of codeFiles) {\n    const source = await readFile(file, 'utf8');\n    collectMatches(\n      file,\n      source,\n      /\\[[^\\]]*?\\]\\s*\\.filter\\(Boolean\\)\\s*\\.join\\((['\\"]) \\1\\)/gs,\n      violations,\n    );\n    collectMatches(\n      file,\n      source,\n      /className\\s*\\?\\s*\\\`[^\\\`]*\\$\\{className\\}[^\\\`]*\\\`/g,\n      violations,\n    );\n    collectMatches(\n      file,\n      source,\n      /className=\\{\\\`(?=[^\\\`]*\\s)[^\\\`]*\\$\\{[^}]+\\}[^\\\`]*\\\`\\}/g,\n      violations,\n    );\n    collectMatches(\n      file,\n      source,\n      /const\\s+(?:names|classes|classNames)\\s*=\\s*\\[[\\s\\S]*?\\];[\\s\\S]*?\\.join\\((['\\"]) \\1\\)/g,\n      violations,\n    );\n  }\n\n  assert.deepEqual(\n    violations,\n    [],\n    'Found manual dynamic CSS class composition; use clsx instead:\\n' + violations.join('\\n'),\n  );\n});\n`;
  await writeFile(architectureTest, testSource);
}

const remaining = [];
for (const file of sourceFiles) {
  const source = await readFile(file, 'utf8');
  if (/\[[^\]]*?\]\s*\.filter\(Boolean\)\s*\.join\((['"]) \1\)/s.test(source)) {
    remaining.push(`${path.relative(uiRoot, file)}: array filter/join`);
  }
  if (/className\s*\?\s*`[^`]*\$\{className\}[^`]*`/.test(source)) {
    remaining.push(`${path.relative(uiRoot, file)}: className ternary template`);
  }
  if (/className=\{`(?=[^`]*\s)[^`]*\$\{[^}]+\}[^`]*`\}/.test(source)) {
    remaining.push(`${path.relative(uiRoot, file)}: interpolated multi-class template`);
  }
  if (/const\s+(?:names|classes|classNames)\s*=\s*\[[\s\S]*?\];[\s\S]*?\.join\((['"]) \1\)/.test(source)) {
    remaining.push(`${path.relative(uiRoot, file)}: class-name array join`);
  }
}

if (remaining.length > 0) {
  throw new Error(`Unmigrated class composition:\n${remaining.join('\n')}`);
}

console.log(`Migrated ${changed.length} source files to clsx.`);
