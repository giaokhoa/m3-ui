import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageRoot = new URL('../', import.meta.url);

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, packageRoot), 'utf8'));
}

test('Checkbox component colors alias canonical runtime roles', async () => {
  const base = (await readJson('tokens/component/checkbox.json')).component.checkbox;
  const web = (await readJson('tokens/component/checkbox-web-current.json')).component.checkbox;

  assert.equal(base.labelColor.$value, '{color.role.onSurface}');
  assert.equal(base.colors.selectedContainer.$value, '{color.role.primary}');
  assert.equal(base.colors.selectedIcon.$value, '{color.role.onPrimary}');
  assert.equal(base.colors.unselectedOutline.$value, '{color.role.onSurfaceVariant}');
  assert.equal(base.colors.disabledSelectedContainer.$value, '{color.role.onSurface}');
  assert.equal(base.colors.disabledSelectedIcon.$value, '{color.role.surface}');
  assert.equal(base.colors.disabledUnselectedOutline.$value, '{color.role.onSurface}');

  assert.equal(web.focusIndicatorColor.$value, '{color.role.secondary}');
  assert.equal(web.selectedPressedStateLayerColor.$value, '{color.role.onSurface}');
  assert.equal(web.unselectedInteractiveOutlineColor.$value, '{color.role.onSurface}');
  assert.equal(web.unselectedPressedStateLayerColor.$value, '{color.role.primary}');
  assert.equal(web.error.selectedContainerColor.$value, '{color.role.error}');
  assert.equal(web.error.selectedIconColor.$value, '{color.role.onError}');
  assert.equal(web.error.unselectedOutlineColor.$value, '{color.role.error}');
  assert.equal(web.error.stateLayerColor.$value, '{color.role.error}');
});

test('generated JS resolves Checkbox semantic aliases to ThemeProvider runtime expressions', async () => {
  const generated = await import(
    `${new URL('dist/generated/tokens.js', packageRoot).href}?checkbox=${Date.now()}`
  );

  assert.equal(generated.ComponentCheckboxLabelColor, 'var(--on-surface)');
  assert.equal(generated.ComponentCheckboxColorsSelectedContainer, 'var(--primary)');
  assert.equal(generated.ComponentCheckboxColorsSelectedIcon, 'var(--on-primary)');
  assert.equal(generated.ComponentCheckboxFocusIndicatorColor, 'var(--secondary)');
});

test('generated Checkbox CSS owns immutable defaults and disabled blends', async () => {
  const css = await readFile(
    new URL('dist/generated/checkbox.css', packageRoot),
    'utf8',
  );

  assert.match(css, /\.checkbox \{/);
  assert.match(css, /--_checkbox-container-size: 18px;/);
  assert.match(css, /--_checkbox-container-radius: 2px;/);
  assert.match(css, /--_checkbox-state-layer-size: 40px;/);
  assert.match(css, /--_checkbox-interactive-size: 48px;/);
  assert.match(css, /--_checkbox-stroke-width: 2px;/);
  assert.match(css, /--_checkbox-label-color: var\(--on-surface\);/);
  assert.match(css, /--_checkbox-selected-container: var\(--primary\);/);
  assert.match(css, /--_checkbox-selected-icon: var\(--on-primary\);/);
  assert.match(css, /--_checkbox-unselected-outline: var\(--on-surface-variant\);/);
  assert.match(
    css,
    /--_checkbox-disabled-selected-container-color: color-mix\(in srgb, var\(--on-surface\) 38%, transparent\);/,
  );
  assert.match(
    css,
    /--_checkbox-disabled-unselected-outline-color: color-mix\(in srgb, var\(--on-surface\) 38%, transparent\);/,
  );
  assert.match(
    css,
    /--_checkbox-disabled-label-color: color-mix\(in srgb, var\(--on-surface\) 38%, transparent\);/,
  );
  assert.match(css, /--_checkbox-box-in-duration: 166ms;/);
  assert.match(css, /--_checkbox-box-out-duration: 108ms;/);
  assert.match(css, /--_checkbox-mark-duration: 194ms;/);
  assert.match(css, /--_checkbox-mark-out-delay: 100ms;/);

  assert.doesNotMatch(css, /(^|\s)--primary\s*:/m);
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}/i);
});
