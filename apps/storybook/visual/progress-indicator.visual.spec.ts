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

test.describe('Material 3 ProgressIndicator browser contract', () => {
  test('default range and standard linear geometry', async ({ page }) => {
    await openStory(page, 'components-progressindicator--default');
    const progress = page.getByRole('progressbar', { name: 'Loading progress' });
    const box = await progress.boundingBox();

    await expect(progress).toHaveAttribute('aria-valuemin', '0');
    await expect(progress).toHaveAttribute('aria-valuemax', '1');
    await expect(progress).toHaveAttribute('aria-valuenow', '0.45');
    expect(box?.width).toBe(240);
    expect(box?.height).toBe(4);
  });

  test('standard linear and circular preserve determinate and indeterminate semantics', async ({ page }) => {
    await openStory(page, 'components-progressindicator--standard-types');
    const determinateLinear = page.getByRole('progressbar', { name: 'Linear 65 percent' });
    const indeterminateLinear = page.getByRole('progressbar', { name: 'Linear loading' });
    const determinateCircular = page.getByRole('progressbar', { name: 'Circular 65 percent' });
    const indeterminateCircular = page.getByRole('progressbar', { name: 'Circular loading' });

    await expect(determinateLinear).toHaveAttribute('aria-valuenow', '0.65');
    await expect(indeterminateLinear).not.toHaveAttribute('aria-valuenow');
    await expect(determinateCircular).toHaveAttribute('aria-valuenow', '0.65');
    await expect(indeterminateCircular).not.toHaveAttribute('aria-valuenow');

    expect((await determinateCircular.boundingBox())?.width).toBe(40);
    expect((await determinateCircular.boundingBox())?.height).toBe(40);
  });

  test('expressive wavy geometry uses canonical wave containers', async ({ page }) => {
    await openStory(page, 'components-progressindicator--expressive-wavy');
    const linear = page.getByRole('progressbar', { name: 'Wavy linear 60 percent' });
    const circular = page.getByRole('progressbar', { name: 'Wavy circular 60 percent' });

    const linearBox = await linear.boundingBox();
    const circularBox = await circular.boundingBox();
    expect(linearBox?.width).toBe(240);
    expect(linearBox?.height).toBe(10);
    expect(circularBox?.width).toBe(48);
    expect(circularBox?.height).toBe(48);
  });

  test('four-color and buffer remain explicit web adaptations', async ({ page }) => {
    await openStory(page, 'components-progressindicator--four-color');
    const fourColor = page.getByRole('progressbar', { name: 'Four color linear loading' });
    await expect(fourColor).toHaveAttribute('data-four-color', 'true');
    await expect(fourColor).not.toHaveAttribute('aria-valuenow');

    await openStory(page, 'components-progressindicator--buffer');
    const buffer = page.getByRole('progressbar', { name: 'Buffered download' });
    await expect(buffer).toHaveAttribute('data-buffer', '0.8');
    await expect(buffer).toHaveAttribute('aria-valuenow', '0.45');
  });
});
