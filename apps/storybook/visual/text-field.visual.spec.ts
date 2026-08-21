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

async function openDefaultField(page: Page) {
  await openStory(page, 'components-textfield--default');
  const input = page.getByRole('textbox', { name: 'Label' });
  const root = page.locator('.m3-text-field');
  await expect(input).toBeVisible();
  await expect(root).toBeVisible();
  return { input, root };
}

test.describe('Material 3 filled TextField visual parity', () => {
  test('defaults to multiline semantics with a single-line opt-out', async ({ page }) => {
    const { input } = await openDefaultField(page);
    await expect(input).toHaveJSProperty('tagName', 'TEXTAREA');
    await input.fill('First line');
    await input.press('End');
    await input.press('Enter');
    await input.type('Second line');
    await expect(input).toHaveValue('First line\nSecond line');

    await openStory(page, 'components-textfield--single-line');
    const singleLine = page.getByRole('textbox', { name: 'Single line' });
    await expect(singleLine).toHaveJSProperty('tagName', 'INPUT');
  });

  test('empty default', async ({ page }) => {
    const { root } = await openDefaultField(page);
    await expect(root).toHaveScreenshot('text-field-empty.png');
  });

  test('filled value', async ({ page }) => {
    await openStory(page, 'components-textfield--with-value');
    await expect(page.locator('.m3-text-field')).toHaveScreenshot(
      'text-field-with-value.png',
    );
  });

  test('keyboard focus', async ({ page }) => {
    const { input, root } = await openDefaultField(page);
    await page.keyboard.press('Tab');
    await expect(input).toBeFocused();
    await expect(root).toHaveScreenshot('text-field-focused.png');
  });

  test('clicking the visible label focuses the control', async ({ page }) => {
    const { input, root } = await openDefaultField(page);
    await root.locator('.m3-text-field__label').click();
    await expect(input).toBeFocused();
  });

  test('invalid', async ({ page }) => {
    await openStory(page, 'components-textfield--invalid');
    await expect(page.locator('.m3-text-field')).toHaveScreenshot(
      'text-field-invalid.png',
    );
  });

  test('invalid keeps error colors while focused', async ({ page }) => {
    await openStory(page, 'components-textfield--invalid');
    const root = page.locator('.m3-text-field');
    const input = page.getByRole('textbox', { name: 'Label' });

    await input.focus();
    await expect(input).toBeFocused();

    const colors = await root.evaluate((element) => {
      const indicator = element.querySelector<HTMLElement>('.m3-text-field__indicator');
      const label = element.querySelector<HTMLElement>('.m3-text-field__label');
      const probe = document.createElement('span');
      probe.style.color = 'var(--error)';
      probe.style.position = 'absolute';
      probe.style.visibility = 'hidden';
      element.append(probe);
      const resolvedError = getComputedStyle(probe).color;
      probe.remove();

      return {
        resolvedError,
        indicator: indicator ? getComputedStyle(indicator).backgroundColor : '',
        label: label ? getComputedStyle(label).color : '',
      };
    });

    expect(colors.indicator).toBe(colors.resolvedError);
    expect(colors.label).toBe(colors.resolvedError);
  });

  test('disabled', async ({ page }) => {
    await openStory(page, 'components-textfield--disabled');
    await expect(page.locator('.m3-text-field')).toHaveScreenshot(
      'text-field-disabled.png',
    );
  });

  test('affixes and icons', async ({ page }) => {
    await openStory(page, 'components-textfield--affixes-and-icons');
    await expect(page.locator('.m3-text-field')).toHaveScreenshot(
      'text-field-affixes-icons.png',
    );
  });

  test('multiline', async ({ page }) => {
    await openStory(page, 'components-textfield--multiline');
    await expect(page.locator('.m3-text-field')).toHaveScreenshot(
      'text-field-multiline.png',
    );
  });

  test('state matrix', async ({ page }) => {
    await openStory(page, 'components-textfield--states');
    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      'text-field-states.png',
    );
  });

  test('theme matrix respects parent width constraints', async ({ page }) => {
    await openStory(page, 'components-textfield--theme-matrix');
    const cards = page.locator('.m3-storybook-theme-card');
    await expect(cards).toHaveCount(4);

    const hasOverflow = await cards.evaluateAll((elements) =>
      elements.some((element) => element.scrollWidth > element.clientWidth),
    );
    expect(hasOverflow).toBe(false);

    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      'text-field-theme-matrix.png',
    );
  });
});
