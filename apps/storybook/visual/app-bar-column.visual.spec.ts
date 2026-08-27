import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

async function expectLayout(page: Page, inlineCount: number, overflowCount: number) {
  const column = page.locator('.app-bar-column');
  await expect(column).toHaveAttribute('data-inline-count', String(inlineCount));
  await expect(column).toHaveAttribute('data-overflow-count', String(overflowCount));
}

test.describe('Material 3 AppBarColumn browser contract', () => {
  test('all-fit renders top-to-bottom with no overflow trigger', async ({ page }) => {
    await openStory(page, 'components-appbarcolumn--all-fit');
    await expectLayout(page, 4, 0);
    await expect(page.getByRole('button', { name: 'More actions' })).toHaveCount(0);
    const labels = await page.locator('.app-bar-column__item button').evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('aria-label')),
    );
    expect(labels).toEqual(['Share this document', 'Pin', 'Archive', 'Settings']);
  });

  test('height overflow reserves trigger and keeps source-order prefix', async ({ page }) => {
    await openStory(page, 'components-appbarcolumn--height-overflow');
    await expectLayout(page, 2, 2);
    const share = await page.getByRole('button', { name: 'Share this document' }).boundingBox();
    const pin = await page.getByRole('button', { name: 'Pin' }).boundingBox();
    expect(share?.y ?? 0).toBeLessThan(pin?.y ?? 0);
    await page.getByRole('button', { name: 'More actions' }).click();
    await expect(page.getByRole('menuitem', { name: 'Archive' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Settings' })).toBeVisible();
  });

  test('maxItemCount includes exactly one overflow slot', async ({ page }) => {
    await openStory(page, 'components-appbarcolumn--max-count');
    await expectLayout(page, 2, 2);
    await expect(page.locator('.app-bar-column > *')).toHaveCount(3);
  });

  test('resize tall to short to tall restores source order', async ({ page }) => {
    await openStory(page, 'components-appbarcolumn--resize');
    const host = page.getByTestId('app-bar-column-host');
    await expectLayout(page, 4, 0);
    await host.evaluate((node) => ((node as HTMLElement).style.blockSize = '144px'));
    await expectLayout(page, 2, 2);
    await host.evaluate((node) => ((node as HTMLElement).style.blockSize = '240px'));
    await expectLayout(page, 4, 0);
  });

  test('toggle activation dismisses and restores trigger focus', async ({ page }) => {
    await openStory(page, 'components-appbarcolumn--toggle-overflow');
    const trigger = page.getByRole('button', { name: 'More actions' });
    await trigger.click();
    await page.getByRole('menuitem', { name: 'Pin' }).click();
    await expect(page.getByTestId('app-bar-column-action')).toHaveText('pin-on');
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('disabled does not activate while action activates and dismisses', async ({ page }) => {
    await openStory(page, 'components-appbarcolumn--height-overflow');
    const trigger = page.getByRole('button', { name: 'More actions' });
    await trigger.click();
    const disabled = page.getByRole('menuitem', { name: 'Archive' });
    await expect(disabled).toHaveAttribute('aria-disabled', 'true');
    await disabled.click({ force: true });
    await expect(page.getByTestId('app-bar-column-action')).toHaveText('none');
    await page.getByRole('menuitem', { name: 'Settings' }).click();
    await expect(page.getByTestId('app-bar-column-action')).toHaveText('settings');
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('custom item participates inline and in overflow rendering', async ({ page }) => {
    await openStory(page, 'components-appbarcolumn--mixed-items');
    await expect(page.getByTestId('column-custom-inline')).toBeVisible();
    const host = page.getByTestId('app-bar-column-host');
    await host.evaluate((node) => ((node as HTMLElement).style.blockSize = '96px'));
    await page.getByRole('button', { name: 'More actions' }).click();
    await page.getByRole('menuitem', { name: 'Custom overflow' }).click();
    await expect(page.getByTestId('app-bar-column-action')).toHaveText('custom-overflow');
    await expect(page.getByRole('menu')).toHaveCount(0);
  });

  test('custom overflow trigger supports keyboard and Escape', async ({ page }) => {
    await openStory(page, 'components-appbarcolumn--custom-overflow-trigger');
    const trigger = page.getByRole('button', { name: 'Custom more actions' });
    await trigger.focus();
    await trigger.press('Enter');
    await expect(page.getByRole('menu')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('outside press dismisses the overflow menu', async ({ page }) => {
    await openStory(page, 'components-appbarcolumn--height-overflow');
    await page.getByRole('button', { name: 'More actions' }).click();
    await expect(page.getByRole('menu')).toBeVisible();
    await page.mouse.click(2, 2);
    await expect(page.getByRole('menu')).toHaveCount(0);
  });

  test('RTL preserves vertical source order', async ({ page }) => {
    await openStory(page, 'components-appbarcolumn--rtl');
    const share = await page.getByRole('button', { name: 'Share this document' }).boundingBox();
    const pin = await page.getByRole('button', { name: 'Pin' }).boundingBox();
    expect(share?.y ?? 0).toBeLessThan(pin?.y ?? 0);
  });

  test('very short container renders trigger-only overflow', async ({ page }) => {
    await openStory(page, 'components-appbarcolumn--very-short');
    await expectLayout(page, 0, 4);
    await expect(page.getByRole('button', { name: 'More actions' })).toBeVisible();
  });

  test('custom-height measurement creates no hidden focusables or cross-axis overflow', async ({ page }) => {
    await openStory(page, 'components-appbarcolumn--long-custom-height');
    const column = page.locator('.app-bar-column');
    await expect(column).toHaveAttribute('data-overflow', 'true');
    await expect(page.locator('.app-bar-column [aria-hidden="true"] button')).toHaveCount(0);
    expect(await column.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
  });
});
