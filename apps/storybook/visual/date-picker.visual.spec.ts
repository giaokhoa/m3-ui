import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

function expectClose(actual: number | undefined, expected: number) {
  expect(actual).not.toBeUndefined();
  expect(Math.abs((actual ?? 0) - expected)).toBeLessThan(1);
}

function cellByText(page: Page, text: string) {
  return page
    .locator('.date-picker__cell:not([data-outside-month])')
    .filter({ hasText: new RegExp(`^${text}$`) })
    .first();
}

test.describe('Material 3 DatePicker browser contract', () => {
  test('modal geometry, header divider, 48px grid pitch and 40px state layer match the pinned Compose renderer', async ({ page }) => {
    await openStory(page, 'components-datepicker--calendar');
    const picker = page.getByTestId('date-picker');
    const [pickerBox, cellBox, surfaceBox, headerBorder] = await Promise.all([
      picker.boundingBox(),
      picker.locator('.date-picker__cell').first().boundingBox(),
      picker.locator('.date-picker__day-surface').first().boundingBox(),
      picker.locator('.date-picker__header').evaluate((element) => getComputedStyle(element).borderBottomWidth),
    ]);
    expectClose(pickerBox?.width, 360);
    expectClose(pickerBox?.height, 568);
    expectClose(cellBox?.height, 48);
    expectClose(cellBox?.width, 48);
    expectClose(surfaceBox?.height, 40);
    expectClose(surfaceBox?.width, 40);
    expect(headerBorder).toBe('1px');
    await expect(picker.locator('.date-picker__cell[data-selected]')).toHaveCount(1);
    await expect(picker.getByTestId('date-picker-headline')).toContainText('Aug');
    await expect(picker.getByTestId('date-picker-headline')).toContainText('26');
  });

  test('today keeps the canonical 40px state layer and 1px primary outline', async ({ page }) => {
    await openStory(page, 'components-datepicker--today');
    const today = page.locator('.date-picker__cell[data-today]');
    await expect(today).toHaveCount(1);
    const surface = today.locator('.date-picker__day-surface');
    const [box, visual] = await Promise.all([
      surface.boundingBox(),
      surface.evaluate((element) => {
        const style = getComputedStyle(element);
        return { borderWidth: style.borderTopWidth, borderColor: style.borderTopColor };
      }),
    ]);
    expectClose(box?.width, 40);
    expectClose(box?.height, 40);
    expect(visual.borderWidth).toBe('1px');
    expect(visual.borderColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('click selection returns the same ISO date-only value', async ({ page }) => {
    await openStory(page, 'components-datepicker--controlled');
    await cellByText(page, '27').click();
    await expect(page.getByTestId('single-value')).toHaveText('2026-08-27');
  });

  test('unavailable dates remain focusable but cannot be selected', async ({ page }) => {
    await openStory(page, 'components-datepicker--unavailable-date');
    const day = cellByText(page, '27');
    await expect(day).toHaveAttribute('data-unavailable', 'true');
    await day.focus();
    await expect(day).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(day).not.toHaveAttribute('data-selected', 'true');
  });

  test('hover and press states come from RAC cell interaction state', async ({ page }) => {
    await openStory(page, 'components-datepicker--calendar');
    const day = cellByText(page, '27');
    await day.hover();
    await expect(day).toHaveAttribute('data-hovered', 'true');
    const box = await day.boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.move((box?.x ?? 0) + (box?.width ?? 0) / 2, (box?.y ?? 0) + (box?.height ?? 0) / 2);
    await page.mouse.down();
    await expect(day).toHaveAttribute('data-pressed', 'true');
    await page.mouse.up();
  });

  test('disabled picker removes interactive calendar and mode-toggle actions', async ({ page }) => {
    await openStory(page, 'components-datepicker--disabled');
    const picker = page.getByTestId('date-picker');
    await expect(picker).toHaveAttribute('data-disabled', 'true');
    await expect(picker.locator('.date-picker__cell').first()).toHaveAttribute('data-disabled', 'true');
    await expect(picker.getByRole('button', { name: 'Switch to text input mode' })).toBeDisabled();
  });

  test('month navigation and year chooser respect the inclusive year range', async ({ page }) => {
    await openStory(page, 'components-datepicker--year-boundary');
    const picker = page.getByTestId('date-picker');
    await expect(picker.getByRole('button', { name: 'Previous month' })).toBeDisabled();
    await picker.getByRole('button', { name: 'Next month' }).click();
    await expect(picker.locator('.date-picker__month-heading')).toContainText('February');

    await openStory(page, 'components-datepicker--calendar');
    const calendar = page.getByTestId('date-picker');
    await calendar.getByRole('button', { name: 'Choose year' }).click();
    const listbox = calendar.getByRole('listbox', { name: 'Choose year' });
    await expect(listbox).toBeVisible();
    await expect(listbox.getByRole('option', { name: '2026' })).toHaveAttribute('aria-selected', 'true');
    await listbox.getByRole('option', { name: '2027' }).click();
    await expect(calendar.locator('.date-picker__month-heading')).toContainText('2027');
  });

  test('keyboard calendar navigation moves and selects the adjacent date', async ({ page }) => {
    await openStory(page, 'components-datepicker--controlled');
    const selected = page.locator('.date-picker__cell[data-selected]');
    await selected.focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('single-value')).toHaveText('2026-08-27');
  });

  test('mode toggle transfers focus and uses pinned DefaultEffects/DefaultSpatial entry motion', async ({ page }) => {
    await openStory(page, 'components-datepicker--controlled');
    await page.getByRole('button', { name: 'Switch to text input mode' }).click();
    const input = page.locator('input[type=date]');
    const content = page.locator('.date-picker__content');
    await expect(input).toBeFocused();
    const motion = await content.evaluate((element) => {
      const style = getComputedStyle(element);
      return { names: style.animationName, durations: style.animationDuration };
    });
    expect(motion.names).toContain('date-picker-input-enter');
    expect(motion.durations).toContain('0.166s');
    expect(motion.durations).toContain('0.194s');
    await input.fill('2026-09-01');
    await expect(page.getByTestId('single-value')).toHaveText('2026-09-01');
    await page.getByRole('button', { name: 'Switch to calendar mode' }).click();
    await expect(page.getByTestId('date-picker')).toHaveAttribute('data-display-mode', 'calendar');
  });

  test('manual input rejects an out-of-range date without corrupting controlled state', async ({ page }) => {
    await openStory(page, 'components-datepicker--controlled');
    await page.getByRole('button', { name: 'Switch to text input mode' }).click();
    const input = page.locator('input[type=date]');
    await input.fill('2201-01-01');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByTestId('single-value')).toHaveText('2026-08-26');
  });

  test('locale formatting and explicit Monday-first ordering reach the calendar grid', async ({ page }) => {
    await openStory(page, 'components-datepicker--locale-monday-first');
    const headers = page.locator('.date-picker__weekday');
    await expect(headers).toHaveCount(7);
    expect((await headers.first().textContent())?.trim()).toBe('T2');
    expect((await headers.last().textContent())?.trim()).toBe('CN');
  });

  test('range spanning a month boundary paints start/middle/end geometry and preserves date-only value', async ({ page }) => {
    await openStory(page, 'components-datepicker--range');
    const picker = page.getByTestId('date-range-picker');
    const start = picker.locator('.date-picker__cell[data-selection-start]');
    await expect(start).toHaveCount(1);
    const startWidth = await start.evaluate((element) => Number.parseFloat(getComputedStyle(element, '::before').width));
    expectClose(startWidth, 24);

    await picker.getByRole('button', { name: 'Next month' }).click();
    const middle = picker.locator('.date-picker__cell[data-selected]:not([data-selection-start]):not([data-selection-end])').first();
    const end = picker.locator('.date-picker__cell[data-selection-end]');
    await expect(middle).toBeVisible();
    await expect(end).toHaveCount(1);
    const [middleWidth, endWidth] = await Promise.all([
      middle.evaluate((element) => Number.parseFloat(getComputedStyle(element, '::before').width)),
      end.evaluate((element) => Number.parseFloat(getComputedStyle(element, '::before').width)),
    ]);
    expectClose(middleWidth, 48);
    expectClose(endWidth, 24);
    await expect(page.getByTestId('range-value')).toHaveText('2026-08-28/2026-09-03');
  });

  test('range input focus moves start to end and reversed/incomplete drafts do not publish', async ({ page }) => {
    await openStory(page, 'components-datepicker--range-input');
    const inputs = page.locator('input[type=date]');
    await expect(inputs.nth(0)).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(inputs.nth(1)).toBeFocused();
    await inputs.nth(0).fill('2026-09-10');
    await inputs.nth(1).fill('2026-09-01');
    await expect(page.getByRole('alert')).toContainText('End date must');
    await expect(page.getByTestId('range-input-value')).toHaveText('2026-08-20/2026-08-25');
    await inputs.nth(1).fill('');
    await expect(page.getByTestId('range-input-value')).toHaveText('2026-08-20/2026-08-25');
  });

  test('docked variant uses 360x456 geometry while retaining 48/40 cell geometry', async ({ page }) => {
    await openStory(page, 'components-datepicker--docked');
    const picker = page.getByTestId('date-picker');
    const [box, cellBox, surfaceBox] = await Promise.all([
      picker.boundingBox(),
      picker.locator('.date-picker__cell').first().boundingBox(),
      picker.locator('.date-picker__day-surface').first().boundingBox(),
    ]);
    expectClose(box?.width, 360);
    expectClose(box?.height, 456);
    expectClose(cellBox?.width, 48);
    expectClose(surfaceBox?.width, 40);
    await expect(picker.getByRole('button', { name: /Switch to/ })).toHaveCount(0);
  });

  test('RTL mirrors navigation icon geometry while logical next-month behavior remains usable', async ({ page }) => {
    await openStory(page, 'components-datepicker--rtl');
    const picker = page.getByTestId('date-picker');
    await expect(picker).toHaveAttribute('dir', 'rtl');
    const transform = await picker.getByRole('button', { name: 'Next month' }).locator('svg').evaluate((element) => getComputedStyle(element).transform);
    expect(transform).not.toBe('none');
    await picker.getByRole('button', { name: 'Next month' }).click();
    await expect(picker.locator('.date-picker__month-heading')).not.toBeEmpty();
  });

  test('reduced motion removes the calendar/input and year-picker transition duration', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'components-datepicker--calendar');
    await expect(page.locator('.date-picker__content')).toHaveCSS('animation-duration', '0s');
    await page.getByRole('button', { name: 'Choose year' }).click();
    await expect(page.getByTestId('date-picker-year-picker')).toHaveCSS('animation-duration', '0s');
  });

  test('Dialog composition preserves focus entry and restoration', async ({ page }) => {
    await openStory(page, 'components-datepicker--in-dialog');
    const trigger = page.getByTestId('open-date-dialog');
    await trigger.click();
    await expect(page.getByRole('dialog', { name: 'Date picker example' })).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(trigger).toBeFocused();
  });
});