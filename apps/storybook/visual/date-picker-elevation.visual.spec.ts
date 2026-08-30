import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

test.describe('DatePicker elevation boundary', () => {
  test('modal DatePicker delegates shadow elevation to Dialog', async ({ page }) => {
    await openStory(page, 'components-datepicker--calendar');
    const picker = page.getByTestId('date-picker');
    await expect(picker).toHaveAttribute('data-elevation', 'level0');
    await expect(picker).toHaveCSS('box-shadow', 'none');
  });

  test('docked DatePicker paints canonical level3 elevation on its clipped root host', async ({ page }) => {
    await openStory(page, 'components-datepicker--docked');
    const picker = page.getByTestId('date-picker');
    await expect(picker).toHaveAttribute('data-elevation', 'level3');
    expect(await picker.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe('none');
  });
});
