import assert from 'node:assert/strict';
import test from 'node:test';
const generatedUrl = new URL('../dist/generated/tokens.js', import.meta.url);
test('Style Dictionary emits the reconciled FAB family without inventing commented-out tokens', async () => {
  const token = await import(`${generatedUrl.href}?fab=${Date.now()}`);
  assert.equal(token.ComponentFabSizeSmallContainerHeight, '40px');
  assert.equal(token.ComponentFabSizeBaselineContainerShape, 'large');
  assert.equal(token.ComponentFabSizeMediumContainerHeight, '80px');
  assert.equal(Object.hasOwn(token, 'ComponentFabSizeMediumContainerShape'), false);
  assert.equal(token.ComponentFabSizeLargeContainerShape, 'extraLarge');
  assert.equal(token.ComponentFabContainerPrimaryContainerColor, 'var(--primary-container)');
  assert.equal(token.ComponentFabContainerPrimaryHoveredContainerElevation, 'level4');
  assert.equal(token.ComponentFabContainerSecondaryIconColor, 'var(--on-secondary-container)');
  assert.equal(token.ComponentFabExtendedPrimaryLoweredHoverContainerElevation, 'level2');
  assert.equal(token.ComponentFabExtendedSizeMediumLeadingSpace, '26px');
  assert.equal(Object.hasOwn(token, 'ComponentFabExtendedSizeMediumContainerShape'), false);
  assert.equal(token.ComponentFabExtendedSizeLargeIconLabelSpace, '20px');
});
