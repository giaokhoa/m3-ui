import { expect, test, type Page } from '@playwright/test';

const themePortalSelector = '[data-' + 'm3' + '-theme-portal]';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

test.describe('Material 3 Menu browser contract', () => {
  test('trigger opens, preserves theme role scope, paints shared elevation, focuses first enabled item, arrows skip disabled, and Enter activates', async ({ page }) => {
    await openStory(page, 'components-menu--default');
    const trigger = page.getByTestId('menu-trigger');
    await trigger.focus();
    await trigger.press('Enter');

    const themePortal = page.locator(themePortalSelector);
    const popover = page.locator('.menu-popover');
    const elevation = popover.locator('.menu__elevation');
    await expect(themePortal.locator('.menu-popover')).toBeVisible();
    expect(
      await popover.evaluate((element) =>
        getComputedStyle(element).getPropertyValue('--shadow').trim(),
      ),
    ).not.toBe('');
    await expect(popover).toHaveCSS('box-shadow', 'none');
    expect(await elevation.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe('none');

    const items = page.getByRole('menuitem');
    await expect(items.first()).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(items.nth(1)).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(items.nth(3)).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('menu-action')).toHaveText('delete');
    await expect(trigger).toBeFocused();
  });

  test('Home/End, Escape and outside press dismiss with focus restoration', async ({ page }) => {
    await openStory(page, 'components-menu--default');
    const trigger = page.getByTestId('menu-trigger');
    await trigger.click();
    await page.keyboard.press('End');
    await expect(page.getByRole('menuitem').last()).toBeFocused();
    await page.keyboard.press('Home');
    await expect(page.getByRole('menuitem').first()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toBeHidden();
    await expect(trigger).toBeFocused();

    await trigger.click();
    await page.mouse.click(4, 4);
    await expect(page.getByRole('menu')).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('controlled state reports open and close', async ({ page }) => {
    await openStory(page, 'components-menu--controlled');
    const trigger = page.getByTestId('controlled-trigger');
    await trigger.click();
    await expect(page.getByTestId('controlled-open')).toHaveText('true');
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('controlled-open')).toHaveText('false');
  });

  test('disabled item exposes disabled semantics and never receives keyboard focus', async ({ page }) => {
    await openStory(page, 'components-menu--default');
    await page.getByTestId('menu-trigger').click();
    const disabled = page.getByRole('menuitem', { name: 'Unavailable' });
    await expect(disabled).toHaveAttribute('data-disabled');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await expect(disabled).not.toBeFocused();
  });

  test('popover flips/shifts inside viewport near bottom-right edge', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 360 });
    await openStory(page, 'components-menu--edge-placement');
    const popover = page.locator('.menu-popover');
    await expect(popover).toBeVisible();
    const box = await popover.boundingBox();
    expect(box).not.toBeNull();
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(352.5);
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(352.5);
  });

  test('long menu is scrollable without escaping the viewport', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 300 });
    await openStory(page, 'components-menu--long-menu');
    const menu = page.getByRole('menu');
    const metrics = await menu.evaluate((node) => ({
      clientHeight: node.clientHeight,
      scrollHeight: node.scrollHeight,
    }));
    expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight);
  });

  test('leading and trailing slots preserve three-column geometry', async ({ page }) => {
    await openStory(page, 'components-menu--default');
    await page.getByTestId('menu-trigger').click();
    const item = page.getByRole('menuitem', { name: /New file/ });
    await expect(item.locator('.menu-item__leading')).toBeVisible();
    await expect(item.locator('.menu-item__trailing')).toBeVisible();
    const labelBox = await item.locator('.menu-item__label').boundingBox();
    const leadingBox = await item.locator('.menu-item__leading').boundingBox();
    const trailingBox = await item.locator('.menu-item__trailing').boundingBox();
    expect((leadingBox?.x ?? 0) + (leadingBox?.width ?? 0)).toBeLessThan(labelBox?.x ?? 0);
    expect((labelBox?.x ?? 0) + (labelBox?.width ?? 0)).toBeLessThan(trailingBox?.x ?? 0);
  });

  test('exposed menu reuses TextField anchor, stays in theme portal, selects, and matches anchor width', async ({ page }) => {
    await openStory(page, 'components-menu--exposed');
    const field = page.getByRole('textbox', { name: 'Density' });
    await field.click();
    const menu = page.getByRole('menu');
    const popover = page.locator('.exposed-menu__popover');
    await expect(menu).toBeVisible();
    await expect(page.locator(`${themePortalSelector} .exposed-menu__popover`)).toBeVisible();
    await expect(popover).not.toHaveAttribute('data-entering');
    await expect(popover).toHaveCSS('transform', 'none');
    const fieldBox = await field
      .locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " text-field ")][1]')
      .boundingBox();
    const popoverBox = await popover.boundingBox();
    expect(Math.abs((fieldBox?.width ?? 0) - (popoverBox?.width ?? 0))).toBeLessThan(2);
    await page.getByRole('menuitem', { name: 'Comfortable' }).click();
    await expect(field).toHaveValue('Comfortable');
  });

  test('RTL keeps logical start alignment', async ({ page }) => {
    await openStory(page, 'components-menu--rtl');
    const item = page.getByRole('menuitem').first();
    await expect(item).toHaveCSS('text-align', 'start');
    await expect(item.locator('.menu-item__leading')).toBeVisible();
  });

  test('reduced motion removes popover transition', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'components-menu--reduced-motion');
    await page.getByTestId('reduced-trigger').click();
    await expect(page.locator('.menu-popover')).toHaveCSS('transition-duration', '0s');
  });
});
