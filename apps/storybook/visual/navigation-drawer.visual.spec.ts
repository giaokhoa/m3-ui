import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

function expectClose(actual: number | undefined, expected: number) {
  expect(actual).not.toBeUndefined();
  expect(Math.abs((actual ?? 0) - expected)).toBeLessThan(0.8);
}

async function waitForDrawerMotion(page: Page) {
  await page.waitForTimeout(220);
}

test.describe('Material 3 NavigationDrawer browser contract', () => {
  test('permanent drawer is 360px wide and selected indicator resolves to 336x56', async ({ page }) => {
    await openStory(page, 'components-navigationdrawer--permanent');
    const stage = page.getByTestId('navigation-drawer-stage');
    const sheet = page.getByTestId('permanent-drawer-sheet');
    const selected = page.getByTestId('drawer-item-home');
    const icon = selected.locator('.navigation-drawer-item__icon');
    const stageBox = await stage.boundingBox();
    const sheetBox = await sheet.boundingBox();
    const selectedBox = await selected.boundingBox();
    const iconBox = await icon.boundingBox();
    const visual = await selected.evaluate((element) => {
      const style = getComputedStyle(element);
      return { backgroundColor: style.backgroundColor, color: style.color, borderRadius: style.borderRadius, fontSize: style.fontSize, lineHeight: style.lineHeight };
    });
    expectClose(sheetBox?.width, 360);
    expectClose(sheetBox?.height, stageBox?.height ?? 0);
    expectClose(selectedBox?.width, 336);
    expectClose(selectedBox?.height, 56);
    expectClose(iconBox?.width, 24);
    expectClose(iconBox?.height, 24);
    expect(visual.backgroundColor).toBe('rgb(232, 222, 248)');
    expect(visual.color).toBe('rgb(29, 25, 43)');
    expect(visual.borderRadius).toBe('9999px');
    expect(visual.fontSize).toBe('14px');
    expect(visual.lineHeight).toBe('20px');
    await expect(selected).toHaveAttribute('role', 'tab');
    await expect(selected).toHaveAttribute('aria-selected', 'true');
  });

  test('drawer actions keep canonical geometry with native disclosure semantics', async ({ page }) => {
    await openStory(page, 'components-navigationdrawer--action');
    const action = page.getByTestId('drawer-action-disclosure');
    const box = await action.boundingBox();

    expectClose(box?.width, 336);
    expectClose(box?.height, 56);
    await expect(action).toHaveRole('button');
    await expect(action).toHaveAttribute('aria-expanded', 'false');
    await expect(action).not.toHaveAttribute('aria-selected');
    await expect(page.getByTestId('drawer-action-panel')).toHaveCount(0);

    await action.click();
    await expect(action).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByTestId('drawer-action-panel')).toBeVisible();
  });

  test('selection uses the real RAC press path and updates inactive colors', async ({ page }) => {
    await openStory(page, 'components-navigationdrawer--permanent');
    const home = page.getByTestId('drawer-item-home');
    const explore = page.getByTestId('drawer-item-explore');
    await explore.click();
    await expect(explore).toHaveAttribute('aria-selected', 'true');
    await expect(home).toHaveAttribute('aria-selected', 'false');
    const colors = await Promise.all([
      explore.evaluate((element) => getComputedStyle(element).backgroundColor),
      home.evaluate((element) => ({ background: getComputedStyle(element).backgroundColor, color: getComputedStyle(element).color })),
    ]);
    expect(colors[0]).toBe('rgb(232, 222, 248)');
    expect(colors[1]).toEqual({ background: 'rgba(0, 0, 0, 0)', color: 'rgb(73, 69, 79)' });
  });

  test('permanent surface uses standard surface color and level0 elevation', async ({ page }) => {
    await openStory(page, 'components-navigationdrawer--permanent');
    const sheet = page.getByTestId('permanent-drawer-sheet');
    const visual = await sheet.evaluate((element) => {
      const style = getComputedStyle(element);
      return { backgroundColor: style.backgroundColor, boxShadow: style.boxShadow, minWidth: style.minWidth, maxWidth: style.maxWidth };
    });
    expect(visual.backgroundColor).toBe('rgb(254, 247, 255)');
    expect(visual.boxShadow).toBe('none');
    expect(visual.minWidth).toBe('240px');
    expect(visual.maxWidth).toBe('360px');
  });

  test('modal drawer owns scrim, first focus, Escape and AndroidX runtime surface', async ({ page }) => {
    await openStory(page, 'components-navigationdrawer--modal');
    const opener = page.getByTestId('modal-drawer-open');
    await opener.click();
    const overlay = page.locator('.modal-navigation-drawer-overlay');
    const sheet = page.getByTestId('modal-drawer-sheet');
    const firstItem = page.getByTestId('drawer-item-home');
    await expect(overlay).toBeVisible();
    await waitForDrawerMotion(page);
    await expect(firstItem).toBeFocused();

    const visual = await sheet.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        backgroundColor: style.backgroundColor,
        boxShadow: style.boxShadow,
        borderStartStartRadius: style.borderStartStartRadius,
        borderStartEndRadius: style.borderStartEndRadius,
        borderEndEndRadius: style.borderEndEndRadius,
        borderEndStartRadius: style.borderEndStartRadius,
        width: style.width,
      };
    });
    const scrimOpacity = await overlay.evaluate((element) => getComputedStyle(element, '::before').opacity);
    expect(visual.backgroundColor).toBe('rgb(247, 242, 250)');
    expect(visual.boxShadow).toBe('none');
    expect(visual.borderStartStartRadius).toBe('0px');
    expect(visual.borderStartEndRadius).toBe('16px');
    expect(visual.borderEndEndRadius).toBe('16px');
    expect(visual.borderEndStartRadius).toBe('0px');
    expect(visual.width).toBe('360px');
    expect(Number.parseFloat(scrimOpacity)).toBeCloseTo(0.32, 2);

    await page.keyboard.press('Escape');
    await expect(overlay).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test('modal horizontal drag crosses the 50% threshold and scrim click dismisses', async ({ page }) => {
    await openStory(page, 'components-navigationdrawer--modal');
    const root = page.getByTestId('modal-navigation-drawer');
    const rootBox = await root.boundingBox();
    expect(rootBox).not.toBeNull();
    const y = (rootBox?.y ?? 0) + 420;
    await page.mouse.move((rootBox?.x ?? 0) + 20, y);
    await page.mouse.down();
    await page.mouse.move((rootBox?.x ?? 0) + 230, y, { steps: 8 });
    await page.mouse.up();
    const overlay = page.locator('.modal-navigation-drawer-overlay');
    await expect(overlay).toBeVisible();
    await waitForDrawerMotion(page);

    const box = await page.getByTestId('modal-drawer-sheet').boundingBox();
    expectClose(box?.x, 0);
    await page.mouse.click(700, 420);
    await expect(overlay).toBeHidden();
  });

  test('dismissible drawer shifts content by its measured width and Escape closes', async ({ page }) => {
    await openStory(page, 'components-navigationdrawer--dismissible');
    const root = page.getByTestId('dismissible-navigation-drawer');
    const opener = page.getByTestId('dismissible-drawer-open');
    const content = page.getByTestId('dismissible-drawer-content');
    const rootBefore = await root.boundingBox();
    const before = await content.boundingBox();
    await opener.click();
    await waitForDrawerMotion(page);
    const sheet = page.getByTestId('dismissible-drawer-sheet');
    const sheetBox = await sheet.boundingBox();
    const after = await content.boundingBox();
    expectClose(sheetBox?.x, rootBefore?.x ?? 0);
    expectClose(sheetBox?.width, 360);
    expectClose((after?.x ?? 0) - (before?.x ?? 0), 360);
    await expect(page.getByTestId('drawer-item-home')).toBeFocused();

    await page.keyboard.press('Escape');
    await waitForDrawerMotion(page);
    const closed = await content.boundingBox();
    expectClose(closed?.x, before?.x ?? 0);
  });

  test('RTL uses the logical start edge for dismissible drag', async ({ page }) => {
    await openStory(page, 'components-navigationdrawer--dismissible-rtl');
    const root = page.getByTestId('dismissible-navigation-drawer');
    const rootBox = await root.boundingBox();
    expect(rootBox).not.toBeNull();
    const right = (rootBox?.x ?? 0) + (rootBox?.width ?? 0) - 20;
    const y = (rootBox?.y ?? 0) + 420;
    await page.mouse.move(right, y);
    await page.mouse.down();
    await page.mouse.move(right - 220, y, { steps: 8 });
    await page.mouse.up();
    await waitForDrawerMotion(page);
    const sheetBox = await page.getByTestId('dismissible-drawer-sheet').boundingBox();
    const rootRight = (rootBox?.x ?? 0) + (rootBox?.width ?? 0);
    expectClose((sheetBox?.x ?? 0) + (sheetBox?.width ?? 0), rootRight);
  });
});
