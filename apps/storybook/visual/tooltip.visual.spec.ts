import { expect, test, type Locator, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, {
    waitUntil: 'networkidle',
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

function expectClose(actual: number | undefined, expected: number) {
  expect(actual).not.toBeUndefined();
  expect(Math.abs((actual ?? 0) - expected)).toBeLessThan(0.7);
}

async function primePointerModality(page: Page) {
  // React Aria deliberately ignores hover-start events until its global input
  // modality tracker has observed a real pointer event. A fresh Playwright page
  // can enter the trigger before the first pointermove is observed, which is not
  // representative of a user moving a mouse across the page.
  await page.mouse.move(1, 1);
}

async function waitForTooltipSettled(tooltip: Locator) {
  await expect
    .poll(async () =>
      tooltip.evaluate((element) => {
        const computed = getComputedStyle(element);
        return `${computed.opacity}|${computed.scale}`;
      }),
    )
    .toBe('1|1');
}

async function hoverDefault(page: Page) {
  await openStory(page, 'components-tooltip--default');
  await primePointerModality(page);
  const trigger = page.getByTestId('tooltip-trigger');
  await trigger.hover();
  const tooltip = page.getByTestId('plain-tooltip');
  await expect(tooltip).toBeVisible();
  await waitForTooltipSettled(tooltip);
  return { trigger, tooltip };
}

async function hoverRich(page: Page) {
  await openStory(page, 'components-tooltip--rich');
  const trigger = page.getByTestId('rich-tooltip-trigger');
  await trigger.hover();
  const tooltip = page.getByTestId('rich-tooltip');
  await expect(tooltip).toBeVisible();
  await waitForTooltipSettled(tooltip);
  return {
    trigger,
    tooltip,
    dialog: tooltip.getByRole('dialog'),
    action: page.getByTestId('rich-tooltip-action'),
  };
}

test.describe('Material 3 PlainTooltip browser contract', () => {
  test('uses Compose 40x24 minimum geometry, 200px cap and canonical Body Small treatment', async ({
    page,
  }) => {
    const { tooltip } = await hoverDefault(page);
    const box = await tooltip.boundingBox();
    const style = await tooltip.evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        minWidth: computed.minWidth,
        minHeight: computed.minHeight,
        maxWidth: computed.maxWidth,
        paddingInline: computed.paddingInline,
        paddingBlock: computed.paddingBlock,
        borderRadius: computed.borderRadius,
        fontSize: computed.fontSize,
        lineHeight: computed.lineHeight,
        fontWeight: computed.fontWeight,
        letterSpacing: computed.letterSpacing,
      };
    });

    expect(box?.width).toBeGreaterThanOrEqual(40);
    expect(box?.width).toBeLessThanOrEqual(200.7);
    expectClose(box?.height, 24);
    expect(style).toEqual({
      minWidth: '40px',
      minHeight: '24px',
      maxWidth: '200px',
      paddingInline: '8px',
      paddingBlock: '4px',
      borderRadius: '4px',
      fontSize: '12px',
      lineHeight: '16px',
      fontWeight: '400',
      letterSpacing: '0.4px',
    });
  });

  test('React Aria positions the tooltip at the Compose 4px anchor spacing', async ({ page }) => {
    const { trigger, tooltip } = await hoverDefault(page);
    const triggerBox = await trigger.boundingBox();
    const tooltipBox = await tooltip.boundingBox();

    await expect(tooltip).toHaveAttribute('data-placement', 'top');
    expectClose(
      (triggerBox?.y ?? 0) - ((tooltipBox?.y ?? 0) + (tooltipBox?.height ?? 0)),
      4,
    );
  });

  test('real hover and keyboard focus open an ARIA-associated tooltip and leaving closes it', async ({
    page,
  }) => {
    await openStory(page, 'components-tooltip--default');
    await primePointerModality(page);
    const trigger = page.getByTestId('tooltip-trigger');
    const tooltip = page.getByTestId('plain-tooltip');

    await trigger.hover();
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveAttribute('role', 'tooltip');
    const tooltipId = await tooltip.getAttribute('id');
    expect(tooltipId).toBeTruthy();
    await expect(trigger).toHaveAttribute('aria-describedby', tooltipId ?? '');

    await page.mouse.move(1, 1);
    await expect(tooltip).toBeHidden();

    // Tooltip focus visibility follows real input modality. Tab establishes
    // keyboard modality; programmatic element.focus() after pointer input does not.
    await page.keyboard.press('Tab');
    await expect(trigger).toBeFocused();
    await expect(tooltip).toBeVisible();
    await expect(trigger).toHaveAttribute(
      'aria-describedby',
      (await tooltip.getAttribute('id')) ?? '',
    );
  });

  test('long descriptive text wraps at the 200px Compose maximum width', async ({ page }) => {
    await openStory(page, 'components-tooltip--long-text');
    await primePointerModality(page);
    const trigger = page.getByTestId('long-tooltip-trigger');
    await trigger.hover();
    const tooltip = page.getByTestId('long-tooltip');
    await expect(tooltip).toBeVisible();
    await waitForTooltipSettled(tooltip);
    const box = await tooltip.boundingBox();

    expect(box?.width).toBeLessThanOrEqual(200.7);
    expect(box?.width).toBeGreaterThan(150);
    expect(box?.height).toBeGreaterThan(24);
    await expect(tooltip).toHaveAttribute('data-placement', 'bottom');
  });

  test('uses the canonical fast effects/spatial CSS transition projections', async ({ page }) => {
    const { tooltip } = await hoverDefault(page);
    const motion = await tooltip.evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        property: computed.transitionProperty,
        duration: computed.transitionDuration,
        timing: computed.transitionTimingFunction,
      };
    });

    expect(motion.property).toBe('opacity, scale');
    expect(motion.duration).toContain('0.108s');
    expect(motion.duration).toContain('0.137s');
    expect(motion.timing).toContain('linear(');
  });
});

