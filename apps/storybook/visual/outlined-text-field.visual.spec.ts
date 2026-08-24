import { expect, test, type Page } from '@playwright/test';

async function openOutlinedDefault(page: Page) {
  await page.goto('/iframe.html?id=components-textfield--outlined-default&viewMode=story', {
    waitUntil: 'networkidle',
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });

  const root = page.locator('.text-field--outlined');
  const container = root.locator('.text-field__outlined-container');
  const label = root.locator('.text-field__label');
  const legend = root.locator('.text-field__outline-legend');
  const input = page.getByRole('textbox', { name: 'Label' });

  await expect(root).toBeVisible();
  await expect(container).toBeVisible();
  await expect(label).toBeVisible();
  await expect(input).toBeVisible();

  return { container, input, label, legend };
}

function centerY(box: { y: number; height: number }) {
  return box.y + box.height / 2;
}

test.describe('Material 3 outlined TextField cutout geometry', () => {
  test('expanded and minimized labels align to the Compose decoration geometry', async ({
    page,
  }) => {
    const { container, input, label, legend } = await openOutlinedDefault(page);

    const expandedContainer = await container.boundingBox();
    const expandedLabel = await label.boundingBox();
    const expandedLegend = await legend.boundingBox();

    expect(expandedContainer).not.toBeNull();
    expect(expandedLabel).not.toBeNull();
    expect(expandedLegend).not.toBeNull();

    if (!expandedContainer || !expandedLabel || !expandedLegend) return;

    expect(expandedContainer.height).toBe(56);
    expect(
      Math.abs(centerY(expandedLabel) - centerY(expandedContainer)),
    ).toBeLessThanOrEqual(1);
    expect(expandedLegend.width - expandedLabel.width).toBeCloseTo(8, 0);

    await label.click();
    await expect(input).toBeFocused();
    await expect(label).toHaveCSS('font-size', '12px');
    await expect(label).toHaveCSS('line-height', '16px');

    const focusedContainer = await container.boundingBox();
    const focusedLabel = await label.boundingBox();
    const focusedLegend = await legend.boundingBox();

    expect(focusedContainer).not.toBeNull();
    expect(focusedLabel).not.toBeNull();
    expect(focusedLegend).not.toBeNull();

    if (!focusedContainer || !focusedLabel || !focusedLegend) return;

    expect(focusedContainer.height).toBe(56);
    expect(Math.abs(centerY(focusedLabel) - focusedContainer.y)).toBeLessThanOrEqual(1);
    expect(focusedLegend.width - focusedLabel.width).toBeCloseTo(8, 0);

    const bridgeOpacity = await legend.evaluate(
      (element) => getComputedStyle(element, '::after').opacity,
    );
    expect(bridgeOpacity).toBe('0');
  });
});
