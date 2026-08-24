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
  // RAC removes data-entering to start the CSS transition from the Material
  // hidden state to the resting state. The attribute can therefore be absent
  // while the browser is still interpolating scale/opacity. Measure geometry
  // only after the rendered visual state has actually reached its resting value.
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
