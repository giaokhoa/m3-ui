import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageRoot = new URL('../', import.meta.url);

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, packageRoot), 'utf8'));
}

test('IconButton semantic colors alias canonical runtime roles', async () => {
  const icon = (await readJson('tokens/component/icon-button.json')).component.iconButton;
  const generic = (await readJson('tokens/component/icon-button-web-generic.json')).component.iconButton;

  assert.equal(icon.standard.color.$value, '{color.role.onSurfaceVariant}');
  assert.equal(icon.standard.selectedColor.$value, '{color.role.primary}');
  assert.equal(icon.variant.filled.containerColor.$value, '{color.role.primary}');
  assert.equal(icon.variant.filled.unselectedContainerColor.$value, '{color.role.surfaceContainer}');
  assert.equal(icon.variant.filledTonal.selectedContainerColor.$value, '{color.role.secondary}');
  assert.equal(icon.variant.outlined.selectedContainerColor.$value, '{color.role.inverseSurface}');
  assert.equal(generic.focusIndicatorColor.$value, '{color.role.secondary}');
});

test('generated IconButton CSS owns immutable size width shape and paint matrices', async () => {
  const css = await readFile(new URL('dist/generated/icon-button.css', packageRoot), 'utf8');

  assert.match(css, /\.icon-button \{/);
  assert.doesNotMatch(css, /--_icon-button-target-size:/);
  assert.doesNotMatch(css, /--_icon-button-container-width:/);
  assert.match(css, /\.icon-button\[data-size='extraSmall'\] \{[^}]*--_icon-button-container-height: 32px;[^}]*--_icon-button-icon-size: 20px;/s);
  assert.match(css, /\.icon-button\[data-size='large'\] \{[^}]*--_icon-button-default-space: 32px;/s);
  assert.match(css, /\.icon-button\[data-size='extraLarge'\] \{[^}]*--_icon-button-outline-width: 3px;/s);
  assert.match(css, /\.icon-button\[data-shape='round'\] \{[^}]*--_icon-button-container-radius: var\(--_icon-button-round-radius\);/s);
  assert.match(css, /\.icon-button--filled \{[^}]*--_icon-button-container-color: var\(--primary\);[^}]*--_icon-button-content-color: var\(--on-primary\);/s);
  assert.match(css, /\.icon-button--filled\[data-toggle\] \{[^}]*--_icon-button-container-color: var\(--surface-container\);/s);
  assert.match(css, /\.icon-button--filled-tonal\[data-toggle\]\[data-selected\] \{[^}]*--_icon-button-container-color: var\(--secondary\);[^}]*--_icon-button-content-color: var\(--on-secondary\);/s);
  assert.match(css, /\.icon-button--outlined\[data-toggle\]\[data-selected\] \{[^}]*--_icon-button-outline-color: transparent;/s);
  assert.match(css, /\.icon-button--outlined\[data-toggle\]\[data-selected\]\[data-disabled\] \{[^}]*--_icon-button-container-color: color-mix\(in srgb, var\(--on-surface\) 10%, transparent\);/s);
  assert.doesNotMatch(css, /--_ripple-(?:hover|focus|pressed)-opacity:/);
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}/i);
});
