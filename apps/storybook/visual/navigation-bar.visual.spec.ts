import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

function expectClose(actual: number | undefined, expected: number) {
  expect(actual).not.toBeUndefined();
  expect(Math.abs((actual ?? 0) - expected)).toBeLessThan(0.8);
}

test.describe('Material 3 NavigationBar browser contract', () => {
  test('uses the AndroidX 80px bar and 56x32 selected indicator geometry', async ({ page }) => {
    await openStory(page, 'components-navigationbar--default');
    const bar = page.getByTestId('navigation-bar');
    const home = page.getByTestId('navigation-bar-item-home');
    const indicator = home.locator('.navigation-bar-item__indicator-ripple');
    const icon = home.locator('.navigation-bar-item__icon');
    const label = home.locator('.navigation-bar-item__label');

    const barBox = await bar.boundingBox();
    const indicatorBox = await indicator.boundingBox();
    const iconBox = await icon.boundingBox();
    const visual = await bar.evaluate((element) => {
      const style = getComputedStyle(element);
      return { backgroundColor: style.backgroundColor, boxShadow: style.boxShadow };
    });
    const itemVisual = await Promise.all([
      icon.evaluate((element) => getComputedStyle(element).color),
      label.evaluate((element) => {
        const style = getComputedStyle(element);
        return { color: style.color, fontSize: style.fontSize, lineHeight: style.lineHeight };
      }),
      home.locator('.navigation-bar-item__indicator').evaluate((element) => getComputedStyle(element).backgroundColor),
    ]);

    expectClose(barBox?.height, 80);
    expectClose(indicatorBox?.width, 56);
    expectClose(indicatorBox?.height, 32);
    expectClose(iconBox?.width, 24);
    expectClose(iconBox?.height, 24);
    expect(visual.backgroundColor).toBe('rgb(243, 237, 247)');
    expect(visual.boxShadow).toBe('none');
    expect(itemVisual[0]).toBe('rgb(29, 25, 43)');
    expect(itemVisual[1]).toEqual({ color: 'rgb(98, 91, 113)', fontSize: '12px', lineHeight: '16px' });
    expect(itemVisual[2]).toBe('rgb(232, 222, 248)');
  });

  test('exposes tab selection semantics and changes selection through RAC press', async ({ page }) => {
    await openStory(page, 'components-navigationbar--default');
    const bar = page.getByTestId('navigation-bar');
    const tablist = bar.getByRole('tablist');
    const home = page.getByTestId('navigation-bar-item-home');
    const explore = page.getByTestId('navigation-bar-item-explore');

    await expect(tablist).toBeVisible();
    await expect(home).toHaveAttribute('role', 'tab');
    await expect(home).toHaveAttribute('aria-selected', 'true');
    await expect(explore).toHaveAttribute('aria-selected', 'false');

    await explore.click();
    await expect(explore).toHaveAttribute('aria-selected', 'true');
    await expect(home).toHaveAttribute('aria-selected', 'false');
    await expect(page.getByTestId('navigation-bar-selection')).toHaveText('Selected: explore');

    await expect
      .poll(async () =>
        Promise.all([
          explore
            .locator('.navigation-bar-item__icon')
            .evaluate((element) => getComputedStyle(element).color),
          home
            .locator('.navigation-bar-item__icon')
            .evaluate((element) => getComputedStyle(element).color),
        ]),
      )
      .toEqual(['rgb(29, 25, 43)', 'rgb(73, 69, 79)']);
  });

  test('distributes destinations evenly while preserving the Compose item gap', async ({ page }) => {
    await openStory(page, 'components-navigationbar--default');
    const items = page.locator('.navigation-bar-item');
    await expect(items).toHaveCount(4);
    const boxes = await items.evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().width));
    expect(Math.max(...boxes) - Math.min(...boxes)).toBeLessThan(0.8);
    const gap = await page.locator('.navigation-bar__items').evaluate((element) => getComputedStyle(element).gap);
    expect(gap).toBe('8px');
  });

  test('selected-label-only keeps inactive labels accessible but visually hidden', async ({ page }) => {
    await openStory(page, 'components-navigationbar--selected-label-only');
    const home = page.getByTestId('navigation-bar-item-home');
    const explore = page.getByTestId('navigation-bar-item-explore');
    const homeLabel = home.locator('.navigation-bar-item__label');
    const exploreLabel = explore.locator('.navigation-bar-item__label');

    await expect(homeLabel).toBeVisible();
    await expect(explore).toHaveAttribute('data-label-hidden', 'true');
    await expect(exploreLabel).toHaveText('Explore');
    const hidden = await exploreLabel.evaluate((element) => {
      const style = getComputedStyle(element);
      return { position: style.position, width: style.width, height: style.height };
    });
    expect(hidden).toEqual({ position: 'absolute', width: '1px', height: '1px' });

    await explore.click();
    await expect(explore).not.toHaveAttribute('data-label-hidden');
    await expect(exploreLabel).toBeVisible();
    await expect(home).toHaveAttribute('data-label-hidden', 'true');
  });

  test('keyboard focus and hover use the real indicator-bounded Ripple', async ({ page }) => {
    await openStory(page, 'components-navigationbar--default');
    const home = page.getByTestId('navigation-bar-item-home');
    const ripple = home.locator('.navigation-bar-item__indicator-ripple > .ripple');
    const indicator = home.locator('.navigation-bar-item__indicator-ripple');

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
