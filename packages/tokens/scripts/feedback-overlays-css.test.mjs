import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageRoot = new URL('../', import.meta.url);

async function css(name) {
  return readFile(new URL(`dist/generated/${name}.css`, packageRoot), 'utf8');
}

test('feedback overlay generated CSS owns immutable Material defaults', async () => {
  const [bottomSheet, snackbar, dialog, tooltip, scrim] = await Promise.all([
    css('bottom-sheet'), css('snackbar'), css('dialog'), css('tooltip'), css('scrim'),
  ]);

  assert.match(bottomSheet, /--_bottom-sheet-container-color: var\(--surface-container-low\);/);
  assert.match(bottomSheet, /--_bottom-sheet-drag-handle-width: 32px;/);
  assert.match(bottomSheet, /--_bottom-sheet-settle-duration: 194ms;/);
  assert.match(bottomSheet, /--_scrim-container-opacity: 0\.32;/);

  assert.match(snackbar, /--_snackbar-container-color: var\(--inverse-surface\);/);
  assert.match(snackbar, /--_snackbar-radius: 4px;/);
  assert.match(snackbar, /--_snackbar-action-font-size: 14px;/);
  assert.match(snackbar, /\.snackbar__action > \.button\[data-pressed\]/);
  assert.match(snackbar, /\.snackbar__dismiss > \.icon-button\[data-focus-visible\]/);

  assert.match(dialog, /--_dialog-container-color: var\(--surface-container-high\);/);
  assert.match(dialog, /--_dialog-radius: 28px;/);
  assert.match(dialog, /--_dialog-min-width: 280px;/);
  assert.match(dialog, /\.dialog__actions \.button\[data-hovered\]/);

  assert.match(tooltip, /--_plain-tooltip-container-color: var\(--inverse-surface\);/);
  assert.match(tooltip, /--_rich-tooltip-container-color: var\(--surface-container\);/);
  assert.match(tooltip, /--_rich-tooltip-scale-duration: 137ms;/);
  assert.match(tooltip, /\.rich-tooltip__action \.button\[data-pressed\]/);

  assert.match(scrim, /--_scrim-container-color: var\(--scrim\);/);
  assert.match(scrim, /--_scrim-container-opacity: 0\.32;/);

  for (const output of [bottomSheet, snackbar, dialog, tooltip, scrim]) {
    assert.doesNotMatch(output, /#[0-9a-f]{3,8}/i);
    assert.doesNotMatch(output, /(^|\s)--primary\s*:/m);
  }
});
