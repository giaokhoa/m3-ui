import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => { await document.fonts.ready; });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

async function installReducedMotionHarness(page: Page) {
  await page.addInitScript(() => {
    const query = '(prefers-reduced-motion: reduce)';
    const originalMatchMedia = window.matchMedia.bind(window);
    const listeners = new Set<(event: MediaQueryListEvent) => void>();
    let matches = false;
    let maxActiveListeners = 0;

    const media = {
      get matches() {
        return matches;
      },
      media: query,
      onchange: null,
      addEventListener: (type: string, listener: EventListenerOrEventListenerObject) => {
        if (type !== 'change') return;
        listeners.add(listener as (event: MediaQueryListEvent) => void);
        maxActiveListeners = Math.max(maxActiveListeners, listeners.size);
      },
      removeEventListener: (type: string, listener: EventListenerOrEventListenerObject) => {
        if (type !== 'change') return;
        listeners.delete(listener as (event: MediaQueryListEvent) => void);
      },
      addListener: (listener: (event: MediaQueryListEvent) => void) => {
        listeners.add(listener);
        maxActiveListeners = Math.max(maxActiveListeners, listeners.size);
      },
      removeListener: (listener: (event: MediaQueryListEvent) => void) => {
        listeners.delete(listener);
      },
      dispatchEvent: () => true,
    } as unknown as MediaQueryList;

    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: (value: string) =>
        value === query ? media : originalMatchMedia(value),
    });

    (window as Window & {
      __reducedMotionHarness?: {
        set: (value: boolean) => void;
        stats: () => { activeListeners: number; maxActiveListeners: number };
      };
    }).__reducedMotionHarness = {
      set: (value) => {
        matches = value;
        const event = { matches, media: query } as MediaQueryListEvent;
        for (const listener of [...listeners]) listener(event);
      },
      stats: () => ({
        activeListeners: listeners.size,
        maxActiveListeners,
      }),
    };
  });
}

async function setReducedMotion(page: Page, value: boolean) {
  await page.evaluate((next) => {
    (window as Window & {
      __reducedMotionHarness?: { set: (value: boolean) => void };
    }).__reducedMotionHarness?.set(next);
  }, value);
}

