import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

function expectClose(actual: number | undefined, expected: number) {
  expect(actual).not.toBeUndefined();
  expect(Math.abs((actual ?? 0) - expected)).toBeLessThan(0.8);
}

test.describe('Material 3 WideNavigationRail browser contract', () => {
  test('uses the AndroidX 96px collapsed rail and 64px top-icon item geometry', async ({ page }) => {
    await openStory(page, 'components-widenavigationrail--default');
    const rail = page.getByTestId('wide-navigation-rail');
    const home = page.getByTestId('wide-navigation-rail-item-home');
    const indicator = home.locator('.wide-navigation-rail-item__indicator-ripple');
    const icon = home.locator('.wide-navigation-rail-item__icon');
    const label = home.locator('.wide-navigation-rail-item__label');

    const railBox = await rail.boundingBox();
    const itemBox = await home.boundingBox();
    const indicatorBox = await indicator.boundingBox();
    const iconBox = await icon.boundingBox();
    const visual = await rail.evaluate((element) => {
      const style = getComputedStyle(element);
      return { backgroundColor: style.backgroundColor, boxShadow: style.boxShadow };
    });
    const labelVisual = await label.evaluate((element) => {
      const style = getComputedStyle(element);
      return { color: style.color, fontSize: style.fontSize, lineHeight: style.lineHeight };
    });

    expectClose(railBox?.width, 96);
    expectClose(itemBox?.width, 96);
    expectClose(itemBox?.height, 64);
    expectClose(indicatorBox?.width, 56);
    expectClose(indicatorBox?.height, 32);
    expectClose((indicatorBox?.y ?? 0) - (itemBox?.y ?? 0), 6);
    expectClose(iconBox?.width, 24);
    expectClose(iconBox?.height, 24);
    expect(visual.backgroundColor).toBe('rgb(254, 247, 255)');
    expect(visual.boxShadow).toBe('none');
    expect(labelVisual).toEqual({
      color: 'rgb(98, 91, 113)',
      fontSize: '12px',
      lineHeight: '16px',
    });
  });

  test('expands to the 220px minimum and switches items to the horizontal 56px layout', async ({ page }) => {
    await openStory(page, 'components-widenavigationrail--expanded');
    const rail = page.getByTestId('wide-navigation-rail');
    const home = page.getByTestId('wide-navigation-rail-item-home');
    const indicator = home.locator('.wide-navigation-rail-item__indicator-ripple');
    const label = home.locator('.wide-navigation-rail-item__label');

    await expect.poll(async () => (await rail.boundingBox())?.width).toBeCloseTo(220, 0);
    const itemBox = await home.boundingBox();
    const indicatorBox = await indicator.boundingBox();
    const labelVisual = await label.evaluate((element) => {
      const style = getComputedStyle(element);
      return { color: style.color, fontSize: style.fontSize, lineHeight: style.lineHeight };
    });

    expectClose(itemBox?.height, 56);
    expectClose(indicatorBox?.height, 56);
    expect((indicatorBox?.width ?? 0)).toBeGreaterThan(56);
    expectClose((indicatorBox?.x ?? 0) - ((await rail.boundingBox())?.x ?? 0), 20);
    expect(labelVisual).toEqual({
      color: 'rgb(29, 25, 43)',
      fontSize: '14px',
      lineHeight: '20px',
    });
  });

  test('toggles state with DefaultSpatial motion and settles on expanded renderer colors', async ({ page }) => {
    await openStory(page, 'components-widenavigationrail--default');
    const rail = page.getByTestId('wide-navigation-rail');
    const home = page.getByTestId('wide-navigation-rail-item-home');
    await page.getByTestId('wide-navigation-rail-toggle').click();

    await expect(rail).toHaveAttribute('data-state', 'expanded');
    await expect(home).toHaveAttribute('data-icon-position', 'start');
    await expect.poll(async () => (await rail.boundingBox())?.width).toBeCloseTo(220, 0);
    await expect
      .poll(async () =>
        home.locator('.wide-navigation-rail-item__label').evaluate((element) =>
          getComputedStyle(element).color,
        ),
      )
      .toBe('rgb(29, 25, 43)');
  });

  test('grows content-driven expanded width but caps it at the AndroidX 360px maximum', async ({ page }) => {
    await openStory(page, 'components-widenavigationrail--long-label');
    const rail = page.getByTestId('wide-navigation-rail');
    await expect.poll(async () => (await rail.boundingBox())?.width).toBeCloseTo(360, 0);
  });

  test('keeps icon-only items circular and preserves vertical tab semantics and selection', async ({ page }) => {
    await openStory(page, 'components-widenavigationrail--icon-only');
    const rail = page.getByTestId('wide-navigation-rail');
    const tablist = rail.getByRole('tablist');
    const home = page.getByTestId('wide-navigation-rail-item-home');
    const explore = page.getByTestId('wide-navigation-rail-item-explore');
    const indicator = home.locator('.wide-navigation-rail-item__indicator-ripple');

    await expect(tablist).toHaveAttribute('aria-orientation', 'vertical');
    await expect(home).toHaveAttribute('role', 'tab');
    await expect(home).toHaveAttribute('aria-selected', 'true');
    const box = await indicator.boundingBox();
    expectClose(box?.width, 56);
    expectClose(box?.height, 56);
    await expect(home.locator('.wide-navigation-rail-item__label')).toHaveCount(0);

    await explore.click();
    await expect(explore).toHaveAttribute('aria-selected', 'true');
    await expect(home).toHaveAttribute('aria-selected', 'false');
    await expect(page.getByTestId('wide-navigation-rail-selection')).toHaveText('Selected: explore');
  });

  test('keeps header spacing and the real Ripple bounded to the animated indicator', async ({ page }) => {
    await openStory(page, 'components-widenavigationrail--with-header');
    const header = page.getByTestId('wide-navigation-rail-header');
    const home = page.getByTestId('wide-navigation-rail-item-home');
    const headerBox = await header.boundingBox();
    const itemBox = await home.boundingBox();
    expectClose((itemBox?.y ?? 0) - ((headerBox?.y ?? 0) + (headerBox?.height ?? 0)), 40);

    const indicator = home.locator('.wide-navigation-rail-item__indicator-ripple');
    const ripple = indicator.locator('> .ripple');
    await home.hover();
    await expect(ripple).toHaveAttribute('data-hovered', 'true');
    const rippleBox = await ripple.boundingBox();
    const indicatorBox = await indicator.boundingBox();
    expectClose(rippleBox?.width, indicatorBox?.width ?? 0);
    expectClose(rippleBox?.height, indicatorBox?.height ?? 0);
  });
});
