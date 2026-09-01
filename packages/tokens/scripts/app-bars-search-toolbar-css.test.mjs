import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageRoot = new URL('../', import.meta.url);
const readCss = (name) => readFile(new URL(`dist/generated/${name}.css`, packageRoot), 'utf8');

test('generated app-bar CSS owns static paint, type and motion', async () => {
  const css = await readCss('top-app-bar');
  assert.match(css, /\.top-app-bar \{/);
  assert.match(css, /--_top-app-bar-container-color: var\(--surface\);/);
  assert.match(css, /--_top-app-bar-collapsed-height: 64px;/);
  assert.match(css, /--_top-app-bar-collapsed-title-font-size: 22px;/);
  assert.match(css, /\.top-app-bar\[data-scrolled\]/);
  assert.match(css, /--_top-app-bar-container-color: var\(--surface-container\);/);
  assert.match(css, /--_top-app-bar-motion-duration: 166ms;/);
});

test('generated bottom-app-bar CSS owns canonical flexible spacing and motion', async () => {
  const css = await readCss('bottom-app-bar');
  assert.match(css, /--_bottom-app-bar-content-color: var\(--on-surface\);/);
  assert.match(css, /--_bottom-app-bar-flexible-leading-space: 16px;/);
  assert.match(css, /--_bottom-app-bar-flexible-min-spacing: 4px;/);
  assert.match(css, /--_bottom-app-bar-flexible-max-spacing: 32px;/);
  assert.match(css, /--_bottom-app-bar-motion-duration: 137ms;/);
});

test('generated search CSS owns static surface, shape, type and motion', async () => {
  const css = await readCss('search-bar');
  assert.match(css, /--_search-container-height: 56px;/);
  assert.match(css, /--_search-container-color: var\(--surface-container-high\);/);
  assert.match(css, /--_search-font-size: 16px;/);
  assert.match(css, /\.search-view--docked \{/);
  assert.match(css, /--_search-view-header-height: 56px;/);
  assert.match(css, /\.search-view--fullscreen \{/);
  assert.match(css, /--_search-view-header-height: 72px;/);
});

test('generated floating-toolbar CSS owns token geometry, variants, FAB state and motion', async () => {
  const css = await readCss('floating-toolbar');
  assert.match(css, /--_floating-toolbar-container-size: 64px;/);
  assert.match(css, /--_floating-toolbar-container-radius: 9999px;/);
  assert.match(css, /--_floating-toolbar-container-color: var\(--surface-container\);/);
  assert.match(css, /--_floating-toolbar-fab-size: 80px;/);
  assert.match(css, /\.floating-toolbar\[data-expanded\]/);
  assert.match(css, /--_floating-toolbar-fab-size: 56px;/);
  assert.match(css, /--_floating-toolbar-motion-duration: 137ms;/);
});
