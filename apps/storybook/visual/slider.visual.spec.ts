import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => { await document.fonts.ready; });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

test.describe('Material 3 Slider browser contract', () => {
  test('single slider keeps RAC semantics and Compose interaction geometry', async ({ page }) => {
    await openStory(page, 'components-slider--default');
    const slider = page.getByRole('slider', { name: 'Volume' });
    const nub = page.locator('.m3-slider__handle-nub');

    await expect(slider).toHaveAttribute('aria-valuemin', '0');
    await expect(slider).toHaveAttribute('aria-valuemax', '100');
    await expect(slider).toHaveAttribute('aria-valuenow', '40');
    expect((await nub.boundingBox())?.width).toBe(4);
    expect((await nub.boundingBox())?.height).toBe(44);

    await slider.focus();
    expect((await nub.boundingBox())?.width).toBe(2);
    await page.keyboard.press('ArrowRight');
    await expect(slider).toHaveAttribute('aria-valuenow', '41');
  });

  test('range slider constrains each RAC thumb to the other thumb', async ({ page }) => {
    await openStory(page, 'components-slider--range');
    const start = page.getByRole('slider', { name: 'Minimum price' });
    const end = page.getByRole('slider', { name: 'Maximum price' });

    await expect(start).toHaveAttribute('aria-valuenow', '25');
    await expect(start).toHaveAttribute('aria-valuemax', '75');
    await expect(end).toHaveAttribute('aria-valuenow', '75');
    await expect(end).toHaveAttribute('aria-valuemin', '25');
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
      const root = page.locator(`.m3-slider[data-size="${size}"]`);
      const segment = root.locator('.m3-slider__segment--active');
      const nub = root.locator('.m3-slider__handle-nub');
      expect((await segment.boundingBox())?.height).toBe(trackHeight);
      expect((await nub.boundingBox())?.height).toBe(handleHeight);
    }
  });

  test('discrete ticks and value indicators remain explicit web adaptations', async ({ page }) => {
    await openStory(page, 'components-slider--discrete-ticks');
    const single = page.locator('.m3-slider').first();
    await expect(single.locator('.m3-slider__tick')).toHaveCount(6);

    const slider = page.getByRole('slider', { name: 'Rating' });
    await slider.focus();
    await expect(single.locator('.m3-slider__value-indicator')).toHaveText('60');
  });

  test('vertical orientation swaps the canonical handle axes', async ({ page }) => {
    await openStory(page, 'components-slider--vertical');
    const slider = page.getByRole('slider', { name: 'Vertical volume' });
    await expect(slider).toHaveAttribute('aria-orientation', 'vertical');
    const nub = page.locator('.m3-slider').first().locator('.m3-slider__handle-nub');
    const box = await nub.boundingBox();
    expect(box?.width).toBe(44);
    expect(box?.height).toBe(4);
  });
});
