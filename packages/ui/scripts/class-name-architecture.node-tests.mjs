import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const uiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(uiRoot, '../..');

// Audited runtime exceptions must stay narrow and named. These files consume
// canonical numeric values for live renderer arithmetic; they do not own static
// paint/default projection.
const runtimeProjectionFiles = new Set([
  'packages/ui/src/components/ProgressIndicator/ProgressIndicator.defaults.ts',
  'packages/ui/src/components/TopAppBar/TopAppBar.defaults.ts',
]);

// Surface computes a tonal overlay from live absolute elevation. The percentage
// is runtime state, so this color-mix cannot be pre-generated as a static CSS
// default without changing the public custom-color behavior.
const runtimeColorMixFiles = new Set([
  'packages/ui/src/components/Surface/Surface.defaults.ts',
]);

async function walk(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function relativePath(file) {
  return path.relative(repoRoot, file).split(path.sep).join('/');
}

function collectMatches(file, source, pattern, violations) {
  for (const match of source.matchAll(pattern)) {
    violations.push(`${relativePath(file)}: ${match[0]}`);
  }
}

async function componentCodeFiles() {
  return (await walk(path.join(uiRoot, 'src/components'))).filter(
    (file) =>
      ['.ts', '.tsx'].includes(path.extname(file)) &&
      !file.endsWith('.test.ts') &&
      !file.endsWith('.test.tsx'),
  );
}

test('brand-prefixed CSS classes are forbidden', async () => {
  const cssFiles = (await walk(path.join(uiRoot, 'src'))).filter((file) =>
    file.endsWith('.css'),
  );
  const codeRoots = [
    path.join(uiRoot, 'src/components'),
    path.join(uiRoot, 'src/internal'),
    path.join(uiRoot, 'src/layout'),
    path.join(repoRoot, 'apps/storybook/.storybook'),
    path.join(repoRoot, 'apps/storybook/stories'),
    path.join(repoRoot, 'apps/storybook/visual'),
  ];
  const codeFiles = (await Promise.all(codeRoots.map((root) => walk(root))))
    .flat()
    .filter((file) => ['.js', '.jsx', '.ts', '.tsx'].includes(path.extname(file)));
  const violations = [];

  // Only CSS class selectors are forbidden here. Source identities and animation
  // names such as @m3-ui/ui, md-comp-*, or m3-progress-* keyframes remain valid.
  for (const file of cssFiles) {
    const source = await readFile(file, 'utf8');
    collectMatches(file, source, /\.m3-[A-Za-z0-9_-]+/g, violations);
  }

  // Runtime, stories and browser contracts must not emit or depend on m3-* class
  // tokens. Exclude the @m3-ui/* package scope from this class-token guard.
  for (const file of codeFiles) {
    const source = await readFile(file, 'utf8');
    collectMatches(
      file,
      source,
      /(?<!@)\bm3-[a-z0-9][a-z0-9_-]*\b/g,
      violations,
    );
  }

  assert.deepEqual(
    violations,
    [],
    `Found branded CSS class names:\n${violations.join('\n')}`,
  );
});

test('dynamic CSS class composition uses clsx', async () => {
  const codeRoots = [
    path.join(uiRoot, 'src/components'),
    path.join(uiRoot, 'src/internal'),
    path.join(uiRoot, 'src/layout'),
  ];
  const codeFiles = (await Promise.all(codeRoots.map((root) => walk(root))))
    .flat()
    .filter((file) => ['.js', '.jsx', '.ts', '.tsx'].includes(path.extname(file)));
  const violations = [];

  for (const file of codeFiles) {
    const source = await readFile(file, 'utf8');
    collectMatches(
      file,
      source,
      /\[[^\]]*?\]\s*\.filter\(Boolean\)\s*\.join\((['"]) \1\)/gs,
      violations,
    );
    collectMatches(
      file,
      source,
      /className\s*\?\s*\`[^\`]*\$\{className\}[^\`]*\`/g,
      violations,
    );
    collectMatches(
      file,
      source,
      /className=\{\`(?=[^\`]*\s)[^\`]*\$\{[^}]+\}[^\`]*\`\}/g,
      violations,
    );
    collectMatches(
      file,
      source,
      /const\s+(?:names|classes|classNames)\s*=\s*\[[\s\S]*?\];[\s\S]*?\.join\((['"]) \1\)/g,
      violations,
    );
  }

  assert.deepEqual(
    violations,
    [],
    'Found manual dynamic CSS class composition; use clsx instead:\n' + violations.join('\n'),
  );
});

test('component runtime does not reintroduce large static token projection bags', async () => {
  const violations = [];

  for (const file of await componentCodeFiles()) {
    const source = await readFile(file, 'utf8');
    const relative = relativePath(file);
    const importsGeneratedValues = /from\s+['"]@m3-ui\/tokens['"]/.test(source);
    const importsLocalTokenFacade = /from\s+['"][^'"]+\.tokens['"]/.test(source);
    const privatePropertyWrites = [
      ...source.matchAll(/['"](--_[a-z0-9_-]+)['"]\s*:/gi),
    ].map((match) => match[1]);

    // Runtime override helpers may serialize a small number of instance values.
    // A broad bag combined with generated/local token imports is the closed
    // static-token -> handwritten projection -> inline custom-property pattern.
    // The two named exceptions were audited as live geometry/scroll arithmetic.
    if (
      privatePropertyWrites.length >= 6 &&
      (importsGeneratedValues || importsLocalTokenFacade) &&
      !runtimeProjectionFiles.has(relative)
    ) {
      violations.push(
        `${relative}: ${privatePropertyWrites.length} private custom-property writes`,
      );
    }

    // Static color composites belong in CSS ownership. Surface is the sole
    // audited exception because its mix percentage is computed from live
    // absolute tonal elevation and must opt out for caller-supplied colors.
    if (/\bcolor-mix\s*\(/.test(source) && !runtimeColorMixFiles.has(relative)) {
      violations.push(`${relative}: static color-mix() belongs in generated/CSS ownership`);
    }
  }

  assert.deepEqual(
    violations,
    [],
    'Found static token projection in component runtime:\n' + violations.join('\n'),
  );
});

test('runtime static-projection exceptions remain explicit and present', async () => {
  const componentFiles = new Set((await componentCodeFiles()).map(relativePath));
  for (const file of [...runtimeProjectionFiles, ...runtimeColorMixFiles]) {
    assert.ok(componentFiles.has(file), `Remove stale runtime projection exception: ${file}`);
  }
});

test('components do not read ThemeProvider color schemes to resolve visual defaults', async () => {
  const violations = [];

  for (const file of await componentCodeFiles()) {
    const source = await readFile(file, 'utf8');
    const readsSchemeProperty = /\buseTheme\s*\(\s*\)\s*\.\s*scheme\b/.test(source);
    const destructuresScheme = /\{[^}]*\bscheme\b[^}]*\}\s*=\s*useTheme\s*\(\s*\)/s.test(source);

    // Runtime interaction policy such as `rippleFocus` may legitimately come
    // from ThemeProvider. Static paint/default resolution must inherit generated
    // role variables rather than extracting the JavaScript color scheme.
    if (readsSchemeProperty || destructuresScheme) {
      violations.push(relativePath(file));
    }
  }

  assert.deepEqual(
    violations,
    [],
    'Component visuals must inherit generated role variables instead of reading useTheme().scheme:\n' +
      violations.join('\n'),
  );
});
