import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

function expectClose(actual: number | undefined, expected: number, tolerance = 2) {
  expect(actual).not.toBeUndefined();
  expect(Math.abs((actual ?? 0) - expected)).toBeLessThanOrEqual(tolerance);
}

test.describe('Material 3 BottomSheetScaffold browser contract', () => {
  test('defaults to a 56px partial sheet and keeps body interactive', async ({ page }) => {
    await openStory(page, 'components-bottomsheetscaffold--default-partial');
    const scaffold = page.getByTestId('bottom-sheet-scaffold');
    const sheet = page.locator('.bottom-sheet');
    const [rootBox, sheetBox] = await Promise.all([scaffold.boundingBox(), sheet.boundingBox()]);
    expectClose((rootBox?.y ?? 0) + (rootBox?.height ?? 0) - (sheetBox?.y ?? 0), 56);
    await page.getByTestId('body-button').click();
    await expect(scaffold).toHaveAttribute('data-sheet-state', SheetValue.PartiallyExpanded);
  });

  test('programmatic expand/collapse remains deterministic', async ({ page }) => {
    await openStory(page, 'components-bottomsheetscaffold--programmatic-state');
    const scaffold = page.getByTestId('bottom-sheet-scaffold');
    await page.getByTestId('expand').click();
    await expect(scaffold).toHaveAttribute('data-sheet-state', 'expanded');
    await page.getByTestId('collapse').click();
    await expect(scaffold).toHaveAttribute('data-sheet-state', 'partially-expanded');
  });

  test('swipe disabled does not block programmatic state changes', async ({ page }) => {
    await openStory(page, 'components-bottomsheetscaffold--swipe-disabled');
    const handle = page.locator('.bottom-sheet__drag-handle');
    await expect(handle).toBeDisabled();
    await page.getByTestId('expand').click();
    await expect(page.getByTestId('bottom-sheet-scaffold')).toHaveAttribute('data-sheet-state', 'expanded');
  });

  test('custom peek height and max width are reflected in geometry', async ({ page }) => {
    await openStory(page, 'components-bottomsheetscaffold--custom-peek-height');
    let root = await page.getByTestId('bottom-sheet-scaffold').boundingBox();
    let sheet = await page.locator('.bottom-sheet').boundingBox();
    expectClose((root?.y ?? 0) + (root?.height ?? 0) - (sheet?.y ?? 0), 96);

    await openStory(page, 'components-bottomsheetscaffold--max-width');
    sheet = await page.locator('.bottom-sheet').boundingBox();
    expectClose(sheet?.width, 420);
    root = await page.getByTestId('bottom-sheet-scaffold').boundingBox();
    expectClose((sheet?.x ?? 0) + (sheet?.width ?? 0) / 2, (root?.x ?? 0) + (root?.width ?? 0) / 2);
  });

  test('snackbar stays above the current settled sheet edge', async ({ page }) => {
    await openStory(page, 'components-bottomsheetscaffold--programmatic-state');
    const snackbar = page.getByTestId('snackbar');
    const sheet = page.locator('.bottom-sheet');
    let [snackBox, sheetBox] = await Promise.all([snackbar.boundingBox(), sheet.boundingBox()]);
    expect((snackBox?.y ?? 0) + (snackBox?.height ?? 0)).toBeLessThanOrEqual((sheetBox?.y ?? 0) + 2);

    await page.getByTestId('expand').click();
    await page.waitForTimeout(550);
    [snackBox, sheetBox] = await Promise.all([snackbar.boundingBox(), sheet.boundingBox()]);
    expect((snackBox?.y ?? 0) + (snackBox?.height ?? 0)).toBeLessThanOrEqual((sheetBox?.y ?? 0) + 2);
  });

  test('optional handle and hidden state preserve accessibility/focus behavior', async ({ page }) => {
    await openStory(page, 'components-bottomsheetscaffold--without-drag-handle');
    await expect(page.locator('.bottom-sheet__drag-handle')).toHaveCount(0);

    await openStory(page, 'components-bottomsheetscaffold--hidden-enabled');
    await page.getByTestId('hide').click();
    const sheet = page.locator('.bottom-sheet');
    await expect(sheet).toHaveAttribute('aria-hidden', 'true');
    await expect(sheet).toHaveAttribute('inert', '');
    await page.getByTestId('body-button').focus();
    await expect(page.getByTestId('body-button')).toBeFocused();
  });

  test('nested body and sheet scroll containers remain independently scrollable', async ({ page }) => {
    await openStory(page, 'components-bottomsheetscaffold--nested-scroll');
    const bodyScroll = page.getByTestId('body-scroll');
    const sheetScroll = page.getByTestId('sheet-scroll');
    await bodyScroll.evaluate((element) => { element.scrollTop = 120; });
    await sheetScroll.evaluate((element) => { element.scrollTop = 120; });
    expect(await bodyScroll.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    expect(await sheetScroll.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  });

  test('resize re-anchors without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 760 });
    await openStory(page, 'components-bottomsheetscaffold--default-partial');
    await page.setViewportSize({ width: 360, height: 640 });
    await page.waitForTimeout(50);
    const overflow = await page.getByTestId('bottom-sheet-scaffold').evaluate(
      (element) => element.scrollWidth - element.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('reduced motion removes scaffold offset transitions', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'components-bottomsheetscaffold--reduced-motion');
    const duration = await page.locator('.bottom-sheet-scaffold__sheet-layer').evaluate(
      (element) => getComputedStyle(element).transitionDuration,
    );
    expect(duration).toBe('0s');
  });
});

const SheetValue = {
  PartiallyExpanded: 'partially-expanded',
} as const;
