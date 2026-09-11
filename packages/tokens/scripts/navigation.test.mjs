import assert from 'node:assert/strict';
import test from 'node:test';
const generatedUrl = new URL('../dist/generated/tokens.js', import.meta.url);

test('Style Dictionary emits the reconciled navigation families', async () => {
  const token = await import(`${generatedUrl.href}?navigation=${Date.now()}`);
  assert.equal(token.ComponentNavigationBarContainerHeight, '64px');
  assert.equal(token.ComponentNavigationBarTallContainerHeight, '80px');
  assert.equal(token.ComponentNavigationBarHorizontalItemActiveIndicatorHeight, '40px');
  assert.equal(token.ComponentNavigationBarVerticalItemActiveIndicatorWidth, '56px');
  assert.equal(token.ComponentNavigationDrawerActiveIndicatorWidth, '336px');
  assert.equal(token.ComponentNavigationDrawerBottomContainerShape, 'largeTop');
  assert.equal(token.ComponentNavigationRailColorItemInactiveFocusedStateLayer, 'var(--on-secondary-container)');
  assert.equal(token.ComponentNavigationRailCollapsedNarrowContainerWidth, '80px');
  assert.equal(token.ComponentNavigationRailExpandedModalContainerColor, 'var(--surface-container)');
  assert.equal(token.ComponentNavigationRailHorizontalItemLabelTextTypography, 'labelLarge');
  assert.equal(token.ComponentNavigationRailVerticalItemLabelTextTypography, 'labelMedium');
  assert.equal(token.ComponentNavigationTabPrimaryActiveIndicatorShape, '3px');
  assert.equal(token.ComponentNavigationTabPrimaryInactiveIconColor, 'var(--on-surface-variant)');
  assert.equal(token.ComponentNavigationTabSecondaryDividerHeight, '1px');
  assert.equal(token.ComponentNavigationTabSecondaryLabelTextTypography, 'titleSmall');
});
