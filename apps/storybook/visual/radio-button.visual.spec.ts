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

async function resolvedColor(
  root: ReturnType<Page['locator']>,
  value: string,
): Promise<string> {
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

test.describe('Material 3 RadioButton parity', () => {
  test('uses native radio-group selection and keyboard semantics', async ({ page }) => {
    await openStory(page, 'components-radiobutton--states');
    const group = page.getByRole('radiogroup', { name: 'Radio states' });
    const selected = page.getByRole('radio', { name: 'Selected' });
    const unselected = page.getByRole('radio', { name: 'Unselected' });

    await expect(group).toBeVisible();
    await expect(selected).toBeChecked();
    await expect(unselected).not.toBeChecked();

    await selected.focus();
    await page.keyboard.press('ArrowDown');
    await expect(unselected).toBeFocused();
    await expect(unselected).toBeChecked();
    await expect(selected).not.toBeChecked();
  });

  test('matches Compose control and state-layer geometry', async ({ page }) => {
    await openStory(page, 'components-radiobutton--states');
    const roots = page.locator('.m3-radio-button');
    const selectedRoot = roots.nth(0);
    const unselectedRoot = roots.nth(1);

    const geometry = await selectedRoot.evaluate((element) => {
      const slot = element.querySelector<HTMLElement>('.m3-radio-button__control-slot')!;
      const stateLayer = element.querySelector<HTMLElement>('.m3-ripple__state-layer')!;
      const control = element.querySelector<HTMLElement>('.m3-radio-button__control')!;
      const dot = element.querySelector<HTMLElement>('.m3-radio-button__dot')!;
      const slotBox = slot.getBoundingClientRect();
      const stateLayerBox = stateLayer.getBoundingClientRect();
      const controlBox = control.getBoundingClientRect();
      const dotBox = dot.getBoundingClientRect();
      const controlStyle = getComputedStyle(control);

      return {
        slot: [slotBox.width, slotBox.height],
        stateLayer: [stateLayerBox.width, stateLayerBox.height],
        control: [controlBox.width, controlBox.height],
        dot: [dotBox.width, dotBox.height],
        borderWidth: controlStyle.borderTopWidth,
      };
    });

    expect(geometry.slot).toEqual([48, 48]);
    expect(geometry.stateLayer).toEqual([40, 40]);
    expect(geometry.control).toEqual([20, 20]);
    expect(geometry.dot).toEqual([10, 10]);
    expect(geometry.borderWidth).toBe('2px');

    const hiddenDotWidth = await unselectedRoot
      .locator('.m3-radio-button__dot')
      .evaluate((element) => element.getBoundingClientRect().width);
    expect(hiddenDotWidth).toBe(0);
  });

  test('maps selected and unselected runtime colors to theme roles', async ({ page }) => {
    await openStory(page, 'components-radiobutton--states');
    const roots = page.locator('.m3-radio-button');
    const selectedRoot = roots.nth(0);
    const unselectedRoot = roots.nth(1);
    const primary = await resolvedColor(selectedRoot, 'var(--primary)');
    const onSurfaceVariant = await resolvedColor(
      unselectedRoot,
      'var(--on-surface-variant)',
    );

    await expect(selectedRoot.locator('.m3-radio-button__control')).toHaveCSS(
      'color',
      primary,
    );
    await expect(unselectedRoot.locator('.m3-radio-button__control')).toHaveCSS(
      'color',
      onSurfaceVariant,
    );
  });

  test('disabled state snaps to OnSurface at 38 percent', async ({ page }) => {
    await openStory(page, 'components-radiobutton--disabled-states');
    const roots = page.locator('.m3-radio-button');
    const first = roots.nth(0);
    const expected = await resolvedColor(
      first,
      'color-mix(in srgb, var(--on-surface) 38%, transparent)',
    );

    await expect(page.getByRole('radio', { name: 'Selected' })).toBeDisabled();
    await expect(page.getByRole('radio', { name: 'Unselected' })).toBeDisabled();
    await expect(first.locator('.m3-radio-button__control')).toHaveCSS(
      'color',
      expected,
    );
    await expect(first.locator('.m3-radio-button__control')).toHaveCSS(
      'transition-duration',
      '0s',
    );
  });

  test('group label and orientation keep accessible relationships', async ({ page }) => {
    await openStory(page, 'components-radiobutton--horizontal-group');
    const group = page.getByRole('radiogroup', { name: 'Delivery speed' });

    await expect(group).toBeVisible();
    await expect(page.getByText('Choose one option')).toBeVisible();
    await expect(page.locator('.m3-radio-group')).toHaveClass(/m3-radio-group--horizontal/);
    await expect(page.getByRole('radio')).toHaveCount(3);
  });

  test('control-only radios retain explicit accessible names', async ({ page }) => {
    await openStory(page, 'components-radiobutton--control-only');
    await expect(page.getByRole('radio', { name: 'Selected control' })).toBeChecked();
    await expect(page.getByRole('radio', { name: 'Unselected control' })).not.toBeChecked();
  });

  test('theme matrix stays inside parent width constraints', async ({ page }) => {
    await openStory(page, 'components-radiobutton--theme-matrix');
    const cards = page.locator('.m3-storybook-theme-card');
    await expect(cards).toHaveCount(4);

    const hasOverflow = await cards.evaluateAll((elements) =>
      elements.some((element) => element.scrollWidth > element.clientWidth),
    );
    expect(hasOverflow).toBe(false);
  });
});
