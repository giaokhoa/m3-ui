import assert from 'node:assert/strict';
import test from 'node:test';
const generatedUrl = new URL('../dist/generated/tokens.js', import.meta.url);
async function generated() { return import(`${generatedUrl.href}?pickers=${Date.now()}`); }

test('Style Dictionary emits current date and time picker token geometry', async () => {
  const token = await generated();
  assert.equal(token.ComponentDateInputModalContainerHeight, '512px');
  assert.equal(token.ComponentDatePickerModalContainerHeight, '568px');
  assert.equal(token.ComponentDatePickerModalSelectionYearContainerWidth, '72px');
  assert.equal(token.ComponentTimeInputTimeFieldFocusOutlineWidth, '2px');
  assert.equal(token.ComponentTimePickerClockDialContainerSize, '256px');
  assert.equal(token.ComponentTimePickerTimeSelector24HVerticalContainerWidth, '114px');
});

test('Style Dictionary preserves picker semantic roles and type keys', async () => {
  const token = await generated();
  assert.equal(token.ComponentDatePickerModalDateSelectedContainerColor, 'var(--primary)');
  assert.equal(token.ComponentDatePickerModalRangeSelectionActiveIndicatorContainerColor, 'var(--secondary-container)');
  assert.equal(token.ComponentTimeInputPeriodSelectorSelectedContainerColor, 'var(--tertiary-container)');
  assert.equal(token.ComponentTimePickerTimeSelectorSelectedContainerColor, 'var(--primary-container)');
  assert.equal(token.ComponentTimePickerTimeSelectorLabelTextFont, 'displayLarge');
});
