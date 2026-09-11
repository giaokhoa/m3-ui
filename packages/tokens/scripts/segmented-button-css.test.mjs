import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageRoot = new URL('../', import.meta.url);

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, packageRoot), 'utf8'));
}

test('SegmentedButton semantic colors alias canonical runtime roles', async () => {
  const segmented = (await readJson('tokens/component/outlined-segmented-button.json')).component.outlinedSegmentedButton;
  const web = (await readJson('tokens/component/outlined-segmented-button-web-current.json')).component.outlinedSegmentedButton;

  assert.equal(segmented.outlineColor.$value, '{color.role.outline}');
  assert.equal(segmented.selectedContainerColor.$value, '{color.role.secondaryContainer}');
  assert.equal(segmented.selectedLabelTextColor.$value, '{color.role.onSecondaryContainer}');
  assert.equal(segmented.unselectedLabelTextColor.$value, '{color.role.onSurface}');
  assert.equal(segmented.disabledLabelTextColor.$value, '{color.role.onSurface}');
  assert.equal(web.focusIndicatorColor.$value, '{color.role.secondary}');
});

test('generated SegmentedButton CSS owns immutable paint typography dimensions and motion', async () => {
  const css = await readFile(new URL('dist/generated/segmented-button.css', packageRoot), 'utf8');

  assert.match(css, /\.segmented-button-row,/);
  assert.match(css, /--_segmented-button-height: 40px;/);
  assert.match(css, /--_segmented-button-min-width:/);
  assert.match(css, /--_segmented-button-radius: 9999px;/);
  assert.match(css, /--_segmented-button-outline-width: 1px;/);
  assert.match(css, /--_segmented-button-outline-color: var\(--outline\);/);
  assert.match(css, /--_segmented-button-disabled-outline-color: color-mix\(in srgb, var\(--on-surface\) 12%, transparent\);/);
  assert.match(css, /--_segmented-button-selected-container-color: var\(--secondary-container\);/);
  assert.match(css, /--_segmented-button-selected-label-color: var\(--on-secondary-container\);/);
  assert.match(css, /--_segmented-button-unselected-label-color: var\(--on-surface\);/);
  assert.match(css, /--_segmented-button-disabled-label-color: color-mix\(in srgb, var\(--on-surface\) 38%, transparent\);/);
  assert.match(css, /--_segmented-button-icon-size: 18px;/);
  assert.match(css, /--_segmented-button-content-motion-duration:/);
  assert.match(css, /--_segmented-button-icon-motion-duration:/);
  assert.match(css, /--_segmented-button-font-family: var\(--font-family-plain\);/);
  assert.match(css, /--_segmented-button-font-size: 14px;/);
  assert.doesNotMatch(css, /--_segmented-button-content-padding-inline:/);
  assert.doesNotMatch(css, /--_segmented-button-icon-label-spacing:/);
  assert.doesNotMatch(css, /--_segmented-button-(?:checked|interaction)-z-index:/);
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}/i);
});
