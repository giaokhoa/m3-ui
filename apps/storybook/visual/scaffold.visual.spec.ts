import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

function expectClose(actual: number | undefined, expected: number, tolerance = 1) {
  expect(actual).not.toBeUndefined();
  expect(Math.abs((actual ?? 0) - expected)).toBeLessThanOrEqual(tolerance);
}

test.describe('Material 3 Scaffold browser contract', () => {
  test('body occupies the full scaffold bounds while top and bottom bars overlay it', async ({ page }) => {
    await openStory(page, 'components-scaffold--full-composition');
    const [scaffold, content, top, bottom] = await Promise.all([
      page.getByTestId('scaffold').boundingBox(),
      page.locator('.scaffold__content').boundingBox(),
      page.getByTestId('scaffold-top-bar').boundingBox(),
      page.getByTestId('scaffold-bottom-bar').boundingBox(),
    ]);

    expectClose(content?.x, scaffold?.x ?? 0);
    expectClose(content?.y, scaffold?.y ?? 0);
    expectClose(content?.width, scaffold?.width ?? 0);
    expectClose(content?.height, scaffold?.height ?? 0);
    expectClose(top?.y, scaffold?.y ?? 0);
    expectClose(
      (bottom?.y ?? 0) + (bottom?.height ?? 0),
      (scaffold?.y ?? 0) + (scaffold?.height ?? 0),
    );
  });

  test('render-prop inner padding uses bar heights when bars are present', async ({ page }) => {
    await openStory(page, 'components-scaffold--conventional-padded-content');
    const [top, bottom] = await Promise.all([
      page.getByTestId('scaffold-top-bar').boundingBox(),
      page.getByTestId('scaffold-bottom-bar').boundingBox(),
    ]);
    const padding = await page.getByTestId('padded-content').evaluate((element) => {
      const style = getComputedStyle(element);
      return { top: parseFloat(style.paddingTop), bottom: parseFloat(style.paddingBottom) };
    });
    expectClose(padding.top, top?.height ?? 0);
    expectClose(padding.bottom, bottom?.height ?? 0);
  });

  test('custom content insets are returned when corresponding bars are absent', async ({ page }) => {
    await openStory(page, 'components-scaffold--nested-consumed-insets');
    const outerContent = page.getByTestId('outer-scaffold').locator(':scope > .scaffold__content');
    const padded = outerContent.locator(':scope > div');
    const padding = await padded.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        top: style.paddingTop,
        right: style.paddingRight,
        bottom: style.paddingBottom,
        left: style.paddingLeft,
      };
    });
    expect(padding).toEqual({ top: '20px', right: '14px', bottom: '18px', left: '12px' });
  });

  test('consumed ancestor insets clamp nested inner padding to zero', async ({ page }) => {
    await openStory(page, 'components-scaffold--nested-consumed-insets');
    const padding = await page.getByTestId('nested-content').evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        top: style.paddingTop,
        right: style.paddingRight,
        bottom: style.paddingBottom,
        left: style.paddingLeft,
      };
    });
    expect(padding).toEqual({ top: '0px', right: '0px', bottom: '0px', left: '0px' });
  });

  for (const [story, expected] of [
    ['fab-start', 'start'],
    ['fab-center', 'center'],
    ['fab-end', 'end'],
    ['fab-end-overlay', 'end-overlay'],
  ] as const) {
    test(`FAB ${expected} uses its Material logical position`, async ({ page }) => {
      await openStory(page, `components-scaffold--${story}`);
      const scaffold = await page.getByTestId('scaffold').boundingBox();
      const fab = await page.getByTestId('scaffold-fab').boundingBox();
      const bottom = await page.getByTestId('scaffold-bottom-bar').boundingBox();
      await expect(page.getByTestId('scaffold')).toHaveAttribute('data-fab-position', expected);

      if (expected === 'start') {
        expectClose((fab?.x ?? 0) - (scaffold?.x ?? 0), 16);
      } else if (expected === 'center') {
        expectClose(
          (fab?.x ?? 0) + (fab?.width ?? 0) / 2,
          (scaffold?.x ?? 0) + (scaffold?.width ?? 0) / 2,
        );
      } else {
        expectClose(
          (scaffold?.x ?? 0) + (scaffold?.width ?? 0) - ((fab?.x ?? 0) + (fab?.width ?? 0)),
          16,
        );
      }

      if (expected === 'end-overlay') {
        expect((fab?.y ?? 0) + (fab?.height ?? 0)).toBeGreaterThan(bottom?.y ?? 0);
      } else {
        expectClose((bottom?.y ?? 0) - ((fab?.y ?? 0) + (fab?.height ?? 0)), 16);
      }
    });
  }

  test('snackbar stacks above FAB and FAB above bottom bar', async ({ page }) => {
    await openStory(page, 'components-scaffold--snackbar-fab-bottom-bar');
    const [snackbar, fab, bottom] = await Promise.all([
      page.getByTestId('scaffold-snackbar').boundingBox(),
      page.getByTestId('scaffold-fab').boundingBox(),
      page.getByTestId('scaffold-bottom-bar').boundingBox(),
    ]);
    expectClose((snackbar?.y ?? 0) + (snackbar?.height ?? 0), fab?.y ?? 0);
    expectClose((bottom?.y ?? 0) - ((fab?.y ?? 0) + (fab?.height ?? 0)), 16);
  });

  test('safe-area inset offsets FAB when no bottom bar is present', async ({ page }) => {
    await openStory(page, 'components-scaffold--safe-area');
    const scaffold = await page.getByTestId('scaffold').boundingBox();
    const fab = await page.getByTestId('scaffold-fab').boundingBox();
    expectClose(
      (scaffold?.x ?? 0) + (scaffold?.width ?? 0) - ((fab?.x ?? 0) + (fab?.width ?? 0)),
      30,
    );
    expectClose(
      (scaffold?.y ?? 0) + (scaffold?.height ?? 0) - ((fab?.y ?? 0) + (fab?.height ?? 0)),
      34,
    );
  });

  test('RTL mirrors logical start while physical safe-area edges remain physical', async ({ page }) => {
    await openStory(page, 'components-scaffold--rtl');
    const root = page.getByTestId('scaffold');
    await root.evaluate((element) => {
      element.style.setProperty('--scaffold-inset-left', '12px');
      element.style.setProperty('--scaffold-inset-right', '14px');
    });
    const [scaffold, fab] = await Promise.all([
      root.boundingBox(),
      page.getByTestId('scaffold-fab').boundingBox(),
    ]);
    expectClose(
      (scaffold?.x ?? 0) + (scaffold?.width ?? 0) - ((fab?.x ?? 0) + (fab?.width ?? 0)),
      30,
    );
  });

  test('full-bleed content reaches every scaffold edge with bars still layered above it', async ({ page }) => {
    await openStory(page, 'components-scaffold--full-bleed-edge-to-edge');
    const [scaffold, bleed, top, bottom] = await Promise.all([
      page.getByTestId('scaffold').boundingBox(),
      page.getByTestId('full-bleed-content').boundingBox(),
      page.getByTestId('scaffold-top-bar').boundingBox(),
      page.getByTestId('scaffold-bottom-bar').boundingBox(),
    ]);
    expectClose(bleed?.x, scaffold?.x ?? 0);
    expectClose(bleed?.y, scaffold?.y ?? 0);
    expectClose(bleed?.width, scaffold?.width ?? 0);
    expectClose(bleed?.height, scaffold?.height ?? 0);
    expect(top?.y).toBe(bleed?.y);
    expect((bottom?.y ?? 0) + (bottom?.height ?? 0)).toBeCloseTo(
      (bleed?.y ?? 0) + (bleed?.height ?? 0),
      0,
    );
  });

  test('resizes without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 700 });
    await openStory(page, 'components-scaffold--resize');
    const first = await page.getByTestId('scaffold-fab').boundingBox();
    await page.setViewportSize({ width: 360, height: 640 });
    const second = await page.getByTestId('scaffold-fab').boundingBox();
    expect(second?.x ?? 0).toBeLessThan(first?.x ?? 0);
    const overflow = await page.getByTestId('scaffold').evaluate(
      (element) => element.scrollWidth - element.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
