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
  const root = page.locator('.text-field');
  await expect(input).toBeVisible();
  await expect(root).toBeVisible();
  return { input, root };
}

async function openOutlinedDefaultField(page: Page) {
  await openStory(page, 'components-textfield--outlined-default');
  const input = page.getByRole('textbox', { name: 'Label' });
  const root = page.locator('.text-field--outlined');
  const container = root.locator('.text-field__outlined-container');
  await expect(input).toBeVisible();
  await expect(root).toBeVisible();
  await expect(container).toBeVisible();
  return { input, root, container };
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
    await expect(page.locator('.text-field')).toHaveScreenshot(
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
    await root.locator('.text-field__label').click();
    await expect(input).toBeFocused();
  });

  test('invalid', async ({ page }) => {
    await openStory(page, 'components-textfield--invalid');
    const root = page.locator('.text-field');
    await expect(root.locator('.text-field__error')).toBeVisible();
    await expect(root.locator('.text-field__supporting')).toBeHidden();
    await expect(root).toHaveScreenshot('text-field-invalid.png');
  });

  test('invalid keeps error colors while focused', async ({ page }) => {
    await openStory(page, 'components-textfield--invalid');
    const root = page.locator('.text-field');
    const input = page.getByRole('textbox', { name: 'Label' });

    await input.focus();
    await expect(input).toBeFocused();

    const colors = await root.evaluate((element) => {
      const indicator = element.querySelector<HTMLElement>('.text-field__indicator');
      const label = element.querySelector<HTMLElement>('.text-field__label');
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
    await expect(page.locator('.text-field')).toHaveScreenshot(
      'text-field-disabled.png',
    );
  });

  test('affixes and icons', async ({ page }) => {
    await openStory(page, 'components-textfield--affixes-and-icons');
    await expect(page.locator('.text-field')).toHaveScreenshot(
      'text-field-affixes-icons.png',
    );
  });

  test('multiline', async ({ page }) => {
    await openStory(page, 'components-textfield--multiline');
    await expect(page.locator('.text-field')).toHaveScreenshot(
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
    const cards = page.locator('.storybook-theme-card');
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

test.describe('Material 3 outlined TextField parity', () => {
  test('uses a transparent presentation fieldset for the native outline cutout', async ({
    page,
  }) => {
    const { container } = await openOutlinedDefaultField(page);
    await expect(container).toHaveJSProperty('tagName', 'FIELDSET');
    await expect(container).toHaveAttribute('role', 'presentation');

    const box = await container.boundingBox();
    expect(box?.height).toBe(56);

    const geometry = await container.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        borderTopWidth: style.borderTopWidth,
        borderRadius: style.borderRadius,
        backgroundColor: style.backgroundColor,
      };
    });

    expect(geometry.borderTopWidth).toBe('1px');
    expect(geometry.borderRadius).toBe('4px');
    expect(geometry.backgroundColor).toBe('rgba(0, 0, 0, 0)');
  });

  test('moves the label into the cutout and thickens the outline on focus', async ({
    page,
  }) => {
    const { input, root, container } = await openOutlinedDefaultField(page);
    const label = root.locator('.text-field__label');
    const legend = root.locator('.text-field__outline-legend');

    const before = await root.evaluate((element) => {
      const labelElement = element.querySelector<HTMLElement>('.text-field__label');
      const legendElement = element.querySelector<HTMLElement>(
        '.text-field__outline-legend',
      );
      return {
        fontSize: labelElement ? getComputedStyle(labelElement).fontSize : '',
        bridgeOpacity: legendElement
          ? getComputedStyle(legendElement, '::after').opacity
          : '',
      };
    });
    expect(before.fontSize).toBe('16px');
    expect(before.bridgeOpacity).toBe('1');

    await label.click();
    await expect(input).toBeFocused();
    await expect(container).toHaveCSS('border-top-width', '2px');
    await expect(label).toHaveCSS('font-size', '12px');

    const bridgeOpacity = await legend.evaluate(
      (element) => getComputedStyle(element, '::after').opacity,
    );
    expect(bridgeOpacity).toBe('0');
  });

  test('keeps the error outline and label while invalid and focused', async ({ page }) => {
    await openStory(page, 'components-textfield--outlined-invalid');
    const root = page.locator('.text-field--outlined');
    const input = page.getByRole('textbox', { name: 'Label' });
    const container = root.locator('.text-field__outlined-container');

    await input.focus();
    await expect(input).toBeFocused();

    const colors = await root.evaluate((element) => {
      const containerElement = element.querySelector<HTMLElement>(
        '.text-field__outlined-container',
      );
      const label = element.querySelector<HTMLElement>('.text-field__label');
      const probe = document.createElement('span');
      probe.style.color = 'var(--error)';
      probe.style.position = 'absolute';
      probe.style.visibility = 'hidden';
      element.append(probe);
      const resolvedError = getComputedStyle(probe).color;
      probe.remove();

      return {
        resolvedError,
        outline: containerElement ? getComputedStyle(containerElement).borderTopColor : '',
        label: label ? getComputedStyle(label).color : '',
      };
    });

    expect(colors.outline).toBe(colors.resolvedError);
    expect(colors.label).toBe(colors.resolvedError);
    await expect(container).toHaveCSS('border-top-width', '2px');
    await expect(root.locator('.text-field__error')).toBeVisible();
    await expect(root.locator('.text-field__supporting')).toBeHidden();
  });

  test('keeps multiline semantics and supports the single-line opt-out', async ({ page }) => {
    const { input } = await openOutlinedDefaultField(page);
    await expect(input).toHaveJSProperty('tagName', 'TEXTAREA');

    await openStory(page, 'components-textfield--outlined-single-line');
    const singleLine = page.getByRole('textbox', { name: 'Single line' });
    await expect(singleLine).toHaveJSProperty('tagName', 'INPUT');
  });

  test('outlined theme matrix respects parent width constraints', async ({ page }) => {
    await openStory(page, 'components-textfield--outlined-theme-matrix');
    const cards = page.locator('.storybook-theme-card');
    await expect(cards).toHaveCount(4);

    const hasOverflow = await cards.evaluateAll((elements) =>
      elements.some((element) => element.scrollWidth > element.clientWidth),
    );
    expect(hasOverflow).toBe(false);
  });
});
