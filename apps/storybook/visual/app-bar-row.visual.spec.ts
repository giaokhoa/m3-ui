import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

async function expectLayout(page: Page, inlineCount: number, overflowCount: number) {
  const row = page.locator('.app-bar-row');
  await expect(row).toHaveAttribute('data-inline-count', String(inlineCount));
  await expect(row).toHaveAttribute('data-overflow-count', String(overflowCount));
}

test.describe('Material 3 AppBarRow browser contract', () => {
  test('all-fit renders no overflow trigger', async ({ page }) => {
    await openStory(page, 'components-appbarrow--all-fit');
    await expectLayout(page, 4, 0);
    await expect(page.getByRole('button', { name: 'More actions' })).toHaveCount(0);
  });

  test('width overflow reserves the trigger and keeps a source-order prefix', async ({ page }) => {
    await openStory(page, 'components-appbarrow--width-overflow');
    await expectLayout(page, 2, 2);
    await expect(page.getByRole('button', { name: 'Share' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pin' })).toBeVisible();
    await page.getByRole('button', { name: 'More actions' }).click();
    await expect(page.getByRole('menuitem', { name: 'Archive' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Settings' })).toBeVisible();
  });

  test('maxItemCount includes the overflow slot', async ({ page }) => {
    await openStory(page, 'components-appbarrow--max-count');
    await expectLayout(page, 2, 2);
    await expect(page.locator('.app-bar-row > *')).toHaveCount(3);
  });

  test('resize narrow to wide recomputes without reordering', async ({ page }) => {
    await openStory(page, 'components-appbarrow--resize');
    const host = page.getByTestId('app-bar-row-host');
    await expectLayout(page, 4, 0);
    await host.evaluate((node) => ((node as HTMLElement).style.inlineSize = '144px'));
    await expectLayout(page, 2, 2);
    await host.evaluate((node) => ((node as HTMLElement).style.inlineSize = '240px'));
    await expectLayout(page, 4, 0);
    const labels = await page.locator('.app-bar-row__item button').evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('aria-label')),
    );
    expect(labels).toEqual(['Share', 'Pin', 'Archive', 'Settings']);
  });

  test('logical source order follows LTR and RTL', async ({ page }) => {
    await openStory(page, 'components-appbarrow--width-overflow');
    const ltrShare = await page.getByRole('button', { name: 'Share' }).boundingBox();
    const ltrPin = await page.getByRole('button', { name: 'Pin' }).boundingBox();
    expect(ltrShare?.x ?? 0).toBeLessThan(ltrPin?.x ?? 0);

    await openStory(page, 'components-appbarrow--rtl');
    const rtlShare = await page.getByRole('button', { name: 'Share' }).boundingBox();
    const rtlPin = await page.getByRole('button', { name: 'Pin' }).boundingBox();
    expect(rtlShare?.x ?? 0).toBeGreaterThan(rtlPin?.x ?? 0);
  });

  test('disabled does not activate and actions dismiss with focus restored', async ({ page }) => {
    await openStory(page, 'components-appbarrow--width-overflow');
    const trigger = page.getByRole('button', { name: 'More actions' });
    await trigger.click();
    const disabled = page.getByRole('menuitem', { name: 'Archive' });
    await expect(disabled).toHaveAttribute('aria-disabled', 'true');
    await disabled.click({ force: true });
    await expect(page.getByTestId('app-bar-row-action')).toHaveText('none');
    await page.getByRole('menuitem', { name: 'Settings' }).click();
    await expect(page.getByTestId('app-bar-row-action')).toHaveText('settings');
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('overflow toggle activates and dismisses', async ({ page }) => {
    await openStory(page, 'components-appbarrow--toggle-overflow');
    const trigger = page.getByRole('button', { name: 'More actions' });
    await trigger.click();
    await page.getByRole('menuitem', { name: 'Pin' }).click();
    await expect(page.getByTestId('app-bar-row-action')).toHaveText('pin-on');
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('keyboard opens menu and custom trigger remains accessible', async ({ page }) => {
    await openStory(page, 'components-appbarrow--custom-overflow-trigger');
    const trigger = page.getByRole('button', { name: 'Custom more actions' });
    await trigger.focus();
    await trigger.press('Enter');
    await expect(page.getByRole('menu')).toBeVisible();
  });

  test('custom item has explicit inline and overflow renderers', async ({ page }) => {
    await openStory(page, 'components-appbarrow--custom-item');
    await expect(page.getByTestId('custom-inline')).toBeVisible();
    const host = page.getByTestId('app-bar-row-host');
    await host.evaluate((node) => ((node as HTMLElement).style.inlineSize = '80px'));
    await page.getByRole('button', { name: 'More actions' }).click();
    await page.getByRole('menuitem', { name: 'Custom overflow' }).click();
    await expect(page.getByTestId('app-bar-row-action')).toHaveText('custom-overflow');
    await expect(page.getByRole('menu')).toHaveCount(0);
  });

  test('long labels do not expand inline icon controls', async ({ page }) => {
    await openStory(page, 'components-appbarrow--long-labels');
    const share = page.getByRole('button', {
      name: 'Share this document with everyone in the workspace',
    });
    const box = await share.boundingBox();
    expect(box?.width ?? 0).toBeLessThan(64);
    await share.hover();
    await expect(page.getByRole('tooltip')).toContainText('Share this document');
  });

  test('measurement creates no duplicate hidden focusables', async ({ page }) => {
    await openStory(page, 'components-appbarrow--width-overflow');
    await expect(page.locator('.app-bar-row button')).toHaveCount(3);
    await expect(page.locator('.app-bar-row [aria-hidden="true"] button')).toHaveCount(0);
  });
});
