import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => { await document.fonts.ready; });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

async function openControlled(page: Page) {
  await openStory(page, 'components-togglebutton--controlled');
  const button = page.getByRole('button', { name: 'Controlled' });
  await expect(button).toBeVisible();
  return button;
}

test.describe('Material 3 ToggleButton browser parity', () => {
  test('four variants expose selected and unselected aria-pressed states', async ({ page }) => {
    await openStory(page, 'components-togglebutton--variant-states');
    const buttons = page.getByRole('button');
    await expect(buttons).toHaveCount(8);
    for (let index = 0; index < 4; index += 1) {
      await expect(buttons.nth(index)).toHaveAttribute('aria-pressed', 'false');
      await expect(buttons.nth(index + 4)).toHaveAttribute('aria-pressed', 'true');
    }
  });

  test('five expressive sizes keep AndroidX container heights', async ({ page }) => {
    await openStory(page, 'components-togglebutton--sizes');
    const sizes = [
      ['extraSmall', 32],
      ['small', 40],
      ['medium', 56],
      ['large', 96],
      ['extraLarge', 136],
    ] as const;
    for (const [size, height] of sizes) {
      const button = page.getByRole('button', { name: `${size} toggle`, exact: true });
      expect((await button.boundingBox())?.height).toBe(height);
    }
  });

  test('text-only and leading-icon content render independently', async ({ page }) => {
    await openStory(page, 'components-togglebutton--content');
    const textOnly = page.getByRole('button', { name: 'Text only' });
    const withIcon = page.getByRole('button', { name: 'Icon and text' });
    await expect(textOnly.locator('.button__icon')).toHaveCount(0);
    await expect(withIcon.locator('.button__icon')).toHaveCount(1);
    await expect(withIcon.locator('.button__icon')).toHaveAttribute('aria-hidden', 'true');
  });

  test('Space and Enter toggle controlled state with button semantics', async ({ page }) => {
    const button = await openControlled(page);
    await button.focus();
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await page.keyboard.press('Space');
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('Enter');
    await expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  test('rapid controlled toggles always settle on the latest state', async ({ page }) => {
    const button = await openControlled(page);
    for (let index = 0; index < 5; index += 1) await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  test('disabled toggles cannot change selection', async ({ page }) => {
    await openStory(page, 'components-togglebutton--disabled');
    const button = page.getByRole('button', { name: 'Filled' }).first();
    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await button.click({ force: true });
    await expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  test('press shape takes priority and resolves to selected shape on release', async ({ page }) => {
    const button = await openControlled(page);
    const box = await button.boundingBox();
    if (!box) throw new Error('ToggleButton has no bounding box');
    await expect(button).toHaveCSS('border-radius', '9999px');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await expect(button).toHaveCSS('border-radius', '8px');
    await page.mouse.up();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(button).toHaveCSS('border-radius', '12px');
  });

  test('keyboard focus is focus-visible', async ({ page }) => {
    await openStory(page, 'components-togglebutton--default');
    const button = page.getByRole('button', { name: 'Toggle' });
    await page.keyboard.press('Tab');
    await expect(button).toBeFocused();
    await expect(button).toHaveAttribute('data-focus-visible');
    await expect(button).toHaveCSS('outline-width', '2px');
  });

  test('RTL keeps native direction and logical leading-icon layout', async ({ page }) => {
    await openStory(page, 'components-togglebutton--rtl');
    const button = page.getByRole('button');
    await expect(button).toHaveCSS('direction', 'rtl');
    await expect(button.locator('.button__icon')).toHaveCount(1);
  });

  test('reduced motion applies final state without transitions', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'components-togglebutton--reduced-motion');
    const button = page.getByRole('button', { name: 'Controlled' });
    await expect(button).toHaveCSS('transition-duration', '0s');
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(button).toHaveCSS('border-radius', '12px');
  });
});
