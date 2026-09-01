import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageRoot = new URL('../', import.meta.url);

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, packageRoot), 'utf8'));
}

test('Slider semantic colors alias canonical runtime roles', async () => {
  const base = (await readJson('tokens/component/surface-controls.json')).component.slider;
  const web = (await readJson('tokens/component/slider-web-current.json')).component.slider.webCurrent;

  assert.equal(base.handleColor.$value, '{color.role.primary}');
  assert.equal(base.activeTrackColor.$value, '{color.role.primary}');
  assert.equal(base.inactiveTrackColor.$value, '{color.role.secondaryContainer}');
  assert.equal(base.disabledHandleColor.$value, '{color.role.onSurface}');
  assert.equal(base.disabledActiveTrackColor.$value, '{color.role.onSurface}');
  assert.equal(base.disabledInactiveTrackColor.$value, '{color.role.onSurface}');
  assert.equal(base.valueIndicatorContainerColor.$value, '{color.role.inverseSurface}');
  assert.equal(base.valueIndicatorLabelTextColor.$value, '{color.role.inverseOnSurface}');

  assert.equal(web.stopIndicatorColor.$value, '{color.role.onSecondaryContainer}');
  assert.equal(web.stopIndicatorColorSelected.$value, '{color.role.onPrimary}');
  assert.equal(
    web.disabledActiveStopIndicatorContainerColor.$value,
    '{color.role.inverseOnSurface}',
  );
  assert.equal(web.disabledInactiveStopIndicatorContainerColor.$value, '{color.role.onSurface}');
});

test('generated JS resolves Slider semantic aliases to ThemeProvider runtime expressions', async () => {
  const generated = await import(
    `${new URL('dist/generated/tokens.js', packageRoot).href}?slider=${Date.now()}`
  );

  assert.equal(generated.ComponentSliderHandleColor, 'var(--primary)');
  assert.equal(generated.ComponentSliderInactiveTrackColor, 'var(--secondary-container)');
  assert.equal(generated.ComponentSliderDisabledHandleColor, 'var(--on-surface)');
  assert.equal(generated.ComponentSliderWebCurrentStopIndicatorColor, 'var(--on-secondary-container)');
  assert.equal(generated.ComponentSliderWebCurrentStopIndicatorColorSelected, 'var(--on-primary)');
});

test('generated Slider CSS owns immutable paint, typography, gaps and size matrices', async () => {
  const css = await readFile(new URL('dist/generated/slider.css', packageRoot), 'utf8');

  assert.match(css, /\.slider \{/);
  assert.match(css, /--_slider-handle-width: 4px;/);
  assert.match(css, /--_slider-hover-handle-width: 4px;/);
  assert.match(css, /--_slider-focus-handle-width: 2px;/);
  assert.match(css, /--_slider-pressed-handle-width: 2px;/);
  assert.match(css, /--_slider-disabled-handle-width: 4px;/);
  assert.match(css, /--_slider-default-thumb-track-gap: 8px;/);
  assert.match(css, /--_slider-focus-thumb-track-gap: 7px;/);
  assert.match(css, /--_slider-pressed-thumb-track-gap: 7px;/);
  assert.match(css, /--_slider-disabled-thumb-track-gap: 8px;/);
  assert.match(css, /--_slider-handle-color: var\(--primary\);/);
  assert.match(css, /--_slider-active-track-color: var\(--primary\);/);
  assert.match(css, /--_slider-inactive-track-color: var\(--secondary-container\);/);
  assert.match(css, /--_slider-disabled-handle-color: var\(--on-surface\);/);
  assert.match(css, /--_slider-disabled-handle-opacity: 0\.38;/);
  assert.match(css, /--_slider-disabled-active-track-opacity: 0\.38;/);
  assert.match(css, /--_slider-disabled-inactive-track-opacity: 0\.12;/);
  assert.match(css, /--_slider-stop-size: 4px;/);
  assert.match(css, /--_slider-stop-trailing-space: 4px;/);
  assert.match(css, /--_slider-stop-center-inset: 6px;/);
  assert.match(css, /--_slider-stop-color: var\(--on-secondary-container\);/);
  assert.match(css, /--_slider-selected-stop-color: var\(--on-primary\);/);
  assert.match(css, /--_slider-disabled-active-stop-color: var\(--inverse-on-surface\);/);
  assert.match(css, /--_slider-disabled-inactive-stop-color: var\(--on-surface\);/);
  assert.match(css, /--_slider-value-indicator-bottom-space: 12px;/);
  assert.match(css, /--_slider-value-indicator-container-color: var\(--inverse-surface\);/);
  assert.match(css, /--_slider-value-indicator-label-color: var\(--inverse-on-surface\);/);
  assert.match(css, /--_slider-value-indicator-font-family: var\(--font-family-plain\);/);
  assert.match(css, /--_slider-value-indicator-font-size: 14px;/);
  assert.match(css, /--_slider-value-indicator-line-height: 20px;/);
  assert.match(css, /--_slider-value-indicator-font-weight: 400;/);
  assert.match(css, /--_slider-value-indicator-letter-spacing: 0\.5px;/);

  const sizes = {
    xSmall: ['44px', '16px', '8px'],
    small: ['44px', '24px', '8px'],
    medium: ['44px', '40px', '12px'],
    large: ['68px', '56px', '16px'],
    xLarge: ['108px', '96px', '28px'],
  };
  for (const [size, [handle, track, radius]] of Object.entries(sizes)) {
    const block = css.match(new RegExp(`\\.slider\\[data-size='${size}'\\] \\{([^}]+)\\}`))?.[1] ?? '';
    assert.match(block, new RegExp(`--_slider-handle-length: ${handle.replace('.', '\\.')};`));
    assert.match(block, new RegExp(`--_slider-active-track-thickness: ${track.replace('.', '\\.')};`));
    assert.match(block, new RegExp(`--_slider-inactive-track-thickness: ${track.replace('.', '\\.')};`));
    assert.match(block, new RegExp(`--_slider-active-outer-radius: ${radius.replace('.', '\\.')};`));
    assert.match(block, new RegExp(`--_slider-inactive-outer-radius: ${radius.replace('.', '\\.')};`));
  }

  assert.doesNotMatch(css, /--_slider-min-target:/);
  assert.doesNotMatch(css, /--_slider-min-inline-size:/);
  assert.doesNotMatch(css, /--_slider-inner-radius:/);
  assert.doesNotMatch(css, /(^|\s)--primary\s*:/m);
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}/i);
});
