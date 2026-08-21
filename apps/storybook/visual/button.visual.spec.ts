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

async function openDefaultButton(page: Page) {
  await openStory(page, 'components-button--default');
  const button = page.getByRole('button', { name: 'Filled button' });
  await expect(button).toBeVisible();
  return button;
}

test.describe('Material 3 Button visual parity', () => {
  test('common variants', async ({ page }) => {
    await openStory(page, 'components-button--variants');
    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      'button-variants.png',
    );
  });

  test('disabled variants', async ({ page }) => {
    await openStory(page, 'components-button--disabled-variants');
    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      'button-disabled-variants.png',
    );
  });

  test('icon layouts', async ({ page }) => {
    await openStory(page, 'components-button--icons');
    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      'button-icons.png',
    );
  });

  test('expressive size family', async ({ page }) => {
    await openStory(page, 'components-button--expressive-sizes');
    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      'button-expressive-sizes.png',
    );
  });

  test('expressive pressed shape', async ({ page }) => {
    await openStory(page, 'components-button--expressive-shape-morph');
    const button = page.getByRole('button', { name: 'Press medium' });
    await expect(button).toBeVisible();
    await button.hover();
    const box = await button.boundingBox();
    if (!box) {
      throw new Error('Expressive medium button has no bounding box');
    }
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();

    try {
      await expect(button).toHaveScreenshot('button-expressive-pressed.png');
    } finally {
      await page.mouse.up();
    }
  });

  test('theme matrix', async ({ page }) => {
    await openStory(page, 'components-button--theme-matrix');
    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      'button-theme-matrix.png',
    );
  });

  test('filled idle', async ({ page }) => {
    const button = await openDefaultButton(page);
    await expect(button).toHaveScreenshot('filled-idle.png');
  });

  test('filled hover', async ({ page }) => {
    const button = await openDefaultButton(page);
    await button.hover();
    await expect(button).toHaveScreenshot('filled-hover.png');
  });

  test('filled keyboard focus', async ({ page }) => {
    const button = await openDefaultButton(page);
    await page.keyboard.press('Tab');
    await expect(button).toBeFocused();
    await expect(button).toHaveScreenshot('filled-focus.png');
  });

  test('latest active interaction: focus after hover', async ({ page }) => {
    const button = await openDefaultButton(page);
    await button.hover();
    await page.keyboard.press('Tab');
    await expect(button).toBeFocused();
    await expect(button).toHaveScreenshot('filled-hover-then-focus.png');
  });

  test('latest active interaction: hover after focus', async ({ page }) => {
    const button = await openDefaultButton(page);
    await page.keyboard.press('Tab');
    await expect(button).toBeFocused();
    await button.hover();
    await expect(button).toHaveScreenshot('filled-focus-then-hover.png');
  });

  test('filled press ripple', async ({ page }) => {
    const button = await openDefaultButton(page);
    await button.hover();
    await page.mouse.down();

    try {
      await expect(button).toHaveScreenshot('filled-pressed.png');
    } finally {
      await page.mouse.up();
    }
  });
});
