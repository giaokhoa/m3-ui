import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, {
    waitUntil: 'networkidle',
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

test.describe('Material 3 levitated drag-to-resize semantics', () => {
  test('announces the current state and next resize action while preserving activation paths', async ({
    page,
  }) => {
    await openStory(page, 'layout-listdetailpanescaffold--levitated-bottom-sheet');

    const root = page.locator('#storybook-root');
    const pane = root.locator('[data-pane-role="tertiary"]');
    const handle = root.locator('.three-pane-scaffold__levitated-resize-handle');

    // The built Storybook preview can finish network activity before the React
    // story commits under parallel CI load. Wait on the semantic pane itself.
    await expect(pane).toBeVisible({ timeout: 15_000 });
    await expect(pane).toHaveAttribute('data-resize-state', 'default');
    await expect(handle).toHaveAttribute('data-resize-state', 'default');
    await expect(handle).toHaveAttribute('aria-label', 'expand');
    await expect(handle).toHaveAttribute('aria-description', 'partially expanded');

    // A real pointer click follows the existing no-drag click path.
    await handle.click();
    await expect(pane).toHaveAttribute('data-resize-state', 'expanded');
    await expect(handle).toHaveAttribute('data-resize-state', 'expanded');
    await expect(handle).toHaveAttribute('aria-label', 'collapse');
    await expect(handle).toHaveAttribute('aria-description', 'expanded');

    await handle.focus();
    await page.keyboard.press('Enter');
    await expect(pane).toHaveAttribute('data-resize-state', 'collapsed');
    await expect(handle).toHaveAttribute('aria-label', 'partially expand');
    await expect(handle).toHaveAttribute('aria-description', 'collapsed');

    // Assistive technologies commonly activate button semantics using a
    // synthetic click with no pointer detail.
    await handle.dispatchEvent('click');
    await expect(pane).toHaveAttribute('data-resize-state', 'default');
    await expect(handle).toHaveAttribute('data-resize-state', 'default');
    await expect(handle).toHaveAttribute('aria-label', 'expand');
    await expect(handle).toHaveAttribute('aria-description', 'partially expanded');
  });
});
