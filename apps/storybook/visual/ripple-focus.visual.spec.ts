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

async function pseudoStyle(
  ring: Locator,
  pseudo: '::before' | '::after',
  property: string,
) {
  return ring.evaluate(
    (element, input) => getComputedStyle(element, input.pseudo).getPropertyValue(input.property),
    { pseudo, property },
  );
}

test.describe('Material 3 ripple focus parity', () => {
  test('keeps opacity focus as the default configuration', async ({ page }) => {
    await openStory(page, 'foundations-ripplefocus--opacity');
    const button = page.getByRole('button', { name: 'Button' });

    await page.keyboard.press('Tab');
    await expect(button).toBeFocused();

    const ripple = button.locator('.m3-ripple');
    await expect(ripple).toHaveAttribute('data-focus-visible', 'true');
    await expect(ripple).not.toHaveAttribute('data-inset-focus-visible', 'true');
    await expect(ripple.locator('.m3-ripple__focus-ring')).toHaveCount(0);
    await expect(ripple.locator('.m3-ripple__state-layer')).toHaveCSS('opacity', '0.1');
  });

  test('matches Compose inset ring dimensions, colors and Button indication bounds', async ({
    page,
  }) => {
    await openStory(page, 'foundations-ripplefocus--inset-ring');
    const button = page.getByRole('button', { name: 'Button' });

    await page.keyboard.press('Tab');
    await expect(button).toBeFocused();

    const ripple = button.locator('.m3-ripple');
    const ring = ripple.locator('.m3-ripple__focus-ring');
    await expect(ripple).toHaveAttribute('data-inset-focus-visible', 'true');
    await expect(ripple).not.toHaveAttribute('data-focus-visible', 'true');
    await expect(ripple.locator('.m3-ripple__state-layer')).toHaveCSS('opacity', '0');

    await expect
      .poll(() => pseudoStyle(ring, '::before', 'border-top-width'))
      .toBe('3px');
    await expect
      .poll(() => pseudoStyle(ring, '::after', 'border-top-width'))
      .toBe('2px');
    await expect.poll(() => pseudoStyle(ring, '::before', 'top')).toBe('1px');
    await expect.poll(() => pseudoStyle(ring, '::after', 'top')).toBe('0px');

    const secondary = await resolvedColor(button, 'var(--secondary)');
    const onSecondary = await resolvedColor(button, 'var(--on-secondary)');
    expect(await pseudoStyle(ring, '::after', 'border-top-color')).toBe(secondary);
    expect(await pseudoStyle(ring, '::before', 'border-top-color')).toBe(onSecondary);

    const geometry = await button.evaluate((element) => {
      const buttonBox = element.getBoundingClientRect();
      const ringBox = element
        .querySelector<HTMLElement>('.m3-ripple__focus-ring')!
        .getBoundingClientRect();
      return {
        button: [buttonBox.width, buttonBox.height],
        ring: [ringBox.width, ringBox.height],
      };
    });
    expect(geometry.ring).toEqual(geometry.button);
    expect(geometry.button[1]).toBe(40);
  });

  test('separates Checkbox and Radio indication bounds from 48px touch targets', async ({
    page,
  }) => {
    await openStory(page, 'foundations-ripplefocus--inset-ring');

    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('checkbox', { name: 'Checkbox' })).toBeFocused();

    const checkboxRoot = page.locator('.m3-checkbox');
    const checkboxSlot = checkboxRoot.locator('.m3-checkbox__control-slot');
    const checkboxStateLayer = checkboxRoot.locator('.m3-ripple__state-layer');
    const checkboxRing = checkboxRoot.locator('.m3-ripple__focus-ring');
    const checkboxGeometry = await checkboxRoot.evaluate((element) => {
      const slot = element.querySelector<HTMLElement>('.m3-checkbox__control-slot')!;
      const stateLayer = element.querySelector<HTMLElement>('.m3-ripple__state-layer')!;
      const ring = element.querySelector<HTMLElement>('.m3-ripple__focus-ring')!;
      const slotBox = slot.getBoundingClientRect();
      const stateLayerBox = stateLayer.getBoundingClientRect();
      const ringBox = ring.getBoundingClientRect();
      return {
        target: [slotBox.width, slotBox.height],
        stateLayer: [stateLayerBox.width, stateLayerBox.height],
        ring: [ringBox.width, ringBox.height],
        radius: getComputedStyle(ring).borderRadius,
      };
    });
    await expect(checkboxSlot).toBeVisible();
    await expect(checkboxStateLayer).toBeVisible();
    await expect(checkboxRing).toBeVisible();
    expect(checkboxGeometry.target).toEqual([48, 48]);
    expect(checkboxGeometry.stateLayer).toEqual([40, 40]);
    expect(checkboxGeometry.ring).toEqual([18, 18]);
    expect(checkboxGeometry.radius).toBe('25%');

    await page.keyboard.press('Tab');
    await expect(page.getByRole('radio', { name: 'Radio' })).toBeFocused();

    const radioRoot = page.locator('.m3-radio-button');
    const radioGeometry = await radioRoot.evaluate((element) => {
      const slot = element.querySelector<HTMLElement>('.m3-radio-button__control-slot')!;
      const stateLayer = element.querySelector<HTMLElement>('.m3-ripple__state-layer')!;
      const ring = element.querySelector<HTMLElement>('.m3-ripple__focus-ring')!;
      const slotBox = slot.getBoundingClientRect();
      const stateLayerBox = stateLayer.getBoundingClientRect();
      const ringBox = ring.getBoundingClientRect();
      return {
        target: [slotBox.width, slotBox.height],
        stateLayer: [stateLayerBox.width, stateLayerBox.height],
        ring: [ringBox.width, ringBox.height],
        radius: getComputedStyle(ring).borderRadius,
      };
    });
    expect(radioGeometry.target).toEqual([48, 48]);
    expect(radioGeometry.stateLayer).toEqual([40, 40]);
    expect(radioGeometry.ring).toEqual([24, 24]);
    expect(radioGeometry.radius).toBe('50%');
  });

  test('keeps inset focus ring while a newer hover state layer is active', async ({ page }) => {
    await openStory(page, 'foundations-ripplefocus--inset-ring');
    const button = page.getByRole('button', { name: 'Button' });

    await page.keyboard.press('Tab');
    await expect(button).toBeFocused();
    await button.hover();

    const ripple = button.locator('.m3-ripple');
    await expect(ripple).toHaveAttribute('data-inset-focus-visible', 'true');
    await expect(ripple).toHaveAttribute('data-hovered', 'true');
    await expect(ripple.locator('.m3-ripple__state-layer')).toHaveCSS('opacity', '0.08');
    await expect
      .poll(() => pseudoStyle(ripple.locator('.m3-ripple__focus-ring'), '::after', 'border-top-width'))
      .toBe('2px');
  });
});
