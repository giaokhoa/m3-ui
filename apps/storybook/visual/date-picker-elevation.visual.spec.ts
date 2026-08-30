import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

function elevationPaint(page: Page, testId: string) {
  return page
    .locator(
      `[data-testid="${testId}"][data-elevation], [data-testid="${testId}"] [data-elevation]`,
    )
    .first();
}

test.describe('DatePicker elevation boundary', () => {
  test('modal DatePicker delegates shadow elevation to Dialog', async ({ page }) => {
    await openStory(page, 'components-datepicker--calendar');
    const paint = elevationPaint(page, 'date-picker');
    await expect(paint).toHaveAttribute('data-elevation', 'level0');
    await expect(paint).toHaveCSS('box-shadow', 'none');
  });

  test('docked DatePicker paints canonical level3 elevation', async ({ page }) => {
    await openStory(page, 'components-datepicker--docked');
    const paint = elevationPaint(page, 'date-picker');
    await expect(paint).toHaveAttribute('data-elevation', 'level3');
    expect(
      await paint.evaluate((element) => getComputedStyle(element).boxShadow),
    ).not.toBe('none');
  });
});
