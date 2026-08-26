import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => { await document.fonts.ready; });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

function close(actual: number, expected: number) {
  expect(Math.abs(actual - expected)).toBeLessThan(0.8);
}

test.describe('Material 3 TimePicker shared interaction contract', () => {
  test('hour/minute and period controls reuse RAC + shared Ripple hover/press state', async ({ page }) => {
    await openStory(page, 'components-timepicker--midnight');
    const hour = page.locator('.time-picker__time-selector').first();
    await hour.hover();
    await expect(hour).toHaveAttribute('data-hovered');
    await expect(hour.locator('.ripple')).toHaveAttribute('data-hovered');

    const box = await hour.boundingBox();
    await page.mouse.move((box?.x ?? 0) + 20, (box?.y ?? 0) + 20);
    await page.mouse.down();
    await expect(hour).toHaveAttribute('data-pressed');
    await expect(hour.locator('.ripple__wave')).toHaveCount(1);
    await page.mouse.up();

    await expect(page.getByRole('radio', { name: 'PM' })).toHaveCount(1);
    const pm = page.locator('.time-picker__period-button', { hasText: 'PM' });
    await pm.hover();
    await expect(pm).toHaveAttribute('data-hovered');
    await expect(pm.locator('.ripple')).toHaveAttribute('data-hovered');
  });

  test('standard and vibrant layouts keep Compose display/dial gaps and trailing space', async ({ page }) => {
    await openStory(page, 'components-timepicker--midnight');
    let root = page.locator('.time-picker');
    let selectors = root.locator('.time-picker__selectors');
    let dial = root.locator('.time-picker__dial');
    let [rootBox, selectorBox, dialBox] = await Promise.all([
      root.boundingBox(), selectors.boundingBox(), dial.boundingBox(),
    ]);
    close((dialBox?.y ?? 0) - ((selectorBox?.y ?? 0) + (selectorBox?.height ?? 0)), 36);
    close((rootBox?.y ?? 0) + (rootBox?.height ?? 0) - ((dialBox?.y ?? 0) + (dialBox?.height ?? 0)), 24);

    await openStory(page, 'components-timepicker--horizontal');
    selectors = page.locator('.time-picker__selectors');
    dial = page.locator('.time-picker__dial');
    [selectorBox, dialBox] = await Promise.all([selectors.boundingBox(), dial.boundingBox()]);
    close((dialBox?.x ?? 0) - ((selectorBox?.x ?? 0) + (selectorBox?.width ?? 0)), 36);

    await openStory(page, 'components-timepicker--vibrant');
    root = page.locator('.time-picker');
    selectors = root.locator('.time-picker__selectors');
    dial = root.locator('.time-picker__dial');
    [rootBox, selectorBox, dialBox] = await Promise.all([
      root.boundingBox(), selectors.boundingBox(), dial.boundingBox(),
    ]);
    close((selectorBox?.y ?? 0) - (rootBox?.y ?? 0), 12);
    close((dialBox?.y ?? 0) - ((selectorBox?.y ?? 0) + (selectorBox?.height ?? 0)), 36);
    close((rootBox?.y ?? 0) + (rootBox?.height ?? 0) - ((dialBox?.y ?? 0) + (dialBox?.height ?? 0)), 36);
  });

  test('TimeInput period selector is 52x72 and aligns with the 72px fields', async ({ page }) => {
    await openStory(page, 'components-timepicker--input');
    const period = page.getByRole('radiogroup', { name: 'AM or PM' });
    const hour = page.getByRole('textbox', { name: 'Hour' });
    const periodBox = await period.boundingBox();
    const hourBox = await hour.boundingBox();
    expect(periodBox?.width).toBe(52);
    expect(periodBox?.height).toBe(72);
    expect(hourBox?.height).toBe(72);
    expect(periodBox?.y).toBe(hourBox?.y);
  });
});
