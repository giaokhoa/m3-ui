import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageRoot = new URL('../', import.meta.url);

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, packageRoot), 'utf8'));
}

test('RadioButton semantic colors alias canonical runtime roles', async () => {
  const radio = (await readJson('tokens/component/radio-button.json')).component.radioButton;
  assert.equal(radio.colors.selected.$value, '{color.role.primary}');
  assert.equal(radio.colors.unselected.$value, '{color.role.onSurfaceVariant}');
  assert.equal(radio.colors.disabledSelected.$value, '{color.role.onSurface}');
  assert.equal(radio.colors.disabledUnselected.$value, '{color.role.onSurface}');
});

test('generated RadioButton CSS owns immutable dimensions paint and motion', async () => {
  const css = await readFile(new URL('dist/generated/radio-button.css', packageRoot), 'utf8');

  assert.match(css, /\.radio-button \{/);
  assert.match(css, /--_radio-icon-size: 20px;/);
  assert.match(css, /--_radio-state-layer-size: 40px;/);
  assert.match(css, /--_radio-interactive-size: 48px;/);
  assert.match(css, /--_radio-stroke-width: 2px;/);
  assert.match(css, /--_radio-dot-size: 12px;/);
  assert.match(css, /--_radio-label-color: var\(--on-surface\);/);
  assert.match(css, /--_radio-selected-color: var\(--primary\);/);
  assert.match(css, /--_radio-unselected-color: var\(--on-surface-variant\);/);
  assert.match(css, /--_radio-disabled-selected-color: var\(--on-surface\);/);
  assert.match(css, /--_radio-disabled-opacity: 0\.38;/);
  assert.match(css, /--_radio-disabled-label-opacity: 38%;/);
  assert.match(css, /--_radio-color-duration:/);
  assert.match(css, /--_radio-dot-duration:/);
  assert.match(css, /\.radio-group \{/);
  assert.match(css, /--_radio-group-content-color: var\(--on-surface\);/);
  assert.match(css, /--_radio-group-error-color: var\(--error\);/);
  assert.doesNotMatch(css, /(^|\s)--primary\s*:/m);
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}/i);
});