test.describe('Material 3 RichTooltip browser contract', () => {
  test('uses Compose 40px floor/320px cap, level2 surface and canonical RichTooltip typography', async ({
    page,
  }) => {
    const { tooltip } = await hoverRich(page);
    const box = await tooltip.boundingBox();
    const surface = await tooltip.evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        minWidth: computed.minWidth,
        minHeight: computed.minHeight,
        maxWidth: computed.maxWidth,
        borderRadius: computed.borderRadius,
      };
    });
    const elevation = tooltip.locator(':scope > .elevation');
    const elevationShadow = await elevation.evaluate(
      (element) => getComputedStyle(element).boxShadow,
    );
    const content = tooltip.locator('.rich-tooltip__content');
    const contentPadding = await content.evaluate((element) => getComputedStyle(element).paddingInline);
    const title = tooltip.locator('.rich-tooltip__title');
    const text = tooltip.locator('.rich-tooltip__text');
    const titleType = await title.evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        fontSize: computed.fontSize,
        lineHeight: computed.lineHeight,
        fontWeight: computed.fontWeight,
        letterSpacing: computed.letterSpacing,
      };
    });
    const textType = await text.evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        fontSize: computed.fontSize,
        lineHeight: computed.lineHeight,
        fontWeight: computed.fontWeight,
        letterSpacing: computed.letterSpacing,
      };
    });

    expect(box?.width).toBeGreaterThanOrEqual(40);
    expect(box?.width).toBeLessThanOrEqual(320.7);
    expect(surface.minWidth).toBe('40px');
    expect(surface.minHeight).toBe('24px');
    expect(surface.maxWidth).toBe('320px');
    expect(surface.borderRadius).toBe('12px');
    await expect(elevation).toHaveAttribute('data-elevation', 'level2');
    expect(elevationShadow).not.toBe('none');
    expect(contentPadding).toBe('16px');
    expect(titleType).toEqual({
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: '500',
      letterSpacing: '0.1px',
    });
    expect(textType).toEqual({
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: '400',
      letterSpacing: '0.2px',
    });
  });

  test('uses dialog semantics and exposes the relationship on the real trigger', async ({ page }) => {
    const { trigger, dialog, action, tooltip } = await hoverRich(page);
    const dialogId = await dialog.getAttribute('id');
    expect(dialogId).toBeTruthy();
    await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(trigger).toHaveAttribute('aria-controls', dialogId ?? '');
    await expect(dialog).toHaveAttribute('role', 'dialog');
    await expect(dialog).toHaveAttribute('aria-describedby', /.+/);

    await action.click();
    await expect(tooltip).toBeHidden();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('persistent rich tooltip survives pointer travel and dismisses on outside interaction', async ({
    page,
  }) => {
    const { action, tooltip } = await hoverRich(page);
    await action.hover();
    await expect(tooltip).toBeVisible();
    await page.mouse.move(1, 1);
    await expect(tooltip).toBeVisible();
    await page.mouse.click(1, 1);
    await expect(tooltip).toBeHidden();
  });

  test('keyboard focus opens the rich tooltip and Tab reaches its action', async ({ page }) => {
    await openStory(page, 'components-tooltip--rich');
    const trigger = page.getByTestId('rich-tooltip-trigger');
    const tooltip = page.getByTestId('rich-tooltip');
    const action = page.getByTestId('rich-tooltip-action');

    await page.keyboard.press('Tab');
    await expect(trigger).toBeFocused();
    await expect(tooltip).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(action).toBeFocused();
    await expect(tooltip).toBeVisible();
  });

  test('text-only rich tooltip keeps Compose 4px block padding and closes on pointer exit when non-persistent', async ({
    page,
  }) => {
    await openStory(page, 'components-tooltip--rich-text-only');
    const trigger = page.getByTestId('rich-text-only-trigger');
    await trigger.hover();
    const tooltip = page.getByTestId('rich-text-only-tooltip');
    await expect(tooltip).toBeVisible();
    const text = tooltip.locator('.rich-tooltip__text');
    const padding = await text.evaluate((element) => getComputedStyle(element).paddingBlock);
    expect(padding).toBe('4px');

    await page.mouse.move(1, 1);
    await expect(tooltip).toBeHidden();
  });
});
