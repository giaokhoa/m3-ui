import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page) {
  await page.goto('/iframe.html?id=layout-paneexpansionstatekeying--default&viewMode=story', {
    waitUntil: 'networkidle',
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

async function expansionPercent(page: Page) {
  const value = await page
    .locator('.three-pane-scaffold__drag-handle')
    .getAttribute('aria-valuenow');
  if (value == null) throw new Error('Pane expansion handle has no aria-valuenow');
  return Number(value);
}

test.describe('Material 3 default PaneExpansionState keying', () => {
  test('restores a user-adjusted split independently for each expanded pane pair', async ({ page }) => {
    await openStory(page);

    const root = page.locator('#storybook-root');
    const handle = root.locator('.three-pane-scaffold__drag-handle');
    const primarySecondary = root.getByRole('button', { name: 'Show primary + secondary' });
    const primaryTertiary = root.getByRole('button', { name: 'Show primary + tertiary' });

    await expect(handle).toBeVisible();
    const primarySecondaryInitial = await expansionPercent(page);

    await handle.focus();
    for (let index = 0; index < 5; index += 1) {
      await page.keyboard.press('ArrowRight');
    }
    const primarySecondaryAdjusted = await expansionPercent(page);
    expect(primarySecondaryAdjusted).toBeGreaterThan(primarySecondaryInitial);

    await primaryTertiary.click();
    await expect(root.locator('[data-pane-role="secondary"]')).toHaveAttribute(
      'data-pane-adapted-value',
      'hidden',
    );
    await expect(root.locator('[data-pane-role="tertiary"]')).toHaveAttribute(
      'data-pane-adapted-value',
      'expanded',
    );
    const primaryTertiaryInitial = await expansionPercent(page);
    expect(primaryTertiaryInitial).not.toBe(primarySecondaryAdjusted);

    await handle.focus();
    for (let index = 0; index < 4; index += 1) {
      await page.keyboard.press('ArrowLeft');
    }
    const primaryTertiaryAdjusted = await expansionPercent(page);
    expect(primaryTertiaryAdjusted).toBeLessThan(primaryTertiaryInitial);

    await primarySecondary.click();
    await expect(root.locator('[data-pane-role="secondary"]')).toHaveAttribute(
      'data-pane-adapted-value',
      'expanded',
    );
    expect(await expansionPercent(page)).toBe(primarySecondaryAdjusted);

    await primaryTertiary.click();
    expect(await expansionPercent(page)).toBe(primaryTertiaryAdjusted);
  });
});
