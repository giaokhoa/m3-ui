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

    // Temporary baseline bootstrap. Removed once the Linux CI image is committed.
    const baseline = await root.screenshot({ animations: 'disabled' });
    console.log(`M3_MOTION_HALFWAY_BASELINE:${baseline.toString('base64')}`);

    await expect(root).toHaveScreenshot(
      'list-detail-pane-scaffold-motion-halfway.png',
    );
  });
});
