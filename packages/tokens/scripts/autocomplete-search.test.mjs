import assert from 'node:assert/strict';
import test from 'node:test';
const generatedUrl = new URL('../dist/generated/tokens.js', import.meta.url);
async function generated() { return import(`${generatedUrl.href}?autocomplete=${Date.now()}`); }

test('Style Dictionary preserves autocomplete state matrices', async () => {
  const token = await generated();
  assert.equal(token.ComponentAutocompleteFilledTextFieldDisabledContainerOpacity, 0.04);
  assert.equal(token.ComponentAutocompleteFilledTextFieldErrorHoverActiveIndicatorColor, 'var(--on-error-container)');
  assert.equal(token.ComponentAutocompleteFilledTextFieldLeadingIconSize, '20px');
  assert.equal(token.ComponentAutocompleteOutlinedTextFieldDisabledOutlineOpacity, 0.12);
  assert.equal(token.ComponentAutocompleteOutlinedTextFieldFocusOutlineWidth, '2px');
  assert.equal(token.ComponentAutocompleteOutlinedTextFieldLeadingIconSize, '24px');
});

test('Style Dictionary emits search bar and search view tokens', async () => {
  const token = await generated();
  assert.equal(token.ComponentSearchBarContainerHeight, '56px');
  assert.equal(token.ComponentSearchBarAvatarSize, '30px');
  assert.equal(token.ComponentSearchViewDockedContainerShape, 'extraLarge');
  assert.equal(token.ComponentSearchViewFullScreenHeaderContainerHeight, '72px');
});
