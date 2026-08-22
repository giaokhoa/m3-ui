import assert from 'node:assert/strict';
import test from 'node:test';
const generatedUrl = new URL('../dist/generated/tokens.js', import.meta.url);

test('Style Dictionary emits full menu state vocabulary and tooltip families', async () => {
  const token = await import(`${generatedUrl.href}?menu=${Date.now()}`);
  assert.equal(token.ComponentMenuBaseContainerColor, 'var(--surface-container)');
  assert.equal(token.ComponentMenuStandardContainerColor, 'var(--surface-container-low)');
  assert.equal(token.ComponentMenuStandardItemSelectedDisabledContainerOpacity, 0.38);
  assert.equal(token.ComponentMenuStandardItemSelectedFocusedSupportingTextColor, 'var(--on-tertiary-container)');
  assert.equal(token.ComponentMenuVibrantContainerColor, 'var(--tertiary-container)');
  assert.equal(token.ComponentMenuVibrantItemFocusedLeadingIconColor, 'var(--tertiary)');
  assert.equal(token.ComponentMenuVibrantItemSelectedDisabledSupportingTextOpacity, 0.38);
  assert.equal(token.ComponentMenuVibrantItemSelectedTrailingSupportingTextColor, 'var(--on-tertiary)');
  assert.equal(token.ComponentMenuSegmentedActiveContainerShape, '24px');
  assert.equal(token.ComponentMenuSegmentedHorizontalIconOnlySegmentedGap, '4px');
  assert.equal(token.ComponentMenuSegmentedItemLabelTextTypography, 'bodyLarge');
  assert.equal(token.ComponentTooltipPlainSupportingTextTypography, 'bodySmall');
  assert.equal(token.ComponentTooltipRichContainerElevation, 'level2');
  assert.equal(token.ComponentTooltipRichActionPressedLabelTextColor, 'var(--primary)');
  assert.equal(token.ComponentFabMenuCloseButtonContainerHeight, '56px');
  assert.equal(token.ComponentFabMenuListItemIconLabelSpace, '8px');
});
