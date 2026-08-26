import { expect, test, type Locator, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

function expectClose(actual: number | undefined, expected: number) {
  expect(actual).not.toBeUndefined();
  expect(Math.abs((actual ?? 0) - expected)).toBeLessThan(0.8);
}

async function transformTranslation(locator: Locator) {
  return locator.evaluate((element) => {
    const transform = getComputedStyle(element).transform;
    if (transform === 'none') return { x: 0, y: 0 };
    const matrix = new DOMMatrixReadOnly(transform);
    return { x: matrix.m41, y: matrix.m42 };
  });
}

test.describe('Material 3 FloatingToolbar browser contract', () => {
  test('horizontal standard toolbar is a 64px full surface with 8px content edges and Level0', async ({ page }) => {
    await openStory(page, 'components-floatingtoolbar--horizontal-expanded');
    const toolbar = page.getByTestId('floating-toolbar');
    const surface = toolbar.locator('.floating-toolbar__surface');
    const first = toolbar.locator('.icon-button').first();
    const last = toolbar.locator('.icon-button').last();
    const [surfaceBox, firstBox, lastBox] = await Promise.all([
      surface.boundingBox(),
      first.boundingBox(),
      last.boundingBox(),
    ]);

    await expect(toolbar).toHaveAttribute('role', 'toolbar');
    await expect(toolbar).toHaveAttribute('aria-orientation', 'horizontal');
    expectClose(surfaceBox?.height, 64);
    expectClose((firstBox?.x ?? 0) - (surfaceBox?.x ?? 0), 8);
    expectClose(
      (surfaceBox?.x ?? 0) + (surfaceBox?.width ?? 0) -
        ((lastBox?.x ?? 0) + (lastBox?.width ?? 0)),
      8,
    );

    const visual = await surface.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        backgroundColor: style.backgroundColor,
        boxShadow: style.boxShadow,
        borderRadius: Number.parseFloat(style.borderRadius),
      };
    });
    expect(visual.backgroundColor).toBe('rgb(243, 237, 247)');
    expect(visual.boxShadow).toBe('none');
    expect(visual.borderRadius).toBeGreaterThanOrEqual(32);
  });

  test('standalone collapsed toolbar keeps main content but removes hidden actions from focus', async ({ page }) => {
    await openStory(page, 'components-floatingtoolbar--horizontal-collapsed');
    const toolbar = page.getByTestId('floating-toolbar');
    const surface = toolbar.locator('.floating-toolbar__surface');
    const leading = toolbar.locator('.floating-toolbar__leading');
    const trailing = toolbar.locator('.floating-toolbar__trailing');

    expectClose((await surface.boundingBox())?.height, 64);
    await expect(leading).toHaveCSS('visibility', 'hidden');
    await expect(trailing).toHaveCSS('visibility', 'hidden');
    await expect(toolbar.getByRole('button', { name: 'Search' })).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(toolbar.getByRole('button', { name: 'Search' })).toBeFocused();
  });

  test('expanded horizontal FAB toolbar reserves 80px cross-axis while FAB is 56px and toolbar surface is Level1', async ({ page }) => {
    await openStory(page, 'components-floatingtoolbar--horizontal-fab-expanded');
    const toolbar = page.getByTestId('floating-toolbar');
    const surface = toolbar.locator('.floating-toolbar__surface');
    const fabSlot = toolbar.locator('.floating-toolbar__fab');
    const fab = fabSlot.locator('.fab');
    const fabVisual = fabSlot.locator('.fab__visual');
    const [toolbarBox, surfaceBox, slotBox, fabBox, visualBox] = await Promise.all([
      toolbar.boundingBox(),
      surface.boundingBox(),
      fabSlot.boundingBox(),
      fab.boundingBox(),
      fabVisual.boundingBox(),
    ]);

    expectClose(toolbarBox?.height, 80);
    expectClose(surfaceBox?.height, 64);
    expectClose(slotBox?.width, 56);
    expectClose(slotBox?.height, 56);
    expectClose(fabBox?.width, 56);
    expectClose(visualBox?.width, 56);
    expectClose((slotBox?.x ?? 0) - ((surfaceBox?.x ?? 0) + (surfaceBox?.width ?? 0)), 8);
    expect((await surface.evaluate((element) => getComputedStyle(element).boxShadow))).not.toBe('none');
  });

  test('collapsed FAB toolbar hides the toolbar part and grows only the FAB to 80px', async ({ page }) => {
    await openStory(page, 'components-floatingtoolbar--horizontal-fab-collapsed');
    const toolbar = page.getByTestId('floating-toolbar');
    const surface = toolbar.locator('.floating-toolbar__surface');
    const fabSlot = toolbar.locator('.floating-toolbar__fab');
    const fabVisual = fabSlot.locator('.fab__visual');
    const [toolbarBox, surfaceBox, slotBox, visualBox] = await Promise.all([
      toolbar.boundingBox(),
      surface.boundingBox(),
      fabSlot.boundingBox(),
      fabVisual.boundingBox(),
    ]);

    expectClose(toolbarBox?.height, 80);
    expectClose(surfaceBox?.width, 0);
    expectClose(surfaceBox?.height, 0);
    await expect(surface).toHaveCSS('visibility', 'hidden');
    expectClose(slotBox?.width, 80);
    expectClose(slotBox?.height, 80);
    expectClose(visualBox?.width, 80);
    expectClose(visualBox?.height, 80);
    await expect(toolbar.getByRole('button', { name: 'Create' })).toBeVisible();
  });

  test('vertical vibrant toolbar uses 64px width and primary-container runtime colors', async ({ page }) => {
    await openStory(page, 'components-floatingtoolbar--vertical-vibrant');
    const toolbar = page.getByTestId('floating-toolbar');
    const surface = toolbar.locator('.floating-toolbar__surface');
    const first = toolbar.locator('.icon-button').first();
    const last = toolbar.locator('.icon-button').last();
    const [surfaceBox, firstBox, lastBox] = await Promise.all([
      surface.boundingBox(),
      first.boundingBox(),
      last.boundingBox(),
    ]);

    await expect(toolbar).toHaveAttribute('aria-orientation', 'vertical');
    expectClose(surfaceBox?.width, 64);
    expectClose((firstBox?.y ?? 0) - (surfaceBox?.y ?? 0), 8);
    expectClose(
      (surfaceBox?.y ?? 0) + (surfaceBox?.height ?? 0) -
        ((lastBox?.y ?? 0) + (lastBox?.height ?? 0)),
      8,
    );
    const colors = await surface.evaluate((element) => ({
      background: getComputedStyle(element).backgroundColor,
      color: getComputedStyle(element).color,
    }));
    expect(colors.background).toBe('rgb(234, 221, 255)');
    expect(colors.color).toBe('rgb(33, 0, 93)');
  });

  test('vertical FAB toolbar reserves 80px width and honors top FAB position when collapsed', async ({ page }) => {
    await openStory(page, 'components-floatingtoolbar--vertical-fab-collapsed');
    const toolbar = page.getByTestId('floating-toolbar');
    const fabSlot = toolbar.locator('.floating-toolbar__fab');
    const surface = toolbar.locator('.floating-toolbar__surface');
    const [toolbarBox, fabBox, surfaceBox] = await Promise.all([
      toolbar.boundingBox(),
      fabSlot.boundingBox(),
      surface.boundingBox(),
    ]);
    await expect(toolbar).toHaveAttribute('data-fab-position', 'top');
    expectClose(toolbarBox?.width, 80);
    expectClose(fabBox?.width, 80);
    expectClose(surfaceBox?.height, 0);
    expect((fabBox?.y ?? 0)).toBeLessThanOrEqual((surfaceBox?.y ?? 0) + 0.8);
  });

  test('controlled exit state projects the hoisted negative offset along the requested direction', async ({ page }) => {
    await openStory(page, 'components-floatingtoolbar--exit-states');
    const toolbar = page.getByTestId('floating-toolbar');

    await page.getByTestId('half-floating-toolbar').click();
    await expect(toolbar).toHaveAttribute('data-offset', '-32');
    await expect.poll(async () => (await transformTranslation(toolbar)).y).toBeCloseTo(32, 0);

    await page.getByTestId('hide-floating-toolbar').click();
    await expect(toolbar).toHaveAttribute('data-offset', '-64');
    await expect.poll(async () => (await transformTranslation(toolbar)).y).toBeCloseTo(64, 0);

    await page.getByTestId('show-floating-toolbar').click();
    await expect.poll(async () => (await transformTranslation(toolbar)).y).toBeCloseTo(0, 0);
  });

  test('logical start exit mirrors in explicit RTL', async ({ page }) => {
    await openStory(page, 'components-floatingtoolbar--rtl-start-exit');
    const toolbar = page.getByTestId('floating-toolbar');
    await expect(toolbar).toHaveAttribute('dir', 'rtl');
    await expect(toolbar).toHaveAttribute('data-exit-direction', 'start');
    const translation = await transformTranslation(toolbar);
    expectClose(translation.x, 24);
    expectClose(translation.y, 0);
  });

  test('reduced motion removes toolbar size and translation transition duration', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'components-floatingtoolbar--horizontal-fab-expanded');
    const toolbar = page.getByTestId('floating-toolbar');
    const surface = toolbar.locator('.floating-toolbar__surface');
    const fabSlot = toolbar.locator('.floating-toolbar__fab');
    const durations = await Promise.all(
      [toolbar, surface, fabSlot].map((locator) =>
        locator.evaluate((element) => getComputedStyle(element).transitionDuration),
      ),
    );
    for (const duration of durations) {
      expect(duration.split(',').every((value) => value.trim() === '0s')).toBe(true);
    }
  });
});
