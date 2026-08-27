import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

function expectClose(actual: number | undefined, expected: number) {
  expect(actual).not.toBeUndefined();
  expect(Math.abs((actual ?? 0) - expected)).toBeLessThan(1);
}

test.describe('Material 3 Scaffold browser contract', () => {
  test('body only fills the composable container without forcing viewport sizing', async ({ page }) => {
    await openStory(page, 'components-scaffold--body-only');
    const scaffold = page.getByTestId('scaffold');
    const box = await scaffold.boundingBox();
    expectClose(box?.height, 388);
    await expect(scaffold).not.toHaveAttribute('data-has-top-bar');
    await expect(scaffold).not.toHaveAttribute('data-has-bottom-bar');
  });

  test('top and bottom bars offset main content through grid rows', async ({ page }) => {
    await openStory(page, 'components-scaffold--full-composition');
    const [scaffold, top, content, bottom] = await Promise.all([
      page.getByTestId('scaffold').boundingBox(),
      page.getByTestId('scaffold-top-bar').boundingBox(),
      page.locator('.scaffold__content').boundingBox(),
      page.getByTestId('scaffold-bottom-bar').boundingBox(),
    ]);
    expectClose(content?.y, (top?.y ?? 0) + (top?.height ?? 0));
    expectClose((content?.y ?? 0) + (content?.height ?? 0), bottom?.y ?? 0);
    expectClose(bottom?.y, (scaffold?.y ?? 0) + (scaffold?.height ?? 0) - (bottom?.height ?? 0));
  });

  test('top-only and bottom-only preserve the opposite content edge', async ({ page }) => {
    await openStory(page, 'components-scaffold--top-bar-only');
    let scaffold = await page.getByTestId('scaffold').boundingBox();
    let content = await page.locator('.scaffold__content').boundingBox();
    const top = await page.getByTestId('scaffold-top-bar').boundingBox();
    expectClose(content?.y, (top?.y ?? 0) + (top?.height ?? 0));
    expectClose((content?.y ?? 0) + (content?.height ?? 0), (scaffold?.y ?? 0) + (scaffold?.height ?? 0));

    await openStory(page, 'components-scaffold--bottom-bar-only');
    scaffold = await page.getByTestId('scaffold').boundingBox();
    content = await page.locator('.scaffold__content').boundingBox();
    const bottom = await page.getByTestId('scaffold-bottom-bar').boundingBox();
    expectClose(content?.y, scaffold?.y ?? 0);
    expectClose((content?.y ?? 0) + (content?.height ?? 0), bottom?.y ?? 0);
  });

  for (const [story, expected] of [
    ['fab-start', 'start'],
    ['fab-center', 'center'],
    ['fab-end', 'end'],
    ['fab-end-overlay', 'end-overlay'],
  ] as const) {
    test(`FAB ${expected} uses its logical Scaffold position`, async ({ page }) => {
      await openStory(page, `components-scaffold--${story}`);
      const scaffold = await page.getByTestId('scaffold').boundingBox();
      const fab = await page.getByTestId('scaffold-fab').boundingBox();
      const bottom = await page.getByTestId('scaffold-bottom-bar').boundingBox();
      await expect(page.getByTestId('scaffold')).toHaveAttribute('data-fab-position', expected);

      if (expected === 'start') {
        expectClose((fab?.x ?? 0) - (scaffold?.x ?? 0), 16);
      } else if (expected === 'center') {
        expectClose((fab?.x ?? 0) + (fab?.width ?? 0) / 2, (scaffold?.x ?? 0) + (scaffold?.width ?? 0) / 2);
      } else {
        expectClose((scaffold?.x ?? 0) + (scaffold?.width ?? 0) - ((fab?.x ?? 0) + (fab?.width ?? 0)), 16);
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

  test('RTL mirrors logical start placement', async ({ page }) => {
    await openStory(page, 'components-scaffold--rtl');
    const scaffold = await page.getByTestId('scaffold').boundingBox();
    const fab = await page.getByTestId('scaffold-fab').boundingBox();
    expectClose((scaffold?.x ?? 0) + (scaffold?.width ?? 0) - ((fab?.x ?? 0) + (fab?.width ?? 0)), 16);
  });

  test('safe-area fixture applies content and floating insets when bars are absent', async ({ page }) => {
    await openStory(page, 'components-scaffold--safe-area');
    const content = page.locator('.scaffold__content');
    const style = await content.evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        top: computed.paddingTop,
        right: computed.paddingRight,
        bottom: computed.paddingBottom,
        left: computed.paddingLeft,
      };
    });
    expect(style).toEqual({ top: '20px', right: '14px', bottom: '18px', left: '12px' });

    const scaffold = await page.getByTestId('scaffold').boundingBox();
    const fab = await page.getByTestId('scaffold-fab').boundingBox();
    expectClose((scaffold?.x ?? 0) + (scaffold?.width ?? 0) - ((fab?.x ?? 0) + (fab?.width ?? 0)), 14);
    expectClose((scaffold?.y ?? 0) + (scaffold?.height ?? 0) - ((fab?.y ?? 0) + (fab?.height ?? 0)), 34);
  });

  test('resizes without JS measurement or horizontal overflow', async ({ page }) => {
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
