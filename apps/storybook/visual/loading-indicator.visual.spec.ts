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

async function installReactCommitCounter(page: Page) {
  await page.addInitScript(() => {
    const runtime = window as Window & {
      __loadingIndicatorReactCommits?: number;
      __REACT_DEVTOOLS_GLOBAL_HOOK__?: {
        supportsFiber: boolean;
        inject: () => number;
        onCommitFiberRoot: () => void;
        onCommitFiberUnmount: () => void;
      };
    };
    let nextRendererId = 1;
    runtime.__loadingIndicatorReactCommits = 0;
    runtime.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
      supportsFiber: true,
      inject: () => nextRendererId++,
      onCommitFiberRoot: () => {
        runtime.__loadingIndicatorReactCommits =
          (runtime.__loadingIndicatorReactCommits ?? 0) + 1;
      },
      onCommitFiberUnmount: () => {},
    };
  });
}

async function reactCommitCount(page: Page) {
  return page.evaluate(
    () =>
      (window as Window & { __loadingIndicatorReactCommits?: number })
        .__loadingIndicatorReactCommits ?? 0,
  );
}
test.describe('Material 3 LoadingIndicator browser contract', () => {
  test('indeterminate animation advances without per-frame React commits', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await installReactCommitCounter(page);
    await openStory(page, 'components-loadingindicator--default');
    const progress = page.getByRole('progressbar', { name: 'Loading' });
    const box = await progress.boundingBox();

    await expect(progress).toHaveAttribute('data-mode', 'indeterminate');
    await expect(progress).not.toHaveAttribute('aria-valuenow');
    expect(box?.width).toBe(48);
    expect(box?.height).toBe(48);
    const visual = progress.locator('svg');
    await expect(visual.locator('path')).toHaveAttribute('d', /^M.+Z$/);
    await page.waitForTimeout(100);
    const beforeCommits = await reactCommitCount(page);
    const before = await visual.evaluate((svg) => ({
      path: svg.querySelector('path')?.getAttribute('d'),
      transform: svg.querySelector('g')?.getAttribute('transform'),
    }));
    await page.waitForTimeout(180);
    const after = await visual.evaluate((svg) => ({
      path: svg.querySelector('path')?.getAttribute('d'),
      transform: svg.querySelector('g')?.getAttribute('transform'),
    }));
    const afterCommits = await reactCommitCount(page);

    expect(after).not.toEqual(before);
    expect(afterCommits).toBe(beforeCommits);
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
    const contained = page.getByRole('progressbar', {
      name: 'Contained loading',
      exact: true,
    });
    const determinate = page.getByRole('progressbar', {
      name: 'Contained loading 60 percent',
      exact: true,
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
