import assert from 'node:assert/strict';
import test from 'node:test';
const generatedUrl = new URL('../dist/generated/tokens.js', import.meta.url);

test('Style Dictionary emits full list state and expressive vocabulary', async () => {
  const token = await import(`${generatedUrl.href}?list=${Date.now()}`);
  assert.equal(token.ComponentListBaseContainerShape, 'large');
  assert.equal(token.ComponentListBaseItemDisabledStateLayerOpacity, 0.1);
  assert.equal(token.ComponentListBaseItemDraggedContainerElevation, 'level4');
  assert.equal(token.ComponentListBaseItemHoveredContainerExpressiveShape, 'medium');
  assert.equal(token.ComponentListBaseItemLargeLeadingVideoWidth, '114px');
  assert.equal(token.ComponentListBaseItemLeadingAvatarLabelFont, 'titleMedium');
  assert.equal(token.ComponentListBaseItemSelectedDisabledTrailingSupportingTextOpacity, 0.38);
  assert.equal(token.ComponentListBaseItemSelectedDraggedLabelTextColor, 'var(--on-secondary-container)');
  assert.equal(token.ComponentListBaseItemThreeLineContainerHeight, '88px');
  assert.equal(token.ComponentListExpandedExpandedItemTrailingIconContainerColor, 'var(--surface-container)');
  assert.equal(token.ComponentListReorderItemDropZoneColor, 'var(--surface-container-low)');
  assert.equal(token.ComponentListRevealItemActionIconButtonContainerColor, 'var(--primary)');
});
