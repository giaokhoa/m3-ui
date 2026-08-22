import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

const valueFacades = [
  'card.ts',
  'checkbox.ts',
  'chip.ts',
  'elevation.ts',
  'motion.ts',
  'radio-button.ts',
  'ripple.ts',
  'state.ts',
  'text-field.ts',
  'typography.ts',
];

test('value facades project Style Dictionary output instead of owning literals', async () => {
  for (const file of valueFacades) {
    const source = await readFile(new URL(`src/${file}`, root), 'utf8');
    assert.match(source, /@m3\/tokens\/generated/, `${file} must consume generated tokens`);
    assert.doesNotMatch(source, /generated\/androidx/, `${file} must not consume an AndroidX snapshot`);
  }
});

test('legacy generated AndroidX runtime snapshot is absent', async () => {
  await assert.rejects(access(new URL('src/generated/androidx', root)));
});

test('package root is the Style Dictionary generated API', async () => {
  const manifest = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
  assert.equal(manifest.main, './dist/generated/tokens.js');
  assert.equal(manifest.types, './dist/generated/tokens.d.ts');
  assert.equal(manifest.exports['.'].import, './dist/generated/tokens.js');
  assert.equal(manifest.exports['.'].types, './dist/generated/tokens.d.ts');
});
