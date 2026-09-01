import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageRoot = new URL('../', import.meta.url);

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, packageRoot), 'utf8'));
}

test('Switch component colors alias canonical runtime roles', async () => {
  const colors = (await readJson('tokens/component/switch.json')).component.switch.colors;

  assert.equal(colors.checkedThumb.$value, '{color.role.onPrimary}');
  assert.equal(colors.checkedTrack.$value, '{color.role.primary}');
  assert.equal(colors.checkedBorder.$value, 'transparent');
  assert.equal(colors.checkedIcon.$value, '{color.role.onPrimaryContainer}');
  assert.equal(colors.uncheckedThumb.$value, '{color.role.outline}');
  assert.equal(colors.uncheckedTrack.$value, '{color.role.surfaceContainerHighest}');
  assert.equal(colors.uncheckedBorder.$value, '{color.role.outline}');
  assert.equal(colors.disabledCheckedThumb.$value, '{color.role.surface}');
  assert.equal(colors.disabledCheckedTrack.$value, '{color.role.onSurface}');
  assert.equal(colors.disabledUncheckedThumb.$value, '{color.role.onSurface}');
  assert.equal(colors.disabledUncheckedTrack.$value, '{color.role.surfaceContainerHighest}');
  assert.equal(colors.disabledUncheckedBorder.$value, '{color.role.onSurface}');
});

test('generated JS resolves Switch semantic aliases to ThemeProvider runtime expressions', async () => {
  const generated = await import(
    `${new URL('dist/generated/tokens.js', packageRoot).href}?switch=${Date.now()}`
  );

  assert.equal(generated.ComponentSwitchColorsCheckedThumb, 'var(--on-primary)');
  assert.equal(generated.ComponentSwitchColorsCheckedTrack, 'var(--primary)');
  assert.equal(generated.ComponentSwitchColorsUncheckedThumb, 'var(--outline)');
  assert.equal(
    generated.ComponentSwitchColorsUncheckedTrack,
    'var(--surface-container-highest)',
  );
});

test('generated Switch CSS owns immutable defaults, offsets and disabled composites', async () => {
  const css = await readFile(
    new URL('dist/generated/switch.css', packageRoot),
    'utf8',
  );

  assert.match(css, /\.switch \{/);
  assert.match(css, /--_switch-track-width: 52px;/);
  assert.match(css, /--_switch-track-height: 32px;/);
  assert.match(css, /--_switch-track-outline-width: 2px;/);
  assert.match(css, /--_switch-min-interactive-size: 48px;/);
  assert.match(css, /--_switch-state-layer-size: 40px;/);
  assert.match(css, /--_switch-unchecked-thumb-size: 16px;/);
  assert.match(css, /--_switch-checked-thumb-size: 24px;/);
  assert.match(css, /--_switch-pressed-thumb-size: 28px;/);
  assert.match(css, /--_switch-icon-size: 16px;/);
  assert.match(css, /--_switch-unchecked-thumb-offset: 8px;/);
  assert.match(css, /--_switch-content-thumb-offset: 4px;/);
  assert.match(css, /--_switch-checked-thumb-offset: 24px;/);
  assert.match(css, /--_switch-pressed-unchecked-thumb-offset: 2px;/);
  assert.match(css, /--_switch-pressed-checked-thumb-offset: 22px;/);
  assert.match(css, /--_switch-label-color: var\(--on-surface\);/);
  assert.match(css, /--_switch-checked-thumb-color: var\(--on-primary\);/);
  assert.match(css, /--_switch-checked-track-color: var\(--primary\);/);
  assert.match(css, /--_switch-unchecked-thumb-color: var\(--outline\);/);
  assert.match(css, /--_switch-unchecked-track-color: var\(--surface-container-highest\);/);
  assert.match(
    css,
    /--_switch-disabled-checked-track-color: color-mix\(in srgb, var\(--on-surface\) 12%, var\(--surface\)\);/,
  );
  assert.match(
    css,
    /--_switch-disabled-unchecked-thumb-color: color-mix\(in srgb, var\(--on-surface\) 38%, var\(--surface\)\);/,
  );
  assert.match(
    css,
    /--_switch-disabled-unchecked-track-color: color-mix\(in srgb, var\(--surface-container-highest\) 12%, var\(--surface\)\);/,
  );
  assert.match(css, /--_switch-disabled-label-opacity: 38%;/);
  assert.match(css, /--_switch-geometry-duration: 137ms;/);
  assert.match(css, /--_switch-geometry-easing: linear\(/);

  assert.doesNotMatch(css, /(^|\s)--primary\s*:/m);
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}/i);
});
