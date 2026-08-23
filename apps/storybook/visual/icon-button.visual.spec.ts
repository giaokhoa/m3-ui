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
  test('default target keeps 48px semantics around a 40px visual surface', async ({ page }) => {
    const button = await openDefaultIconButton(page);
    const surface = button.locator('.m3-icon-button__surface');
    const buttonBox = await button.boundingBox();
    const surfaceBox = await surface.boundingBox();

    expect(buttonBox?.width).toBe(48);
    expect(buttonBox?.height).toBe(48);
    expect(surfaceBox?.width).toBe(40);
    expect(surfaceBox?.height).toBe(40);
  });

  test('action variants', async ({ page }) => {
    await openStory(page, 'components-iconbutton--action-variants-story');
    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      'icon-button-action-variants.png',
    );
  });

  test('toggle selected and unselected states', async ({ page }) => {
    await openStory(page, 'components-iconbutton--toggle-states');
    const toggles = page.getByRole('button', { name: /toggle favorite/ });
    await expect(toggles).toHaveCount(8);

    for (let index = 0; index < 4; index += 1) {
      await expect(toggles.nth(index)).toHaveAttribute('aria-pressed', 'false');
    }
    for (let index = 4; index < 8; index += 1) {
      await expect(toggles.nth(index)).toHaveAttribute('aria-pressed', 'true');
    }

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

    const sizes = [
      ['extraSmall', 32],
      ['small', 40],
      ['medium', 56],
      ['large', 96],
      ['extraLarge', 136],
    ] as const;

    for (const [size, surfaceHeight] of sizes) {
      const button = page.getByRole('button', {
        name: `${size} favorite`,
        exact: true,
      });
      const surface = button.locator('.m3-icon-button__surface');
      const buttonBox = await button.boundingBox();
      const surfaceBox = await surface.boundingBox();

      expect(surfaceBox?.height).toBe(surfaceHeight);
      expect(buttonBox?.height).toBe(Math.max(48, surfaceHeight));
    }

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
