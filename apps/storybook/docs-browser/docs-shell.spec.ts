import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { installRuntimeGuard } from './runtimeGuard';

const representativeViewports = {
  compact: { width: 390, height: 844 },
  medium: { width: 700, height: 900 },
  expanded: { width: 1000, height: 900 },
  large: { width: 1440, height: 900 },
  'extra-large': { width: 1920, height: 1080 },
} as const;

const componentRoute = '/docs/components/button';

async function openRoute(
  page: Page,
  route: string,
  viewport: { width: number; height: number },
) {
  await page.setViewportSize(viewport);
  const response = await page.goto(route, { waitUntil: 'networkidle' });
  expect(response, `Expected a document response for ${route}`).not.toBeNull();
  expect(response!.status(), `Expected ${route} to render successfully`).toBeLessThan(400);
}

async function attachViewportScreenshot(
  page: Page,
  testInfo: TestInfo,
  name: string,
) {
  await testInfo.attach(name, {
    body: await page.screenshot({ animations: 'disabled', fullPage: false }),
    contentType: 'image/png',
  });
}

async function assertNoHorizontalPageOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
}

async function assertPersistentDesktopGeometry(page: Page, showToc: boolean) {
  const rail = page.locator('.docs-global-navigation');
  const drawer = page.locator('.docs-permanent-drawer .docs-sidebar');
  const workspace = page.locator('.docs-permanent-drawer .docs-workspace');
  const mainInner = page.locator('.docs-permanent-drawer .docs-main__inner');

  await expect(rail).toBeVisible();
  await expect(drawer).toBeVisible();
  await expect(workspace).toBeVisible();
  await expect(mainInner).toBeVisible();

  const [railBox, drawerBox, workspaceBox, mainInnerBox] = await Promise.all([
    rail.boundingBox(),
    drawer.boundingBox(),
    workspace.boundingBox(),
    mainInner.boundingBox(),
  ]);

  expect(railBox).not.toBeNull();
  expect(drawerBox).not.toBeNull();
  expect(workspaceBox).not.toBeNull();
  expect(mainInnerBox).not.toBeNull();

  const railEnd = railBox!.x + railBox!.width;
  const drawerEnd = drawerBox!.x + drawerBox!.width;

  expect(
    Math.abs(drawerBox!.x - railEnd),
    'persistent contextual navigation should be adjacent to the global rail',
  ).toBeLessThanOrEqual(2);
  expect(
    Math.abs(workspaceBox!.x - drawerEnd),
    'workspace should start at the contextual navigation edge',
  ).toBeLessThanOrEqual(2);
  expect(
    Math.abs(mainInnerBox!.x - workspaceBox!.x),
    'article column should stay anchored instead of re-centering in the remaining viewport',
  ).toBeLessThanOrEqual(2);
  expect(mainInnerBox!.width).toBeLessThanOrEqual(workspaceBox!.width);

  if (showToc) {
    const toc = page.getByRole('complementary', { name: 'On this page' });
    await expect(toc).toBeVisible();
    const tocBox = await toc.boundingBox();
    expect(tocBox).not.toBeNull();
    expect(tocBox!.x).toBeGreaterThanOrEqual(
      mainInnerBox!.x + mainInnerBox!.width - 1,
    );
    expect(tocBox!.x + tocBox!.width).toBeLessThanOrEqual(
      workspaceBox!.x + workspaceBox!.width + 1,
    );
  } else {
    await expect(
      page.getByRole('complementary', { name: 'On this page' }),
    ).toHaveCount(0);
  }

  await assertNoHorizontalPageOverflow(page);
}

