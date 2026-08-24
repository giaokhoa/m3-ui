import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, {
    waitUntil: 'networkidle',
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

function expectClose(actual: number | undefined, expected: number) {
  expect(actual).not.toBeUndefined();
  expect(Math.abs((actual ?? 0) - expected)).toBeLessThan(0.6);
}

test.describe('Material 3 Badge browser contract', () => {
  test('dot badge uses the canonical 6px geometry', async ({ page }) => {
    await openStory(page, 'components-badge--dot');
    const badge = page.getByTestId('dot-badge');
    const box = await badge.boundingBox();

    await expect(badge).toHaveAttribute('data-variant', 'dot');
    expectClose(box?.width, 6);
    expectClose(box?.height, 6);
  });

  test('content badge uses the canonical 16px minimum and grows for long values', async ({
    page,
  }) => {
    await openStory(page, 'components-badge--numeric');
    const numeric = page.getByTestId('numeric-badge');
    const numericBox = await numeric.boundingBox();

    await expect(numeric).toHaveAttribute('data-variant', 'content');
    expectClose(numericBox?.width, 16);
    expectClose(numericBox?.height, 16);

    await openStory(page, 'components-badge--long-value');
    const longBadge = page.getByTestId('long-badge');
    const longBox = await longBadge.boundingBox();
    expect(longBox?.width ?? 0).toBeGreaterThan(16);
    expectClose(longBox?.height, 16);
  });

  test('BadgedBox preserves anchor bounds and current Compose offsets in LTR', async ({
    page,
  }) => {
    await openStory(page, 'components-badge--positioned');

    const dotAnchor = await page.getByTestId('anchor-dot').boundingBox();
    const dotBox = await page.getByTestId('dot-box').boundingBox();
    const dotBadge = await page.getByTestId('positioned-dot').boundingBox();
    const contentAnchor = await page.getByTestId('anchor-count').boundingBox();
    const contentBox = await page.getByTestId('content-box').boundingBox();
    const contentBadge = await page
      .getByTestId('positioned-content')
      .boundingBox();

    expectClose(dotBox?.width, dotAnchor?.width ?? 0);
    expectClose(dotBox?.height, dotAnchor?.height ?? 0);
    expectClose(dotBadge?.x, (dotAnchor?.x ?? 0) + (dotAnchor?.width ?? 0) - 6);
    expectClose(dotBadge?.y, dotAnchor?.y ?? 0);

    expectClose(contentBox?.width, contentAnchor?.width ?? 0);
    expectClose(contentBox?.height, contentAnchor?.height ?? 0);
    expectClose(
      contentBadge?.x,
      (contentAnchor?.x ?? 0) + (contentAnchor?.width ?? 0) - 12,
    );
    expectClose(
      contentBadge?.y,
      (contentAnchor?.y ?? 0) - (contentBadge?.height ?? 0) + 14,
    );
  });

  test('BadgedBox mirrors logical-end placement in RTL', async ({ page }) => {
    await openStory(page, 'components-badge--rtl');

    const dotAnchor = await page.getByTestId('anchor-rtldot').boundingBox();
    const dotBadge = await page.getByTestId('rtl-dot').boundingBox();
    const contentAnchor = await page.getByTestId('anchor-rtlcount').boundingBox();
    const contentBadge = await page.getByTestId('rtl-content').boundingBox();

    expectClose(dotBadge?.x, dotAnchor?.x ?? 0);
    expectClose(dotBadge?.y, dotAnchor?.y ?? 0);
    expectClose(
      (contentBadge?.x ?? 0) + (contentBadge?.width ?? 0),
      (contentAnchor?.x ?? 0) + 12,
    );
    expectClose(
      contentBadge?.y,
      (contentAnchor?.y ?? 0) - (contentBadge?.height ?? 0) + 14,
    );
  });
});
