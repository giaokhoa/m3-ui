import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

function expectClose(actual: number | undefined, expected: number) {
  expect(actual).not.toBeUndefined();
  expect(Math.abs((actual ?? 0) - expected)).toBeLessThan(0.8);
}

test.describe('Material 3 BottomAppBar browser contract', () => {
  test('regular bar locks the canonical 80px surface-container Level2 container', async ({ page }) => {
    await openStory(page, 'components-bottomappbar--standard');
    const bar = page.getByTestId('bottom-app-bar');
    expectClose((await bar.boundingBox())?.height, 80);
    await expect(bar).toHaveAttribute('data-variant', 'regular');
    const visual = await bar.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        backgroundColor: style.backgroundColor,
        boxShadow: style.boxShadow,
        borderRadius: style.borderRadius,
      };
    });
    expect(visual.backgroundColor).toBe('rgb(243, 237, 247)');
    expect(visual.boxShadow).not.toBe('none');
    expect(visual.borderRadius).toBe('0px');
  });

  test('regular actions and FAB preserve AndroidX 4px content plus 12/8px FAB padding', async ({ page }) => {
    await openStory(page, 'components-bottomappbar--standard');
    const bar = page.getByTestId('bottom-app-bar');
    const firstAction = bar.locator('.bottom-app-bar__actions .icon-button').first();
    const fab = bar.locator('.bottom-app-bar__fab .fab').first();
    const [barBox, actionBox, fabBox] = await Promise.all([
      bar.boundingBox(),
      firstAction.boundingBox(),
      fab.boundingBox(),
    ]);

    expectClose(actionBox?.x, (barBox?.x ?? 0) + 4);
    expectClose(fabBox?.y, (barBox?.y ?? 0) + 12);
    expectClose(
      (barBox?.x ?? 0) + (barBox?.width ?? 0) - ((fabBox?.x ?? 0) + (fabBox?.width ?? 0)),
      16,
    );
  });

  test('generic content overload keeps the regular geometry without inventing a FAB', async ({ page }) => {
    await openStory(page, 'components-bottomappbar--content-only');
    const bar = page.getByTestId('bottom-app-bar');
    expectClose((await bar.boundingBox())?.height, 80);
    await expect(bar.locator('.bottom-app-bar__actions .icon-button')).toHaveCount(3);
    await expect(bar.locator('.bottom-app-bar__fab')).toHaveCount(0);
  });

  test('flexible bar uses DockedToolbar 64px geometry, 16px logical edges and Level0', async ({ page }) => {
    await openStory(page, 'components-bottomappbar--flexible');
    const bar = page.getByTestId('bottom-app-bar');
    const buttons = bar.locator('.bottom-app-bar__flexible-content .icon-button');
    const [barBox, firstBox, lastBox] = await Promise.all([
      bar.boundingBox(),
      buttons.first().boundingBox(),
      buttons.last().boundingBox(),
    ]);
    expectClose(barBox?.height, 64);
    expectClose(firstBox?.x, (barBox?.x ?? 0) + 16);
    expectClose(
      (barBox?.x ?? 0) + (barBox?.width ?? 0) - ((lastBox?.x ?? 0) + (lastBox?.width ?? 0)),
      16,
    );
    const visual = await bar.evaluate((element) => ({
      backgroundColor: getComputedStyle(element).backgroundColor,
      boxShadow: getComputedStyle(element).boxShadow,
    }));
    expect(visual.backgroundColor).toBe('rgb(243, 237, 247)');
    expect(visual.boxShadow).toBe('none');
  });

  test('flexible fixed arrangement uses the pinned 32px maximum spacing', async ({ page }) => {
    await openStory(page, 'components-bottomappbar--flexible-fixed');
    const buttons = page.locator('.bottom-app-bar__flexible-content .icon-button');
    const [firstBox, secondBox, thirdBox] = await Promise.all([
      buttons.nth(0).boundingBox(),
      buttons.nth(1).boundingBox(),
      buttons.nth(2).boundingBox(),
    ]);
    expectClose((secondBox?.x ?? 0) - ((firstBox?.x ?? 0) + (firstBox?.width ?? 0)), 32);
    expectClose((thirdBox?.x ?? 0) - ((secondBox?.x ?? 0) + (secondBox?.width ?? 0)), 32);
  });

  test('exit-always state collapses the entire bar height and can expand again', async ({ page }) => {
    await openStory(page, 'components-bottomappbar--scroll-states');
    const bar = page.getByTestId('bottom-app-bar');
    await page.getByTestId('half-bottom-app-bar').click();
    await expect(bar).toHaveAttribute('data-collapsed-fraction', '0.5');
    await expect.poll(async () => Math.round((await bar.boundingBox())?.height ?? 0)).toBe(40);
    await page.getByTestId('collapse-bottom-app-bar').click();
    await expect(bar).toHaveAttribute('data-collapsed', 'true');
    await expect.poll(async () => Math.round((await bar.boundingBox())?.height ?? 0)).toBe(0);
    await page.getByTestId('expand-bottom-app-bar').click();
    await expect.poll(async () => Math.round((await bar.boundingBox())?.height ?? 0)).toBe(80);
  });

  test('RTL mirrors logical action/FAB placement', async ({ page }) => {
    await openStory(page, 'components-bottomappbar--rtl');
    const bar = page.getByTestId('bottom-app-bar');
    const firstAction = bar.locator('.bottom-app-bar__actions .icon-button').first();
    const fab = bar.locator('.bottom-app-bar__fab .fab').first();
    const [barBox, actionBox, fabBox] = await Promise.all([
      bar.boundingBox(),
      firstAction.boundingBox(),
      fab.boundingBox(),
    ]);
    expect((actionBox?.x ?? 0)).toBeGreaterThan((fabBox?.x ?? 0));
    expectClose((fabBox?.x ?? 0) - (barBox?.x ?? 0), 16);
  });

  test('reduced motion removes height transition duration', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'components-bottomappbar--scroll-states');
    await page.getByTestId('half-bottom-app-bar').click();
    const duration = await page.getByTestId('bottom-app-bar').evaluate(
      (element) => getComputedStyle(element).transitionDuration,
    );
    expect(duration.split(',').every((value) => value.trim() === '0s')).toBe(true);
  });
});
