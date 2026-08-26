import { expect, test, type Locator, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

function expectClose(actual: number | undefined, expected: number, tolerance = 1) {
  expect(actual).not.toBeUndefined();
  expect(Math.abs((actual ?? 0) - expected)).toBeLessThan(tolerance);
}

async function widths(items: Locator) {
  return Promise.all((await items.all()).map(async (item) => (await item.boundingBox())?.width ?? 0));
}

async function totalRowWidth(group: Locator) {
  const row = group.locator('.button-group__row');
  return (await row.boundingBox())?.width ?? 0;
}

test.describe('Material 3 ButtonGroup browser contract', () => {
  test('standard group keeps small height, 12px spacing, order and native actions', async ({ page }) => {
    await openStory(page, 'components-buttongroup--standard');
    const group = page.getByTestId('button-group');
    const items = group.locator('.button-group__item');
    await expect(group).toHaveAttribute('role', 'group');
    await expect(items).toHaveCount(3);
    await expect(group.locator('.button-group__row')).toHaveCSS('gap', '12px');
    expectClose((await group.boundingBox())?.height, 40);
    await expect(items.nth(0).getByRole('button')).toHaveText('One');
    await expect(items.nth(1).getByRole('button')).toHaveText('Two medium');
    await expect(items.nth(2).getByRole('button')).toHaveText('Three');
  });

  test('middle press expands itself, compresses both neighbors, and does not jump total width', async ({ page }) => {
    await openStory(page, 'components-buttongroup--standard');
    const group = page.getByTestId('button-group');
    const items = group.locator('.button-group__item');
    const before = await widths(items);
    const totalBefore = await totalRowWidth(group);
    const middle = items.nth(1).getByRole('button');
    const box = await middle.boundingBox();
    await page.mouse.move((box?.x ?? 0) + (box?.width ?? 0) / 2, (box?.y ?? 0) + (box?.height ?? 0) / 2);
    await page.mouse.down();
    await expect.poll(async () => (await widths(items))[1]).toBeGreaterThan(before[1] + 1);
    const pressed = await widths(items);
    expect(pressed[0]).toBeLessThan(before[0]);
    expect(pressed[2]).toBeLessThan(before[2]);
    expectClose(await totalRowWidth(group), totalBefore, 1.5);
    await page.mouse.up();
    await expect.poll(async () => (await widths(items))[1]).toBeCloseTo(before[1], 0);
  });

  test('edge press redistributes only to its one neighbor and releases to baseline', async ({ page }) => {
    await openStory(page, 'components-buttongroup--standard');
    const items = page.getByTestId('button-group').locator('.button-group__item');
    const before = await widths(items);
    const first = items.first().getByRole('button');
    const box = await first.boundingBox();
    await page.mouse.move((box?.x ?? 0) + 8, (box?.y ?? 0) + (box?.height ?? 0) / 2);
    await page.mouse.down();
    await expect.poll(async () => (await widths(items))[0]).toBeGreaterThan(before[0] + 1);
    const pressed = await widths(items);
    expect(pressed[1]).toBeLessThan(before[1]);
    expectClose(pressed[2], before[2]);
    await page.mouse.up();
    await expect.poll(async () => (await widths(items))[0]).toBeCloseTo(before[0], 0);
  });

  test('reduced motion preserves pressed/released geometry with zero transition duration', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'components-buttongroup--standard');
    const items = page.getByTestId('button-group').locator('.button-group__item');
    const before = await widths(items);
    await expect(items.nth(1)).toHaveCSS('transition-duration', '0s');
    const middle = items.nth(1).getByRole('button');
    const box = await middle.boundingBox();
    await page.mouse.move((box?.x ?? 0) + (box?.width ?? 0) / 2, (box?.y ?? 0) + 8);
    await page.mouse.down();
    expect((await widths(items))[1]).toBeGreaterThan(before[1]);
    await page.mouse.up();
    expectClose((await widths(items))[1], before[1]);
  });

  test('constrained width overflows a deterministic suffix and overflow action still executes', async ({ page }) => {
    await openStory(page, 'components-buttongroup--overflow');
    const group = page.getByTestId('button-group');
    const visible = group.locator('.button-group__item');
    const trigger = group.getByRole('button', { name: 'More options' });
    await expect(trigger).toBeVisible();
    const visibleCount = await visible.count();
    expect(visibleCount).toBeGreaterThan(0);
    expect(visibleCount).toBeLessThan(6);
    await trigger.click();
    const menu = group.getByRole('menu');
    await expect(menu).toBeVisible();
    const menuItems = menu.getByRole('menuitem');
    expect(await menuItems.count()).toBe(6 - visibleCount);
    const expectedLabel = await menuItems.last().textContent();
    await menuItems.last().click();
    await expect(page.getByTestId('last-action')).toHaveText((expectedLabel ?? '').trim().toLowerCase());
  });

  test('resize moves items in and out of overflow without duplicates or lost ordering', async ({ page }) => {
    await openStory(page, 'components-buttongroup--overflow');
    const group = page.getByTestId('button-group');
    const narrowCount = await group.locator('.button-group__item').count();
    await page.getByTestId('toggle-width').click();
    await expect.poll(async () => group.locator('.button-group__item').count()).toBe(6);
    await expect(group.getByRole('button', { name: 'More options' })).toHaveCount(0);
    const order = await group.locator('.button-group__item .button').allTextContents();
    expect(order.map((value) => value.trim())).toEqual(['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta']);
    await page.getByTestId('toggle-width').click();
    await expect.poll(async () => group.locator('.button-group__item').count()).toBe(narrowCount);
  });

  test('connected 2/3/4 groups assign logical leading/middle/trailing positions and selected full shape', async ({ page }) => {
    await openStory(page, 'components-buttongroup--connected-geometry');
    for (const count of [2, 3, 4]) {
      const group = page.getByTestId(`connected-${count}`);
      const items = group.locator('.button-group__connected-item');
      await expect(items).toHaveCount(count);
      await expect(items.first()).toHaveAttribute('data-position', 'leading');
      await expect(items.last()).toHaveAttribute('data-position', 'trailing');
      if (count > 2) await expect(items.nth(1)).toHaveAttribute('data-position', 'middle');
      const leading = await items.first().evaluate((element) => {
        const style = getComputedStyle(element);
        return { left: Number.parseFloat(style.borderTopLeftRadius), right: Number.parseFloat(style.borderTopRightRadius) };
      });
      const trailing = await items.last().evaluate((element) => {
        const style = getComputedStyle(element);
        return { left: Number.parseFloat(style.borderTopLeftRadius), right: Number.parseFloat(style.borderTopRightRadius) };
      });
      expect(leading.left).toBeGreaterThan(100);
      expectClose(leading.right, 8);
      expectClose(trailing.left, 8);
      expect(trailing.right).toBeGreaterThan(100);
      await expect(group.locator('.button-group__row')).toHaveCSS('gap', '2px');
    }
  });

  test('connected pressed inner corners morph to 4px and checked shape becomes full', async ({ page }) => {
    await openStory(page, 'components-buttongroup--connected-single');
    const group = page.getByTestId('button-group');
    const middle = group.locator('.button-group__connected-item[data-button-group-item="food"]');
    const radio = group.getByRole('radio', { name: 'Food' });
    const box = await middle.boundingBox();
    await page.mouse.move((box?.x ?? 0) + (box?.width ?? 0) / 2, (box?.y ?? 0) + (box?.height ?? 0) / 2);
    await page.mouse.down();
    await expect.poll(async () => Number.parseFloat(await middle.evaluate((element) => getComputedStyle(element).borderTopLeftRadius))).toBeCloseTo(4, 0);
    await page.mouse.up();
    await middle.click();
    await expect(radio).toBeChecked();
    await expect.poll(async () => Number.parseFloat(await middle.evaluate((element) => getComputedStyle(element).borderTopLeftRadius))).toBeGreaterThan(100);
  });

  test('single connected selection has radio semantics and exactly one checked item', async ({ page }) => {
    await openStory(page, 'components-buttongroup--connected-single');
    const group = page.getByRole('radiogroup', { name: 'Single connected selection' });
    const radios = group.getByRole('radio');
    await expect(radios).toHaveCount(3);
    await expect(radios.nth(0)).toBeChecked();
    await group.locator('.button-group__connected-item[data-button-group-item="food"]').click();
    await expect(radios.nth(0)).not.toBeChecked();
    await expect(radios.nth(1)).toBeChecked();
    expect(await group.locator('input[type="radio"]:checked').count()).toBe(1);
  });

  test('multiple connected selection permits multiple pressed toggles and disabled item cannot change', async ({ page }) => {
    await openStory(page, 'components-buttongroup--connected-multiple');
    const group = page.getByTestId('button-group');
    const buttons = group.getByRole('button');
    await expect(buttons.nth(0)).toHaveAttribute('aria-pressed', 'true');
    await expect(buttons.nth(2)).toHaveAttribute('aria-pressed', 'true');
    await buttons.nth(1).click();
    await expect(buttons.nth(1)).toHaveAttribute('aria-pressed', 'true');

    await openStory(page, 'components-buttongroup--disabled');
    const disabled = page.getByTestId('button-group').getByRole('button', { name: 'Food' });
    await expect(disabled).toBeDisabled();
    await expect(disabled).toHaveAttribute('aria-pressed', 'false');
  });

  test('keyboard focus is visible and RTL flips physical outer shape without reversing data order', async ({ page }) => {
    await openStory(page, 'components-buttongroup--connected-single');
    await page.keyboard.press('Tab');
    const focused = page.getByRole('radio', { name: 'Work' });
    const focusedSurface = page.locator('.button-group__connected-item[data-button-group-item="work"]');
    await expect(focused).toBeFocused();
    await expect(focusedSurface).toHaveAttribute('data-focus-visible');
    await page.keyboard.press('ArrowRight');
    const next = page.getByRole('radio', { name: 'Food' });
    const nextSurface = page.locator('.button-group__connected-item[data-button-group-item="food"]');
    await expect(next).toBeFocused();
    await expect(next).toBeChecked();
    await expect(nextSurface).toHaveAttribute('data-focus-visible');

    await openStory(page, 'components-buttongroup--rtl');
    const group = page.getByTestId('button-group');
    const items = group.locator('.button-group__connected-item');
    expect((await items.allTextContents()).map((value) => value.trim())).toEqual(['Work', 'Food', 'Coffee']);
    await items.nth(1).click();
    await expect(group.getByRole('radio', { name: 'Food' })).toBeChecked();
    const leading = await items.first().evaluate((element) => {
      const style = getComputedStyle(element);
      return { left: Number.parseFloat(style.borderTopLeftRadius), right: Number.parseFloat(style.borderTopRightRadius) };
    });
    expectClose(leading.left, 8);
    expect(leading.right).toBeGreaterThan(100);
  });

  test('animated width keeps the live surface hit-testable without overlap dead zones', async ({ page }) => {
    await openStory(page, 'components-buttongroup--standard');
    const group = page.getByTestId('button-group');
    const second = group.locator('.button-group__item').nth(1);
    const button = second.getByRole('button');
    const box = await button.boundingBox();
    await page.mouse.move((box?.x ?? 0) + (box?.width ?? 0) / 2, (box?.y ?? 0) + (box?.height ?? 0) / 2);
    await page.mouse.down();
    await expect.poll(async () => (await second.boundingBox())?.width ?? 0).toBeGreaterThan((box?.width ?? 0) + 1);
    const expanded = await second.boundingBox();
    await page.mouse.up();
    await page.mouse.click((expanded?.x ?? 0) + (expanded?.width ?? 0) / 2, (expanded?.y ?? 0) + (expanded?.height ?? 0) / 2);
    await expect(page.getByTestId('last-action')).toHaveText('two');
  });
});
