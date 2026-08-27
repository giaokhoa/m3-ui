import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

async function drag(page: Page, deltaX: number, deltaY = 0, slow = false) {
  const foreground = page.locator('[data-swipe-foreground]');
  const box = await foreground.boundingBox();
  if (!box) throw new Error('SwipeToDismissBox foreground missing');
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  if (slow) {
    await page.mouse.move(x + deltaX * 0.9, y + deltaY * 0.9, { steps: 6 });
    await page.waitForTimeout(180);
    await page.mouse.move(x + deltaX, y + deltaY);
    await page.waitForTimeout(40);
  } else {
    await page.mouse.move(x + deltaX, y + deltaY, { steps: 8 });
  }
  await page.mouse.up();
}

async function transformX(page: Page) {
  return page.locator('[data-swipe-foreground]').evaluate((element) => {
    const transform = getComputedStyle(element).transform;
    if (transform === 'none') return 0;
    return new DOMMatrixReadOnly(transform).m41;
  });
}

test.describe('Material 3 SwipeToDismissBox browser contract', () => {
  test('start-to-end drag over threshold settles at the positive full-width anchor', async ({ page }) => {
    await openStory(page, 'components-swipetodismissbox--default');
    const box = page.getByTestId('swipe-box');
    const width = (await box.boundingBox())?.width ?? 0;
    await drag(page, 90, 0, true);
    await expect(box).toHaveAttribute('data-state', 'start-to-end');
    await expect(page.getByTestId('dismiss-direction')).toHaveText('start-to-end');
    await expect(page.getByTestId('dismiss-count')).toHaveText('1');
    await expect.poll(() => transformX(page)).toBeCloseTo(width, 0);
  });

  test('end-to-start drag over threshold settles at the negative full-width anchor', async ({ page }) => {
    await openStory(page, 'components-swipetodismissbox--default');
    const box = page.getByTestId('swipe-box');
    const width = (await box.boundingBox())?.width ?? 0;
    await drag(page, -90, 0, true);
    await expect(box).toHaveAttribute('data-state', 'end-to-start');
    await expect(page.getByTestId('dismiss-direction')).toHaveText('end-to-start');
    await expect(page.getByTestId('dismiss-count')).toHaveText('1');
    await expect.poll(() => transformX(page)).toBeCloseTo(-width, 0);
  });

  test('under-threshold drag snaps back without dismissal', async ({ page }) => {
    await openStory(page, 'components-swipetodismissbox--default');
    await drag(page, 30, 0, true);
    await expect(page.getByTestId('swipe-box')).toHaveAttribute('data-state', 'settled');
    await expect(page.getByTestId('dismiss-count')).toHaveText('0');
    await expect.poll(() => transformX(page)).toBeCloseTo(0, 0);
  });

  test('vertical scroll noise does not engage horizontal dragging', async ({ page }) => {
    await openStory(page, 'components-swipetodismissbox--default');
    await drag(page, 4, 60, true);
    await expect(page.getByTestId('swipe-box')).toHaveAttribute('data-state', 'settled');
    await expect(page.getByTestId('dismiss-count')).toHaveText('0');
    expect(await transformX(page)).toBe(0);
  });

  test('each logical direction can be independently disabled', async ({ page }) => {
    await openStory(page, 'components-swipetodismissbox--start-to-end-disabled');
    await drag(page, 120, 0, true);
    await expect(page.getByTestId('swipe-box')).toHaveAttribute('data-state', 'settled');
    await openStory(page, 'components-swipetodismissbox--end-to-start-disabled');
    await drag(page, -120, 0, true);
    await expect(page.getByTestId('swipe-box')).toHaveAttribute('data-state', 'settled');
  });

  test('gesturesEnabled=false leaves foreground interaction intact but blocks dragging', async ({ page }) => {
    await openStory(page, 'components-swipetodismissbox--gestures-disabled');
    const input = page.getByTestId('foreground-input');
    await input.focus();
    await expect(input).toBeFocused();
    await drag(page, 120, 0, true);
    await expect(page.getByTestId('swipe-box')).toHaveAttribute('data-state', 'settled');
    await input.focus();
    await expect(input).toBeFocused();
  });

  test('RTL maps physical left drag to logical start-to-end', async ({ page }) => {
    await openStory(page, 'components-swipetodismissbox--rtl');
    await drag(page, -90, 0, true);
    await expect(page.getByTestId('swipe-box')).toHaveAttribute('data-state', 'start-to-end');
    await expect(page.getByTestId('dismiss-direction')).toHaveText('start-to-end');
  });

  test('pointer cancel returns to the current settled state without onDismiss', async ({ page }) => {
    await openStory(page, 'components-swipetodismissbox--default');
    const foreground = page.locator('[data-swipe-foreground]');
    const box = await foreground.boundingBox();
    if (!box) throw new Error('foreground missing');
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 90, y, { steps: 5 });
    await foreground.dispatchEvent('pointercancel', {
      pointerId: 1,
      isPrimary: true,
      button: 0,
      clientX: x + 90,
      clientY: y,
    });
    await page.mouse.up();
    await expect(page.getByTestId('swipe-box')).toHaveAttribute('data-state', 'settled');
    await expect(page.getByTestId('dismiss-count')).toHaveText('0');
    await expect.poll(() => transformX(page)).toBeCloseTo(0, 0);
  });

  test('onDismiss fires exactly once for a settled dismissal and foreground remains operable after reset', async ({ page }) => {
    await openStory(page, 'components-swipetodismissbox--default');
    await drag(page, 90, 0, true);
    await expect(page.getByTestId('dismiss-count')).toHaveText('1');
    await page.waitForTimeout(350);
    await expect(page.getByTestId('dismiss-count')).toHaveText('1');
    await page.getByTestId('reset').click();
    const input = page.getByTestId('foreground-input');
    await input.focus();
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('Focusable');
  });

  test('revealed actions retain native semantics without inventing a swipe ARIA role', async ({ page }) => {
    await openStory(page, 'components-swipetodismissbox--default');
    const box = page.getByTestId('swipe-box');
    await expect(box).not.toHaveAttribute('role');
    await expect(page.getByTestId('archive-action')).toHaveRole('button');
    await expect(page.getByTestId('delete-action')).toHaveRole('button');
  });

  test('reduced motion removes settling transition while preserving final state', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'components-swipetodismissbox--default');
    await drag(page, 90, 0, true);
    await expect(page.getByTestId('swipe-box')).toHaveAttribute('data-state', 'start-to-end');
    await expect(page.locator('[data-swipe-foreground]')).toHaveCSS('transition-duration', '0s');
    await expect(page.getByTestId('dismiss-count')).toHaveText('1');
  });
});
