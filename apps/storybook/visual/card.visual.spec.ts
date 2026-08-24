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

test.describe('Material 3 Card parity', () => {
  test('static variants keep Compose containers, shape and base elevations', async ({ page }) => {
    await openStory(page, 'components-card--variants');
    const cards = page.locator('.card');
    await expect(cards).toHaveCount(3);

    const values = await cards.evaluateAll((elements) =>
      elements.map((element) => {
        const rootStyle = getComputedStyle(element as HTMLElement);
        const surface = element.querySelector<HTMLElement>('.card__surface')!;
        const surfaceStyle = getComputedStyle(surface);
        const elevation = element.querySelector<HTMLElement>('.elevation')!;
        return {
          interactive: element.hasAttribute('data-interactive'),
          tabIndex: (element as HTMLElement).tabIndex,
          role: element.getAttribute('role'),
          radius: surfaceStyle.borderRadius,
          container: surfaceStyle.backgroundColor,
          outlineWidth: rootStyle.getPropertyValue('--_card-outline-width').trim(),
          elevation: elevation.dataset.elevation,
        };
      }),
    );

    expect(values[0]).toMatchObject({
      interactive: false,
      tabIndex: -1,
      role: null,
      radius: '12px',
      outlineWidth: '0px',
      elevation: 'level0',
    });
    expect(values[1]).toMatchObject({ elevation: 'level1', outlineWidth: '0px' });
    expect(values[2]).toMatchObject({ elevation: 'level0', outlineWidth: '1px' });
  });

  test('clickable cards are keyboard focusable without inventing a Compose role', async ({ page }) => {
    await openStory(page, 'components-card--clickable');
    const cards = page.locator('.card');
    const count = page.getByTestId('card-press-count');

    await expect(cards.first()).toHaveAttribute('data-interactive', 'true');
    await expect(cards.first()).toHaveAttribute('tabindex', '0');
    await expect(cards.first()).not.toHaveAttribute('role');
    await expect(count).toHaveText('Card presses: 0');

    await page.keyboard.press('Tab');
    await expect(cards.first()).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(count).toHaveText('Card presses: 1');
    await page.keyboard.press('Space');
    await expect(count).toHaveText('Card presses: 2');

    await cards.nth(1).click();
    await expect(count).toHaveText('Card presses: 3');
  });

  test('uses latest interaction to animate filled and elevated hover elevations', async ({ page }) => {
    await openStory(page, 'components-card--clickable');
    const cards = page.locator('.card');

    await cards.nth(0).hover();
    await expect(cards.nth(0).locator('.elevation')).toHaveAttribute('data-elevation', 'level1');
    await expect(cards.nth(0).locator('.elevation')).toHaveCSS('transition-duration', '0.12s');

    await cards.nth(1).hover();
    await expect(cards.nth(1).locator('.elevation')).toHaveAttribute('data-elevation', 'level2');
    await expect(cards.nth(0).locator('.elevation')).toHaveAttribute('data-elevation', 'level0');

    await cards.nth(2).hover();
    await expect(cards.nth(2).locator('.elevation')).toHaveAttribute('data-elevation', 'level1');
  });

  test('presses use full-surface ripple while elevation resolves to pressed state', async ({ page }) => {
    await openStory(page, 'components-card--clickable');
    const card = page.locator('.card').first();
    const box = await card.boundingBox();
    expect(box).not.toBeNull();

    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.mouse.down();
    await expect(card).toHaveAttribute('data-pressed', 'true');
    await expect(card.locator('.elevation')).toHaveAttribute('data-elevation', 'level0');
    await expect(card.locator('.ripple__wave')).toHaveCount(1);

    await page.mouse.up();
    await expect(card).not.toHaveAttribute('data-pressed', 'true');
  });

  test('disabled card colors match Compose alpha/composite behavior', async ({ page }) => {
    await openStory(page, 'components-card--disabled');
    const cards = page.locator('.card');
    const filled = cards.nth(0);
    const elevated = cards.nth(1);
    const outlined = cards.nth(2);

    const filledContainer = await resolvedColor(
      filled,
      'color-mix(in srgb, var(--surface-variant) 38%, var(--surface-container-highest))',
    );
    const elevatedContainer = await resolvedColor(
      elevated,
      'color-mix(in srgb, var(--surface) 38%, var(--surface))',
    );
    const disabledContent = await resolvedColor(
      filled,
      'color-mix(in srgb, var(--on-surface) 38%, transparent)',
    );

    await expect(filled).toHaveAttribute('aria-disabled', 'true');
    await expect(filled).toHaveAttribute('tabindex', '-1');
    await expect(filled.locator('.card__surface')).toHaveCSS('background-color', filledContainer);
    await expect(elevated.locator('.card__surface')).toHaveCSS(
      'background-color',
      elevatedContainer,
    );
    await expect(filled).toHaveCSS('color', disabledContent);

    const outlinedStyle = await outlined.evaluate((element) =>
      getComputedStyle(element).getPropertyValue('--_card-disabled-outline-color').trim(),
    );
    const outlinedResolved = await resolvedColor(outlined, outlinedStyle);
    const expectedOutlined = await resolvedColor(
      outlined,
      'color-mix(in srgb, var(--outline) 12%, var(--surface-container-low))',
    );
    expect(outlinedResolved).toBe(expectedOutlined);
  });

  test('moves keyboard focus indication between opacity and inset-ring modes', async ({ page }) => {
    await openStory(page, 'components-card--focus-modes');
    const cards = page.locator('.card');

    await page.keyboard.press('Tab');
    await expect(cards.nth(0)).toBeFocused();
    const opacityRipple = cards.nth(0).locator('.ripple');
    await expect(opacityRipple).toHaveAttribute('data-focus-visible', 'true');
    await expect(opacityRipple.locator('.ripple__state-layer')).toHaveCSS('opacity', '0.1');

    await page.keyboard.press('Tab');
    await expect(cards.nth(1)).toBeFocused();
    const insetRipple = cards.nth(1).locator('.ripple');
    await expect(insetRipple).toHaveAttribute('data-inset-focus-visible', 'true');
    const ring = insetRipple.locator('.ripple__focus-ring');
    const geometry = await ring.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const surface = element.closest('.card__surface')!.getBoundingClientRect();
      return {
        ring: [box.width, box.height],
        surface: [surface.width, surface.height],
        radius: getComputedStyle(element).borderRadius,
      };
    });
    expect(geometry.ring).toEqual(geometry.surface);
    expect(geometry.radius).toBe('12px');
  });

  test('nested child actions do not activate the clickable card parent', async ({ page }) => {
    await openStory(page, 'components-card--nested-action');
    const cardCount = page.getByTestId('nested-card-count');
    const buttonCount = page.getByTestId('nested-button-count');

    await page.getByRole('button', { name: 'Child action' }).click();
    await expect(buttonCount).toHaveText('Button presses: 1');
    await expect(cardCount).toHaveText('Card presses: 0');

    await page.getByText('Card with child action').click();
    await expect(cardCount).toHaveText('Card presses: 1');
  });

  test('allows an explicit web role without forcing it on Compose parity defaults', async ({ page }) => {
    await openStory(page, 'components-card--role-opt-in');
    const card = page.getByRole('button', { name: 'Action card' });
    await expect(card).toBeVisible();
    await expect(card).toHaveClass(/card/);
  });

  test('supports a shape override while preserving card clipping', async ({ page }) => {
    await openStory(page, 'components-card--custom-shape');
    const card = page.locator('.card');
    await expect(card.locator('.card__surface')).toHaveCSS('border-radius', '4px');
    await expect(card.locator('.elevation')).toHaveCSS('border-radius', '4px');
  });

  test('theme matrix remains responsive', async ({ page }) => {
    await openStory(page, 'components-card--theme-matrix');
    const cards = page.locator('.storybook-theme-card');
    await expect(cards).toHaveCount(4);
    const overflow = await cards.evaluateAll((elements) =>
      elements.some((element) => element.scrollWidth > element.clientWidth),
    );
    expect(overflow).toBe(false);
  });
});
