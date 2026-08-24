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

test.describe('Material 3 LoadingIndicator browser contract', () => {
  test('indeterminate semantics and canonical 48px container', async ({ page }) => {
    await openStory(page, 'components-loadingindicator--default');
    const progress = page.getByRole('progressbar', { name: 'Loading' });
    const box = await progress.boundingBox();

    await expect(progress).toHaveAttribute('data-mode', 'indeterminate');
    await expect(progress).not.toHaveAttribute('aria-valuenow');
    expect(box?.width).toBe(48);
    expect(box?.height).toBe(48);
    await expect(progress.locator('path')).toHaveAttribute('d', /^M.+Z$/);
  });

  test('determinate mode keeps RAC range semantics and morphs across progress', async ({ page }) => {
    await openStory(page, 'components-loadingindicator--determinate');
    const start = page.getByRole('progressbar', { name: 'Loading 0 percent' });
    const middle = page.getByRole('progressbar', { name: 'Loading 50 percent' });
    const end = page.getByRole('progressbar', { name: 'Loading 100 percent' });

    await expect(start).toHaveAttribute('aria-valuemin', '0');
    await expect(start).toHaveAttribute('aria-valuemax', '1');
    await expect(start).toHaveAttribute('aria-valuenow', '0');
    await expect(middle).toHaveAttribute('aria-valuenow', '0.5');
    await expect(end).toHaveAttribute('aria-valuenow', '1');

    const paths = await Promise.all(
      [start, middle, end].map((item) => item.locator('path').getAttribute('d')),
    );
    expect(new Set(paths).size).toBe(3);
  });

  test('contained variant exposes the canonical container treatment', async ({ page }) => {
    await openStory(page, 'components-loadingindicator--contained');
    const contained = page.getByRole('progressbar', { name: 'Contained loading' });
    const determinate = page.getByRole('progressbar', {
      name: 'Contained loading 60 percent',
    });

    await expect(contained).toHaveAttribute('data-contained', 'true');
    await expect(contained).not.toHaveAttribute('aria-valuenow');
    await expect(determinate).toHaveAttribute('aria-valuenow', '0.6');

    const styles = await contained.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        backgroundColor: style.backgroundColor,
        borderRadius: style.borderRadius,
      };
    });
    expect(styles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(styles.borderRadius).toBe('9999px');
  });

  test('reduced motion freezes the indeterminate frame', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'components-loadingindicator--default');
    const progress = page.getByRole('progressbar', { name: 'Loading' });
    const visual = progress.locator('svg');

    const before = await visual.evaluate((svg) => ({
      path: svg.querySelector('path')?.getAttribute('d'),
      transform: svg.querySelector('g')?.getAttribute('transform'),
    }));
    await page.waitForTimeout(120);
    const after = await visual.evaluate((svg) => ({
      path: svg.querySelector('path')?.getAttribute('d'),
      transform: svg.querySelector('g')?.getAttribute('transform'),
    }));

    expect(after).toEqual(before);
  });
});
