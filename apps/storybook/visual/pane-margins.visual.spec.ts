import { expect, test, type Locator, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, {
    waitUntil: 'networkidle',
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

async function bounds(locator: Locator) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  return box!;
}

function expectClose(actual: number, expected: number) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(1);
}

test.describe('Material 3 pane margins', () => {
  test('clamps outer edges without consuming the 24px pane spacer', async ({ page }) => {
    await openStory(page, 'layout-panemargins--default');

    const root = page.getByTestId('pane-margins-scaffold');
    const primary = root.locator('[data-pane-role="primary"]');
    const secondary = root.locator('[data-pane-role="secondary"]');
    const rootBox = await bounds(root);
    const primaryBox = await bounds(primary);
    const secondaryBox = await bounds(secondary);

    expectClose(secondaryBox.x - rootBox.x, 40);
    expectClose(secondaryBox.y - rootBox.y, 16);
    expectClose(rootBox.y + rootBox.height - (secondaryBox.y + secondaryBox.height), 24);
    expectClose(rootBox.x + rootBox.width - (primaryBox.x + primaryBox.width), 56);
    expectClose(primaryBox.y - rootBox.y, 32);
    expectClose(rootBox.y + rootBox.height - (primaryBox.y + primaryBox.height), 48);
    expectClose(primaryBox.x - (secondaryBox.x + secondaryBox.width), 24);
  });

  test('resolves logical inline margins against RTL without changing the spacer', async ({ page }) => {
    await openStory(page, 'layout-panemargins--rtl');

    const root = page.getByTestId('pane-margins-scaffold');
    const primary = root.locator('[data-pane-role="primary"]');
    const secondary = root.locator('[data-pane-role="secondary"]');
    const rootBox = await bounds(root);
    const primaryBox = await bounds(primary);
    const secondaryBox = await bounds(secondary);

    expectClose(rootBox.x + rootBox.width - (secondaryBox.x + secondaryBox.width), 40);
    expectClose(primaryBox.x - rootBox.x, 56);
    expectClose(secondaryBox.x - (primaryBox.x + primaryBox.width), 24);
  });
});
