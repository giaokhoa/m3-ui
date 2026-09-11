import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

function expectClose(actual: number | undefined, expected: number) {
  expect(actual).not.toBeUndefined();
  expect(Math.abs((actual ?? 0) - expected)).toBeLessThan(1);
}

test.describe('Material 3 FloatingActionButtonMenu browser contract', () => {
  test('closed trigger expands deterministically without ARIA menu semantics', async ({ page }) => {
    await openStory(page, 'components-fabmenu--default');
    const trigger = page.getByRole('button', { name: 'More actions' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByRole('menu')).toHaveCount(0);
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('group')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Archive' })).toHaveAttribute('aria-disabled', 'true');
  });

  test('open stagger follows the pinned bottom-to-top source order', async ({ page }) => {
    await openStory(page, 'components-fabmenu--expanded');
    const slots = page.locator('.fab-menu__item-slot');
    await expect(slots).toHaveCount(3);
    await expect(slots.nth(0)).toHaveAttribute('data-stagger-order', '2');
    await expect(slots.nth(1)).toHaveAttribute('data-stagger-order', '1');
    await expect(slots.nth(2)).toHaveAttribute('data-stagger-order', '0');
    expect(await slots.nth(0).evaluate((node) => getComputedStyle(node).transitionDelay)).toContain('0.1s');
    expect(await slots.nth(2).evaluate((node) => getComputedStyle(node).transitionDelay)).toContain('0s');
  });

  test('Tab or ArrowDown from expanded trigger enters the first actionable item', async ({ page }) => {
    await openStory(page, 'components-fabmenu--default');
    const trigger = page.getByRole('button', { name: 'More actions' });
    await trigger.click();
    await trigger.focus();
    await trigger.press('ArrowDown');
    await expect(page.getByRole('button', { name: 'Edit' })).toBeFocused();

    await trigger.focus();
    await trigger.press('Tab');
    await expect(page.getByRole('button', { name: 'Edit' })).toBeFocused();
  });

  test('activating an item collapses and restores valid trigger focus', async ({ page }) => {
    await openStory(page, 'components-fabmenu--default');
    const trigger = page.getByRole('button', { name: 'More actions' });
    await trigger.click();
    await trigger.focus();
    await trigger.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('fab-menu-action')).toHaveText('edit');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toBeFocused();
  });

  test('overflow actions scroll inside the configured container limit', async ({ page }) => {
    await openStory(page, 'components-fabmenu--overflow');
    const actions = page.locator('.fab-menu__actions');
    const metrics = await actions.evaluate((node) => ({
      clientHeight: node.clientHeight,
      scrollHeight: node.scrollHeight,
      overflowY: getComputedStyle(node).overflowY,
    }));
    expect(metrics.clientHeight).toBeLessThanOrEqual(180);
    expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight);
    expect(metrics.overflowY).toBe('auto');
  });

  test('logical end alignment follows LTR and RTL edges', async ({ page }) => {
    await openStory(page, 'components-fabmenu--expanded');
    const ltrTrigger = await page.locator('.fab-menu__trigger').boundingBox();
    const ltrItem = await page.locator('.fab-menu__item-slot').first().boundingBox();
    expectClose((ltrItem?.x ?? 0) + (ltrItem?.width ?? 0), (ltrTrigger?.x ?? 0) + (ltrTrigger?.width ?? 0));

    await openStory(page, 'components-fabmenu--rtl');
    const rtlTrigger = await page.locator('.fab-menu__trigger').boundingBox();
    const rtlItem = await page.locator('.fab-menu__item-slot').first().boundingBox();
    expectClose(rtlItem?.x, rtlTrigger?.x ?? 0);
  });

  test('toggle FAB preserves initial target while checked geometry morphs to 56px circle', async ({ page }) => {
    await openStory(page, 'components-fabmenu--toggle-geometry');
    const expectedInitial = [
      ['baseline', 56, 16],
      ['medium', 80, 20],
      ['large', 96, 28],
    ] as const;

    for (const [size, initialSize, initialRadius] of expectedInitial) {
      const unchecked = page.getByRole('button', { name: `${size} unchecked` });
      const checked = page.getByRole('button', { name: `${size} checked` });
      const uncheckedVisual = unchecked.locator('.fab__visual');
      const checkedVisual = checked.locator('.fab__visual');
      const uncheckedBox = await uncheckedVisual.boundingBox();
      const checkedBox = await checkedVisual.boundingBox();
      const checkedTarget = await checked.boundingBox();

      expectClose(uncheckedBox?.width, initialSize);
      expectClose(uncheckedBox?.height, initialSize);
      expectClose(checkedBox?.width, 56);
      expectClose(checkedBox?.height, 56);
      expectClose(checkedTarget?.width, initialSize);
      await expect(uncheckedVisual).toHaveCSS('border-radius', `${initialRadius}px`);
      await expect(checkedVisual).toHaveCSS('border-radius', '28px');
      await expect(checked).toHaveAttribute('aria-pressed', 'true');
    }
  });

  test('reduced motion removes stagger and morph durations without changing state or focus', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'components-fabmenu--reduced-motion');
    const trigger = page.getByRole('button', { name: 'More actions' });
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.fab-menu__item-slot').first()).toHaveCSS('transition-duration', '0s');
    await expect(trigger.locator('.fab__visual')).toHaveCSS('transition-duration', '0s');
    await trigger.focus();
    await trigger.press('ArrowDown');
    await expect(page.getByRole('button', { name: 'Edit' })).toBeFocused();
  });

  test('rapid open/close converges on the controlled state and never strands focus', async ({ page }) => {
    await openStory(page, 'components-fabmenu--rapid-toggle');
    const trigger = page.getByRole('button', { name: 'More actions' });
    for (let index = 0; index < 5; index += 1) await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await trigger.focus();
    await trigger.press('ArrowDown');
    await expect(page.getByRole('button', { name: 'Edit' })).toBeFocused();
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toBeFocused();
  });
});
