import assert from 'node:assert/strict';
import test from 'node:test';

const generatedUrl = new URL('../dist/generated/tokens.js', import.meta.url);
async function generated(suffix) {
  return import(`${generatedUrl.href}?${suffix}=${Date.now()}`);
}

test('Style Dictionary emits button-group and split-button source semantics', async () => {
  const token = await generated('button-groups');
  assert.equal(token.ComponentButtonGroupSmallBetweenSpace, '12px');
  assert.equal(token.ComponentButtonGroupConnectedSmallInnerCornerSize, '8px');
  assert.equal(token.ComponentButtonGroupConnectedSmallPressedInnerCornerSize, '4px');
  assert.equal(token.ComponentButtonGroupConnectedSmallSelectedInnerCornerSizePercent, 50);
  assert.equal(token.ComponentSplitButtonSizeXSmallContainerHeight, '32px');
  assert.equal(token.ComponentSplitButtonSizeLargeInnerHoveredCornerSize, '20px');
  assert.equal(token.ComponentSplitButtonSizeXLargeTrailingIconSize, '50px');
});

test('Style Dictionary emits outlined segmented button states', async () => {
  const token = await generated('outlined-segmented-button');
  assert.equal(token.ComponentOutlinedSegmentedButtonContainerHeight, '40px');
  assert.equal(token.ComponentOutlinedSegmentedButtonSelectedContainerColor, 'var(--secondary-container)');
  assert.equal(token.ComponentOutlinedSegmentedButtonDisabledOutlineOpacity, 0.12);
  assert.equal(token.ComponentOutlinedSegmentedButtonIconSize, '18px');
});
