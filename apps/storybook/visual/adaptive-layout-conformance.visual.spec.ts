import { expect, test } from '@playwright/test';
import { openStory } from '../test-support/story';

function centerX(box: { x: number; width: number } | null) {
  if (!box) throw new Error('Expected visible pane bounds');
  return box.x + box.width / 2;
}

test.describe('Material 3 Lane 10 adaptive layout shared conformance', () => {
  test('SupportingPaneScaffold keeps canonical Main -> Supporting order and mirrors it in RTL', async ({
    page,
  }) => {
    await openStory(page, 'layout-supportingpanescaffold--expanded');
    const ltr = page.locator('.three-pane-scaffold');
    const [ltrMain, ltrSupporting] = await Promise.all([
      ltr.locator('[data-pane-role="primary"]').boundingBox(),
      ltr.locator('[data-pane-role="secondary"]').boundingBox(),
    ]);
    expect(centerX(ltrMain)).toBeLessThan(centerX(ltrSupporting));

    await openStory(page, 'layout-supportingpanescaffold--rtl');
    const rtl = page.locator('.three-pane-scaffold');
    const [rtlMain, rtlSupporting] = await Promise.all([
      rtl.locator('[data-pane-role="primary"]').boundingBox(),
      rtl.locator('[data-pane-role="secondary"]').boundingBox(),
    ]);
    expect(centerX(rtlMain)).toBeGreaterThan(centerX(rtlSupporting));
  });

  test('NavigationSuiteScaffold recommended type follows the real layout viewport', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 500, height: 800 });
    await openStory(page, 'conformance-adaptivelayout--measured-window');

    const scaffold = page.locator('.navigation-suite-scaffold');
    await expect(scaffold).toHaveAttribute(
      'data-navigation-suite-type',
      'short-navigation-bar-compact',
    );
    await expect(scaffold).toHaveAttribute('data-navigation-position', 'bottom');

    await page.setViewportSize({ width: 1000, height: 800 });
    await expect(scaffold).toHaveAttribute(
      'data-navigation-suite-type',
      'wide-navigation-rail-collapsed',
    );
    await expect(scaffold).toHaveAttribute('data-navigation-position', 'start');
  });

  test('wide recommended navigation occupies logical start in both LTR and RTL', async ({
    page,
  }) => {
    await openStory(page, 'layout-navigationsuitescaffold--wide-recommended');
    const ltrRoot = page.locator('.navigation-suite-scaffold');
    const [ltrNavigation, ltrContent] = await Promise.all([
      ltrRoot.locator('.navigation-suite-scaffold__navigation').boundingBox(),
      ltrRoot.locator('.navigation-suite-scaffold__content').boundingBox(),
    ]);
    expect(centerX(ltrNavigation)).toBeLessThan(centerX(ltrContent));

    await openStory(page, 'layout-navigationsuitescaffold--rtl-wide-recommended');
    const rtlRoot = page.locator('.navigation-suite-scaffold');
    const [rtlNavigation, rtlContent] = await Promise.all([
      rtlRoot.locator('.navigation-suite-scaffold__navigation').boundingBox(),
      rtlRoot.locator('.navigation-suite-scaffold__content').boundingBox(),
    ]);
    expect(centerX(rtlNavigation)).toBeGreaterThan(centerX(rtlContent));
  });
});
