import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

function expectClose(actual: number | undefined, expected: number, tolerance = 1) {
  expect(actual).not.toBeUndefined();
  expect(Math.abs((actual ?? 0) - expected)).toBeLessThan(tolerance);
}

async function maskSize(page: Page, index: number) {
  return Number(await page.locator(`[data-carousel-item][data-index="${index}"]`).getAttribute('data-mask-size'));
}

async function installScrollBehaviorRecorder(page: Page) {
  const viewport = page.locator('[data-carousel-viewport]');
  await viewport.evaluate((element) => {
    const target = element as HTMLElement & { __carouselBehaviors?: string[] };
    const original = target.scrollTo.bind(target);
    target.__carouselBehaviors = [];
    target.scrollTo = ((options: ScrollToOptions) => {
      target.__carouselBehaviors?.push(options.behavior ?? 'auto');
      original(options);
    }) as typeof target.scrollTo;
  });
  return viewport;
}

async function recordedBehaviors(page: Page) {
  return page.locator('[data-carousel-viewport]').evaluate((element) =>
    (element as HTMLElement & { __carouselBehaviors?: string[] }).__carouselBehaviors ?? [],
  );
}

test.describe('Material 3 Carousel browser contract', () => {
  test('multi-browse matches pinned large, medium, and small geometry exactly', async ({ page }) => {
    await openStory(page, 'components-carousel--exact-multi-browse-geometry');
    const carousel = page.getByTestId('carousel');
    const first = carousel.locator('[data-index="0"]');

    await expect(carousel).toHaveAttribute('role', 'region');
    await expect(carousel).toHaveAttribute('aria-roledescription', 'carousel');
    await expect(carousel).toHaveAttribute('aria-label', 'Pinned geometry carousel');
    expectClose((await first.boundingBox())?.width, 186, 0.5);
    await expect.poll(() => maskSize(page, 0)).toBeCloseTo(186, 2);
    await expect.poll(() => maskSize(page, 1)).toBeCloseTo(122, 2);
    await expect.poll(() => maskSize(page, 2)).toBeCloseTo(56, 2);
  });

  test('content padding preserves pinned geometry inside logical 16px edges', async ({ page }) => {
    await openStory(page, 'components-carousel--content-padding');
    const viewport = page.locator('[data-carousel-viewport]');
    const first = page.locator('[data-carousel-item][data-index="0"]');
    const [viewportBox, firstBox] = await Promise.all([viewport.boundingBox(), first.boundingBox()]);

    expectClose((firstBox?.x ?? 0) - (viewportBox?.x ?? 0), 16, 1);
    await expect.poll(() => maskSize(page, 0)).toBeCloseTo(186, 2);
    await expect.poll(() => maskSize(page, 1)).toBeCloseTo(122, 2);
    await expect.poll(() => maskSize(page, 2)).toBeCloseTo(56, 2);
  });

  test('resize recomputes keyline geometry without remounting current state', async ({ page }) => {
    await openStory(page, 'components-carousel--multi-browse');
    const carousel = page.getByTestId('carousel');
    const stage = page.getByTestId('carousel-stage');
    const firstBefore = await carousel.locator('[data-index="0"]').boundingBox();
    await stage.evaluate((element) => { element.style.width = '560px'; });
    await expect.poll(async () => (await carousel.locator('[data-index="0"]').boundingBox())?.width).not.toBe(firstBefore?.width);
    await expect(carousel).toHaveAttribute('data-current-item', '0');
  });

  test('masking progresses continuously while scrolling between keylines', async ({ page }) => {
    await openStory(page, 'components-carousel--exact-multi-browse-geometry');
    const viewport = page.locator('[data-carousel-viewport]');
    const before = await maskSize(page, 0);
    await viewport.evaluate((element) => { element.scrollLeft = 70; });
    await expect.poll(() => maskSize(page, 0)).not.toBe(before);
    const after = await maskSize(page, 0);
    expect(after).toBeLessThan(before);
  });

  test('large pointer fling advances multi-browse by at most one item', async ({ page }) => {
    await openStory(page, 'components-carousel--multi-browse');
    const carousel = page.getByTestId('carousel');
    const viewport = page.locator('[data-carousel-viewport]');
    const box = await viewport.boundingBox();
    if (!box) throw new Error('viewport missing');

    await page.mouse.move(box.x + box.width * 0.9, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.05, box.y + box.height / 2, { steps: 6 });
    await page.mouse.up();
    await page.waitForTimeout(350);
    await expect(carousel).toHaveAttribute('data-current-item', '1');
  });

  test('keyboard navigation respects logical first/last boundaries and edge keyline shifting', async ({ page }) => {
    await openStory(page, 'components-carousel--multi-browse');
    const carousel = page.getByTestId('carousel');
    const viewport = page.locator('[data-carousel-viewport]');
    const items = carousel.locator('[data-carousel-item]');
    await viewport.focus();
    await page.keyboard.press('ArrowRight');
    await expect.poll(async () => carousel.getAttribute('data-current-item')).toBe('1');
    await page.keyboard.press('End');
    await expect.poll(async () => carousel.getAttribute('data-current-item')).toBe('7');
    await expect.poll(() => maskSize(page, 7)).toBeCloseTo((await items.nth(7).boundingBox())?.width ?? 0, 1);
    const end = await viewport.evaluate((element) => ({ left: element.scrollLeft, max: element.scrollWidth - element.clientWidth }));
    expect(end.left).toBeLessThanOrEqual(end.max + 1);
    await page.keyboard.press('Home');
    await expect.poll(async () => carousel.getAttribute('data-current-item')).toBe('0');
    await expect.poll(() => maskSize(page, 0)).toBeCloseTo((await items.nth(0).boundingBox())?.width ?? 0, 1);
  });

  test('uncontained preserves requested width, exposes the pinned cut-off item, and does not snap', async ({ page }) => {
    await openStory(page, 'components-carousel--exact-uncontained-geometry');
    const carousel = page.getByTestId('carousel');
    const viewport = page.locator('[data-carousel-viewport]');
    expectClose((await carousel.locator('[data-index="0"]').boundingBox())?.width, 125, 0.5);
    await expect.poll(() => maskSize(page, 0)).toBeCloseTo(125, 2);
    await expect.poll(() => maskSize(page, 1)).toBeCloseTo(125, 2);
    await expect.poll(() => maskSize(page, 2)).toBeCloseTo(125, 2);
    await expect.poll(() => maskSize(page, 3)).toBeCloseTo(37.5, 2);
    expect(await viewport.evaluate((element) => getComputedStyle(element).scrollSnapType)).toBe('none');

    await viewport.evaluate((element) => { element.scrollLeft = 73; });
    await page.waitForTimeout(160);
    expectClose(await viewport.evaluate((element) => element.scrollLeft), 73, 2);
  });

  test('centered hero centers an interior focal item and makes edge items fully focal', async ({ page }) => {
    await openStory(page, 'components-carousel--centered-hero');
    const carousel = page.getByTestId('carousel');
    const viewport = page.locator('[data-carousel-viewport]');
    const focal = page.locator('[data-carousel-item][data-focal="true"]').first();
    const [viewportBox, focalBox] = await Promise.all([viewport.boundingBox(), focal.boundingBox()]);
    const viewportCenter = (viewportBox?.x ?? 0) + (viewportBox?.width ?? 0) / 2;
    const focalCenter = (focalBox?.x ?? 0) + (focalBox?.width ?? 0) / 2;
    expectClose(focalCenter, viewportCenter, 2);

    await viewport.focus();
    await page.keyboard.press('Home');
    await expect.poll(async () => carousel.getAttribute('data-current-item')).toBe('0');
    await expect.poll(() => maskSize(page, 0)).toBeCloseTo(280, 1);
    await page.keyboard.press('End');
    await expect.poll(async () => carousel.getAttribute('data-current-item')).toBe('6');
    await expect.poll(() => maskSize(page, 6)).toBeCloseTo(280, 1);
  });

  test('controlled current item follows consumer state without trapping keyboard focus', async ({ page }) => {
    await openStory(page, 'components-carousel--controlled-current-item');
    const carousel = page.getByTestId('carousel');
    const viewport = page.locator('[data-carousel-viewport]');
    await expect(page.getByTestId('controlled-current')).toHaveText('1');
    await viewport.focus();
    await page.keyboard.press('ArrowRight');
    await expect.poll(async () => carousel.getAttribute('data-current-item')).toBe('2');
    await expect(page.getByTestId('controlled-current')).toHaveText('2');
  });

  test('programmatic jump is immediate, animate uses smooth behavior, and dynamic count clamps state', async ({ page }) => {
    await openStory(page, 'components-carousel--state-and-programmatic-navigation');
    const carousel = page.getByTestId('carousel');
    await expect(carousel).toHaveAttribute('data-current-item', '1');
    await installScrollBehaviorRecorder(page);

    await page.getByTestId('jump-4').click();
    await expect.poll(async () => carousel.getAttribute('data-current-item')).toBe('4');
    expect((await recordedBehaviors(page)).at(-1)).toBe('auto');

    await page.getByTestId('animate-2').click();
    await expect.poll(async () => carousel.getAttribute('data-current-item')).toBe('2');
    expect((await recordedBehaviors(page))).toContain('smooth');

    await page.getByTestId('shrink').click();
    await expect.poll(async () => carousel.locator('[data-carousel-item]').count()).toBe(2);
    await expect.poll(async () => carousel.getAttribute('data-current-item')).toBe('1');
  });

  test('pointer drag and wheel/trackpad baseline change logical scroll position', async ({ page }) => {
    await openStory(page, 'components-carousel--uncontained');
    const viewport = page.locator('[data-carousel-viewport]');
    const box = await viewport.boundingBox();
    if (!box) throw new Error('viewport missing');
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.25, box.y + box.height / 2, { steps: 5 });
    await page.mouse.up();
    await expect.poll(async () => viewport.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
    const dragged = await viewport.evaluate((element) => element.scrollLeft);
    await viewport.hover();
    await page.mouse.wheel(180, 0);
    await expect.poll(async () => viewport.evaluate((element) => element.scrollLeft)).toBeGreaterThanOrEqual(dragged);
  });

  test('userScrollEnabled=false blocks pointer, wheel, and keyboard scrolling', async ({ page }) => {
    await openStory(page, 'components-carousel--user-scroll-disabled');
    const carousel = page.getByTestId('carousel');
    const viewport = page.locator('[data-carousel-viewport]');
    await expect(viewport).toHaveAttribute('aria-disabled', 'true');
    await viewport.focus();
    await page.keyboard.press('ArrowRight');
    await viewport.hover();
    await page.mouse.wheel(200, 0);
    await expect(carousel).toHaveAttribute('data-current-item', '0');
    expect(await viewport.evaluate((element) => element.scrollLeft)).toBe(0);
  });

  test('RTL mirrors keyboard direction and keeps logical current item', async ({ page }) => {
    await openStory(page, 'components-carousel--rtl');
    const carousel = page.getByTestId('carousel');
    const viewport = page.locator('[data-carousel-viewport]');
    await viewport.focus();
    await page.keyboard.press('ArrowLeft');
    await expect.poll(async () => carousel.getAttribute('data-current-item')).toBe('1');
    expect(await viewport.evaluate((element) => element.scrollLeft)).toBeLessThan(0);
  });

  test('reduced motion removes item transitions and turns animated navigation into an immediate scroll', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'components-carousel--state-and-programmatic-navigation');
    const item = page.locator('[data-carousel-item]').first();
    await expect(item).toHaveCSS('transition-duration', '0s');
    await installScrollBehaviorRecorder(page);
    await page.getByTestId('animate-2').click();
    await expect.poll(async () => page.getByTestId('carousel').getAttribute('data-current-item')).toBe('2');
    expect((await recordedBehaviors(page)).at(-1)).toBe('auto');
  });
});
