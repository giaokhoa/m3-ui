import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

function expectClose(actual: number | undefined, expected: number) {
  expect(actual).not.toBeUndefined();
  expect(Math.abs((actual ?? 0) - expected)).toBeLessThan(0.8);
}

test.describe('Material 3 NavigationRail browser contract', () => {
  test('uses the AndroidX 80px rail, 56px item and 56x32 labeled indicator geometry', async ({ page }) => {
    await openStory(page, 'components-navigationrail--default');
    const rail = page.getByTestId('navigation-rail');
    const home = page.getByTestId('navigation-rail-item-home');
    const indicator = home.locator('.navigation-rail-item__indicator-ripple');
    const icon = home.locator('.navigation-rail-item__icon');
    const label = home.locator('.navigation-rail-item__label');

    const railBox = await rail.boundingBox();
    const itemBox = await home.boundingBox();
    const indicatorBox = await indicator.boundingBox();
    const iconBox = await icon.boundingBox();
    const visual = await rail.evaluate((element) => {
      const style = getComputedStyle(element);
      return { backgroundColor: style.backgroundColor, boxShadow: style.boxShadow };
    });
    const itemVisual = await Promise.all([
      icon.evaluate((element) => getComputedStyle(element).color),
      label.evaluate((element) => {
        const style = getComputedStyle(element);
        return { color: style.color, fontSize: style.fontSize, lineHeight: style.lineHeight };
      }),
      home.locator('.navigation-rail-item__indicator').evaluate((element) => getComputedStyle(element).backgroundColor),
    ]);

    expectClose(railBox?.width, 80);
    expectClose(itemBox?.width, 80);
    expectClose(itemBox?.height, 56);
    expectClose(indicatorBox?.width, 56);
    expectClose(indicatorBox?.height, 32);
    expectClose(iconBox?.width, 24);
    expectClose(iconBox?.height, 24);
    expect(visual.backgroundColor).toBe('rgb(254, 247, 255)');
    expect(visual.boxShadow).toBe('none');
    expect(itemVisual[0]).toBe('rgb(29, 25, 43)');
    expect(itemVisual[1]).toEqual({ color: 'rgb(98, 91, 113)', fontSize: '12px', lineHeight: '16px' });
    expect(itemVisual[2]).toBe('rgb(232, 222, 248)');
  });

  test('icon-only items use the current AndroidX 56x56 indicator', async ({ page }) => {
    await openStory(page, 'components-navigationrail--icon-only');
    const home = page.getByTestId('navigation-rail-item-home');
    const indicator = home.locator('.navigation-rail-item__indicator-ripple');
    const box = await indicator.boundingBox();
    expectClose(box?.width, 56);
    expectClose(box?.height, 56);
    await expect(home.locator('.navigation-rail-item__label')).toHaveCount(0);
  });

  test('exposes vertical tab selection and selected-label-only layout', async ({ page }) => {
    await openStory(page, 'components-navigationrail--selected-label-only');
    const rail = page.getByTestId('navigation-rail');
    const tablist = rail.getByRole('tablist');
    const home = page.getByTestId('navigation-rail-item-home');
    const explore = page.getByTestId('navigation-rail-item-explore');

    await expect(tablist).toHaveAttribute('aria-orientation', 'vertical');
    await expect(home).toHaveAttribute('role', 'tab');
    await expect(home).toHaveAttribute('aria-selected', 'true');
    await expect(explore).toHaveAttribute('data-label-hidden', 'true');
    await expect(explore.locator('.navigation-rail-item__label')).toHaveText('Explore');

    await explore.click();
    await expect(explore).toHaveAttribute('aria-selected', 'true');
    await expect(explore).not.toHaveAttribute('data-label-hidden');
    await expect(home).toHaveAttribute('data-label-hidden', 'true');
    await expect(page.getByTestId('navigation-rail-selection')).toHaveText('Selected: explore');

    await expect
      .poll(async () =>
        Promise.all([
          explore.locator('.navigation-rail-item__icon').evaluate((element) => getComputedStyle(element).color),
          home.locator('.navigation-rail-item__icon').evaluate((element) => getComputedStyle(element).color),
        ]),
      )
      .toEqual(['rgb(29, 25, 43)', 'rgb(73, 69, 79)']);
  });

  test('preserves Compose vertical spacing and header spacer geometry', async ({ page }) => {
    await openStory(page, 'components-navigationrail--with-header');
    const header = page.getByTestId('navigation-rail-header');
    const first = page.getByTestId('navigation-rail-item-home');
    const headerBox = await header.boundingBox();
    const firstBox = await first.boundingBox();
    expectClose((firstBox?.y ?? 0) - ((headerBox?.y ?? 0) + (headerBox?.height ?? 0)), 16);

    const items = page.locator('.navigation-rail-item');
    const boxes = await items.evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect()));
    expectClose(boxes[1].y - (boxes[0].y + boxes[0].height), 4);
  });

  test('keyboard focus and hover use the real indicator-bounded Ripple', async ({ page }) => {
    await openStory(page, 'components-navigationrail--default');
    const home = page.getByTestId('navigation-rail-item-home');
    const ripple = home.locator('.navigation-rail-item__indicator-ripple > .ripple');
    const indicator = home.locator('.navigation-rail-item__indicator-ripple');

    await home.hover();
    await expect(ripple).toHaveAttribute('data-hovered', 'true');
    const rippleBox = await ripple.boundingBox();
    const indicatorBox = await indicator.boundingBox();
    expectClose(rippleBox?.width, indicatorBox?.width ?? 0);
    expectClose(rippleBox?.height, indicatorBox?.height ?? 0);

    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toHaveAttribute('role', 'tab');
  });
});
