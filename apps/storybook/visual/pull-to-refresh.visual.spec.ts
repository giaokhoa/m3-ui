import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

async function dragDown(page: Page, distance: number, release = true) {
  const root = page.getByTestId('pull-to-refresh');
  const box = await root.boundingBox();
  if (!box) throw new Error('pull-to-refresh missing');
  const x = box.x + box.width / 2;
  const y = box.y + 48;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y + distance, { steps: 6 });
  if (release) await page.mouse.up();
}

test.describe('Material 3 PullToRefresh browser contract', () => {
  test('at-top pull beyond threshold triggers exactly one controlled refresh', async ({ page }) => {
    await openStory(page, 'components-pulltorefresh--default');
    const root = page.getByTestId('pull-to-refresh');
    await dragDown(page, 190);
    await expect(page.getByTestId('refresh-count')).toHaveText('1');
    await expect(root).toHaveAttribute('data-pull-status', 'refreshing');
    await expect(root.getByRole('status')).toHaveText('Refreshing');
    await dragDown(page, 220);
    await expect(page.getByTestId('refresh-count')).toHaveText('1');
  });

  test('under-threshold release snaps back without refreshing', async ({ page }) => {
    await openStory(page, 'components-pulltorefresh--default');
    const root = page.getByTestId('pull-to-refresh');
    await dragDown(page, 120);
    await expect(page.getByTestId('refresh-count')).toHaveText('0');
    await expect(root).toHaveAttribute('data-pull-status', 'idle');
    await expect(root).toHaveAttribute('data-pull-progress', '0.000');
  });

  test('scrolled-away container does not claim pull gesture', async ({ page }) => {
    await openStory(page, 'components-pulltorefresh--default');
    const root = page.getByTestId('pull-to-refresh');
    await root.evaluate((element) => {
      element.scrollTop = 140;
      element.dispatchEvent(new Event('scroll'));
    });
    await expect(root).toHaveAttribute('data-at-top', 'false');
    await dragDown(page, 220);
    await expect(page.getByTestId('refresh-count')).toHaveText('0');
    await expect(root).toHaveAttribute('data-pull-status', 'idle');
  });

  test('disabled state never claims or refreshes', async ({ page }) => {
    await openStory(page, 'components-pulltorefresh--disabled');
    const root = page.getByTestId('pull-to-refresh');
    await expect(root).toHaveAttribute('data-enabled', 'false');
    await dragDown(page, 220);
    await expect(page.getByTestId('refresh-count')).toHaveText('0');
    await expect(root).toHaveAttribute('data-pull-status', 'idle');
  });

  test('controlled refreshing is stable and completion resets', async ({ page }) => {
    await openStory(page, 'components-pulltorefresh--refreshing');
    const root = page.getByTestId('pull-to-refresh');
    await expect(root).toHaveAttribute('data-pull-status', 'refreshing');
    await expect(root).toHaveAttribute('data-pull-progress', '1.000');
    await dragDown(page, 220);
    await expect(page.getByTestId('refresh-count')).toHaveText('0');
    await expect(root).toHaveAttribute('data-pull-status', 'refreshing');
    await page.getByTestId('complete-refresh').click();
    await expect(root).toHaveAttribute('data-pull-status', 'idle');
  });

  test('custom indicator receives pulling, armed, and refreshing states', async ({ page }) => {
    await openStory(page, 'components-pulltorefresh--custom-indicator');
    const indicator = page.getByTestId('custom-indicator');
    await dragDown(page, 80, false);
    await expect(indicator).toHaveAttribute('data-status', 'pulling');
    expect(Number(await indicator.getAttribute('data-progress'))).toBeGreaterThan(0);
    const root = page.getByTestId('pull-to-refresh');
    const box = await root.boundingBox();
    if (!box) throw new Error('pull-to-refresh missing');
    await page.mouse.move(box.x + box.width / 2, box.y + 250, { steps: 4 });
    await expect(indicator).toHaveAttribute('data-status', 'armed');
    await page.mouse.up();
    await expect(indicator).toHaveAttribute('data-status', 'refreshing');
    await expect(page.getByTestId('refresh-count')).toHaveText('1');
  });

  test('pointer cancel resets without firing refresh', async ({ page }) => {
    await openStory(page, 'components-pulltorefresh--default');
    const root = page.getByTestId('pull-to-refresh');
    const box = await root.boundingBox();
    if (!box) throw new Error('pull-to-refresh missing');
    const x = box.x + box.width / 2;
    const y = box.y + 40;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x, y + 210, { steps: 6 });
    await expect(root).toHaveAttribute('data-pull-status', 'armed');
    await root.dispatchEvent('pointercancel', { pointerId: 1, pointerType: 'mouse', isPrimary: true });
    await page.mouse.up();
    await expect(page.getByTestId('refresh-count')).toHaveText('0');
    await expect(root).toHaveAttribute('data-pull-status', 'idle');
  });

  test('reduced motion removes settling transitions without changing refresh behavior', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'components-pulltorefresh--default');
    const indicator = page.locator('[data-pull-to-refresh-indicator]');
    await expect(indicator).toHaveCSS('transition-duration', '0s');
    await dragDown(page, 190);
    await expect(page.getByTestId('refresh-count')).toHaveText('1');
  });

  test('nested scrollable content away from top preserves its boundary', async ({ page }) => {
    await openStory(page, 'components-pulltorefresh--nested-content');
    const nested = page.getByTestId('nested-scroll');
    await nested.evaluate((element) => { element.scrollTop = 100; });
    const box = await nested.boundingBox();
    if (!box) throw new Error('nested scroll missing');
    const x = box.x + box.width / 2;
    const y = box.y + 40;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x, y + 210, { steps: 6 });
    await page.mouse.up();
    await expect(page.getByTestId('refresh-count')).toHaveText('0');
    await expect(page.getByTestId('pull-to-refresh')).toHaveAttribute('data-pull-status', 'idle');
  });

  test('RTL leaves vertical pull semantics unchanged', async ({ page }) => {
    await openStory(page, 'components-pulltorefresh--rtl');
    await dragDown(page, 190);
    await expect(page.getByTestId('refresh-count')).toHaveText('1');
  });
});
