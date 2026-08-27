import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

function expectClose(actual: number | undefined, expected: number) {
  expect(actual).not.toBeUndefined();
  expect(Math.abs((actual ?? 0) - expected)).toBeLessThan(0.8);
}

test.describe('Material 3 ShortNavigationBar browser contract', () => {
  for (const count of [3, 4, 5]) {
    test(`equal-weight ${count} items divide the available width evenly`, async ({ page }) => {
      await openStory(page, `components-shortnavigationbar--equal-weight-${count}`);
      const items = page.locator('.short-navigation-bar-item');
      await expect(items).toHaveCount(count);
      const widths = await items.evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().width));
      expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(0.8);
      const bar = await page.getByTestId('short-navigation-bar').boundingBox();
      expectClose(bar?.height, 64);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    });
  }

  test('centered 3 items occupy 60% and start items use 40px indicators', async ({ page }) => {
    await openStory(page, 'components-shortnavigationbar--centered-3');
    const bar = page.getByTestId('short-navigation-bar');
    const items = page.locator('.short-navigation-bar-item');
    const barBox = await bar.boundingBox();
    const boxes = await items.evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect()));
    const occupied = boxes.reduce((sum, box) => sum + box.width, 0);
    expectClose(occupied, (barBox?.width ?? 0) * 0.6);
    expectClose(await items.first().locator('.short-navigation-bar-item__indicator-ripple').evaluate((el) => el.getBoundingClientRect().height), 40);
  });

  test('centered 6 items occupy 90% and remain centered through resize', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 500 });
    await openStory(page, 'components-shortnavigationbar--centered-6');
    const bar = page.getByTestId('short-navigation-bar');
    const items = page.locator('.short-navigation-bar-item');
    const assertCentered = async () => {
      const barBox = await bar.boundingBox();
      const first = await items.first().boundingBox();
      const last = await items.last().boundingBox();
      expectClose((first?.x ?? 0) - (barBox?.x ?? 0), (barBox?.width ?? 0) * 0.05);
      expectClose((barBox?.x ?? 0) + (barBox?.width ?? 0) - ((last?.x ?? 0) + (last?.width ?? 0)), (barBox?.width ?? 0) * 0.05);
    };
    await assertCentered();
    await page.setViewportSize({ width: 700, height: 500 });
    await assertCentered();
  });

  test('top items use 56x32 indicator geometry and labels stay visible', async ({ page }) => {
    await openStory(page, 'components-shortnavigationbar--equal-weight-4');
    const item = page.getByTestId('short-navigation-item-0');
    const indicator = await item.locator('.short-navigation-bar-item__indicator-ripple').boundingBox();
    expectClose(indicator?.width, 56);
    expectClose(indicator?.height, 32);
    await expect(item.locator('.short-navigation-bar-item__label')).toBeVisible();
  });

  test('disabled item is inert and destination item renders a real link', async ({ page }) => {
    await openStory(page, 'components-shortnavigationbar--disabled-and-link');
    const disabled = page.getByRole('button', { name: 'Search' });
    await expect(disabled).toBeDisabled();
    const link = page.getByRole('link', { name: 'Docs' });
    await expect(link).toHaveAttribute('href', '#docs');
  });

  test('native keyboard focus works and selection updates through press', async ({ page }) => {
    await openStory(page, 'components-shortnavigationbar--equal-weight-4');
    const first = page.getByTestId('short-navigation-item-0');
    const second = page.getByTestId('short-navigation-item-1');
    await page.keyboard.press('Tab');
    await expect(first).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(second).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(second).toHaveAttribute('data-selected', 'true');
  });

  test('RTL preserves order geometry without overflow', async ({ page }) => {
    await openStory(page, 'components-shortnavigationbar--rtl');
    const first = await page.getByTestId('short-navigation-item-0').boundingBox();
    const last = await page.getByTestId('short-navigation-item-3').boundingBox();
    expect((first?.x ?? 0)).toBeGreaterThan(last?.x ?? 0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });

  test('safe-area adaptation is declared for horizontal and bottom insets', async ({ page }) => {
    await openStory(page, 'components-shortnavigationbar--equal-weight-3');
    const items = page.locator('.short-navigation-bar__items');
    const padding = await items.evaluate((el) => {
      const style = getComputedStyle(el);
      return [style.paddingLeft, style.paddingRight, style.paddingBottom];
    });
    expect(padding).toEqual(['0px', '0px', '0px']);
    await expect(page.getByTestId('short-navigation-bar')).toHaveAttribute('data-safe-area', 'true');
  });
});
