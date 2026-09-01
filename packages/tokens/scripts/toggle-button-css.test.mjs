import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageRoot = new URL('../', import.meta.url);

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, packageRoot), 'utf8'));
}

test('ToggleButton canonical semantics alias system and Button tokens', async () => {
  const toggle = (await readJson('tokens/component/toggle-button.json')).component.toggleButton;
  assert.equal(toggle.variant.filled.selectedContainerColor.$value, '{color.role.primary}');
  assert.equal(toggle.variant.elevated.unselectedContainerColor.$value, '{component.button.variant.elevated.containerColor}');
  assert.equal(toggle.variant.filledTonal.selectedContainerColor.$value, '{color.role.secondary}');
  assert.equal(toggle.variant.outlined.selectedContainerColor.$value, '{color.role.inverseSurface}');
  assert.equal(toggle.variant.outlined.outlineColor.$value, '{color.role.outlineVariant}');
  assert.equal(toggle.size.extraSmall.iconSpacing.$value.value, 8);
});

test('generated ToggleButton CSS owns static selected paint shape outline disabled and motion mappings', async () => {
  const css = await readFile(new URL('dist/generated/toggle-button.css', packageRoot), 'utf8');

  assert.match(css, /\.toggle-button \{/);
  assert.match(css, /--_button-disabled-container-opacity: 10%;/);
  assert.match(css, /--_button-disabled-content-color: var\(--on-surface-variant\);/);
  assert.match(css, /--_button-disabled-content-opacity: 38%;/);
  assert.match(css, /--_toggle-button-effects-duration:/);
  assert.match(css, /\.toggle-button\[data-size='extraSmall'\] \{[^}]*--_toggle-button-selected-radius: 12px;[^}]*--_toggle-button-pressed-radius: 8px;[^}]*--_toggle-button-outline-width: 1px;/s);
  assert.match(css, /\.toggle-button\[data-size='large'\] \{[^}]*--_toggle-button-selected-radius: 28px;[^}]*--_toggle-button-outline-width: 2px;/s);
  assert.match(css, /\.toggle-button\[data-size='extraSmall'\] \{[^}]*--_button-icon-spacing: 8px;/s);
  assert.match(css, /\.toggle-button--filled \{[^}]*--_button-container-color: var\(--surface-container\);[^}]*--_button-content-color: var\(--on-surface-variant\);/s);
  assert.match(css, /\.toggle-button--filled\[data-selected\] \{[^}]*--_button-container-color: var\(--primary\);[^}]*--_button-content-color: var\(--on-primary\);/s);
  assert.match(css, /\.toggle-button--filled-tonal\[data-selected\] \{[^}]*--_button-container-color: var\(--secondary\);/s);
  assert.match(css, /\.toggle-button--outlined \{[^}]*--_button-outline-width: var\(--_toggle-button-outline-width\);/s);
  assert.match(css, /\.toggle-button--outlined\[data-selected\] \{[^}]*--_button-outline-width: 0px;/s);
  assert.match(css, /\.toggle-button\[data-pressed\] \{[^}]*--_button-container-radius: var\(--_toggle-button-pressed-radius\);/s);
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}/i);
});
