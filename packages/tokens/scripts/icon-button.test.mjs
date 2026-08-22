import assert from 'node:assert/strict';
import test from 'node:test';
const generatedUrl = new URL('../dist/generated/tokens.js', import.meta.url);
test('Style Dictionary emits the reconciled IconButton family', async () => {
  const token = await import(`${generatedUrl.href}?icon-button=${Date.now()}`);
  assert.equal(token.ComponentIconButtonStandardDisabledOpacity, 0.38);
  assert.equal(token.ComponentIconButtonStandardSelectedColor, 'var(--primary)');
  assert.equal(token.ComponentIconButtonSizeXSmallContainerHeight, '32px');
  assert.equal(token.ComponentIconButtonSizeSmallDefaultLeadingSpace, '8px');
  assert.equal(token.ComponentIconButtonSizeMediumContainerShapeSquare, 'large');
  assert.equal(token.ComponentIconButtonSizeLargeUniformLeadingSpace, '32px');
  assert.equal(token.ComponentIconButtonSizeLargeOutlinedOutlineWidth, '2px');
  assert.equal(token.ComponentIconButtonSizeXLargeContainerHeight, '136px');
  assert.equal(token.ComponentIconButtonVariantFilledContainerColor, 'var(--primary)');
  assert.equal(token.ComponentIconButtonVariantFilledTonalSelectedContainerColor, 'var(--secondary)');
  assert.equal(token.ComponentIconButtonVariantOutlinedSelectedContainerColor, 'var(--inverse-surface)');
});
