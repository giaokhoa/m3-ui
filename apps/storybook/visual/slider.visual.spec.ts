import { expect, test, type Page } from '@playwright/test';
import { setDocumentDirection } from '../test-support/browser';
import { openStory } from '../test-support/story';

async function pseudoWidth(locator: ReturnType<Page['locator']>): Promise<number> {
  return locator.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element, '::before').width),
  );
}

test.describe('Material 3 Slider browser contract', () => {
  test('single slider keeps RAC native semantics and Compose interaction geometry', async ({ page }) => {
    await openStory(page, 'components-slider--default');
    const slider = page.getByRole('slider', { name: 'Volume' });
    const track = page.locator('.slider__track');
    const activeSegment = page.locator('.slider__segment--active');
    const nub = page.locator('.slider__handle-nub');
    const stop = page.locator('.slider__stop');

    await expect(slider).toHaveAttribute('min', '0');
    await expect(slider).toHaveAttribute('max', '100');
    await expect(slider).toHaveValue('40');
    await expect(slider).toHaveAttribute('aria-valuetext', '40');
    expect((await nub.boundingBox())?.width).toBe(4);
    expect((await nub.boundingBox())?.height).toBe(44);

    const activeBox = await activeSegment.boundingBox();
    expect(await pseudoWidth(activeSegment)).toBeCloseTo((activeBox?.width ?? 0) - 8, 1);

    const trackBox = await track.boundingBox();
    const stopBox = await stop.boundingBox();
    expect(
      (trackBox?.x ?? 0) + (trackBox?.width ?? 0) -
        ((stopBox?.x ?? 0) + (stopBox?.width ?? 0)),
    ).toBeCloseTo(4, 1);

    await slider.focus();
    expect((await nub.boundingBox())?.width).toBe(2);
    expect(await pseudoWidth(activeSegment)).toBeCloseTo((activeBox?.width ?? 0) - 7, 1);
    await page.keyboard.press('ArrowRight');
    await expect(slider).toHaveValue('41');
    await expect(slider).toHaveAttribute('aria-valuetext', '41');
  });

  test('range slider constrains each RAC native thumb to the other thumb', async ({ page }) => {
    await openStory(page, 'components-slider--range');
    const start = page.getByRole('slider', { name: 'Minimum price' });
    const end = page.getByRole('slider', { name: 'Maximum price' });

    await expect(start).toHaveValue('25');
    await expect(start).toHaveAttribute('min', '0');
    await expect(start).toHaveAttribute('max', '75');
    await expect(end).toHaveValue('75');
    await expect(end).toHaveAttribute('min', '25');
    await expect(end).toHaveAttribute('max', '100');
  });

  test('all five canonical sizes project their track and handle geometry', async ({ page }) => {
    await openStory(page, 'components-slider--size-family');
    const expectations = [
      ['xSmall', 16, 44],
      ['small', 24, 44],
      ['medium', 40, 44],
      ['large', 56, 68],
      ['xLarge', 96, 108],
    ] as const;

    for (const [size, trackHeight, handleHeight] of expectations) {
      const root = page.locator(`.slider[data-size="${size}"]`);
      const segment = root.locator('.slider__segment--active');
      const nub = root.locator('.slider__handle-nub');
      expect((await segment.boundingBox())?.height).toBe(trackHeight);
      expect((await nub.boundingBox())?.height).toBe(handleHeight);
    }
  });

  test('discrete ticks and value indicators remain explicit web adaptations', async ({ page }) => {
    await openStory(page, 'components-slider--discrete-ticks');
    const single = page.locator('.slider').first();
    await expect(single.locator('.slider__tick')).toHaveCount(6);

    const slider = page.getByRole('slider', { name: 'Rating' });
    await slider.focus();
    await expect(single.locator('.slider__value-indicator')).toHaveText('60');
  });

  test('vertical orientation swaps the canonical handle axes', async ({ page }) => {
    await openStory(page, 'components-slider--vertical');
    const slider = page.getByRole('slider', { name: 'Vertical volume' });
    await expect(slider).toHaveAttribute('aria-orientation', 'vertical');
    const nub = page.locator('.slider').first().locator('.slider__handle-nub');
    const box = await nub.boundingBox();
    expect(box?.width).toBe(44);
    expect(box?.height).toBe(4);
  });

  test('disabled single and range thumbs keep native disabled semantics', async ({ page }) => {
    await openStory(page, 'components-slider--disabled');
    await expect(
      page.getByRole('slider', { name: 'Disabled single' }),
    ).toBeDisabled();
    await expect(
      page.getByRole('slider', { name: 'Disabled start' }),
    ).toBeDisabled();
    await expect(
      page.getByRole('slider', { name: 'Disabled end' }),
    ).toBeDisabled();
  });

  test('anchors the active horizontal track to logical inline start in RTL', async ({ page }) => {
    await openStory(page, 'components-slider--default');
    await setDocumentDirection(page, 'rtl');

    const track = page.locator('.slider__track');
    const active = page.locator('.slider__segment--active');
    const [trackBox, activeBox] = await Promise.all([
      track.boundingBox(),
      active.boundingBox(),
    ]);
    expect(trackBox).not.toBeNull();
    expect(activeBox).not.toBeNull();
    expect(
      Math.abs(trackBox!.x + trackBox!.width - (activeBox!.x + activeBox!.width)),
      'active track should remain attached to logical inline-start (the right edge in RTL)',
    ).toBeLessThanOrEqual(1);
  });

  test('removes handle and value-indicator transitions under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'components-slider--discrete-ticks');
    const slider = page.getByRole('slider', { name: 'Rating' });
    await slider.focus();
    const root = page.locator('.slider').first();
    await expect(root.locator('.slider__handle')).toHaveCSS(
      'transition-duration',
      '0s',
    );
    await expect(root.locator('.slider__handle-nub')).toHaveCSS(
      'transition-duration',
      '0s',
    );
    await expect(root.locator('.slider__value-indicator')).toHaveCSS(
      'transition-duration',
      '0s',
    );
  });
});
