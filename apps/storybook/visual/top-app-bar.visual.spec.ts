import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

function expectClose(actual: number | undefined, expected: number) {
  expect(actual).not.toBeUndefined();
  expect(Math.abs((actual ?? 0) - expected)).toBeLessThan(0.8);
}

test.describe('Material 3 TopAppBar browser contract', () => {
  test('small bar locks 64px height and AndroidX leading/title/trailing geometry', async ({ page }) => {
    await openStory(page, 'components-topappbar--small');
    const bar = page.getByTestId('top-app-bar');
    const box = await bar.boundingBox();
    const title = bar.locator('.top-app-bar__collapsed-title');
    const navigation = bar.locator('.top-app-bar__navigation');
    const actions = bar.locator('.top-app-bar__actions');

    expectClose(box?.height, 64);
    const [titleBox, navigationBox, actionsBox] = await Promise.all([
      title.boundingBox(),
      navigation.boundingBox(),
      actions.boundingBox(),
    ]);
    expectClose(navigationBox?.x, (box?.x ?? 0) + 4);
    expectClose(
      titleBox?.x,
      (box?.x ?? 0) + 4 + Math.max(12, navigationBox?.width ?? 0),
    );
    expect((actionsBox?.x ?? 0)).toBeGreaterThan((titleBox?.x ?? 0));
    const typography = await title.evaluate((element) => {
      const style = getComputedStyle(element);
      return { fontSize: style.fontSize, lineHeight: style.lineHeight };
    });
    expect(typography).toEqual({ fontSize: '22px', lineHeight: '28px' });
  });

  test('center-aligned title remains centered with unequal slot widths', async ({ page }) => {
    await openStory(page, 'components-topappbar--center-aligned');
    const bar = page.getByTestId('top-app-bar');
    await expect(bar).toHaveAttribute('data-center-layout', 'true');
    const title = bar.locator('.top-app-bar__collapsed-title-group');
    const navigationButton = bar.locator('.top-app-bar__navigation .icon-button');
    const actionButtons = bar.locator('.top-app-bar__actions .icon-button');
    await expect(actionButtons).toHaveCount(2);

    const [barBox, titleBox, navigationBox, firstActionBox, secondActionBox] =
      await Promise.all([
        bar.boundingBox(),
        title.boundingBox(),
        navigationButton.boundingBox(),
        actionButtons.nth(0).boundingBox(),
        actionButtons.nth(1).boundingBox(),
      ]);
    const actionsWidth =
      (secondActionBox?.x ?? 0) +
      (secondActionBox?.width ?? 0) -
      (firstActionBox?.x ?? 0);
    expect(actionsWidth).toBeGreaterThan(navigationBox?.width ?? 0);
    await expect
      .poll(async () => {
        const currentBar = await bar.boundingBox();
        const currentTitle = await title.boundingBox();
        return (
          (currentTitle?.x ?? 0) +
          (currentTitle?.width ?? 0) / 2 -
          ((currentBar?.x ?? 0) + (currentBar?.width ?? 0) / 2)
        );
      })
      .toBeCloseTo(0, 0);
    expectClose(
      (titleBox?.x ?? 0) + (titleBox?.width ?? 0) / 2,
      (barBox?.x ?? 0) + (barBox?.width ?? 0) / 2,
    );
  });

  test('center-aligned title shifts only when trailing content collides', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 600 });
    await openStory(page, 'components-topappbar--center-aligned');
    const bar = page.getByTestId('top-app-bar');
    const title = bar.locator('.top-app-bar__collapsed-title-group');
    const actions = bar.locator('.top-app-bar__actions');
    await expect(bar).toHaveAttribute('data-center-layout', 'true');

    await expect.poll(async () => {
      const [barBox, titleBox] = await Promise.all([
        bar.boundingBox(),
        title.boundingBox(),
      ]);
      return (
        (titleBox?.x ?? 0) +
        (titleBox?.width ?? 0) / 2 -
        ((barBox?.x ?? 0) + (barBox?.width ?? 0) / 2)
      );
    }).toBeLessThan(0);

    const [barBox, titleBox, actionsBox] = await Promise.all([
      bar.boundingBox(),
      title.boundingBox(),
      actions.boundingBox(),
    ]);
    expectClose(
      (titleBox?.x ?? 0) + (titleBox?.width ?? 0),
      (barBox?.x ?? 0) + (barBox?.width ?? 0) - 4 - (actionsBox?.width ?? 0),
    );
  });

  test('medium, large and flexible variants use canonical expanded heights', async ({ page }) => {
    const cases = [
      ['components-topappbar--medium', 112],
      ['components-topappbar--medium-flexible', 136],
      ['components-topappbar--large', 152],
      ['components-topappbar--large-flexible', 152],
    ] as const;

    for (const [id, height] of cases) {
      await openStory(page, id);
      const bar = page.getByTestId('top-app-bar');
      expectClose((await bar.boundingBox())?.height, height);
      await expect(bar.locator('.top-app-bar__expanded-title')).toBeVisible();
    }
  });

  test('collapsed state switches to on-scroll container and elevation deterministically', async ({ page }) => {
    await openStory(page, 'components-topappbar--scroll-states');
    const bar = page.getByTestId('top-app-bar');
    await page.getByTestId('collapse-app-bar').click();
    await expect(bar).toHaveAttribute('data-collapsed', 'true');
    await expect.poll(async () => Math.round((await bar.boundingBox())?.height ?? 0)).toBe(64);
    const visual = await bar.evaluate((element) => {
      const style = getComputedStyle(element);
      return { backgroundColor: style.backgroundColor, boxShadow: style.boxShadow };
    });
    expect(visual.backgroundColor).toBe('rgb(243, 237, 247)');
    expect(visual.boxShadow).not.toBe('none');
  });

  test('pinned single-row bar uses overlap for scroll-under visuals without collapsing', async ({ page }) => {
    await openStory(page, 'components-topappbar--pinned-overlap');
    const bar = page.getByTestId('top-app-bar');
    expectClose((await bar.boundingBox())?.height, 64);
    await expect(bar).toHaveAttribute('data-scroll-fraction', '0');
    await expect(bar).toHaveAttribute('data-overlapped-fraction', '1');
    await expect(bar).toHaveAttribute('data-scrolled', 'true');
    const background = await bar.evaluate((element) => getComputedStyle(element).backgroundColor);
    expect(background).toBe('rgb(243, 237, 247)');
  });

  test('RTL mirrors logical leading/trailing placement', async ({ page }) => {
    await openStory(page, 'components-topappbar--rtl');
    const bar = page.getByTestId('top-app-bar');
    const navigationBox = await bar.locator('.top-app-bar__navigation').boundingBox();
    const actionsBox = await bar.locator('.top-app-bar__actions').boundingBox();
    expect((navigationBox?.x ?? 0)).toBeGreaterThan((actionsBox?.x ?? 0));
  });

  test('reduced motion removes the app-bar transition duration', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'components-topappbar--scroll-states');
    const bar = page.getByTestId('top-app-bar');
    await page.getByTestId('collapse-app-bar').click();
    const duration = await bar.evaluate((element) => getComputedStyle(element).transitionDuration);
    expect(duration.split(',').every((value) => value.trim() === '0s')).toBe(true);
  });
});
