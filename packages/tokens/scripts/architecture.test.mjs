import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const packageRoot = new URL('../', import.meta.url);
const repoRoot = new URL('../../../', import.meta.url);

const valueFacades = [
  'card.ts',
  'checkbox.ts',
  'chip.ts',
  'elevation.ts',
  'radio-button.ts',
  'text-field.ts',
];

const removedCoreFacades = ['motion.ts', 'ripple.ts', 'state.ts', 'typography.ts'];

test('remaining compatibility facades project Style Dictionary output', async () => {
  for (const file of valueFacades) {
    const source = await readFile(new URL(`src/${file}`, packageRoot), 'utf8');
    assert.match(source, /@m3\/tokens\/generated/, `${file} must consume generated tokens`);
    assert.doesNotMatch(source, /generated\/androidx/, `${file} must not consume an AndroidX snapshot`);
  }
});

test('retired compatibility and upstream-sync paths stay deleted', async () => {
  for (const file of removedCoreFacades) {
    await assert.rejects(access(new URL(`src/${file}`, packageRoot)));
  }
  await assert.rejects(access(new URL('src/generated/androidx', packageRoot)));
  await assert.rejects(access(new URL('src/index.ts', packageRoot)));
  await assert.rejects(access(new URL('scripts/compose-sync', repoRoot)));

  const rootManifest = JSON.parse(await readFile(new URL('package.json', repoRoot), 'utf8'));
  for (const [name, command] of Object.entries(rootManifest.scripts ?? {})) {
    assert.doesNotMatch(
      `${name} ${command}`,
      /compose:sync|scripts\/compose-sync/,
      `root script ${name} must not resurrect the legacy sync pipeline`,
    );
  }

  const manifest = JSON.parse(await readFile(new URL('package.json', packageRoot), 'utf8'));
  for (const subpath of ['./motion', './ripple', './state', './typography']) {
    assert.equal(Object.hasOwn(manifest.exports, subpath), false, `${subpath} must stay retired`);
  }
});

test('Style Dictionary reads only canonical DTCG and emits only typed JS artifacts', async () => {
  const configUrl = new URL('style-dictionary.config.mjs', packageRoot);
  const { default: config } = await import(`${configUrl.href}?architecture=${Date.now()}`);

  assert.deepEqual(config.source, ['tokens/**/*.json']);
  assert.equal(Object.hasOwn(config, 'include'), false, 'upstream references must never be Style Dictionary includes');
  assert.deepEqual(Object.keys(config.platforms), ['js'], 'generic CSS-variable platforms are forbidden');
});

test('package root is the Style Dictionary generated API', async () => {
  const manifest = JSON.parse(await readFile(new URL('package.json', packageRoot), 'utf8'));
  assert.equal(manifest.main, './dist/generated/tokens.js');
  assert.equal(manifest.types, './dist/generated/tokens.d.ts');
  assert.equal(manifest.exports['.'].import, './dist/generated/tokens.js');
  assert.equal(manifest.exports['.'].types, './dist/generated/tokens.d.ts');
});
