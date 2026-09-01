import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import {
  buildMaterialSpecModel,
  defaultRepositoryRoot,
  requireMaterialSpecFamily,
  selectMaterialSpecEntries,
  stableMaterialSpecJson,
} from './material-spec.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = defaultRepositoryRoot();

let cachedModel;
async function model() {
  cachedModel ??= await buildMaterialSpecModel({ repoRoot });
  return cachedModel;
}

test('extracts canonical component tokens and preserves aliases', async () => {
  const button = requireMaterialSpecFamily(await model(), 'button');
  const iconPaddingBlock = button.entries.find(
    (entry) => entry.path === 'baseline.iconPadding.block',
  );

  assert.equal(button.tokenPath, 'component.button');
  assert.equal(iconPaddingBlock?.alias, 'component.button.baseline.padding.block');
  assert.equal(iconPaddingBlock?.resolvedValue, '8px');
});

test('supports focused spec groups without a docs-owned token mapping table', async () => {
  const entries = selectMaterialSpecEntries(await model(), 'button', ['shape', 'icon']);

  assert.ok(entries.length > 0);
  assert.ok(entries.every((entry) => entry.group === 'shape' || entry.group === 'icon'));
  assert.ok(entries.some((entry) => entry.path === 'baseline.containerShape'));
  assert.ok(entries.some((entry) => entry.path === 'baseline.iconSize'));
});

test('missing families and groups fail loudly instead of guessing', async () => {
  const specs = await model();

  assert.throws(
    () => requireMaterialSpecFamily(specs, 'definitely-not-a-family'),
    /Unknown Material spec family/,
  );
  assert.throws(
    () => selectMaterialSpecEntries(specs, 'shape', ['icon']),
    /has no "icon" group/,
  );
});

test('Material spec output is deterministic and does not leak absolute workspace paths', async () => {
  const first = stableMaterialSpecJson(await model());
  const second = stableMaterialSpecJson(await buildMaterialSpecModel({ repoRoot }));

  assert.equal(first, second);
  assert.equal(first.includes(resolve(repoRoot)), false);
});

test('MDX fixture embeds MaterialSpecTable through the shared runtime registry', async () => {
  const fixture = await readFile(resolve(scriptDir, 'fixtures/material-spec.mdx'), 'utf8');
  const registry = await readFile(resolve(scriptDir, '../src/mdx.tsx'), 'utf8');

  assert.match(fixture, /<MaterialSpecTable family="button" groups=\{\['size', 'shape', 'icon'\]\} \/>/);
  assert.doesNotMatch(fixture, /^\s*import\s/m);
  assert.match(registry, /import \{ MaterialSpecTable \} from '\.\/materialSpecTable';/);
  assert.match(registry, /\bMaterialSpecTable,\s*\n/);
});
