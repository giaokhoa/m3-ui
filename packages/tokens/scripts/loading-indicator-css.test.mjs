import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageRoot = new URL('../', import.meta.url);

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, packageRoot), 'utf8'));
}

test('Loading Indicator semantic colors alias canonical runtime roles', async () => {
  const loading = (await readJson('tokens/component/loading-indicator.json')).component.loadingIndicator;

  assert.equal(loading.activeIndicatorColor.$value, '{color.role.primary}');
  assert.equal(loading.containedActiveColor.$value, '{color.role.onPrimaryContainer}');
  assert.equal(loading.containedContainerColor.$value, '{color.role.primaryContainer}');
});

test('generated Loading Indicator CSS owns immutable defaults', async () => {
  const css = await readFile(new URL('dist/generated/loading-indicator.css', packageRoot), 'utf8');

  assert.match(css, /\.loading-indicator \{/);
  assert.match(css, /--_loading-width: 48px;/);
  assert.match(css, /--_loading-height: 48px;/);
  assert.match(css, /--_loading-active-size: 38px;/);
  assert.match(css, /--_loading-container-radius: 9999px;/);
  assert.match(css, /--_loading-indicator-color: var\(--primary\);/);
  assert.match(css, /--_loading-container-color: transparent;/);
  assert.match(css, /\.loading-indicator\[data-contained='true'\] \{/);
  assert.match(css, /--_loading-indicator-color: var\(--on-primary-container\);/);
  assert.match(css, /--_loading-container-color: var\(--primary-container\);/);
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}/i);
});
