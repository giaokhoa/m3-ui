import { expect, test, type Locator } from '@playwright/test';
import { openStory } from '../test-support/story';

async function cssNumber(locator: Locator, property: string) {
  return locator.evaluate(
    (element, name) => Number.parseFloat(getComputedStyle(element).getPropertyValue(name)),
    property,
  );
}

async function pseudoBorderWidth(
  locator: Locator,
  pseudo: '::before' | '::after',
) {
  return locator.evaluate(
    (element, pseudoElement) =>
      getComputedStyle(element, pseudoElement).borderTopWidth,
    pseudo,
  );
}

test.describe('reviewed Material upstream re-pin', () => {
  test('keeps standard TimePicker geometry while adopting expressive renderer deltas', async ({
    page,
  }) => {
    await openStory(page, 'components-timepicker--horizontal');
    let picker = page.locator('.time-picker');
    let period = page.getByRole('radiogroup', { name: 'AM or PM' });
    expect((await period.boundingBox())?.height).toBe(38);
    expect(await cssNumber(picker, 'gap')).toBe(36);

    await openStory(page, 'components-timepicker--vibrant');
    picker = page.locator('.time-picker');
    expect(await cssNumber(picker, 'gap')).toBe(12);
    expect(await cssNumber(picker, 'padding-block-end')).toBe(12);

    await openStory(page, 'components-timepicker--vibrant-horizontal');
    picker = page.locator('.time-picker');
    period = page.getByRole('radiogroup', { name: 'AM or PM' });
    expect((await period.boundingBox())?.height).toBe(40);
    expect(await cssNumber(picker, 'gap')).toBe(52);
  });

  test('ScrollField follows ThemeProvider opacity and inset-ring focus policy', async ({
    page,
  }) => {
    await openStory(page, 'components-scrollfield--focus-modes');

    const opacityField = page.getByTestId('scroll-field-opacity-focus');
    const insetField = page.getByTestId('scroll-field-inset-focus');

    await page.keyboard.press('Tab');
    await expect(opacityField).toBeFocused();
    await expect(opacityField).toHaveCSS('outline-style', 'none');

    const opacityRipple = opacityField.locator('.ripple');
    await expect(opacityRipple).toHaveAttribute('data-focus-visible', 'true');
    await expect(opacityRipple).not.toHaveAttribute(
      'data-inset-focus-visible',
      'true',
    );
    await expect(opacityRipple.locator('.ripple__focus-ring')).toHaveCount(0);
    await expect(opacityRipple.locator('.ripple__state-layer')).toHaveCSS(
      'opacity',
      '0.1',
    );

    await page.keyboard.press('Tab');
    await expect(insetField).toBeFocused();
    await expect(insetField).toHaveCSS('outline-style', 'none');

    const insetRipple = insetField.locator('.ripple');
    await expect(insetRipple).toHaveAttribute(
      'data-inset-focus-visible',
      'true',
    );
    await expect(insetRipple).not.toHaveAttribute('data-focus-visible', 'true');
    await expect(insetRipple.locator('.ripple__state-layer')).toHaveCSS(
      'opacity',
      '0',
    );

    const ring = insetRipple.locator('.ripple__focus-ring');
    await expect(ring).toHaveCount(1);
    await expect.poll(() => pseudoBorderWidth(ring, '::before')).toBe('3px');
    await expect.poll(() => pseudoBorderWidth(ring, '::after')).toBe('2px');
  });
});
