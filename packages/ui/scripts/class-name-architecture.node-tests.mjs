import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const uiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(uiRoot, '../..');

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
      /\[[^\]]*?\]\s*\.filter\(Boolean\)\s*\.join\((['\"]) \1\)/gs,
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
      /const\s+(?:names|classes|classNames)\s*=\s*\[[\s\S]*?\];[\s\S]*?\.join\((['\"]) \1\)/g,
      violations,
    );
  }

  assert.deepEqual(
    violations,
    [],
    'Found manual dynamic CSS class composition; use clsx instead:\n' + violations.join('\n'),
  );
});
