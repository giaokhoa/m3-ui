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

async function openDefaultField(page: Page) {
  await openStory(page, 'components-textfield--default');
  const input = page.getByRole('textbox', { name: 'Label' });
  const root = page.locator('.m3-text-field');
  await expect(input).toBeVisible();
  await expect(root).toBeVisible();
  return { input, root };
}

test.describe('Material 3 filled TextField visual parity', () => {
  test('empty default', async ({ page }) => {
    const { root } = await openDefaultField(page);
    await expect(root).toHaveScreenshot('text-field-empty.png');
  });

  test('filled value', async ({ page }) => {
    await openStory(page, 'components-textfield--with-value');
    await expect(page.locator('.m3-text-field')).toHaveScreenshot(
      'text-field-with-value.png',
    );
  });

  test('keyboard focus', async ({ page }) => {
    const { input, root } = await openDefaultField(page);
    await page.keyboard.press('Tab');
    await expect(input).toBeFocused();
    await expect(root).toHaveScreenshot('text-field-focused.png');
  });

  test('invalid', async ({ page }) => {
    await openStory(page, 'components-textfield--invalid');
    await expect(page.locator('.m3-text-field')).toHaveScreenshot(
      'text-field-invalid.png',
    );
  });

  test('disabled', async ({ page }) => {
    await openStory(page, 'components-textfield--disabled');
    await expect(page.locator('.m3-text-field')).toHaveScreenshot(
      'text-field-disabled.png',
    );
  });

  test('affixes and icons', async ({ page }) => {
    await openStory(page, 'components-textfield--affixes-and-icons');
    await expect(page.locator('.m3-text-field')).toHaveScreenshot(
      'text-field-affixes-icons.png',
    );
  });

  test('multiline', async ({ page }) => {
    await openStory(page, 'components-textfield--multiline');
    await expect(page.locator('.m3-text-field')).toHaveScreenshot(
      'text-field-multiline.png',
    );
  });

  test('state matrix', async ({ page }) => {
    await openStory(page, 'components-textfield--states');
    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      'text-field-states.png',
    );
  });

  test('theme matrix', async ({ page }) => {
    await openStory(page, 'components-textfield--theme-matrix');
    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      'text-field-theme-matrix.png',
    );
  });
});
