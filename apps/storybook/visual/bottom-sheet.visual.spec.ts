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

test.describe('Material 3 BottomSheet browser contract', () => {
  test('uses the 640px surface, top-only 28px shape and canonical 32x4 handle', async ({
    page,
  }) => {
    await openStory(page, 'components-bottomsheet--default');
    const stage = page.getByTestId('bottom-sheet-stage');
    const sheet = page.getByTestId('bottom-sheet-default');
    const handle = sheet.locator('.bottom-sheet__drag-handle');
    const bar = sheet.locator('.bottom-sheet__drag-handle-bar');
    const stageBox = await stage.boundingBox();
    const sheetBox = await sheet.boundingBox();
    const handleBox = await handle.boundingBox();
    const barBox = await bar.boundingBox();
    const surface = await sheet.evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        backgroundColor: computed.backgroundColor,
        color: computed.color,
        borderStartStartRadius: computed.borderStartStartRadius,
        borderStartEndRadius: computed.borderStartEndRadius,
        borderEndStartRadius: computed.borderEndStartRadius,
        borderEndEndRadius: computed.borderEndEndRadius,
        maxWidth: computed.maxWidth,
      };
    });

    expectClose(sheetBox?.width, 640);
    expect(surface.maxWidth).toBe('640px');
    expect(surface.backgroundColor).toBe('rgb(247, 242, 250)');
    expect(surface.color).toBe('rgb(29, 27, 32)');
    expect(surface.borderStartStartRadius).toBe('28px');
    expect(surface.borderStartEndRadius).toBe('28px');
    expect(surface.borderEndStartRadius).toBe('0px');
    expect(surface.borderEndEndRadius).toBe('0px');
    expectClose(handleBox?.height, 48);
    expectClose(barBox?.width, 32);
    expectClose(barBox?.height, 4);
    expectClose(
      sheetBox?.y,
      (stageBox?.y ?? 0) + (stageBox?.height ?? 0) / 2,
    );
    await expect(sheet).toHaveAttribute('data-state', 'partially-expanded');
  });

  test('deterministic partial anchor converges to Expanded for a short sheet', async ({
    page,
  }) => {
    await openStory(page, 'components-bottomsheet--short-content');
    const stage = page.getByTestId('bottom-sheet-stage');
    const sheet = page.getByTestId('bottom-sheet-short');
    await expect(sheet).toHaveAttribute('data-state', 'expanded');
    const stageBox = await stage.boundingBox();
    const sheetBox = await sheet.boundingBox();

    expectClose(
      (sheetBox?.y ?? 0) + (sheetBox?.height ?? 0),
      (stageBox?.y ?? 0) + (stageBox?.height ?? 0),
    );
    expect((sheetBox?.height ?? 0) < (stageBox?.height ?? 0) / 2).toBe(true);
  });

  test('the native handle action expands and collapses through SheetState', async ({
    page,
  }) => {
    await openStory(page, 'components-bottomsheet--default');
    const sheet = page.getByTestId('bottom-sheet-default');

    const expand = page.getByRole('button', { name: 'Expand bottom sheet' });
    await expand.click();
    await expect(sheet).toHaveAttribute('data-state', 'expanded');

    const collapse = page.getByRole('button', { name: 'Collapse bottom sheet' });
    await collapse.click();
    await expect(sheet).toHaveAttribute('data-state', 'partially-expanded');
  });

  test('real pointer drag settles across the AndroidX positional threshold', async ({
    page,
  }) => {
    await openStory(page, 'components-bottomsheet--default');
    const sheet = page.getByTestId('bottom-sheet-default');
    let handle = page.getByRole('button', { name: 'Expand bottom sheet' });
    let box = await handle.boundingBox();
    const x = (box?.x ?? 0) + (box?.width ?? 0) / 2;
    const y = (box?.y ?? 0) + (box?.height ?? 0) / 2;

    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x, y - 80, { steps: 6 });
    await page.mouse.up();
    await expect(sheet).toHaveAttribute('data-state', 'expanded');

    handle = page.getByRole('button', { name: 'Collapse bottom sheet' });
    box = await handle.boundingBox();
    const expandedX = (box?.x ?? 0) + (box?.width ?? 0) / 2;
    const expandedY = (box?.y ?? 0) + (box?.height ?? 0) / 2;
    await page.mouse.move(expandedX, expandedY);
    await page.mouse.down();
    await page.mouse.move(expandedX, expandedY + 80, { steps: 6 });
    await page.mouse.up();
    await expect(sheet).toHaveAttribute('data-state', 'partially-expanded');
  });

  test('imperative state controls remain non-modal and Hidden becomes inert', async ({
    page,
  }) => {
    await openStory(page, 'components-bottomsheet--state-controls');
    const sheet = page.getByTestId('bottom-sheet-controls');

    await page.getByRole('button', { name: 'Hide sheet' }).click();
    await expect(sheet).toHaveAttribute('data-state', 'hidden');
    await expect(sheet).toHaveAttribute('aria-hidden', 'true');
    expect(await sheet.getAttribute('inert')).not.toBeNull();

    await page.getByRole('button', { name: 'Show sheet' }).click();
    await expect(sheet).toHaveAttribute('data-state', 'partially-expanded');
    await expect(sheet).not.toHaveAttribute('aria-hidden', 'true');
    expect(await sheet.getAttribute('inert')).toBeNull();
  });

  test('uses DefaultSpatial settling and FastEffects hiding motion', async ({
    page,
  }) => {
    await openStory(page, 'components-bottomsheet--state-controls');
    const sheet = page.getByTestId('bottom-sheet-controls');

    const settle = await sheet.evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        duration: computed.transitionDuration,
        timing: computed.transitionTimingFunction,
      };
    });
    expect(settle.duration).toBe('0.194s');
    expect(settle.timing).toContain('linear(');

    await page.getByRole('button', { name: 'Hide sheet' }).click();
    const hide = await sheet.evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        duration: computed.transitionDuration,
        timing: computed.transitionTimingFunction,
      };
    });
    expect(hide.duration).toBe('0.108s');
    expect(hide.timing).toContain('linear(');
  });
});
