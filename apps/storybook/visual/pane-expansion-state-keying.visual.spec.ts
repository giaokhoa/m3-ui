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
  const scaffold = page.locator('#storybook-root .three-pane-scaffold');
  const handle = page.locator('#storybook-root .three-pane-scaffold__drag-handle');
  const [scaffoldBox, handleBox] = await Promise.all([
    scaffold.boundingBox(),
    handle.boundingBox(),
  ]);
  if (!scaffoldBox || !handleBox) {
    throw new Error('Pane expansion scaffold or drag handle has no visual bounds');
  }
  return ((handleBox.x + handleBox.width / 2 - scaffoldBox.x) / scaffoldBox.width) * 100;
}

async function dragHandleBy(page: Page, deltaX: number) {
  const handle = page.locator('#storybook-root .three-pane-scaffold__drag-handle');
  const handleBox = await handle.boundingBox();
  if (!handleBox) throw new Error('Pane expansion drag handle has no visual bounds');

  const centerX = handleBox.x + handleBox.width / 2;
  const centerY = handleBox.y + handleBox.height / 2;
  await page.mouse.move(centerX, centerY);
  await page.mouse.down();
  await page.mouse.move(centerX + deltaX, centerY, { steps: 4 });
  await page.mouse.up();
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

    await dragHandleBy(page, 80);
    await expect.poll(() => expansionPercent(page)).toBeGreaterThan(primarySecondaryInitial + 5);
    const primarySecondaryAdjusted = await expansionPercent(page);

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
    expect(Math.abs(primaryTertiaryInitial - primarySecondaryAdjusted)).toBeGreaterThan(5);

    await dragHandleBy(page, -80);
    await expect.poll(() => expansionPercent(page)).toBeLessThan(primaryTertiaryInitial - 5);
    const primaryTertiaryAdjusted = await expansionPercent(page);

    await primarySecondary.click();
    await expect(root.locator('[data-pane-role="secondary"]')).toHaveAttribute(
      'data-pane-adapted-value',
      'expanded',
    );
    await expect.poll(() => expansionPercent(page)).toBeCloseTo(primarySecondaryAdjusted, 1);

    await primaryTertiary.click();
    await expect.poll(() => expansionPercent(page)).toBeCloseTo(primaryTertiaryAdjusted, 1);
  });
});