for (const widthClass of ['compact', 'medium'] as const) {
  test(`${widthClass} uses two-level modal documentation navigation`, async ({ page }) => {
    const runtime = installRuntimeGuard(page);
    await openRoute(page, componentRoute, representativeViewports[widthClass]);

    const openButton = page.getByRole('button', { name: 'Open navigation' });
    await expect(openButton).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: 'Documentation sections' }),
    ).toHaveCount(0);

    await openButton.click();
    const drawer = page.locator('[aria-label="Documentation navigation"]');
    const modalNav = page.getByRole('navigation', { name: 'Documentation' });
    await expect(drawer).toBeVisible();
    await expect(modalNav.getByRole('button', { name: 'Main menu' })).toBeVisible();
    await expect(
      modalNav.getByRole('link', { name: 'Button', exact: true }),
    ).toHaveAttribute('aria-current', 'page');
    await expect(modalNav.getByRole('button', { name: 'Actions' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await expect(
      modalNav.getByRole('button', { name: 'Input and surfaces' }),
    ).toHaveAttribute('aria-expanded', 'false');

    await modalNav.getByRole('button', { name: 'Main menu' }).click();
    const openComponents = modalNav.getByRole('button', {
      name: 'Open Components navigation',
    });
    await expect(openComponents).toBeVisible();
    await openComponents.click();
    await expect(
      modalNav.getByRole('link', { name: 'Button', exact: true }),
    ).toHaveAttribute('aria-current', 'page');

    await page.getByRole('button', { name: 'Close navigation' }).click();
    await expect(drawer).toBeHidden();

    const skipLink = page.getByRole('link', { name: 'Skip to content' });
    await skipLink.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#docs-main')).toBeFocused();

    runtime.assertClean();
  });
}

test('expanded uses the global rail with contextual navigation on demand', async ({ page }) => {
  const runtime = installRuntimeGuard(page);
  await openRoute(page, componentRoute, representativeViewports.expanded);

  const rail = page.getByRole('navigation', { name: 'Documentation sections' });
  await expect(rail).toBeVisible();
  await expect(
    rail.getByRole('link', { name: 'Components', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('.docs-permanent-drawer')).toHaveCount(0);

  const openComponents = page.getByRole('button', {
    name: 'Open Components navigation',
  });
  await expect(openComponents).toBeVisible();
  await openComponents.click();

  const drawer = page.locator('[aria-label="Documentation navigation"]');
  const modalNav = page.getByRole('navigation', { name: 'Documentation' });
  await expect(drawer).toBeVisible();
  await expect(
    modalNav.getByRole('link', { name: 'Button', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  await page.getByRole('button', { name: 'Close navigation' }).click();

  runtime.assertClean();
});

test('large desktop keeps persistent navigation adjacent to the article', async ({
  page,
}, testInfo) => {
  const runtime = installRuntimeGuard(page);
  await openRoute(page, componentRoute, representativeViewports.large);

  const rail = page.getByRole('navigation', { name: 'Documentation sections' });
  const contextualNav = page.getByRole('navigation', {
    name: 'Components navigation',
  });
  await expect(rail).toBeVisible();
  await expect(contextualNav).toBeVisible();
  await expect(
    contextualNav.getByRole('link', { name: 'Button', exact: true }),
  ).toHaveAttribute('aria-current', 'page');

  await attachViewportScreenshot(page, testInfo, 'docs-large-1440.png');
  await assertPersistentDesktopGeometry(page, false);
  runtime.assertClean();
});

test('extra-large desktop adds an independent TOC without shifting the article', async ({
  page,
}, testInfo) => {
  const runtime = installRuntimeGuard(page);
  await openRoute(page, componentRoute, representativeViewports['extra-large']);

  await expect(
    page.getByRole('navigation', { name: 'Documentation sections' }),
  ).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: 'Components navigation' }),
  ).toBeVisible();
  await expect(
    page.getByRole('complementary', { name: 'On this page' }),
  ).toBeVisible();

  await attachViewportScreenshot(page, testInfo, 'docs-extra-large-1920.png');
  await assertPersistentDesktopGeometry(page, true);
  runtime.assertClean();
});

test('top-level leaf destinations do not create an empty persistent context pane', async ({
  page,
}) => {
  const runtime = installRuntimeGuard(page);
  await openRoute(page, '/docs', representativeViewports.large);

  await expect(
    page.getByRole('navigation', { name: 'Documentation sections' }),
  ).toBeVisible();
  await expect(page.locator('.docs-permanent-drawer')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'm3-ui documentation' })).toBeVisible();
  runtime.assertClean();
});

