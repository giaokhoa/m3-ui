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
  test('retains pane-local React state while the pane is hidden', async ({ page }) => {
    await openStory(page, 'layout-listdetailpanescaffold--state-retention');

    const root = page.locator('#storybook-root');
    const scaffold = root.locator('.three-pane-scaffold');
    const detailPane = scaffold.locator('[data-pane-role="primary"]');
    const count = detailPane.locator('[data-testid="detail-count"]');

    await expect(detailPane).toHaveAttribute('data-pane-adapted-value', 'expanded');
    await expect(count).toHaveText('Count: 0');
    await detailPane.getByRole('button', { name: 'Increment detail' }).click();
    await expect(count).toHaveText('Count: 1');

    await root.getByRole('button', { name: 'Show list' }).click();
    await expect(detailPane).toHaveAttribute('data-pane-adapted-value', 'hidden');
    await expect(detailPane).toHaveCSS('display', 'none');
    await expect(count).toHaveText('Count: 1');

    await root.getByRole('button', { name: 'Show detail' }).click();
    await expect(detailPane).toHaveAttribute('data-pane-adapted-value', 'expanded');
    await expect(detailPane).not.toHaveCSS('display', 'none');
    await expect(count).toHaveText('Count: 1');
  });

  test('exposes named pane regions only while they are interactable', async ({ page }) => {
    await openStory(page, 'layout-listdetailpanescaffold--expanded');

    const root = page.locator('#storybook-root');
    const primaryRegion = root.getByRole('region', { name: 'Primary pane' });
    const secondaryRegion = root.getByRole('region', { name: 'Secondary pane' });

    await expect(primaryRegion).toBeVisible();
    await expect(primaryRegion).toHaveAttribute('data-pane-role', 'primary');
    await expect(secondaryRegion).toBeVisible();
    await expect(secondaryRegion).toHaveAttribute('data-pane-role', 'secondary');
    await expect(primaryRegion).toBeFocused();

    await openStory(page, 'layout-listdetailpanescaffold--levitated-dialog');
    const modalRoot = page.locator('#storybook-root');
    const modalScaffold = modalRoot.locator('.three-pane-scaffold');
    const extraRegion = modalRoot.getByRole('region', { name: 'Tertiary pane' });
    const underlyingPrimary = modalScaffold.locator('[data-pane-role="primary"]');

    await expect(extraRegion).toBeVisible();
    await expect(extraRegion).toHaveAttribute('data-pane-adapted-value', 'levitated');
    await expect(extraRegion).toBeFocused();
    await expect(underlyingPrimary).toHaveAttribute('inert', '');
    await expect(modalRoot.getByRole('region', { name: 'Primary pane' })).toHaveCount(0);
  });

  test('announces anchored pane splits and exposes the next anchor activation', async ({ page }) => {
    await openStory(page, 'layout-listdetailpanescaffold--resizable');

    const handle = page
      .locator('#storybook-root')
      .getByRole('separator', { name: 'Resize panes' });

    await expect(handle).toHaveAttribute('aria-valuenow', '50');
    await expect(handle).toHaveAttribute('aria-valuetext', 'Current pane split, 50 percent');
    await expect(handle).toHaveAttribute('aria-description', 'Change pane split to 70 percent');

    await handle.focus();
    await page.keyboard.press('Enter');
    await expect(handle).toHaveAttribute('aria-valuenow', '70');
    await expect(handle).toHaveAttribute('aria-valuetext', 'Current pane split, 70 percent');
    await expect(handle).toHaveAttribute('aria-description', 'Change pane split to 30 percent');

    // A real pointer click remains part of the drag interaction and must not
    // activate the accessibility-only next-anchor action.
    await handle.click();
    await expect(handle).toHaveAttribute('aria-valuenow', '70');

    // Assistive technologies commonly invoke semantic actions as a synthetic
    // click without pointer detail. That follows AndroidX's onClick semantics.
    await handle.dispatchEvent('click');
    await expect(handle).toHaveAttribute('aria-valuenow', '30');
    await expect(handle).toHaveAttribute('aria-valuetext', 'Current pane split, 30 percent');
    await expect(handle).toHaveAttribute('aria-description', 'Change pane split to 50 percent');
  });

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
    const predictiveLayer = scaffold.locator(
      '.three-pane-scaffold__predictive-back-layer',
    );
    const listPane = scaffold.locator('[data-pane-role="secondary"]');

    await expect(scaffold).toBeVisible();
    await expect(predictiveLayer).toBeVisible();
    await expect(listPane).toHaveAttribute('data-pane-motion', 'enter-from-left');

    const scaffoldMetrics = await scaffold.evaluate((element) => ({
      clientWidth: element.clientWidth,
      clientHeight: element.clientHeight,
      scale: getComputedStyle(element).scale,
    }));
    const predictiveMetrics = await predictiveLayer.evaluate((element) => ({
      clientWidth: element.clientWidth,
      clientHeight: element.clientHeight,
      scale: Number.parseFloat(getComputedStyle(element).scale),
    }));
    const listLayoutWidth = await listPane.evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).width),
    );
    const [scaffoldBounds, predictiveBounds, listBounds] = await Promise.all([
      scaffold.boundingBox(),
      predictiveLayer.boundingBox(),
      listPane.boundingBox(),
    ]);
    if (!scaffoldBounds || !predictiveBounds || !listBounds) {
      throw new Error('Predictive-back scaffold has no visual bounds');
    }

    const browserGeometryTolerance = 1 / 32;
    expect(scaffoldMetrics.clientWidth).toBe(480);
    expect(scaffoldMetrics.clientHeight).toBe(640);
    expect(scaffoldMetrics.scale).toBe('none');
    expect(predictiveMetrics.clientWidth).toBe(480);
    expect(predictiveMetrics.clientHeight).toBe(640);
    expect(predictiveMetrics.scale).toBeCloseTo(0.9523809524, 5);
    // Chromium quantizes computed/bounding-box geometry to a 1/64px-ish grid.
    // The layout contract is that predictive graphics scaling belongs to the
    // dedicated inner layer and does not feed back into outer scaffold geometry.
    expect(Math.abs(listLayoutWidth - scaffoldMetrics.clientWidth)).toBeLessThan(
      browserGeometryTolerance,
    );
    expect(Math.abs(scaffoldBounds.width - 480)).toBeLessThan(
      browserGeometryTolerance,
    );
    expect(Math.abs(scaffoldBounds.height - 640)).toBeLessThan(
      browserGeometryTolerance,
    );
    expect(
      Math.abs(predictiveBounds.width - 480 * predictiveMetrics.scale),
    ).toBeLessThan(browserGeometryTolerance);
    expect(
      Math.abs(predictiveBounds.height - 640 * predictiveMetrics.scale),
    ).toBeLessThan(browserGeometryTolerance);
    expect(Math.abs(listBounds.width - predictiveBounds.width)).toBeLessThan(
      browserGeometryTolerance,
    );
  });

  test('levitated AnimatedPane applies the requested shape and shadow only as a modal pane', async ({ page }) => {
    await openStory(page, 'layout-listdetailpanescaffold--levitated-dialog');

    const root = page.locator('#storybook-root');
    const scaffold = root.locator('.three-pane-scaffold');
    const extraPane = scaffold.locator('[data-pane-role="tertiary"]');
    const animatedPane = extraPane.locator('.animated-pane');

    await expect(extraPane).toHaveAttribute('data-pane-adapted-value', 'levitated');
    await expect(animatedPane).toBeVisible();

    const levitatedStyle = await animatedPane.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        borderRadius: style.borderRadius,
        boxShadow: style.boxShadow,
        overflow: style.overflow,
      };
    });
    expect(levitatedStyle.borderRadius).toBe('16px');
    expect(levitatedStyle.boxShadow).not.toBe('none');
    expect(levitatedStyle.overflow).toBe('hidden');

    await openStory(page, 'layout-listdetailpanescaffold--expanded');
    const expandedAnimatedPane = page
      .locator('#storybook-root')
      .locator('[data-pane-role="primary"] .animated-pane');
    const expandedShadow = await expandedAnimatedPane.evaluate(
      (element) => getComputedStyle(element).boxShadow,
    );
    expect(expandedShadow).toBe('none');
  });
});
