import { expect, test, type Locator } from '@playwright/test';
import { openStory } from '../test-support/story';

async function resolvedColor(scope: Locator, value: string): Promise<string> {
  return scope.evaluate((element, colorValue) => {
    const probe = document.createElement('span');
    probe.style.color = colorValue;
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    element.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, value);
}

test.describe('Material 3 Lane 7 picker shared conformance', () => {
  test('nested source-color roles reach representative date and time picker paint', async ({
    page,
  }) => {
    await openStory(page, 'conformance-pickers--dynamic-theme');

    const theme = page.locator('.picker-conformance-dynamic-theme');
    const [surfaceContainerHigh, surfaceContainerHighest, primary] = await Promise.all([
      resolvedColor(theme, 'var(--surface-container-high)'),
      resolvedColor(theme, 'var(--surface-container-highest)'),
      resolvedColor(theme, 'var(--primary)'),
    ]);

    const datePicker = page.getByTestId('theme-date-picker');
    await expect(datePicker).toHaveCSS('background-color', surfaceContainerHigh);
    await expect(
      datePicker.locator(
        '.date-picker__cell[data-selected] .date-picker__day-surface',
      ),
    ).toHaveCSS('background-color', primary);

    const timePicker = page.getByTestId('theme-time-picker');
    await expect(timePicker.locator('.time-picker__dial')).toHaveCSS(
      'background-color',
      surfaceContainerHighest,
    );
    await expect(
      timePicker.locator('.time-picker__dial-label[data-selected]'),
    ).toHaveCSS('background-color', primary);
  });
});