test('theme preference and portaled search stay synchronized after hydration', async ({
  page,
}) => {
  const runtime = installRuntimeGuard(page);
  await page.emulateMedia({ colorScheme: 'dark' });
  await openRoute(page, componentRoute, representativeViewports.expanded);

  const themeRoot = page.locator('.docs-theme[data-m3-theme]');
  const portal = page.locator('#docs-theme-portal');
  await expect(portal).toHaveCount(1);
  await expect(themeRoot).toHaveAttribute('data-theme', 'dark');
  await expect(portal).toHaveAttribute('data-theme', 'dark');

  const systemThemeButton = page.getByRole('button', {
    name: 'Theme preference: system. Activate to change.',
  });
  await systemThemeButton.click();
  await expect(themeRoot).toHaveAttribute('data-theme', 'light');
  await expect(portal).toHaveAttribute('data-theme', 'light');

  const lightThemeButton = page.getByRole('button', {
    name: 'Theme preference: light. Activate to change.',
  });
  await lightThemeButton.click();
  await expect(themeRoot).toHaveAttribute('data-theme', 'dark');
  await expect(portal).toHaveAttribute('data-theme', 'dark');

  const searchButton = page.getByRole('button', { name: 'Search documentation' });
  await searchButton.click();
  const searchbox = page.getByRole('searchbox', { name: 'Search documentation' });
  await expect(searchbox).toBeVisible();
  expect(
    await searchbox.evaluate((element) => element.closest('#docs-theme-portal') !== null),
    'expanded search should render inside the SSR-owned theme portal',
  ).toBe(true);

  const [rootSurface, portalSurface] = await page.evaluate(() => {
    const root = document.querySelector<HTMLElement>('.docs-theme[data-m3-theme]');
    const portalHost = document.querySelector<HTMLElement>('#docs-theme-portal');
    return [
      root ? getComputedStyle(root).getPropertyValue('--surface').trim() : '',
      portalHost
        ? getComputedStyle(portalHost).getPropertyValue('--surface').trim()
        : '',
    ];
  });
  expect(rootSurface).not.toBe('');
  expect(portalSurface).toBe(rootSurface);

  await page.keyboard.press('Escape');
  await expect(searchbox).toBeHidden();
  await expect(searchButton).toBeFocused();
  runtime.assertClean();
});

test('search returns the canonical component route', async ({ page }) => {
  const runtime = installRuntimeGuard(page);
  await openRoute(page, componentRoute, representativeViewports.expanded);

  await page.getByRole('button', { name: 'Search documentation' }).click();
  const searchbox = page.getByRole('searchbox', { name: 'Search documentation' });
  await searchbox.fill('button');

  const result = page
    .locator('#docs-theme-portal')
    .locator('.docs-search__result-link[href="/docs/components/button"]')
    .first();
  await expect(result).toBeVisible();
  await result.click();
  await expect(page).toHaveURL(/\/docs\/components\/button$/);
  await expect(page.getByRole('heading', { name: 'Button', exact: true })).toBeVisible();
  runtime.assertClean();
});

test('rail actions remain reachable on a short expanded viewport', async ({ page }) => {
  const runtime = installRuntimeGuard(page);
  await openRoute(page, componentRoute, { width: 1000, height: 520 });

  const search = page.getByRole('button', { name: 'Search documentation' });
  const theme = page.getByRole('button', {
    name: /Theme preference: .* Activate to change\./,
  });
  await expect(search).toBeInViewport();
  await expect(theme).toBeInViewport();
  runtime.assertClean();
});

test('representative public routes render without browser runtime failures', async ({
  page,
}) => {
  const runtime = installRuntimeGuard(page);
  await page.setViewportSize(representativeViewports.large);

  const routes = [
    ['/docs', 'm3-ui documentation'],
    ['/docs/getting-started/installation', 'Installation'],
    ['/docs/foundations/color', 'Color'],
    ['/docs/develop/forms', 'Forms and validation'],
    ['/docs/components/button', 'Button'],
    ['/docs/reference/parity', 'Parity catalog'],
  ] as const;

  for (const [route, heading] of routes) {
    const response = await page.goto(route, { waitUntil: 'networkidle' });
    expect(response).not.toBeNull();
    expect(response!.status(), `Expected ${route} to render successfully`).toBeLessThan(400);
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
  }

  runtime.assertClean();
});

test('unknown docs routes use framework not-found behavior', async ({ page }) => {
  const runtime = installRuntimeGuard(page);
  await page.setViewportSize(representativeViewports.large);
  const response = await page.goto('/docs/this-route-must-not-exist');
  expect(response).not.toBeNull();
  expect(response!.status()).toBe(404);
  runtime.assertClean();
});
