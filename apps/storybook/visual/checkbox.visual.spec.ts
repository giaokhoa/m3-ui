import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, {
    waitUntil: 'networkidle',
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

async function openSelectedCheckbox(page: Page) {
  await openStory(page, 'components-checkbox--selected');
  const checkbox = page.getByRole('checkbox', { name: 'Selected checkbox' });
  await expect(checkbox).toBeVisible();
  return checkbox;
}

test.describe('Material 3 Checkbox visual parity', () => {
  test('states', async ({ page }) => {
    await openStory(page, 'components-checkbox--states');
    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      'checkbox-states.png',
    );
  });

  test('disabled states', async ({ page }) => {
    await openStory(page, 'components-checkbox--disabled-states');
    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      'checkbox-disabled-states.png',
    );
  });

  test('control only', async ({ page }) => {
    await openStory(page, 'components-checkbox--control-only');
    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      'checkbox-control-only.png',
    );
  });

  test('theme matrix', async ({ page }) => {
    await openStory(page, 'components-checkbox--theme-matrix');
    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      'checkbox-theme-matrix.png',
    );
  });

  test('selected hover state layer', async ({ page }) => {
    const checkbox = await openSelectedCheckbox(page);
    await checkbox.hover();
    await expect(checkbox).toHaveScreenshot('checkbox-selected-hover.png');
  });

  test('selected keyboard focus state layer', async ({ page }) => {
    const checkbox = await openSelectedCheckbox(page);
    await page.keyboard.press('Tab');
    await expect(checkbox).toBeFocused();
    await expect(checkbox).toHaveScreenshot('checkbox-selected-focus.png');
  });

  test('selected press ripple', async ({ page }) => {
    const checkbox = await openSelectedCheckbox(page);
    await checkbox.hover();
    const box = await checkbox.boundingBox();
    if (!box) throw new Error('Checkbox bounds unavailable');
    await page.mouse.move(box.x + 24, box.y + box.height / 2);
    await page.mouse.down();
    try {
      await expect(checkbox).toHaveScreenshot('checkbox-selected-pressed.png');
    } finally {
      await page.mouse.up();
    }
  });
});
