import { expect, test, type Locator } from '@playwright/test';
import { setDocumentDirection } from '../test-support/browser';
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

async function transitionDurations(locator: Locator): Promise<string[]> {
  return locator.evaluate((element) =>
    getComputedStyle(element)
      .transitionDuration.split(',')
      .map((duration) => duration.trim()),
  );
}

function expectNoTransition(durations: string[]) {
  expect(durations.length).toBeGreaterThan(0);
  expect(durations.every((duration) => duration === '0s')).toBe(true);
}

test.describe('Material 3 Lane 4 shared conformance', () => {
  test('Chip and ListItem remove component-owned transitions under reduced motion', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'conformance-contentprimitives--motion-and-direction');

    const chip = page.getByTestId('motion-chip');
    expectNoTransition(await transitionDurations(chip.locator('.chip__visual')));
    expectNoTransition(await transitionDurations(chip.locator('.elevation')));

    const checkbox = page.getByRole('checkbox', { name: 'Motion filter' });
    await expect(checkbox).not.toBeChecked();
    await chip.click();
    await expect(checkbox).toBeChecked();
    expectNoTransition(await transitionDurations(chip.locator('.chip__visual')));

    const listItem = page.getByTestId('motion-list-item');
    expectNoTransition(await transitionDurations(listItem));
    await listItem.focus();
    await expect(listItem).toBeFocused();
  });

  test('Chip leading and trailing slots follow logical RTL placement', async ({ page }) => {
    await openStory(page, 'conformance-contentprimitives--motion-and-direction');
    await setDocumentDirection(page, 'rtl');

    const chip = page.getByTestId('rtl-chip');
    const label = chip.locator('.chip__label');
    const leading = page.getByTestId('chip-leading');
    const trailing = page.getByTestId('chip-trailing');
    const [labelBox, leadingBox, trailingBox] = await Promise.all([
      label.boundingBox(),
      leading.boundingBox(),
      trailing.boundingBox(),
    ]);

    expect(labelBox).not.toBeNull();
    expect(leadingBox).not.toBeNull();
    expect(trailingBox).not.toBeNull();
    expect(leadingBox!.x).toBeGreaterThan(labelBox!.x);
    expect(trailingBox!.x).toBeLessThan(labelBox!.x);
  });

  test('dynamic source color reaches content primitives and the Menu portal scope', async ({
    page,
  }) => {
    await openStory(page, 'conformance-contentprimitives--dynamic-theme');

    const theme = page.locator('.content-primitives-dynamic-theme');
    const chip = page.getByTestId('theme-chip');
    const listItem = page.getByTestId('theme-list-item');
    const badge = page.getByTestId('theme-badge');
    const divider = page.getByTestId('theme-divider');

    const [surface, surfaceContainerLow, error, outlineVariant] = await Promise.all([
      resolvedColor(theme, 'var(--surface)'),
      resolvedColor(theme, 'var(--surface-container-low)'),
      resolvedColor(theme, 'var(--error)'),
      resolvedColor(theme, 'var(--outline-variant)'),
    ]);

    await expect(chip.locator('.chip__surface')).toHaveCSS(
      'background-color',
      surfaceContainerLow,
    );
    expect(
      await listItem.evaluate((element) =>
        getComputedStyle(element, '::before').backgroundColor,
      ),
    ).toBe(surface);
    await expect(badge).toHaveCSS('background-color', error);
    await expect(divider).toHaveCSS('background-color', outlineVariant);

    await page.getByTestId('theme-menu-trigger').click();
    const menuItem = page.getByTestId('theme-menu-item');
    await expect(menuItem).toBeVisible();
    const portal = page.locator(themePortalSelector).filter({ has: menuItem });
    await expect(portal).toHaveCount(1);

    const themeMenuRole = await resolvedColor(theme, 'var(--surface-container)');
    const portalMenuRole = await resolvedColor(portal, 'var(--surface-container)');
    expect(portalMenuRole).toBe(themeMenuRole);
    await expect(portal.locator('.menu-surface__clip')).toHaveCSS(
      'background-color',
      themeMenuRole,
    );
  });
});
