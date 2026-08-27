import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

function expectClose(actual: number | undefined, expected: number, tolerance = 1) {
  expect(actual).not.toBeUndefined();
  expect(Math.abs((actual ?? 0) - expected)).toBeLessThanOrEqual(tolerance);
}

test.describe('Material 3 NonInteractiveScrollbar browser contract', () => {
  test('vertical scrollbar follows logical end edge in LTR and RTL', async ({ page }) => {
    await openStory(page, 'components-noninteractivescrollbar--vertical-ltr');
    const ltrHost = await page.getByTestId('scrollbar-host').boundingBox();
    const ltrThumb = await page.getByTestId('non-interactive-scrollbar-thumb').boundingBox();
    expectClose((ltrThumb?.x ?? 0) + (ltrThumb?.width ?? 0), (ltrHost?.x ?? 0) + (ltrHost?.width ?? 0));

    await openStory(page, 'components-noninteractivescrollbar--vertical-rtl');
    const rtlHost = await page.getByTestId('scrollbar-host').boundingBox();
    const rtlThumb = await page.getByTestId('non-interactive-scrollbar-thumb').boundingBox();
    expectClose(rtlThumb?.x, rtlHost?.x ?? 0);
  });

  test('vertical thumb maps top, middle and bottom scroll positions', async ({ page }) => {
    await openStory(page, 'components-noninteractivescrollbar--vertical-ltr');
    const scroller = page.getByTestId('scrollbar-scroller');
    const thumb = page.getByTestId('non-interactive-scrollbar-thumb');
    const first = await thumb.boundingBox();

    await scroller.evaluate((node) => { node.scrollTop = (node.scrollHeight - node.clientHeight) / 2; });
    await expect.poll(async () => (await thumb.boundingBox())?.y ?? 0).toBeGreaterThan((first?.y ?? 0) + 20);
    const middle = await thumb.boundingBox();

    await scroller.evaluate((node) => { node.scrollTop = node.scrollHeight; });
    await expect.poll(async () => (await thumb.boundingBox())?.y ?? 0).toBeGreaterThan((middle?.y ?? 0) + 20);
    const bottom = await thumb.boundingBox();
    const host = await page.getByTestId('scrollbar-host').boundingBox();
    expectClose((bottom?.y ?? 0) + (bottom?.height ?? 0), (host?.y ?? 0) + (host?.height ?? 0) - 2);
  });

  test('horizontal scrollbar stays on bottom and advances from inline-start in LTR and RTL', async ({ page }) => {
    for (const story of ['horizontal-ltr', 'horizontal-rtl']) {
      await openStory(page, `components-noninteractivescrollbar--${story}`);
      const scroller = page.getByTestId('scrollbar-scroller');
      const host = await page.getByTestId('scrollbar-host').boundingBox();
      const thumb = page.getByTestId('non-interactive-scrollbar-thumb');
      const start = await thumb.boundingBox();
      expectClose((start?.y ?? 0) + (start?.height ?? 0), (host?.y ?? 0) + (host?.height ?? 0));

      await scroller.evaluate((node) => {
        const max = node.scrollWidth - node.clientWidth;
        node.scrollLeft = getComputedStyle(node).direction === 'rtl' ? -max : max;
      });
      await expect.poll(async () => (await thumb.boundingBox())?.x ?? 0).not.toBe(start?.x ?? 0);
    }
  });

  test('hides without overflow and honors minimum/maximum thumb lengths', async ({ page }) => {
    await openStory(page, 'components-noninteractivescrollbar--no-overflow');
    await expect(page.getByTestId('scrollbar')).not.toHaveAttribute('data-overflow');
    await expect(page.getByTestId('non-interactive-scrollbar-fade-layer')).toHaveCSS('opacity', '0');

    await openStory(page, 'components-noninteractivescrollbar--min-thumb');
    expectClose((await page.getByTestId('non-interactive-scrollbar-thumb').boundingBox())?.height, 36);

    await openStory(page, 'components-noninteractivescrollbar--max-thumb');
    const track = await page.getByTestId('non-interactive-scrollbar-track').boundingBox();
    const thumb = await page.getByTestId('non-interactive-scrollbar-thumb').boundingBox();
    expectClose(thumb?.height, (track?.height ?? 0) * 0.5);
  });

  test('fade disabled remains visible while fade enabled hides after idle delay', async ({ page }) => {
    await openStory(page, 'components-noninteractivescrollbar--fade-disabled');
    await expect(page.getByTestId('non-interactive-scrollbar-fade-layer')).toHaveCSS('opacity', '1');

    await openStory(page, 'components-noninteractivescrollbar--fade-enabled');
    const scroller = page.getByTestId('scrollbar-scroller');
    const fadeLayer = page.getByTestId('non-interactive-scrollbar-fade-layer');
    await expect(fadeLayer).toHaveCSS('opacity', '0');
    await scroller.evaluate((node) => { node.scrollTop = 40; });
    await expect(fadeLayer).toHaveCSS('opacity', '1');
    await page.waitForTimeout(140);
    await expect.poll(async () => Number(await fadeLayer.evaluate((node) => getComputedStyle(node).opacity))).toBeLessThan(1);
    await page.waitForTimeout(120);
    await expect(fadeLayer).toHaveCSS('opacity', '0');
  });

  test('reduced motion removes transition duration but preserves fade delay', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'components-noninteractivescrollbar--reduced-motion');
    const scroller = page.getByTestId('scrollbar-scroller');
    const fadeLayer = page.getByTestId('non-interactive-scrollbar-fade-layer');
    await expect(fadeLayer).toHaveCSS('transition-duration', '0s');
    await scroller.evaluate((node) => { node.scrollTop = 40; });
    await expect(fadeLayer).toHaveCSS('opacity', '1');
    await page.waitForTimeout(60);
    await expect(fadeLayer).toHaveCSS('opacity', '1');
    await page.waitForTimeout(100);
    await expect(fadeLayer).toHaveCSS('opacity', '0');
  });

  test('content mutation and resize recompute overflow without polling', async ({ page }) => {
    await openStory(page, 'components-noninteractivescrollbar--resize-and-mutation');
    const scrollbar = page.getByTestId('scrollbar');
    await expect(scrollbar).not.toHaveAttribute('data-overflow');
    await page.getByTestId('add-content').click();
    await expect(scrollbar).toHaveAttribute('data-overflow', 'true');

    await scrollbar.evaluate((node) => {
      const host = node.parentElement as HTMLElement;
      host.style.blockSize = '400px';
    });
    await expect(scrollbar).not.toHaveAttribute('data-overflow');
  });

  test('decorative layer is aria-hidden, unfocusable and pointer-pass-through', async ({ page }) => {
    await openStory(page, 'components-noninteractivescrollbar--vertical-ltr');
    const scrollbar = page.getByTestId('scrollbar');
    await expect(scrollbar).toHaveAttribute('aria-hidden', 'true');
    await expect(scrollbar).toHaveCSS('pointer-events', 'none');
    await expect(scrollbar.locator('[tabindex]')).toHaveCount(0);

    const thumb = await page.getByTestId('non-interactive-scrollbar-thumb').boundingBox();
    const hitClass = await page.evaluate(({ x, y }) => {
      const hit = document.elementFromPoint(x, y);
      return hit?.className ?? '';
    }, {
      x: (thumb?.x ?? 0) + (thumb?.width ?? 0) / 2,
      y: (thumb?.y ?? 0) + (thumb?.height ?? 0) / 2,
    });
    expect(String(hitClass)).not.toContain('non-interactive-scrollbar');
  });
});
