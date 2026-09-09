import { expect, test, type Locator } from '@playwright/test';
import { openStory } from '../test-support/story';

const themePortalSelector = '[data-' + 'm3' + '-theme-portal]';

async function resolvedColor(scope: Locator, value: string): Promise<string> {
  return scope.evaluate((element, colorValue) => {
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

async function expectInsideThemePortal(page: import('@playwright/test').Page, locator: Locator) {
  await expect(page.locator(themePortalSelector).filter({ has: locator })).toHaveCount(1);
}

test.describe('Material 3 Lane 8 navigation/chrome shared conformance', () => {
  test('nested source-color roles reach navigation, tabs and app chrome paint', async ({ page }) => {
    await openStory(page, 'conformance-navigationchrome--dynamic-theme');

    const theme = page.locator('.navigation-chrome-dynamic-theme');
    const [surface, surfaceContainer, secondaryContainer, primary] = await Promise.all([
      resolvedColor(theme, 'var(--surface)'),
      resolvedColor(theme, 'var(--surface-container)'),
      resolvedColor(theme, 'var(--secondary-container)'),
      resolvedColor(theme, 'var(--primary)'),
    ]);

    const navigationBar = page.getByTestId('theme-navigation-bar');
    await expect(navigationBar).toHaveCSS('background-color', surfaceContainer);
    await expect(navigationBar.locator('.navigation-bar-item[data-selected] .navigation-bar-item__indicator')).toHaveCSS(
      'background-color',
      secondaryContainer,
    );

    const shortNavigationBar = page.getByTestId('theme-short-navigation-bar');
    await expect(shortNavigationBar).toHaveCSS('background-color', surfaceContainer);
    await expect(shortNavigationBar.locator('.short-navigation-bar-item[data-selected] .short-navigation-bar-item__indicator')).toHaveCSS(
      'background-color',
      secondaryContainer,
    );

    const navigationRail = page.getByTestId('theme-navigation-rail');
    await expect(navigationRail).toHaveCSS('background-color', surface);
    await expect(navigationRail.locator('.navigation-rail-item[data-selected] .navigation-rail-item__indicator')).toHaveCSS(
      'background-color',
      secondaryContainer,
    );

    const wideRail = page.getByTestId('theme-wide-navigation-rail');
    await expect(wideRail).toHaveCSS('background-color', surface);
    await expect(wideRail.locator('.wide-navigation-rail-item[data-selected] .wide-navigation-rail-item__indicator')).toHaveCSS(
      'background-color',
      secondaryContainer,
    );

    const tabs = page.getByTestId('theme-tabs');
    await expect(tabs).toHaveCSS('background-color', surface);
    await expect(tabs.getByTestId('tabs-indicator')).toHaveCSS('background-color', primary);

    await expect(page.getByTestId('theme-top-app-bar')).toHaveCSS('background-color', surface);
    await expect(page.getByTestId('theme-bottom-app-bar')).toHaveCSS('background-color', surfaceContainer);
    await expect(page.getByTestId('theme-floating-toolbar').locator('.floating-toolbar__surface')).toHaveCSS(
      'background-color',
      surfaceContainer,
    );
  });

  test('modal navigation and app-bar overflow stay inside the nested theme portal', async ({ page }) => {
    await openStory(page, 'conformance-navigationchrome--dynamic-theme');

    const theme = page.locator('.navigation-chrome-dynamic-theme');
    const [surfaceContainerLow, surfaceContainer] = await Promise.all([
      resolvedColor(theme, 'var(--surface-container-low)'),
      resolvedColor(theme, 'var(--surface-container)'),
    ]);

    await page.getByTestId('theme-modal-drawer-open').click();
    const drawerSheet = page.getByTestId('theme-modal-drawer-sheet');
    await expect(drawerSheet).toBeVisible();
    await expect(drawerSheet).toHaveCSS('background-color', surfaceContainerLow);
    await expectInsideThemePortal(page, drawerSheet);
    await page.keyboard.press('Escape');
    await expect(drawerSheet).toBeHidden();

    await page.getByTestId('theme-modal-wide-rail-open').click();
    const modalWideRail = page.locator('.modal-wide-navigation-rail__rail');
    await expect(modalWideRail).toBeVisible();
    await expect(modalWideRail).toHaveCSS('background-color', surfaceContainer);
    await expectInsideThemePortal(page, modalWideRail);
    await page.keyboard.press('Escape');
    await expect(page.locator('.modal-wide-navigation-rail-overlay')).toHaveCount(0);

    await page.getByRole('button', { name: 'Row more actions' }).click();
    let menu = page.getByRole('menu', { name: 'Row more actions' });
    await expect(menu).toBeVisible();
    await expect(menu.locator('..').locator('..').locator('.menu-surface__clip')).toHaveCSS(
      'background-color',
      surfaceContainer,
    );
    await expectInsideThemePortal(page, menu);
    await page.keyboard.press('Escape');
    await expect(menu).toHaveCount(0);

    await page.getByRole('button', { name: 'Column more actions' }).click();
    menu = page.getByRole('menu', { name: 'Column more actions' });
    await expect(menu).toBeVisible();
    await expectInsideThemePortal(page, menu);
  });

  test('wide navigation rail resolves logical start/end geometry in RTL', async ({ page }) => {
    await openStory(page, 'conformance-navigationchrome--dynamic-theme');

    const theme = page.locator('.navigation-chrome-dynamic-theme');
    await theme.evaluate((element) => element.setAttribute('dir', 'rtl'));

    const wideRail = page.getByTestId('theme-wide-navigation-rail');
    await expect(wideRail).toHaveCSS('direction', 'rtl');
    const selected = wideRail.locator('.wide-navigation-rail-item[data-selected]');
    const [iconBox, labelBox] = await Promise.all([
      selected.locator('.wide-navigation-rail-item__icon').boundingBox(),
      selected.locator('.wide-navigation-rail-item__label').boundingBox(),
    ]);
    expect(iconBox).not.toBeNull();
    expect(labelBox).not.toBeNull();
    expect(iconBox!.x).toBeGreaterThan(labelBox!.x);
  });

  test('reduced motion removes drawer and wide/modal rail family transitions', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'conformance-navigationchrome--dynamic-theme');

    const wideRail = page.getByTestId('theme-wide-navigation-rail');
    await expect(wideRail).toHaveCSS('transition-duration', '0s');
    await expect(wideRail.locator('.wide-navigation-rail-item').first()).toHaveCSS(
      'transition-duration',
      '0s',
    );

    await page.getByTestId('theme-modal-drawer-open').click();
    const drawerFrame = page.locator('.modal-navigation-drawer__sheet-frame');
    await expect(drawerFrame).toBeVisible();
    await expect(drawerFrame).toHaveCSS('transition-duration', '0s');
    await page.keyboard.press('Escape');
    await expect(page.locator('.modal-navigation-drawer-overlay')).toBeHidden();

    await page.getByTestId('theme-modal-wide-rail-open').click();
    const modalFrame = page.locator('.modal-wide-navigation-rail__frame');
    await expect(modalFrame).toBeVisible();
    await expect(modalFrame).toHaveCSS('transition-duration', '0s');
    await expect(page.locator('.modal-wide-navigation-rail__rail')).toHaveCSS(
      'transition-duration',
      '0s',
    );
  });
});
