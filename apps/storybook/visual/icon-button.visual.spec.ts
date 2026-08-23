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

async function openDefaultIconButton(page: Page) {
  await openStory(page, 'components-iconbutton--default');
  const button = page.getByRole('button', { name: 'Favorite' });
  await expect(button).toBeVisible();
  return button;
}

test.describe('Material 3 IconButton visual parity', () => {
  test('action variants', async ({ page }) => {
    await openStory(page, 'components-iconbutton--action-variants-story');
    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      'icon-button-action-variants.png',
    );
  });

  test('toggle selected and unselected states', async ({ page }) => {
    await openStory(page, 'components-iconbutton--toggle-states');
    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      'icon-button-toggle-states.png',
    );
  });

  test('disabled action and toggle states', async ({ page }) => {
    await openStory(page, 'components-iconbutton--disabled-states');
    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      'icon-button-disabled-states.png',
    );
  });

  test('expressive size family', async ({ page }) => {
    await openStory(page, 'components-iconbutton--expressive-sizes');
    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      'icon-button-expressive-sizes.png',
    );
  });

  test('width and shape families', async ({ page }) => {
    await openStory(page, 'components-iconbutton--widths-and-shapes');
    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      'icon-button-widths-and-shapes.png',
    );
  });

  test('expressive pressed shape', async ({ page }) => {
    await openStory(page, 'components-iconbutton--expressive-shape-morph');
    const button = page.getByRole('button', { name: 'Press round favorite' });
    await expect(button).toBeVisible();
    const box = await button.boundingBox();
    if (!box) throw new Error('Expressive IconButton has no bounding box');

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    try {
      await expect(button).toHaveScreenshot('icon-button-expressive-pressed.png');
    } finally {
      await page.mouse.up();
    }
  });

  test('keyboard focus', async ({ page }) => {
    const button = await openDefaultIconButton(page);
    await page.keyboard.press('Tab');
    await expect(button).toBeFocused();
    await expect(button).toHaveScreenshot('icon-button-focus.png');
  });

  test('theme matrix', async ({ page }) => {
    await openStory(page, 'components-iconbutton--theme-matrix');
    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      'icon-button-theme-matrix.png',
    );
  });
});