async function reducedMotionStats(page: Page) {
  return page.evaluate(() =>
    (window as Window & {
      __reducedMotionHarness?: {
        stats: () => { activeListeners: number; maxActiveListeners: number };
      };
    }).__reducedMotionHarness?.stats(),
  );
}
test.describe('Material 3 ProgressIndicator browser contract', () => {
  test('reduced-motion consumers share one browser listener and update together', async ({
    page,
  }) => {
    await installReducedMotionHarness(page);
    await openStory(page, 'components-progressindicator--reduced-motion-consumers');

    const loading = page.getByRole('progressbar', {
      name: 'Shared reduced motion loading one',
    });
    const wavy = page.getByRole('progressbar', {
      name: 'Shared reduced motion wavy loading',
    });
    const loadingVisual = loading.locator('svg');

    expect(await reducedMotionStats(page)).toEqual({
      activeListeners: 1,
      maxActiveListeners: 1,
    });
    await expect(wavy.locator('animate')).toHaveCount(1);

    const movingBefore = await loadingVisual.evaluate((svg) => ({
      path: svg.querySelector('path')?.getAttribute('d'),
      transform: svg.querySelector('g')?.getAttribute('transform'),
    }));
    await page.waitForTimeout(120);
    const movingAfter = await loadingVisual.evaluate((svg) => ({
      path: svg.querySelector('path')?.getAttribute('d'),
      transform: svg.querySelector('g')?.getAttribute('transform'),
    }));
    expect(movingAfter).not.toEqual(movingBefore);

    await setReducedMotion(page, true);
    await expect(wavy.locator('animate')).toHaveCount(0);
    await page.waitForTimeout(30);
    const frozenBefore = await loadingVisual.evaluate((svg) => ({
      path: svg.querySelector('path')?.getAttribute('d'),
      transform: svg.querySelector('g')?.getAttribute('transform'),
    }));
    await page.waitForTimeout(120);
    const frozenAfter = await loadingVisual.evaluate((svg) => ({
      path: svg.querySelector('path')?.getAttribute('d'),
      transform: svg.querySelector('g')?.getAttribute('transform'),
    }));
    expect(frozenAfter).toEqual(frozenBefore);
    expect(await reducedMotionStats(page)).toEqual({
      activeListeners: 1,
      maxActiveListeners: 1,
    });

    await setReducedMotion(page, false);
    await expect(wavy.locator('animate')).toHaveCount(1);
    await page.waitForTimeout(30);
    const resumedBefore = await loadingVisual.evaluate((svg) => ({
      path: svg.querySelector('path')?.getAttribute('d'),
      transform: svg.querySelector('g')?.getAttribute('transform'),
    }));
    await page.waitForTimeout(120);
    const resumedAfter = await loadingVisual.evaluate((svg) => ({
      path: svg.querySelector('path')?.getAttribute('d'),
      transform: svg.querySelector('g')?.getAttribute('transform'),
    }));
    expect(resumedAfter).not.toEqual(resumedBefore);
  });

  test('default range and standard linear geometry', async ({ page }) => {
    await openStory(page, 'components-progressindicator--default');
    const progress = page.getByRole('progressbar', { name: 'Loading progress' });
    const box = await progress.boundingBox();
    await expect(progress).toHaveAttribute('aria-valuemin', '0');
    await expect(progress).toHaveAttribute('aria-valuemax', '1');
    await expect(progress).toHaveAttribute('aria-valuenow', '0.45');
    expect(box?.width).toBe(240);
    expect(box?.height).toBe(4);
  });

  test('standard linear and circular preserve determinate and indeterminate semantics', async ({ page }) => {
    await openStory(page, 'components-progressindicator--standard-types');
    const determinateLinear = page.getByRole('progressbar', { name: 'Linear 65 percent' });
    const indeterminateLinear = page.getByRole('progressbar', { name: 'Linear loading' });
    const determinateCircular = page.getByRole('progressbar', { name: 'Circular 65 percent' });
    const indeterminateCircular = page.getByRole('progressbar', { name: 'Circular loading' });
    await expect(determinateLinear).toHaveAttribute('aria-valuenow', '0.65');
    await expect(indeterminateLinear).not.toHaveAttribute('aria-valuenow');
    await expect(determinateCircular).toHaveAttribute('aria-valuenow', '0.65');
    await expect(indeterminateCircular).not.toHaveAttribute('aria-valuenow');
    expect((await determinateCircular.boundingBox())?.width).toBe(40);
    expect((await determinateCircular.boundingBox())?.height).toBe(40);
  });

  test('wavy determinate locks 0/25/50/100 linear and circular ARIA + paths', async ({ page }) => {
    await openStory(page, 'components-progressindicator--wavy-determinate-matrix');
    for (const value of [0, 0.25, 0.5, 1]) {
      const linear = page.getByRole('progressbar', { name: `Linear wavy ${value}`, exact: true });
      const circular = page.getByRole('progressbar', { name: `Circular wavy ${value}`, exact: true });
      await expect(linear).toHaveAttribute('aria-valuenow', String(value));
      await expect(circular).toHaveAttribute('aria-valuenow', String(value));
      await expect(linear.locator('svg')).toHaveAttribute('aria-hidden', 'true');
      await expect(circular.locator('svg')).toHaveAttribute('aria-hidden', 'true');
      if (value > 0) {
        const linearPath = await linear.locator('.progress-indicator__wave-path').getAttribute('d');
        const circularPath = await circular.locator('.progress-indicator__circular-wave-path').getAttribute('d');
        expect(linearPath).toMatch(/^M /);
        expect(circularPath).toMatch(/^M /);
        expect(linearPath).not.toContain('NaN');
        expect(circularPath).not.toContain('NaN');
      }
    }
  });

  test('wavy indeterminate has no fake aria-valuenow', async ({ page }) => {
    await openStory(page, 'components-progressindicator--expressive-wavy');
    const linear = page.getByRole('progressbar', { name: 'Wavy linear loading' });
    const circular = page.getByRole('progressbar', { name: 'Wavy circular loading' });
    await expect(linear).not.toHaveAttribute('aria-valuenow');
    await expect(circular).not.toHaveAttribute('aria-valuenow');
    await expect(linear.locator('.progress-indicator__linear-indeterminate')).toBeVisible();
    await expect(circular.locator('.progress-indicator__circular-indeterminate')).toBeVisible();
  });

  test('amplitude zero/default/max and custom wavelength/speed/thickness stay finite', async ({ page }) => {
    await openStory(page, 'components-progressindicator--wavy-controls');
    const linearZero = page.getByRole('progressbar', { name: 'Linear amplitude zero' });
    const linearMax = page.getByRole('progressbar', { name: 'Linear amplitude max' });
    const circularZero = page.getByRole('progressbar', { name: 'Circular amplitude zero' });
    const circularMax = page.getByRole('progressbar', { name: 'Circular amplitude max' });
    const linearCustom = page.getByRole('progressbar', { name: 'Linear custom wave' });
    const circularCustom = page.getByRole('progressbar', { name: 'Circular custom wave' });

    await expect(linearZero).toHaveAttribute('data-amplitude', '0');
    await expect(linearMax).toHaveAttribute('data-amplitude', '1');
    await expect(circularZero).toHaveAttribute('data-amplitude', '0');
    await expect(circularMax).toHaveAttribute('data-amplitude', '1');
    await expect(linearCustom).toHaveAttribute('data-wavelength', '28');
    await expect(linearCustom).toHaveAttribute('data-wave-speed', '0');
    await expect(linearCustom).toHaveAttribute('data-thickness', '8');
    await expect(circularCustom).toHaveAttribute('data-wavelength', '22');
    await expect(circularCustom).toHaveAttribute('data-wave-speed', '11');
    await expect(circularCustom).toHaveAttribute('data-track-thickness', '6');

    const flatLinear = await linearZero.locator('.progress-indicator__wave-path').getAttribute('d');
    const flatCircular = await circularZero.locator('.progress-indicator__circular-wave-path').getAttribute('d');
    expect(flatLinear).toMatch(/^M .* L /);
    expect(flatCircular).not.toContain('NaN');
  });

  test('clamps out-of-range values and guards NaN', async ({ page }) => {
    await openStory(page, 'components-progressindicator--wavy-guards');
    await expect(page.getByRole('progressbar', { name: 'Wavy below range' })).toHaveAttribute('aria-valuenow', '0');
    await expect(page.getByRole('progressbar', { name: 'Wavy above range' })).toHaveAttribute('aria-valuenow', '1');
    await expect(page.getByRole('progressbar', { name: 'Wavy NaN' })).toHaveAttribute('aria-valuenow', '0');
    await expect(page.getByRole('progressbar', { name: 'Wavy indeterminate semantics' })).not.toHaveAttribute('aria-valuenow');
  });

  test('resize preserves wavy stroke widths and viewBox geometry', async ({ page }) => {
    await openStory(page, 'components-progressindicator--wavy-resize');
    const linear = page.getByRole('progressbar', { name: 'Wavy resized linear' });
    const circular = page.getByRole('progressbar', { name: 'Wavy resized circular' });
    expect((await linear.boundingBox())?.width).toBe(480);
    expect((await circular.boundingBox())?.width).toBe(96);
    await expect(linear.locator('.progress-indicator__wave-path')).toHaveAttribute('vector-effect', 'non-scaling-stroke');
    const stroke = await linear.locator('.progress-indicator__wave-path').evaluate((node) => getComputedStyle(node).strokeWidth);
    expect(stroke).toBe('4px');
    await expect(circular.locator('svg')).toHaveAttribute('viewBox', '0 0 48 48');
  });

  test('reduced motion produces static valid wave paths', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'components-progressindicator--expressive-wavy');
    const circular = page.getByRole('progressbar', { name: 'Wavy circular loading' });
    await expect(circular.locator('animate')).toHaveCount(0);
    const path = await circular.locator('.progress-indicator__circular-indeterminate-active').getAttribute('d');
    expect(path).toMatch(/^M /);
    expect(path).not.toContain('NaN');
  });

  test('circular full-wave endpoints close without a phase seam', async ({ page }) => {
    await openStory(page, 'components-progressindicator--expressive-wavy');
    const path = await page.getByRole('progressbar', { name: 'Wavy circular loading' }).locator('.progress-indicator__circular-indeterminate-active').getAttribute('d');
    expect(path).toBeTruthy();
    const points = path!.replace(/^M /, '').split(' L ');
    const first = points[0].split(' ').map(Number);
    const last = points.at(-1)!.split(' ').map(Number);
    expect(Math.abs(first[0] - last[0])).toBeLessThan(0.01);
    expect(Math.abs(first[1] - last[1])).toBeLessThan(0.01);
  });

  test('four-color and buffer remain explicit web adaptations', async ({ page }) => {
    await openStory(page, 'components-progressindicator--four-color');
    const fourColor = page.getByRole('progressbar', { name: 'Four color linear loading' });
    await expect(fourColor).toHaveAttribute('data-four-color', 'true');
    await expect(fourColor).not.toHaveAttribute('aria-valuenow');
    await openStory(page, 'components-progressindicator--buffer');
    const buffer = page.getByRole('progressbar', { name: 'Buffered download' });
    await expect(buffer).toHaveAttribute('data-buffer', '0.8');
    await expect(buffer).toHaveAttribute('aria-valuenow', '0.45');
  });
});
