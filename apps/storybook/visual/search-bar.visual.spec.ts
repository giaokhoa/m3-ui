import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

function close(actual: number | undefined, expected: number) {
  expect(actual).not.toBeUndefined();
  expect(Math.abs((actual ?? 0) - expected)).toBeLessThan(0.8);
}

async function settle(element: ReturnType<Page['locator']>) {
  await element.evaluate(async (node) => {
    await Promise.all(node.getAnimations().map((animation) => animation.finished));
  });
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

  test('docked with gap uses canonical split geometry, scrim, dismissal and focus restoration', async ({ page }) => {
    await openStory(page, 'components-searchbar--docked-with-gap');
    const trigger = page.getByTestId('gap-trigger-input');
    await trigger.focus();

    const view = page.getByTestId('search-view-docked-gap');
    await expect(view).toBeVisible();
    await settle(view);
    await expect(page.getByTestId('state-value')).toHaveText('expanded');
    await expect(page.getByTestId('gap-expanded-input')).toBeFocused();

    const header = view.locator('.search-view__header');
    const dropdown = view.locator('.search-view__docked-dropdown');
    const headerBox = await header.boundingBox();
    const dropdownBox = await dropdown.boundingBox();
    close(headerBox?.height, 56);
    close((dropdownBox?.y ?? 0) - ((headerBox?.y ?? 0) + (headerBox?.height ?? 0)), 2);
    await expect(dropdown).toHaveCSS('border-radius', '12px');
    const scrim = page.locator('.search-view__docked-gap-scrim');
    await expect(scrim).toHaveCSS('position', 'fixed');
    await expect(scrim).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    expect((await view.boundingBox())?.height ?? 0).toBeLessThanOrEqual((page.viewportSize()?.height ?? 0) / 2 + 1);

    await page.keyboard.press('Escape');
    await expect(view).toHaveCount(0);
    await expect(page.getByTestId('state-value')).toHaveText('collapsed');
    await expect(trigger).toBeFocused();

    await trigger.evaluate((element) => (element as HTMLInputElement).blur());
    await trigger.focus();
    await expect(page.getByTestId('search-view-docked-gap')).toBeVisible();
    await page.locator('.search-view__docked-gap-scrim').click({ position: { x: 1, y: 1 } });
    await expect(page.getByTestId('search-view-docked-gap')).toHaveCount(0);
  });

  test('fullscreen fills viewport, uses a 72px header, transfers/traps focus and restores it on Escape', async ({ page }) => {
    await openStory(page, 'components-searchbar--full-screen-expanded');
    const trigger = page.getByTestId('background-button');
    await trigger.focus();
    await trigger.click();

    const view = page.getByTestId('search-view-fullscreen');
    await settle(view);
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

  test('contained fullscreen keeps a canonical 56px search bar inside the full-screen lifecycle', async ({ page }) => {
    await openStory(page, 'components-searchbar--full-screen-contained');
    const trigger = page.getByTestId('contained-background-button');
    await trigger.focus();
    await trigger.click();

    const view = page.getByTestId('search-view-fullscreen-contained');
    await settle(view);
    const viewport = page.viewportSize();
    const box = await view.boundingBox();
    close(box?.width, viewport?.width ?? 0);
    close(box?.height, viewport?.height ?? 0);
    await expect(view).toHaveAttribute('data-contained', 'true');
    close((await view.locator('.search-view__header').boundingBox())?.height, 72);
    const containedBar = view.locator('.search-view__contained-bar');
    close((await containedBar.boundingBox())?.height, 56);
    expect((await containedBar.boundingBox())?.width ?? 0).toBeLessThanOrEqual(720);
    await expect(page.getByTestId('contained-search-input')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(view).toHaveCount(0);
    await expect(page.getByTestId('state-value')).toHaveText('collapsed');
    await expect(trigger).toBeFocused();
  });

  test('AppBarWithSearch exposes navigation/actions and reacts only to explicit overlap state', async ({ page }) => {
    await openStory(page, 'components-searchbar--app-bar-search');
    const appBar = page.getByTestId('app-bar-with-search');
    close((await appBar.boundingBox())?.height, 64);
    await expect(appBar).toHaveAttribute('data-overlapped-fraction', '0');
    await expect(appBar).not.toHaveAttribute('data-scrolled');
    await expect(page.getByTestId('app-bar-search-input')).toHaveAttribute('type', 'search');

    const nav = await page.getByTestId('app-bar-navigation').boundingBox();
    const action = await page.getByTestId('app-bar-action').boundingBox();
    expect(nav?.x ?? 0).toBeLessThan(action?.x ?? 0);

    const before = await appBar.evaluate((element) => ({
      appBar: getComputedStyle(element).backgroundColor,
      search: getComputedStyle(element.querySelector('.search-bar') as Element).backgroundColor,
    }));
    await page.getByTestId('toggle-overlap').click();
    await expect(appBar).toHaveAttribute('data-overlapped-fraction', '1');
    await expect(appBar).toHaveAttribute('data-scrolled', 'true');
    await settle(appBar);
    const after = await appBar.evaluate((element) => ({
      appBar: getComputedStyle(element).backgroundColor,
      search: getComputedStyle(element.querySelector('.search-bar') as Element).backgroundColor,
    }));
    expect(after.appBar).not.toBe(before.appBar);
    expect(after.search).not.toBe(before.search);
  });

  test('new variants honor reduced motion and logical RTL ordering', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'components-searchbar--docked-with-gap');
    await page.getByTestId('gap-trigger-input').focus();
    await expect(page.getByTestId('search-view-docked-gap')).toHaveCSS('animation-name', 'none');

    await openStory(page, 'components-searchbar--app-bar-search');
    await expect(page.getByTestId('app-bar-with-search')).toHaveCSS('transition-duration', '0s');

    await openStory(page, 'components-searchbar--app-bar-search-rtl');
    const nav = await page.getByTestId('app-bar-navigation').boundingBox();
    const action = await page.getByTestId('app-bar-action').boundingBox();
    expect(nav?.x ?? 0).toBeGreaterThan(action?.x ?? 0);
    await expect(page.getByTestId('app-bar-search-input')).toHaveCSS('text-align', 'right');
  });

  test('collapsed RTL ordering remains logical', async ({ page }) => {
    await openStory(page, 'components-searchbar--rtl');
    const shell = page.locator('.search-bar__input-shell');
    const leading = shell.locator('.search-bar__icon--leading');
    const input = shell.locator('.search-bar__input');
    const trailing = shell.locator('.search-bar__icon--trailing');
    const leadingBox = await leading.boundingBox();
    const inputBox = await input.boundingBox();
    const trailingBox = await trailing.boundingBox();
    expect(leadingBox?.x ?? 0).toBeGreaterThan(inputBox?.x ?? 0);
    expect(trailingBox?.x ?? 0).toBeLessThan(inputBox?.x ?? 0);
    await expect(input).toHaveCSS('text-align', 'right');
  });
});
