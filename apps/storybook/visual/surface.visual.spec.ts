import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => { await document.fonts.ready; });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

test.describe('Material 3 Surface parity', () => {
  test('passive surface clips content without clipping shadow or becoming focusable', async ({ page }) => {
    await openStory(page, 'components-surface--shape-clip-and-border');
    const surfaces = page.locator('.surface');
    await expect(surfaces.first()).toHaveCSS('overflow', 'visible');
    await expect(surfaces.first().locator('.surface__content')).toHaveCSS('overflow', 'hidden');
    await expect(surfaces.first()).toHaveCSS('border-radius', '28px');
    await expect(surfaces.first()).not.toHaveAttribute('tabindex');
    await expect(surfaces.nth(1)).toHaveCSS('border-width', '2px');
  });

  test('keeps tonal and shadow elevation separate', async ({ page }) => {
    await openStory(page, 'components-surface--elevations');
    const level3 = page.locator('.surface[data-level="level3"]');
    await expect(level3.locator('.elevation')).toHaveAttribute('data-elevation', 'level3');
    const background = await level3.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(background).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('clickable surface activates by pointer, Enter and Space', async ({ page }) => {
    await openStory(page, 'components-surface--clickable');
    const surface = page.getByRole('button', { name: 'Clickable' });
    const count = page.getByTestId('click-count');
    await expect(surface).toHaveAttribute('tabindex', '0');
    await surface.click();
    await expect(count).toHaveText('1');
    await surface.focus();
    await page.keyboard.press('Enter');
    await expect(count).toHaveText('2');
    await page.keyboard.press('Space');
    await expect(count).toHaveText('3');
  });

  test('disabled clickable surface is removed from tab order', async ({ page }) => {
    await openStory(page, 'components-surface--disabled-clickable');
    const surface = page.getByRole('button', { name: 'Disabled' });
    await expect(surface).toHaveAttribute('aria-disabled', 'true');
    await expect(surface).not.toHaveAttribute('tabindex');
  });

  test('selection and toggle roles expose real web state', async ({ page }) => {
    await openStory(page, 'components-surface--selectable');
    const radio = page.getByRole('radio', { name: 'Selectable surface' });
    await expect(radio).toHaveAttribute('aria-checked', 'false');
    await radio.click();
    await expect(radio).toHaveAttribute('aria-checked', 'true');

    await openStory(page, 'components-surface--toggleable');
    await expect(page.getByRole('checkbox', { name: 'Checkbox surface' })).toHaveAttribute('aria-checked', 'false');
    await expect(page.getByRole('switch', { name: 'Switch surface' })).toHaveAttribute('aria-checked', 'false');
    await expect(page.getByRole('button', { name: 'Pressed surface' })).toHaveAttribute('aria-pressed', 'false');
  });

  test('nested surfaces accumulate tonal elevation while shadow remains local', async ({ page }) => {
    await openStory(page, 'components-surface--nested');
    const outer = page.getByTestId('outer-surface');
    const inner = page.getByTestId('inner-surface');
    const [outerBg, innerBg] = await Promise.all([
      outer.evaluate((el) => getComputedStyle(el).backgroundColor),
      inner.evaluate((el) => getComputedStyle(el).backgroundColor),
    ]);
    expect(innerBg).not.toBe(outerBg);
    await expect(inner.locator('.elevation')).toHaveAttribute('data-elevation', 'level0');
  });

  test('focus-visible and theme matrix remain usable', async ({ page }) => {
    await openStory(page, 'components-surface--clickable');
    const surface = page.getByRole('button', { name: 'Clickable' });
    await page.keyboard.press('Tab');
    await expect(surface).toBeFocused();
    await expect(surface).toHaveCSS('outline-style', 'solid');

    await openStory(page, 'components-surface--theme-matrix');
    await expect(page.locator('.storybook-theme-card')).toHaveCount(2);
  });
});
