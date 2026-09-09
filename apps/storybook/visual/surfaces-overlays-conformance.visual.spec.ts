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

test.describe('Material 3 Lane 5 shared conformance', () => {
  test('Card removes component-owned elevation motion without changing activation', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'conformance-surfacesoverlays--card-motion');

    const card = page.getByTestId('motion-card');
    const elevation = card.locator('.elevation');
    await card.hover();
    await expect(elevation).toHaveCSS('transition-duration', '0s');

    await card.focus();
    await expect(card).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('motion-card-count')).toHaveText('1');
  });

  test('dynamic roles reach passive surfaces and nested Dialog/ModalBottomSheet portals', async ({
    page,
  }) => {
    await openStory(page, 'conformance-surfacesoverlays--dynamic-theme');

    const theme = page.locator('.surfaces-overlays-dynamic-theme');
    const card = page.getByTestId('theme-card');
    const surface = page.getByTestId('theme-surface');
    const scrim = page.getByTestId('theme-scrim');

    const [surfaceRole, cardRole, dialogRole, scrimRole] = await Promise.all([
      resolvedColor(theme, 'var(--surface)'),
      resolvedColor(theme, 'var(--surface-container-low)'),
      resolvedColor(theme, 'var(--surface-container-high)'),
      resolvedColor(theme, 'var(--scrim)'),
    ]);

    await expect(card.locator('.card__surface')).toHaveCSS(
      'background-color',
      cardRole,
    );
    await expect(surface).toHaveCSS('background-color', surfaceRole);
    await expect(scrim).toHaveCSS('background-color', scrimRole);
    await expect(scrim).toHaveCSS('opacity', '0.32');

    const dialogTrigger = page.getByTestId('theme-dialog-trigger');
    await dialogTrigger.click();
    const dialog = page.getByRole('dialog', { name: 'Dynamic dialog' });
    await expect(dialog).toBeVisible();

    const dialogPortal = page.locator(themePortalSelector).filter({ has: dialog });
    await expect(dialogPortal).toHaveCount(1);
    expect(await resolvedColor(dialogPortal, 'var(--surface-container-high)')).toBe(
      dialogRole,
    );
    await expect(dialog).toHaveCSS('background-color', dialogRole);

    await page.getByRole('button', { name: 'Close dialog' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(dialogTrigger).toBeFocused();

    const sheetTrigger = page.getByTestId('theme-sheet-trigger');
    await sheetTrigger.click();
    const sheet = page.getByTestId('theme-modal-sheet');
    await expect(sheet).toHaveAttribute('data-state', 'partially-expanded');
    await expect(page.getByRole('dialog', { name: 'Dynamic sheet' })).toBeVisible();

    const sheetPortal = page.locator(themePortalSelector).filter({ has: sheet });
    await expect(sheetPortal).toHaveCount(1);
    expect(await resolvedColor(sheetPortal, 'var(--surface-container-low)')).toBe(
      cardRole,
    );
    await expect(sheet).toHaveCSS('background-color', cardRole);

    const overlay = page.locator('.modal-bottom-sheet-overlay');
    // BottomSheet's family suite owns the animated scrim-alpha contract. This
    // shared cross-family test only verifies the nested theme role and focus
    // while the entrance transition may still be in flight.
    const overlayPaint = await overlay.evaluate((element) => {
      const style = getComputedStyle(element, '::before');
      return {
        backgroundColor: style.backgroundColor,
        focusInsideDialog:
          document.activeElement?.closest('[role="dialog"]') !== null,
      };
    });
    expect(overlayPaint).toEqual({
      backgroundColor: scrimRole,
      focusInsideDialog: true,
    });

    await page.keyboard.press('Escape');
    await expect(sheet).toHaveCount(0);
    await expect(sheetTrigger).toBeFocused();
  });
});
