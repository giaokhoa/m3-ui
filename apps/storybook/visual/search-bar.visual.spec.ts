import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

function close(actual: number | undefined, expected: number) {
  expect(actual).not.toBeUndefined();
  expect(Math.abs((actual ?? 0) - expected)).toBeLessThan(0.8);
}

test.describe('Material 3 SearchBar browser contract', () => {
  test('collapsed bar uses 360x56 minimum geometry and native search semantics', async ({ page }) => {
    await openStory(page, 'components-searchbar--default');
    const bar = page.getByTestId('search-bar');
    const input = page.getByRole('searchbox', { name: 'Search' });
    const box = await bar.boundingBox();
    close(box?.width, 360);
    close(box?.height, 56);
    await expect(input).toHaveAttribute('type', 'search');
    await input.fill('tokens');
    await expect(page.getByTestId('query-value')).toHaveText('tokens');
    await expect(bar).toHaveAttribute('data-state', 'expanded');
  });

  test('clear action empties the controlled value and returns focus', async ({ page }) => {
    await openStory(page, 'components-searchbar--default');
    const input = page.getByRole('searchbox', { name: 'Search' });
    await input.fill('material');
    await page.getByRole('button', { name: 'Clear search' }).click();
    await expect(input).toHaveValue('');
    await expect(input).toBeFocused();
  });

  test('docked expanded surface uses the 56px header, moves focus and dismisses outside/Escape', async ({ page }) => {
    await openStory(page, 'components-searchbar--docked-expanded');
    const view = page.getByTestId('search-view-docked');
    const header = view.locator('.search-view__header');
    const input = view.getByRole('searchbox', { name: 'Search' });
    close((await view.boundingBox())?.width, 360);
    close((await header.boundingBox())?.height, 56);
    expect((await view.boundingBox())?.height).toBeGreaterThanOrEqual(240);
    await expect(input).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(view).toHaveCount(0);
    await expect(page.getByTestId('state-value')).toHaveText('collapsed');

    await openStory(page, 'components-searchbar--docked-expanded');
    await page.mouse.click(750, 480);
    await expect(page.getByTestId('search-view-docked')).toHaveCount(0);
  });

  test('fullscreen fills viewport, uses a 72px header, transfers/traps focus and restores it on Escape', async ({ page }) => {
    await openStory(page, 'components-searchbar--full-screen-expanded');
    const trigger = page.getByTestId('background-button');
    await trigger.focus();
    await trigger.click();

    const view = page.getByTestId('search-view-fullscreen');
    await view.evaluate(async (element) => {
      await Promise.all(element.getAnimations().map((animation) => animation.finished));
    });

    const viewport = page.viewportSize();
    const box = await view.boundingBox();
    close(box?.width, viewport?.width ?? 0);
    close(box?.height, viewport?.height ?? 0);
    close((await view.locator('.search-view__header').boundingBox())?.height, 72);
    await expect(view.getByRole('searchbox', { name: 'Search' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(trigger).not.toBeFocused();
    await page.keyboard.press('Escape');
    await expect(view).toHaveCount(0);
    await expect(page.getByTestId('state-value')).toHaveText('collapsed');
    await expect(trigger).toBeFocused();
  });

  test('honors reduced motion and logical RTL ordering', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'components-searchbar--docked-expanded');
    const animation = await page.getByTestId('search-view-docked').evaluate((element) => getComputedStyle(element).animationName);
    expect(animation).toBe('none');

    await openStory(page, 'components-searchbar--rtl');
    const shell = page.locator('.search-bar__input-shell');
    const leading = shell.locator('.search-bar__icon--leading');
    const input = shell.locator('.search-bar__input');
    const trailing = shell.locator('.search-bar__icon--trailing');
    const leadingBox = await leading.boundingBox();
    const inputBox = await input.boundingBox();
    const trailingBox = await trailing.boundingBox();
    expect((leadingBox?.x ?? 0)).toBeGreaterThan(inputBox?.x ?? 0);
    expect((trailingBox?.x ?? 0)).toBeLessThan(inputBox?.x ?? 0);
    await expect(input).toHaveCSS('text-align', 'right');
  });
});
