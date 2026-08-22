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

test.describe('Material 3 Switch parity', () => {
  test('uses native switch semantics and toggles from pointer and keyboard input', async ({
    page,
  }) => {
    await openStory(page, 'components-switch--default');
    const control = page.getByRole('switch', { name: 'Switch label' });
    const root = page.locator('.m3-switch');

    await expect(control).not.toBeChecked();
    await root.click();
    await expect(control).toBeChecked();

    await control.focus();
    await page.keyboard.press('Space');
    await expect(control).not.toBeChecked();
  });

  test('matches track, target, thumb and thumb-content geometry', async ({ page }) => {
    await openStory(page, 'components-switch--states');
    const roots = page.locator('.m3-switch');

    const geometry = await roots.evaluateAll((elements) =>
      elements.map((element) => {
        const slot = element.querySelector<HTMLElement>('.m3-switch__control-slot')!;
        const track = element.querySelector<HTMLElement>('.m3-switch__track')!;
        const thumb = element.querySelector<HTMLElement>('.m3-switch__thumb-shell')!;
        const icon = element.querySelector<HTMLElement>('.m3-switch__icon');
        const trackBox = track.getBoundingClientRect();
        const thumbBox = thumb.getBoundingClientRect();
        const iconBox = icon?.getBoundingClientRect();
        return {
          slot: [slot.getBoundingClientRect().width, slot.getBoundingClientRect().height],
          track: [trackBox.width, trackBox.height],
          thumb: [thumbBox.width, thumbBox.height],
          offset: thumbBox.left - trackBox.left,
          icon: iconBox ? [iconBox.width, iconBox.height] : null,
        };
      }),
    );

    expect(geometry[0]).toMatchObject({
      slot: [52, 48],
      track: [52, 32],
      thumb: [16, 16],
      offset: 8,
      icon: null,
    });
    expect(geometry[1]).toMatchObject({ thumb: [24, 24], offset: 24 });
    expect(geometry[2]).toMatchObject({ thumb: [24, 24], offset: 4, icon: [16, 16] });
    expect(geometry[3]).toMatchObject({ thumb: [24, 24], offset: 24, icon: [16, 16] });
  });

  test('snaps to pressed geometry and uses FastSpatial when released', async ({ page }) => {
    await openStory(page, 'components-switch--default');
    const root = page.locator('.m3-switch');
    const track = root.locator('.m3-switch__track');
    const thumb = root.locator('.m3-switch__thumb-shell');
    const rootBox = await root.boundingBox();
    expect(rootBox).not.toBeNull();

    await page.mouse.move(rootBox!.x + 20, rootBox!.y + rootBox!.height / 2);
    await page.mouse.down();
    await expect(root).toHaveAttribute('data-pressed', 'true');

    const pressed = await root.evaluate((element) => {
      const trackBox = element
        .querySelector<HTMLElement>('.m3-switch__track')!
        .getBoundingClientRect();
      const thumbElement = element.querySelector<HTMLElement>('.m3-switch__thumb-shell')!;
      const thumbBox = thumbElement.getBoundingClientRect();
      return {
        size: [thumbBox.width, thumbBox.height],
        offset: thumbBox.left - trackBox.left,
        duration: getComputedStyle(thumbElement).transitionDuration,
      };
    });
    expect(pressed.size).toEqual([28, 28]);
    expect(pressed.offset).toBe(2);
    expect(pressed.duration).toBe('0s');

    await page.mouse.up();
    await expect(root).not.toHaveAttribute('data-pressed', 'true');
    await expect(page.getByRole('switch', { name: 'Switch label' })).toBeChecked();
    await expect(thumb).toHaveCSS('transition-duration', '0.137s, 0.137s, 0.137s');
    await expect(track).toBeVisible();
  });

  test('keeps the 40px ambient-content state layer on the moving thumb', async ({ page }) => {
    await openStory(page, 'components-switch--states');
    const root = page.locator('.m3-switch').first();
    const onSurface = await resolvedColor(root, 'var(--on-surface)');

    await root.hover();
    const layer = root.locator('.m3-switch__state-layer .m3-ripple__state-layer');
    const layerBox = await layer.boundingBox();
    expect(layerBox && [layerBox.width, layerBox.height]).toEqual([40, 40]);
    await expect(layer).toHaveCSS('background-color', onSurface);
    await expect(layer).toHaveCSS('opacity', '0.08');
  });

  test('composites disabled colors over Surface rather than transparency', async ({ page }) => {
    await openStory(page, 'components-switch--disabled-states');
    const roots = page.locator('.m3-switch');
    const unchecked = roots.nth(0);
    const checked = roots.nth(1);

    const uncheckedTrack = await resolvedColor(
      unchecked,
      'color-mix(in srgb, var(--surface-container-highest) 12%, var(--surface))',
    );
    const uncheckedThumb = await resolvedColor(
      unchecked,
      'color-mix(in srgb, var(--on-surface) 38%, var(--surface))',
    );
    const checkedTrack = await resolvedColor(
      checked,
      'color-mix(in srgb, var(--on-surface) 12%, var(--surface))',
    );
    const surface = await resolvedColor(checked, 'var(--surface)');

    await expect(page.getByRole('switch', { name: 'Unchecked' })).toBeDisabled();
    await expect(unchecked.locator('.m3-switch__track')).toHaveCSS(
      'background-color',
      uncheckedTrack,
    );
    await expect(unchecked.locator('.m3-switch__thumb')).toHaveCSS(
      'background-color',
      uncheckedThumb,
    );
    await expect(checked.locator('.m3-switch__track')).toHaveCSS(
      'background-color',
      checkedTrack,
    );
    await expect(checked.locator('.m3-switch__thumb')).toHaveCSS(
      'background-color',
      surface,
    );
  });

  test('moves focus indication from thumb to track in inset-ring mode', async ({ page }) => {
    await openStory(page, 'components-switch--focus-modes');
    const switches = page.getByRole('switch');

    await page.keyboard.press('Tab');
    await expect(switches.nth(0)).toBeFocused();
    const opacityRoot = page.locator('.m3-switch').nth(0);
    const opacityThumbRipple = opacityRoot.locator(
      '.m3-switch__state-layer .m3-ripple',
    );
    await expect(opacityThumbRipple).toHaveAttribute('data-focus-visible', 'true');
    await expect(
      opacityThumbRipple.locator('.m3-ripple__state-layer'),
    ).toHaveCSS('opacity', '0.1');

    await page.keyboard.press('Tab');
    await expect(switches.nth(1)).toBeFocused();
    const insetRoot = page.locator('.m3-switch').nth(1);
    const trackRipple = insetRoot.locator('.m3-switch__track > .m3-ripple');
    const thumbRipple = insetRoot.locator('.m3-switch__state-layer .m3-ripple');
    await expect(trackRipple).toHaveAttribute('data-inset-focus-visible', 'true');
    await expect(thumbRipple).not.toHaveAttribute('data-focus-visible', 'true');
    await expect(thumbRipple.locator('.m3-ripple__state-layer')).toHaveCSS('opacity', '0');

    const ring = trackRipple.locator('.m3-ripple__focus-ring');
    const geometry = await ring.evaluate((element) => {
      const box = element.getBoundingClientRect();
      return {
        size: [box.width, box.height],
        radius: getComputedStyle(element).borderRadius,
      };
    });
    expect(geometry.size).toEqual([52, 32]);
    expect(geometry.radius).toBe('16px');
  });

  test('mirrors thumb placement in RTL using logical positioning', async ({ page }) => {
    await openStory(page, 'components-switch--states');
    await page.evaluate(() => {
      document.documentElement.dir = 'rtl';
    });
    const root = page.locator('.m3-switch').first();
    const geometry = await root.evaluate((element) => {
      const track = element.querySelector<HTMLElement>('.m3-switch__track')!;
      const thumb = element.querySelector<HTMLElement>('.m3-switch__thumb-shell')!;
      const trackBox = track.getBoundingClientRect();
      const thumbBox = thumb.getBoundingClientRect();
      return trackBox.right - thumbBox.right;
    });
    expect(geometry).toBe(8);
  });

  test('read-only web translation preserves selection', async ({ page }) => {
    await openStory(page, 'components-switch--read-only');
    const control = page.getByRole('switch', { name: 'Read-only' });
    const root = page.locator('.m3-switch');
    await expect(control).toBeChecked();
    await root.click();
    await expect(control).toBeChecked();
  });
});
