import { expect, test } from '@playwright/test';

test('preferred width proportion resolves before pane allocation', async ({ page }) => {
  await page.goto('/iframe.html?id=layout-preferredpanesize--width-proportion&viewMode=story', {
    waitUntil: 'networkidle',
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });

  const root = page.getByTestId('preferred-size-scaffold');
  const primary = root.locator('[data-pane-role="primary"]');
  const secondary = root.locator('[data-pane-role="secondary"]');
  const rootBox = await root.boundingBox();
  const primaryBox = await primary.boundingBox();
  const secondaryBox = await secondary.boundingBox();

  expect(rootBox).not.toBeNull();
  expect(primaryBox).not.toBeNull();
  expect(secondaryBox).not.toBeNull();

  const secondaryPreferredWidth = Math.trunc(rootBox!.width * 0.4);
  const primaryAllocatedWidth = rootBox!.width - 24 - secondaryPreferredWidth;

  expect(primaryBox!.width).toBeCloseTo(primaryAllocatedWidth, 0);
  expect(secondaryBox!.width).toBeCloseTo(secondaryPreferredWidth, 0);
  expect(secondaryBox!.x - rootBox!.x).toBeCloseTo(primaryAllocatedWidth + 24, 0);
  expect(secondaryBox!.x - (primaryBox!.x + primaryBox!.width)).toBeCloseTo(24, 0);
});
