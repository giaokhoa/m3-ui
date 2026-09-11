import assert from 'node:assert/strict';
import test from 'node:test';
const generatedUrl = new URL('../dist/generated/tokens.js', import.meta.url);
async function generated() { return import(`${generatedUrl.href}?final=${Date.now()}`); }

test('Style Dictionary emits dialog, bottom sheet and toolbar families', async () => {
  const token = await generated();
  assert.equal(token.ComponentDialogContainerColor, 'var(--surface-container-high)');
  assert.equal(token.ComponentDialogIconSize, '24px');
  assert.equal(token.ComponentSheetBottomDockedContainerShape, 'extraLargeTop');
  assert.equal(token.ComponentSheetBottomDockedDragHandleWidth, '32px');
  assert.equal(token.ComponentToolbarDockedContainerMaxSpacing, '32px');
  assert.equal(token.ComponentToolbarFloatingVibrantContainerColor, 'var(--primary-container)');
});

test('Style Dictionary preserves the current slider state matrix', async () => {
  const token = await generated();
  assert.equal(token.ComponentSliderActiveHandleHeight, '44px');
  assert.equal(token.ComponentSliderActiveTrackHeight, '16px');
  assert.equal(token.ComponentSliderDisabledActiveTrackOpacity, 0.38);
  assert.equal(token.ComponentSliderDisabledInactiveTrackOpacity, 0.12);
  assert.equal(token.ComponentSliderPressedHandleWidth, '2px');
  assert.equal(token.ComponentSliderValueIndicatorLabelTextFont, 'labelLarge');
});
