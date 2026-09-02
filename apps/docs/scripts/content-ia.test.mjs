import assert from 'node:assert/strict';
import { access, readdir, readFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import test from 'node:test';

const appDir = resolve(import.meta.dirname, '..');
const docsDir = resolve(appDir, 'content/docs');

const legacyRoutes = [
  '/docs/theming',
  '/docs/forms',
  '/docs/layout',
  '/docs/accessibility',
  '/docs/parity',
];

const canonicalFiles = [
  'foundations/theming.mdx',
  'develop/index.mdx',
  'develop/forms.mdx',
  'develop/layout.mdx',
  'develop/accessibility.mdx',
  'reference/index.mdx',
  'reference/parity.mdx',
];

async function collectMdxFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await collectMdxFiles(path)));
    if (entry.isFile() && entry.name.endsWith('.mdx')) files.push(path);
  }

  return files;
}

test('docs content uses canonical IA routes', async () => {
  const staleReferences = [];

  for (const file of await collectMdxFiles(docsDir)) {
    const content = await readFile(file, 'utf8');
    for (const route of legacyRoutes) {
      if (content.includes(route)) {
        staleReferences.push(`${relative(docsDir, file)} -> ${route}`);
      }
    }
  }

  assert.deepEqual(staleReferences, []);

  for (const file of canonicalFiles) {
    await assert.doesNotReject(access(resolve(docsDir, file)));
  }
});
