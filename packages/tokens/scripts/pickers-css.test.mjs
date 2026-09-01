import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageRoot = new URL('../', import.meta.url);

async function generated(name) {
  return readFile(new URL(`dist/generated/${name}.css`, packageRoot), 'utf8');
}

test('generated DatePicker CSS owns immutable picker defaults', async () => {
  const css = await generated('date-picker');

  assert.match(css, /\.date-picker \{/);
  assert.match(css, /--_date-picker-cell-size: 48px;/);
  assert.match(css, /--_date-picker-horizontal-padding: 12px;/);
  assert.match(css, /--_date-picker-month-year-height: 56px;/);
  assert.match(css, /--_date-picker-mode-parallax: 48px;/);
  assert.match(css, /--_date-picker-state-layer-size: 40px;/);
  assert.match(css, /--_date-picker-selected-color: var\(--primary\);/);
  assert.match(css, /--_date-picker-range-color: var\(--secondary-container\);/);
  assert.match(css, /--_date-picker-divider-thickness: 1px;/);
  assert.match(css, /--_date-picker-spatial-duration: 194ms;/);
  assert.match(css, /--_date-picker-effects-in-duration: 166ms;/);
  assert.match(css, /--_date-picker-effects-out-duration: 108ms;/);
  assert.match(css, /--_date-picker-body-font-size: 16px;/);

  const modal = css.match(/\.date-picker\[data-variant='modal'\] \{([^}]+)\}/)?.[1] ?? '';
  assert.match(modal, /--_date-picker-width: 360px;/);
  assert.match(modal, /--_date-picker-height: 568px;/);
  assert.match(modal, /--_date-picker-header-height: 120px;/);

  const input = css.match(/\.date-picker\[data-variant='modal'\]\[data-display-mode='input'\] \{([^}]+)\}/)?.[1] ?? '';
  assert.match(input, /--_date-picker-width: 328px;/);
  assert.match(input, /--_date-picker-height: 512px;/);
  assert.match(input, /--_date-picker-container-color: var\(--surface-container-high\);/);

  const docked = css.match(/\.date-picker\[data-variant='docked'\] \{([^}]+)\}/)?.[1] ?? '';
  assert.match(docked, /--_date-picker-width: 360px;/);
  assert.match(docked, /--_date-picker-height: 456px;/);
  assert.match(docked, /--_date-picker-state-layer-size: 40px;/);
  assert.match(docked, /--_date-picker-container-radius: 16px;/);

  assert.doesNotMatch(css, /(^|\s)--primary\s*:/m);
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}/i);
});

test('generated TimePicker CSS owns immutable picker and input defaults', async () => {
  const css = await generated('time-picker');

  assert.match(css, /\.time-picker,/);
  assert.match(css, /--_tp-dial-size: 256px;/);
  assert.match(css, /--_tp-selector-size: 48px;/);
  assert.match(css, /--_tp-selector-track-width: 2px;/);
  assert.match(css, /--_tp-selector-center-size: 8px;/);
  assert.match(css, /--_tp-time-selector-width: 96px;/);
  assert.match(css, /--_tp-time-selector-24-width: 114px;/);
  assert.match(css, /--_tp-period-v-width: 52px;/);
  assert.match(css, /--_tp-period-h-width: 216px;/);
  assert.match(css, /--_tp-input-width: 96px;/);
  assert.match(css, /--_tp-input-height: 72px;/);
  assert.match(css, /--_tp-input-focus-outline-width: 2px;/);
  assert.match(css, /--_tp-time-selector-font-size: 57px;/);
  assert.match(css, /--_tp-input-font-size: 45px;/);
  assert.match(css, /--_tp-period-font-size: 16px;/);
  assert.match(css, /--_tp-dial-label-font-size: 16px;/);
  assert.match(css, /--_tp-standard-field-shape: 8px;/);
  assert.match(css, /--_tp-vibrant-field-shape: 16px;/);
  assert.match(css, /--_tp-vibrant-period-shape: 9999px;/);
  assert.match(css, /--_tp-standard-display-dial-gap: 36px;/);
  assert.match(css, /--_tp-vibrant-horizontal-display-dial-gap: 52px;/);
  assert.match(css, /--_tp-spatial-duration: 194ms;/);
  assert.match(css, /--_tp-effects-duration: 166ms;/);
  assert.match(css, /--_tp-dial-color: var\(--surface-container-highest\);/);
  assert.match(css, /--_tp-selector-color: var\(--primary\);/);

  assert.doesNotMatch(css, /(^|\s)--primary\s*:/m);
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}/i);
});
