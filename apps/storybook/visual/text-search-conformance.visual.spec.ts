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

test.describe('Material 3 text and search conformance', () => {
  test('TextField keeps native form, required, read-only, disabled, and invalid semantics', async ({
    page,
  }) => {
    await openStory(page, 'conformance-textsearch--form-contract');

    const email = page.getByRole('textbox', { name: 'Email' });
    const readOnly = page.getByRole('textbox', { name: 'Read only' });
    const disabled = page.getByRole('textbox', { name: 'Disabled' });
    const invalid = page.getByRole('textbox', { name: 'Invalid' });

    await expect(email).toHaveValue('person@example.com');
    await expect(email).toHaveAttribute('type', 'email');
    await expect(email).toHaveAttribute('autocomplete', 'email');
    expect(
      await email.evaluate(
        (element) =>
          (element as HTMLInputElement).required ||
          element.getAttribute('aria-required') === 'true',
      ),
    ).toBe(true);

    await expect(readOnly).toHaveJSProperty('readOnly', true);
    await expect(disabled).toBeDisabled();
    await expect(invalid).toHaveAttribute('aria-invalid', 'true');

    const data = await page.getByTestId('text-field-form').evaluate((form) =>
      Object.fromEntries(new FormData(form as HTMLFormElement).entries()),
    );
    expect(data).toMatchObject({
      email: 'person@example.com',
      readonly: 'locked',
      invalid: 'bad',
    });
    expect(data).not.toHaveProperty('disabled');
  });

  test('TextField leading and trailing slots follow logical RTL placement', async ({ page }) => {
    await openStory(page, 'components-textfield--affixes-and-icons');
    await setDocumentDirection(page, 'rtl');

    const root = page.locator('.text-field');
    const input = page.getByRole('textbox', { name: 'Email' });
    const leading = root.locator('.text-field__icon--leading');
    const trailing = root.locator('.text-field__icon--trailing');
    const [inputBox, leadingBox, trailingBox] = await Promise.all([
      input.boundingBox(),
      leading.boundingBox(),
      trailing.boundingBox(),
    ]);

    expect(inputBox).not.toBeNull();
    expect(leadingBox).not.toBeNull();
    expect(trailingBox).not.toBeNull();
    expect(leadingBox!.x).toBeGreaterThan(inputBox!.x);
    expect(trailingBox!.x).toBeLessThan(inputBox!.x);
  });

  test('TextField removes component transitions under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await openStory(page, 'components-textfield--default');
    expectNoTransition(
      await transitionDurations(page.locator('.text-field__indicator')),
    );

    await openStory(page, 'components-textfield--outlined-default');
    expectNoTransition(
      await transitionDurations(page.locator('.text-field__label')),
    );
  });

  test('SecureTextField reveal exposes pressed state while preserving native password semantics', async ({
    page,
  }) => {
    await openStory(page, 'components-securetextfield--with-value');
    const input = page.locator('input');
    const reveal = page.getByRole('button', { name: 'Show password' });

    await expect(input).toHaveAttribute('type', 'password');
    await expect(reveal).toHaveAttribute('aria-pressed', 'false');
    await reveal.click();

    const hide = page.getByRole('button', { name: 'Hide password' });
    await expect(input).toHaveAttribute('type', 'text');
    await expect(hide).toHaveAttribute('aria-pressed', 'true');
    await hide.click();
    await expect(input).toHaveAttribute('type', 'password');
    await expect(page.getByRole('button', { name: 'Show password' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  test('SearchBar submits the native search form through its public onSearch callback', async ({
    page,
  }) => {
    await openStory(page, 'conformance-textsearch--search-submit-contract');
    const input = page.getByRole('searchbox', { name: 'Submit search' });
    await expect(input.locator('xpath=ancestor::form')).toHaveAttribute('role', 'search');

    await input.fill('tokens');
    await input.press('Enter');
    await expect(page.getByTestId('submitted-query')).toHaveText('tokens');
  });

  test('fullscreen SearchView inherits the dynamic ThemeProvider portal scope', async ({ page }) => {
    await openStory(page, 'conformance-textsearch--search-dynamic-portal');
    const theme = page.locator('.text-search-dynamic-theme');
    const bar = page.getByTestId('themed-search-bar');
    const themeRole = await resolvedColor(theme, 'var(--surface-container-high)');
    await expect(bar).toHaveCSS('background-color', themeRole);

    await page.getByTestId('open-themed-search').click();
    const view = page.getByTestId('themed-search-view');
    const portal = page.locator(themePortalSelector).filter({ has: view });
    await expect(view).toBeVisible();
    await expect(portal).toHaveCount(1);

    const portalRole = await resolvedColor(portal, 'var(--surface-container-high)');
    expect(portalRole).toBe(themeRole);
    const dialog = portal.getByRole('dialog', { name: 'Search' });
    await expect(dialog).toBeVisible();
    await expect(view).toHaveCSS('background-color', themeRole);
    await expect(view.getByRole('searchbox', { name: 'Themed search' })).toBeFocused();
  });
});
