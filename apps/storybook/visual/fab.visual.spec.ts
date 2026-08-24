import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, {
    waitUntil: 'networkidle',
  });

  await page.evaluate(async () => {
    await document.fonts.ready;
  });

  await expect(page.locator('#storybook-root')).toBeVisible();
}

async function openDefaultFab(page: Page) {
  await openStory(page, 'components-fab--default');
  const button = page.getByRole('button', { name: 'Create', exact: true });
  await expect(button).toBeVisible();
  return button;
}

async function expectFabGeometry(
  page: Page,
  name: string,
  visualSize: number,
) {
  const button = page.getByRole('button', { name, exact: true });
  const visual = button.locator('.m3-fab__visual');
  const buttonBox = await button.boundingBox();
  const visualBox = await visual.boundingBox();

  expect(buttonBox?.height).toBe(Math.max(48, visualSize));
  expect(visualBox?.width).toBe(visualSize);
  expect(visualBox?.height).toBe(visualSize);
}

test.describe('Material 3 FAB visual parity', () => {
  test('size family preserves Compose visuals and minimum interaction target', async ({ page }) => {
    await openStory(page, 'components-fab--size-family');

    await expectFabGeometry(page, 'Small create', 40);
    await expectFabGeometry(page, 'Baseline create', 56);
    await expectFabGeometry(page, 'Medium create', 80);
    await expectFabGeometry(page, 'Large create', 96);

    await expect(page.locator('#storybook-root')).toHaveScreenshot('fab-size-family.png');
  });

  test('container roles and Material Web public variants', async ({ page }) => {
    await openStory(page, 'components-fab--color-families');

    const variants = [
      'primaryContainer',
      'secondaryContainer',
      'tertiaryContainer',
      'surface',
      'primary',
      'secondary',
      'tertiary',
    ] as const;

    for (const variant of variants) {
      const button = page.getByRole('button', { name: `${variant} create`, exact: true });
      await expect(button).toHaveAttribute('data-variant', variant);
    }

    await expect(page.locator('#storybook-root')).toHaveScreenshot('fab-color-families.png');
  });

  test('branded FAB keeps fixed geometry and supports the current labeled form', async ({ page }) => {
    await openStory(page, 'components-fab--branded');

    const normal = page.getByRole('button', { name: 'Branded normal', exact: true });
    const lowered = page.getByRole('button', { name: 'Branded lowered', exact: true });
    const extended = page.getByRole('button', { name: 'Branded extended', exact: true });
    const normalIconBox = await normal.locator('.m3-fab__icon').boundingBox();
    const extendedIconBox = await extended.locator('.m3-fab__icon').boundingBox();
    const extendedVisualBox = await extended.locator('.m3-fab__visual').boundingBox();

    await expectFabGeometry(page, 'Branded normal', 56);
    await expectFabGeometry(page, 'Branded lowered', 56);
    await expect(normal).toHaveAttribute('data-variant', 'branded');
    await expect(lowered).toHaveAttribute('data-variant', 'branded');
    await expect(extended).toHaveAttribute('data-variant', 'branded');
    await expect(extended).toHaveAttribute('data-extended', 'true');
    await expect(extended).toHaveAttribute('data-has-icon', 'true');
    await expect(normal.locator('.m3-fab__elevation')).toHaveAttribute('data-elevation', 'level3');
    await expect(lowered.locator('.m3-fab__elevation')).toHaveAttribute('data-elevation', 'level1');
    expect(normalIconBox?.width).toBe(36);
    expect(normalIconBox?.height).toBe(36);
    expect(extendedIconBox?.width).toBe(36);
    expect(extendedIconBox?.height).toBe(36);
    expect(extendedVisualBox?.height).toBe(56);
    expect(extendedVisualBox?.width ?? 0).toBeGreaterThanOrEqual(80);

    await extended.hover();
    await expect(extended).toHaveAttribute('data-interaction', 'hover');
    await page.mouse.move(0, 0);

    await expect(page.locator('#storybook-root')).toHaveScreenshot('fab-branded.png');
  });

  test('normal and lowered elevation react to hover with canonical levels', async ({ page }) => {
    await openStory(page, 'components-fab--lowered-elevation');

    const normal = page.getByRole('button', { name: 'Surface normal', exact: true });
    const lowered = page.getByRole('button', { name: 'Surface lowered', exact: true });
    const normalElevation = normal.locator('.m3-fab__elevation');
    const loweredElevation = lowered.locator('.m3-fab__elevation');

    await expect(normalElevation).toHaveAttribute('data-elevation', 'level3');
    await expect(loweredElevation).toHaveAttribute('data-elevation', 'level1');

    await normal.hover();
    await expect(normal).toHaveAttribute('data-interaction', 'hover');
    await expect(normalElevation).toHaveAttribute('data-elevation', 'level4');

    await lowered.hover();
    await expect(lowered).toHaveAttribute('data-interaction', 'hover');
    await expect(loweredElevation).toHaveAttribute('data-elevation', 'level2');

    await page.mouse.move(0, 0);
    await expect(page.locator('#storybook-root')).toHaveScreenshot('fab-lowered-elevation.png');
  });

  test('expanded Extended FAB sizes use canonical height and minimum width', async ({ page }) => {
    await openStory(page, 'components-fab--extended-sizes');

    const sizes = [
      ['Baseline extended', 56, 80],
      ['Small extended', 56, 56],
      ['Medium extended', 80, 80],
      ['Large extended', 96, 96],
    ] as const;

    for (const [name, height, minWidth] of sizes) {
      const button = page.getByRole('button', { name, exact: true });
      const visual = button.locator('.m3-fab__visual');
      const label = button.locator('.m3-fab__label');
      const buttonBox = await button.boundingBox();
      const visualBox = await visual.boundingBox();

      expect(buttonBox?.height).toBe(height);
      expect(visualBox?.height).toBe(height);
      expect(visualBox?.width ?? 0).toBeGreaterThanOrEqual(minWidth);
      await expect(button).toHaveAttribute('data-expanded', 'true');
      await expect(button).toHaveAttribute('data-has-icon', 'true');
      await expect(label).not.toHaveAttribute('aria-hidden', 'true');
    }

    await expect(page.locator('#storybook-root')).toHaveScreenshot('fab-extended-sizes.png');
  });

  test('text-only Extended FAB overloads stay expanded and keep runtime minimums', async ({ page }) => {
    await openStory(page, 'components-fab--text-only-extended');

    const sizes = [
      ['Baseline text', 56, 80],
      ['Small text', 56, 56],
      ['Medium text', 80, 80],
      ['Large text', 96, 96],
    ] as const;

    for (const [name, height, minWidth] of sizes) {
      const button = page.getByRole('button', { name, exact: true });
      const visual = button.locator('.m3-fab__visual');
      const label = button.locator('.m3-fab__label');
      const visualBox = await visual.boundingBox();

      expect(visualBox?.height).toBe(height);
      expect(visualBox?.width ?? 0).toBeGreaterThanOrEqual(minWidth);
      await expect(button).toHaveAttribute('data-expanded', 'true');
      await expect(button).not.toHaveAttribute('data-has-icon', 'true');
      await expect(button.locator('.m3-fab__icon')).toHaveCount(0);
      await expect(label).not.toHaveAttribute('aria-hidden', 'true');
    }

    await expect(page.locator('#storybook-root')).toHaveScreenshot('fab-text-only-extended.png');
  });

  test('collapsed Extended FAB returns to icon geometry and keeps an accessible name', async ({ page }) => {
    await openStory(page, 'components-fab--collapsed-extended');

    const sizes = [
      ['Baseline collapsed', 56],
      ['Small collapsed', 56],
      ['Medium collapsed', 80],
      ['Large collapsed', 96],
    ] as const;

    for (const [name, size] of sizes) {
      const button = page.getByRole('button', { name, exact: true });
      const visual = button.locator('.m3-fab__visual');
      const label = button.locator('.m3-fab__label');
      const visualBox = await visual.boundingBox();

      expect(visualBox?.width).toBe(size);
      expect(visualBox?.height).toBe(size);
      await expect(button).not.toHaveAttribute('data-expanded', 'true');
      await expect(button).toHaveAttribute('data-has-icon', 'true');
      await expect(label).toHaveAttribute('aria-hidden', 'true');
    }

    await expect(page.locator('#storybook-root')).toHaveScreenshot('fab-collapsed-extended.png');
  });

  test('keyboard focus uses the visual container shape', async ({ page }) => {
    const button = await openDefaultFab(page);
    await page.keyboard.press('Tab');
    await expect(button).toBeFocused();
    await expect(button).toHaveAttribute('data-interaction', 'focus');
    await expect(button).toHaveScreenshot('fab-focus.png');
  });

  test('theme matrix', async ({ page }) => {
    await openStory(page, 'components-fab--theme-matrix');
    await expect(page.locator('#storybook-root')).toHaveScreenshot('fab-theme-matrix.png');
  });
});
