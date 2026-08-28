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

test.describe('Material 3 ListDetailPaneScaffold visual parity', () => {
  test('seekable motion halfway', async ({ page }) => {
    await openStory(page, 'layout-listdetailpanescaffold--motion-halfway');

    const root = page.locator('#storybook-root');
    const scaffold = root.locator('.three-pane-scaffold');
    const detailPane = scaffold.locator('[data-pane-role="primary"]');
    const listPane = scaffold.locator('[data-pane-role="secondary"]');

    await expect(scaffold).toBeVisible();
    await expect(detailPane).toHaveAttribute('data-pane-adapted-value', 'hidden');
    await expect(detailPane).toHaveAttribute('data-pane-motion', 'exit-to-right');
    await expect(detailPane).toContainText('Detail');
    await expect(listPane).toHaveAttribute('data-pane-adapted-value', 'expanded');
    await expect(listPane).toHaveAttribute('data-pane-motion', 'enter-from-left');
    await expect(listPane).toContainText('List');

    const [scaffoldBounds, detailBounds, listBounds] = await Promise.all([
      scaffold.boundingBox(),
      detailPane.boundingBox(),
      listPane.boundingBox(),
    ]);
    if (!scaffoldBounds || !detailBounds || !listBounds) {
      throw new Error('ThreePaneScaffold transition panes have no visual bounds');
    }

    expect(scaffoldBounds.width).toBeCloseTo(480, 3);
    expect(scaffoldBounds.height).toBeCloseTo(640, 3);
    expect(detailBounds.width).toBeCloseTo(scaffoldBounds.width, 3);
    expect(listBounds.width).toBeCloseTo(scaffoldBounds.width, 3);
    expect(detailBounds.height).toBeCloseTo(scaffoldBounds.height, 3);
    expect(listBounds.height).toBeCloseTo(scaffoldBounds.height, 3);

    const detailOffsetX = detailBounds.x - scaffoldBounds.x;
    const listOffsetX = listBounds.x - scaffoldBounds.x;

    // At progress=0.5 the pinned 0.8 / 380 spring has just overshot the
    // compact-pane target: List is ~0.14px past x=0 and Detail is ~0.14px
    // past the 480px trailing edge. Keep this as a browser geometry contract
    // instead of snapshotting font rasterization.
    expect(listOffsetX).toBeGreaterThanOrEqual(0);
    expect(listOffsetX).toBeLessThan(1);
    expect(detailOffsetX).toBeGreaterThan(480);
    expect(detailOffsetX).toBeLessThan(481);
  });

  test('predictive back scales graphics without feeding back into layout', async ({ page }) => {
    await openStory(page, 'layout-listdetailpanescaffold--motion-halfway-predictive-back');

    const root = page.locator('#storybook-root');
    const scaffold = root.locator('.three-pane-scaffold');
    const listPane = scaffold.locator('[data-pane-role="secondary"]');

    await expect(scaffold).toBeVisible();
    await expect(listPane).toHaveAttribute('data-pane-motion', 'enter-from-left');

    const metrics = await scaffold.evaluate((element) => ({
      clientWidth: element.clientWidth,
      clientHeight: element.clientHeight,
      scale: Number.parseFloat(getComputedStyle(element).scale),
    }));
    const listLayoutWidth = await listPane.evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).width),
    );
    const [scaffoldBounds, listBounds] = await Promise.all([
      scaffold.boundingBox(),
      listPane.boundingBox(),
    ]);
    if (!scaffoldBounds || !listBounds) {
      throw new Error('Predictive-back scaffold has no visual bounds');
    }

    expect(metrics.clientWidth).toBe(480);
    expect(metrics.clientHeight).toBe(640);
    expect(metrics.scale).toBeCloseTo(0.9523809524, 5);
    // Chromium quantizes computed layout dimensions to a 1/64px-ish grid.
    // The layout contract is that predictive graphics scaling does not feed
    // back into pane width; tolerate one extra quantum rather than requiring
    // impossible sub-millipixel equality from getComputedStyle().
    expect(Math.abs(listLayoutWidth - metrics.clientWidth)).toBeLessThan(1 / 32);
    expect(scaffoldBounds.width).toBeCloseTo(480 * metrics.scale, 2);
    expect(scaffoldBounds.height).toBeCloseTo(640 * metrics.scale, 2);
    expect(listBounds.width).toBeCloseTo(scaffoldBounds.width, 2);
  });
});
