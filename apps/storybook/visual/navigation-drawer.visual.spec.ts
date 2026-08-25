import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, {
    waitUntil: 'networkidle',
  });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

function expectClose(actual: number | undefined, expected: number) {
  expect(actual).not.toBeUndefined();
  expect(Math.abs((actual ?? 0) - expected)).toBeLessThan(0.8);
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
      return {
        backgroundColor: style.backgroundColor,
        color: style.color,
        borderRadius: style.borderRadius,
        fontSize: style.fontSize,
        lineHeight: style.lineHeight,
      };
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

  test('selection uses the real RAC press path and updates inactive colors', async ({ page }) => {
    await openStory(page, 'components-navigationdrawer--permanent');
    const home = page.getByTestId('drawer-item-home');
    const explore = page.getByTestId('drawer-item-explore');

    await explore.click();
    await expect(explore).toHaveAttribute('aria-selected', 'true');
    await expect(home).toHaveAttribute('aria-selected', 'false');

    const colors = await Promise.all([
      explore.evaluate((element) => getComputedStyle(element).backgroundColor),
      home.evaluate((element) => ({
        background: getComputedStyle(element).backgroundColor,
        color: getComputedStyle(element).color,
      })),
    ]);
    expect(colors[0]).toBe('rgb(232, 222, 248)');
    expect(colors[1]).toEqual({
      background: 'rgba(0, 0, 0, 0)',
      color: 'rgb(73, 69, 79)',
    });
  });

  test('permanent surface uses standard surface color and level0 elevation', async ({ page }) => {
    await openStory(page, 'components-navigationdrawer--permanent');
    const sheet = page.getByTestId('permanent-drawer-sheet');
    const visual = await sheet.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        backgroundColor: style.backgroundColor,
        boxShadow: style.boxShadow,
        minWidth: style.minWidth,
        maxWidth: style.maxWidth,
      };
    });

    expect(visual.backgroundColor).toBe('rgb(254, 247, 255)');
    expect(visual.boxShadow).not.toBe('none');
    expect(visual.boxShadow.match(/0px 0px 0px 0px/g)).toHaveLength(3);
    expect(visual.minWidth).toBe('240px');
    expect(visual.maxWidth).toBe('360px');
  });
});
