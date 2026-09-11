import assert from 'node:assert/strict';
import test from 'node:test';

const generatedUrl = new URL('../dist/generated/tokens.js', import.meta.url);

test('Style Dictionary emits the reconciled AppBar family', async () => {
  const token = await import(`${generatedUrl.href}?appbar=${Date.now()}`);
  assert.equal(token.ComponentAppBarBaseAvatarSize, '32px');
  assert.equal(token.ComponentAppBarBaseContainerColor, 'var(--surface)');
  assert.equal(token.ComponentAppBarBaseOnScrollContainerColor, 'var(--surface-container)');
  assert.equal(token.ComponentAppBarVariantSmallContainerHeight, '64px');
  assert.equal(token.ComponentAppBarVariantSmallTitleTypography, 'titleLarge');
  assert.equal(token.ComponentAppBarVariantMediumContainerHeight, '112px');
  assert.equal(token.ComponentAppBarVariantMediumFlexibleLargeContainerHeight, '136px');
  assert.equal(token.ComponentAppBarVariantLargeContainerHeight, '152px');
  assert.equal(token.ComponentAppBarVariantLargeFlexibleContainerHeight, '120px');
  assert.equal(token.ComponentAppBarVariantLargeFlexibleTitleTypography, 'displaySmall');
});
