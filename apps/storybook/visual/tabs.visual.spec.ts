import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, {
    waitUntil: 'networkidle',
  });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

function expectClose(actual: number | undefined, expected: number) {
  expect(actual).not.toBeUndefined();
  expect(Math.abs((actual ?? 0) - expected)).toBeLessThan(0.8);
}

test.describe('Material 3 Tabs browser contract', () => {
  test('fixed primary tabs distribute evenly and match the indicator to content', async ({ page }) => {
    await openStory(page, 'components-tabs--primary-fixed');
    const tabs = page.getByTestId('tabs');
    const items = tabs.getByRole('tab');
    const selected = items.first();
    const content = selected.locator('.tabs__content');
    const indicator = tabs.getByTestId('tabs-indicator');

    await expect(items).toHaveCount(3);
    await expect(selected).toHaveAttribute('aria-selected', 'true');
    const widths = await items.evaluateAll((nodes) =>
      nodes.map((node) => node.getBoundingClientRect().width),
    );
    expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(0.8);

    const selectedBox = await selected.boundingBox();
    const contentBox = await content.boundingBox();
    const indicatorBox = await indicator.boundingBox();
    expectClose(selectedBox?.height, 48);
    expectClose(indicatorBox?.width, contentBox?.width ?? 0);
    expectClose(indicatorBox?.x, contentBox?.x ?? 0);
    expectClose(indicatorBox?.height, 3);

    const motion = await indicator.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        property: style.transitionProperty,
        duration: style.transitionDuration,
      };
    });
    expect(motion.property).toContain('transform');
    expect(motion.property).toContain('width');
    expect(motion.duration).not.toBe('0s');
  });

  test('secondary indicator fills the selected tab instead of matching content', async ({ page }) => {
    await openStory(page, 'components-tabs--secondary-fixed');
    const tabs = page.getByTestId('tabs');
    const selected = tabs.getByRole('tab').first();
    const content = selected.locator('.tabs__content');
    const indicator = tabs.getByTestId('tabs-indicator');

    const selectedBox = await selected.boundingBox();
    const contentBox = await content.boundingBox();
    const indicatorBox = await indicator.boundingBox();
    expectClose(indicatorBox?.width, selectedBox?.width ?? 0);
    expectClose(indicatorBox?.x, selectedBox?.x ?? 0);
    expect((indicatorBox?.width ?? 0) - (contentBox?.width ?? 0)).toBeGreaterThan(10);
    // AndroidX SecondaryIndicator currently defaults to the primary 3dp height;
    // canonical web secondary remains 2px and is locked separately by unit tests.
    expectClose(indicatorBox?.height, 3);
  });

  test('scrollable tabs preserve 52px edge padding, 90px minimum width, and scroll selection into view', async ({ page }) => {
    await openStory(page, 'components-tabs--primary-scrollable');
    const tabs = page.getByTestId('tabs');
    const viewport = tabs.locator('.tabs__viewport');
    const items = tabs.getByRole('tab');
    const first = items.first();

    const viewportBox = await viewport.boundingBox();
    const firstBox = await first.boundingBox();
    expectClose((firstBox?.x ?? 0) - (viewportBox?.x ?? 0), 52);
    for (const width of await items.evaluateAll((nodes) =>
      nodes.map((node) => node.getBoundingClientRect().width),
    )) {
      expect(width).toBeGreaterThanOrEqual(89.8);
    }

    await first.focus();
    await page.keyboard.press('End');
    const last = items.last();
    await expect(last).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByTestId('tabs-selection')).toHaveText('Selected: books');
    await expect
      .poll(() => viewport.evaluate((element) => element.scrollLeft))
      .not.toBe(0);

    const lastBox = await last.boundingBox();
    const scrolledViewportBox = await viewport.boundingBox();
    expect((lastBox?.right ?? 0)).toBeLessThanOrEqual(
      (scrolledViewportBox?.right ?? 0) + 1,
    );
  });

  test('RAC keyboard navigation supports arrows, Home/End, and skips disabled tabs', async ({ page }) => {
    await openStory(page, 'components-tabs--disabled');
    const tabs = page.getByTestId('tabs');
    const items = tabs.getByRole('tab');
    const first = items.nth(0);
    const disabled = items.nth(1);
    const last = items.nth(2);

    await expect(disabled).toHaveAttribute('aria-disabled', 'true');
    await first.focus();
    await page.keyboard.press('ArrowRight');
    await expect(last).toBeFocused();
    await expect(last).toHaveAttribute('aria-selected', 'true');

    await page.keyboard.press('Home');
    await expect(first).toBeFocused();
    await expect(first).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('End');
    await expect(last).toBeFocused();

    await disabled.evaluate((element) => (element as HTMLElement).click());
    await expect(disabled).toHaveAttribute('aria-selected', 'false');
    await expect(last).toHaveAttribute('aria-selected', 'true');
  });

  test('hover, press and focus-visible are represented by the shared Ripple and RAC states', async ({ page }) => {
    await openStory(page, 'components-tabs--primary-fixed');
    const first = page.getByRole('tab').first();
    const ripple = first.locator(':scope > .ripple');

    await first.hover();
    await expect(first).toHaveAttribute('data-hovered', 'true');
    await expect(ripple).toHaveAttribute('data-hovered', 'true');

    const box = await first.boundingBox();
    await page.mouse.move((box?.x ?? 0) + 10, (box?.y ?? 0) + 10);
    await page.mouse.down();
    await expect(ripple.locator('.ripple__wave')).toHaveCount(1);
    await page.mouse.up();

    await page.locator('body').click({ position: { x: 2, y: 2 } });
    await page.keyboard.press('Tab');
    await expect(first).toBeFocused();
    await expect(first).toHaveAttribute('data-focus-visible', 'true');
    const focusState = await ripple.evaluate((element) => ({
      opacityFocus: element.hasAttribute('data-focus-visible'),
      insetFocus: element.hasAttribute('data-inset-focus-visible'),
    }));
    expect(focusState.opacityFocus || focusState.insetFocus).toBe(true);
  });

  test('reduced motion removes indicator and content transitions', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'components-tabs--primary-fixed');
    const tabs = page.getByTestId('tabs');

    const durations = await Promise.all([
      tabs.getByTestId('tabs-indicator').evaluate((element) => getComputedStyle(element).transitionDuration),
      tabs.locator('.tabs__label').first().evaluate((element) => getComputedStyle(element).transitionDuration),
    ]);
    expect(durations).toEqual(['0s', '0s']);
  });

  test('RTL keeps the primary indicator aligned to content while keyboard navigation scrolls logically', async ({ page }) => {
    await openStory(page, 'components-tabs--rtl-scrollable');
    const tabs = page.getByTestId('tabs');
    const items = tabs.getByRole('tab');
    const first = items.first();
    const indicator = tabs.getByTestId('tabs-indicator');

    await first.focus();
    await page.keyboard.press('End');
    const last = items.last();
    await expect(last).toHaveAttribute('aria-selected', 'true');
    await expect(last).toBeFocused();
    await expect
      .poll(async () => {
        const content = await last.locator('.tabs__content').boundingBox();
        const marker = await indicator.boundingBox();
        return Math.abs((content?.x ?? 0) - (marker?.x ?? 0));
      })
      .toBeLessThan(0.8);
  });
});
