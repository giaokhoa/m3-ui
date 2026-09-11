import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { listCssAdapterNames } from '../style-dictionary/adapter-registry.mjs';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('generated CSS adapters share one package export convention', async () => {
  const packageJson = JSON.parse(
    await readFile(resolve(packageRoot, 'package.json'), 'utf8'),
  );
  assert.deepEqual(
    packageJson.exports['./*.css'],
    {
      types: './dist/css.d.ts',
      default: './dist/generated/*.css',
    },
    'generated CSS subpaths must expose runtime CSS and a TypeScript declaration',
  );

  await Promise.all([
    access(resolve(packageRoot, 'dist/css.d.ts')),
    ...listCssAdapterNames().map((name) =>
      access(resolve(packageRoot, `dist/generated/${name}.css`)),
    ),
  ]);
});
