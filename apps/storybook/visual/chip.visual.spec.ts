import { expect, test, type Locator, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

async function resolvedColor(root: Locator, value: string): Promise<string> {
  return root.evaluate((element, colorValue) => {
    const probe = document.createElement('span');
    probe.style.color = colorValue;
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    element.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, value);
}

test.describe('Material 3 Chip parity', () => {
  test('uses Button semantics for action chips and Checkbox semantics for selectable chips', async ({
    page,
  }) => {
    await openStory(page, 'components-chip--action-variants');
    await expect(page.getByRole('button', { name: 'Assist', exact: true })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Elevated assist', exact: true }),
    ).toBeVisible();
    await expect(page.getByRole('checkbox')).toHaveCount(0);

    await openStory(page, 'components-chip--selectable-states');
    await expect(page.getByRole('checkbox', { name: 'Filter', exact: true })).toBeVisible();
    await expect(
      page.getByRole('checkbox', { name: 'Elevated filter', exact: true }),
    ).toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'Input', exact: true })).toBeChecked();
  });

  test('separates the 48px semantic target from the 32px visual container', async ({ page }) => {
    await openStory(page, 'components-chip--action-variants');
    const chip = page.getByRole('button', { name: 'Assist', exact: true });
    const visual = chip.locator('.m3-chip__visual');
    const geometry = await chip.evaluate((root) => {
      const visualElement = root.querySelector<HTMLElement>('.m3-chip__visual')!;
      const rootBox = root.getBoundingClientRect();
      const visualBox = visualElement.getBoundingClientRect();
      return {
        rootHeight: rootBox.height,
        visualHeight: visualBox.height,
        topGap: visualBox.top - rootBox.top,
        bottomGap: rootBox.bottom - visualBox.bottom,
      };
    });

    expect(geometry.rootHeight).toBeGreaterThanOrEqual(48);
    expect(geometry.visualHeight).toBe(32);
    expect(Math.abs(geometry.topGap - geometry.bottomGap)).toBeLessThanOrEqual(0.5);
    await expect(visual).toHaveCSS('border-radius', '8px');
  });

  test('ports action chip flat/elevated containers, outlines and hover elevations', async ({ page }) => {
    await openStory(page, 'components-chip--action-variants');
    const chips = page.locator('.m3-chip');
    const flat = chips.nth(0);
    const elevated = chips.nth(1);

    await expect(flat.locator('.m3-chip__surface')).toHaveCSS(
      'background-color',
      'rgba(0, 0, 0, 0)',
    );
    expect(
      await flat.locator('.m3-chip__visual').evaluate((element) =>
        getComputedStyle(element).getPropertyValue('--_chip-outline-width').trim(),
      ),
    ).toBe('1px');
    await expect(flat.locator('.m3-elevation')).toHaveAttribute('data-elevation', 'level0');

    const elevatedColor = await resolvedColor(elevated, 'var(--surface-container-low)');
    await expect(elevated.locator('.m3-chip__surface')).toHaveCSS(
      'background-color',
      elevatedColor,
    );
    await expect(elevated.locator('.m3-elevation')).toHaveAttribute('data-elevation', 'level1');

    await flat.hover();
    await expect(flat.locator('.m3-elevation')).toHaveAttribute('data-elevation', 'level0');

    await elevated.hover();
    await expect(elevated.locator('.m3-elevation')).toHaveAttribute('data-elevation', 'level2');
    await expect(elevated.locator('.m3-elevation')).toHaveCSS('transition-duration', '0.12s');
  });

  test('FilterChip toggles as a checkbox and resolves selected visual state', async ({ page }) => {
    await openStory(page, 'components-chip--selectable-states');
    const filter = page.getByRole('checkbox', { name: 'Filter', exact: true });
    const visual = filter.locator('.m3-chip__visual');

    await expect(filter).not.toBeChecked();
    expect(
      await visual.evaluate((element) =>
        getComputedStyle(element).getPropertyValue('--_chip-outline-width').trim(),
      ),
    ).toBe('1px');

    await filter.click();
    await expect(filter).toBeChecked();
    const selectedContainer = await resolvedColor(filter, 'var(--secondary-container)');
    const selectedLabel = await resolvedColor(filter, 'var(--on-secondary-container)');
    await expect(filter.locator('.m3-chip__surface')).toHaveCSS(
      'background-color',
      selectedContainer,
    );
    await expect(filter.locator('.m3-chip__label')).toHaveCSS('color', selectedLabel);
    expect(
      await visual.evaluate((element) =>
        getComputedStyle(element).getPropertyValue('--_chip-outline-width').trim(),
      ),
    ).toBe('0px');

    await filter.focus();
    await page.keyboard.press('Space');
    await expect(filter).not.toBeChecked();
  });

  test('flat FilterChip uses the runtime Level1 hover elevation', async ({ page }) => {
    await openStory(page, 'components-chip--selectable-states');
    const filter = page.getByRole('checkbox', { name: 'Filter', exact: true });
    await filter.hover();
    await expect(filter.locator('.m3-elevation')).toHaveAttribute('data-elevation', 'level1');
  });

  test('InputChip gives avatar precedence and applies dynamic padding', async ({ page }) => {
    await openStory(page, 'components-chip--selectable-states');
    const input = page.getByRole('checkbox', { name: 'Input', exact: true });
    await expect(input.locator('.m3-chip__avatar')).toHaveCount(1);
    await expect(input.locator('.m3-chip__leading-icon')).toHaveCount(0);
    await expect(input.locator('.m3-chip__avatar')).toHaveCSS('width', '24px');
    await expect(input.locator('.m3-chip__avatar')).toHaveCSS('height', '24px');

    const content = input.locator('.m3-chip__content');
    await expect(content).toHaveCSS('padding-inline-start', '4px');
    await expect(content).toHaveCSS('padding-inline-end', '8px');
  });

  test('disabled elevated FilterChip uses OnSurface alpha for container and content', async ({
    page,
  }) => {
    await openStory(page, 'components-chip--disabled-states');
    const filter = page.getByRole('checkbox', {
      name: 'Elevated filter',
      exact: true,
    });
    await expect(filter).toBeDisabled();

    const container = await resolvedColor(
      filter,
      'color-mix(in srgb, var(--on-surface) 12%, transparent)',
    );
    const content = await resolvedColor(
      filter,
      'color-mix(in srgb, var(--on-surface) 38%, transparent)',
    );
    await expect(filter.locator('.m3-chip__surface')).toHaveCSS('background-color', container);
    await expect(filter.locator('.m3-chip__label')).toHaveCSS('color', content);
    await expect(filter.locator('.m3-elevation')).toHaveAttribute('data-elevation', 'level0');
  });

  test('press ripple stays on the 32px visual surface', async ({ page }) => {
    await openStory(page, 'components-chip--action-variants');
    const chip = page.getByRole('button', { name: 'Assist', exact: true });
    const visual = chip.locator('.m3-chip__visual');
    const box = await visual.boundingBox();
    expect(box).not.toBeNull();

    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.mouse.down();
    await expect(chip).toHaveAttribute('data-pressed', 'true');
    await expect(chip.locator('.m3-ripple__wave')).toHaveCount(1);
    const rippleGeometry = await chip.locator('.m3-ripple').evaluate((element) => {
      const ripple = element.getBoundingClientRect();
      const surface = element.closest('.m3-chip__surface')!.getBoundingClientRect();
      return { ripple: [ripple.width, ripple.height], surface: [surface.width, surface.height] };
    });
    expect(rippleGeometry.ripple).toEqual(rippleGeometry.surface);
    expect(rippleGeometry.ripple[1]).toBe(32);
    await page.mouse.up();
  });

  test('moves keyboard focus indication between opacity and inset-ring modes', async ({ page }) => {
    await openStory(page, 'components-chip--focus-modes');
    const chips = page.locator('.m3-chip');

    await page.keyboard.press('Tab');
    await expect(chips.nth(0)).toBeFocused();
    const opacityRipple = chips.nth(0).locator('.m3-ripple');
    await expect(opacityRipple).toHaveAttribute('data-focus-visible', 'true');
    await expect(opacityRipple.locator('.m3-ripple__state-layer')).toHaveCSS('opacity', '0.1');

    await page.keyboard.press('Tab');
    await expect(chips.nth(1)).toBeFocused();
    const insetRipple = chips.nth(1).locator('.m3-ripple');
    await expect(insetRipple).toHaveAttribute('data-inset-focus-visible', 'true');
    const ringGeometry = await insetRipple.locator('.m3-ripple__focus-ring').evaluate((element) => {
      const ring = element.getBoundingClientRect();
      const surface = element.closest('.m3-chip__surface')!.getBoundingClientRect();
      return {
        ring: [ring.width, ring.height],
        surface: [surface.width, surface.height],
        radius: getComputedStyle(element).borderRadius,
      };
    });
    expect(ringGeometry.ring).toEqual(ringGeometry.surface);
    expect(ringGeometry.ring[1]).toBe(32);
    expect(ringGeometry.radius).toBe('8px');
  });

  test('expressive shapes morph 12px → full → 8px pressed with compact spacing', async ({
    page,
  }) => {
    await openStory(page, 'components-chip--expressive-shapes');
    const filter = page.getByRole('checkbox', { name: 'Expressive filter', exact: true });
    const visual = filter.locator('.m3-chip__visual');

    await expect(visual).toHaveCSS('border-radius', '12px');
    await expect(filter.locator('.m3-chip__leading-icon')).toHaveCSS('margin-right', '0px');
    await expect(filter.locator('.m3-chip__label')).toHaveCSS('margin-left', '4px');
    await expect(filter.locator('.m3-chip__trailing-icon')).toHaveCSS('margin-left', '4px');

    await filter.click();
    await expect(filter).toBeChecked();
    await expect(visual).toHaveCSS('border-radius', '9999px');

    const box = await visual.boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.mouse.down();
    await expect(visual).toHaveCSS('border-radius', '8px');
    await expect(visual).toHaveCSS('transition-duration', '0.137s');
    await page.mouse.up();
  });

  test('theme matrix remains responsive', async ({ page }) => {
    await openStory(page, 'components-chip--theme-matrix');
    const themes = page.locator('.m3-storybook-theme-card');
    await expect(themes).toHaveCount(4);
    const overflow = await themes.evaluateAll((elements) =>
      elements.some((element) => element.scrollWidth > element.clientWidth),
    );
    expect(overflow).toBe(false);
  });
});
