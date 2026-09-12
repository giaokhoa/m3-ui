import { expect, test, type Page } from '@playwright/test';
import { setDocumentDirection } from '../test-support/browser';
import { openStory } from '../test-support/story';

async function openDefaultButton(page: Page) {
  await openStory(page, 'components-button--default');
  const button = page.getByRole('button', { name: 'Filled button' });
  await expect(button).toBeVisible();
  return button;
}

test.describe('Material 3 Button visual parity', () => {
  test('common variants', async ({ page }) => {
    await openStory(page, 'components-button--variants');
    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      'button-variants.png',
    );
  });

  test('disabled variants', async ({ page }) => {
    await openStory(page, 'components-button--disabled-variants');
    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      'button-disabled-variants.png',
    );
  });

  test('disabled variants use reconciled web roles and runtime container adaptations', async ({ page }) => {
    await openStory(page, 'components-button--disabled-variants');

    const filled = page.getByRole('button', { name: 'Filled', exact: true });
    const outlined = page.getByRole('button', { name: 'Outlined', exact: true });
    const text = page.getByRole('button', { name: 'Text', exact: true });

    const filledRoles = await filled.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        disabledContent: style.getPropertyValue('--_button-disabled-content-color').trim(),
        onSurface: style.getPropertyValue('--on-surface').trim(),
      };
    });
    expect(filledRoles.disabledContent).toBe(filledRoles.onSurface);

    const outlinedRoles = await outlined.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        disabledContent: style.getPropertyValue('--_button-disabled-content-color').trim(),
        onSurface: style.getPropertyValue('--on-surface').trim(),
        disabledContainer: style.getPropertyValue('--_button-disabled-container-color').trim(),
        disabledOutlineOpacity: style.getPropertyValue('--_button-disabled-outline-opacity').trim(),
      };
    });
    expect(outlinedRoles.disabledContent).toBe(outlinedRoles.onSurface);
    expect(outlinedRoles.disabledContainer).toBe('transparent');
    expect(outlinedRoles.disabledOutlineOpacity).toBe('10%');

    const textRoles = await text.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        disabledContent: style.getPropertyValue('--_button-disabled-content-color').trim(),
        onSurface: style.getPropertyValue('--on-surface').trim(),
        disabledContainer: style.getPropertyValue('--_button-disabled-container-color').trim(),
      };
    });
    expect(textRoles.disabledContent).toBe(textRoles.onSurface);
    expect(textRoles.disabledContainer).toBe('transparent');
  });

  test('icon layouts', async ({ page }) => {
    await openStory(page, 'components-button--icons');
    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      'button-icons.png',
    );
  });

  test('logical start icon follows RTL direction without reversing the public slot contract', async ({ page }) => {
    await openStory(page, 'components-button--icons');
    await setDocumentDirection(page, 'rtl');
    const button = page.getByRole('button', { name: 'Send' }).first();
    const icon = button.locator('.button__icon');
    const [buttonBox, iconBox] = await Promise.all([
      button.boundingBox(),
      icon.boundingBox(),
    ]);
    expect(buttonBox).not.toBeNull();
    expect(iconBox).not.toBeNull();
    expect((iconBox?.x ?? 0) + (iconBox?.width ?? 0) / 2).toBeGreaterThan(
      (buttonBox?.x ?? 0) + (buttonBox?.width ?? 0) / 2,
    );
  });

  test('omitted size resolves to the same current Small contract as explicit size=small', async ({ page }) => {
    const defaultButton = await openDefaultButton(page);
    await expect(defaultButton).toHaveAttribute('data-size', 'small');
    const defaultContract = await defaultButton.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        minHeight: style.getPropertyValue('--_button-min-height').trim(),
        paddingBlock: style.getPropertyValue('--_button-padding-block').trim(),
        paddingInlineStart: style.getPropertyValue('--_button-padding-inline-start').trim(),
        paddingInlineEnd: style.getPropertyValue('--_button-padding-inline-end').trim(),
        iconSize: style.getPropertyValue('--_button-icon-size').trim(),
        iconSpacing: style.getPropertyValue('--_button-icon-spacing').trim(),
        fontSize: style.getPropertyValue('--_button-font-size').trim(),
        lineHeight: style.getPropertyValue('--_button-line-height').trim(),
      };
    });

    await openStory(page, 'components-button--expressive-sizes');
    const explicitSmall = page.getByRole('button', { name: 'Small', exact: true });
    await expect(explicitSmall).toHaveAttribute('data-size', 'small');
    const explicitSmallContract = await explicitSmall.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        minHeight: style.getPropertyValue('--_button-min-height').trim(),
        paddingBlock: style.getPropertyValue('--_button-padding-block').trim(),
        paddingInlineStart: style.getPropertyValue('--_button-padding-inline-start').trim(),
        paddingInlineEnd: style.getPropertyValue('--_button-padding-inline-end').trim(),
        iconSize: style.getPropertyValue('--_button-icon-size').trim(),
        iconSpacing: style.getPropertyValue('--_button-icon-spacing').trim(),
        fontSize: style.getPropertyValue('--_button-font-size').trim(),
        lineHeight: style.getPropertyValue('--_button-line-height').trim(),
      };
    });

    expect(defaultContract).toEqual(explicitSmallContract);
  });

  test('expressive size family', async ({ page }) => {
    await openStory(page, 'components-button--expressive-sizes');
    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      'button-expressive-sizes.png',
    );
  });

  test('expressive pressed shape', async ({ page }) => {
    await openStory(page, 'components-button--expressive-shape-morph');
    const button = page.getByRole('button', { name: 'Press medium' });
    await expect(button).toBeVisible();
    await button.hover();
    const box = await button.boundingBox();
    if (!box) {
      throw new Error('Expressive medium button has no bounding box');
    }
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();

    try {
      await expect(button).toHaveScreenshot('button-expressive-pressed.png');
    } finally {
      await page.mouse.up();
    }
  });

  test('reduced motion removes expressive shape transitions without changing activation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'components-button--expressive-shape-morph');
    const button = page.getByRole('button', { name: 'Press medium' });
    await expect(button).toHaveCSS('transition-duration', '0s');
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(button).toBeFocused();
  });

  test('theme matrix', async ({ page }) => {
    await openStory(page, 'components-button--theme-matrix');
    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      'button-theme-matrix.png',
    );
  });

  test('filled idle', async ({ page }) => {
    const button = await openDefaultButton(page);
    await expect(button).toHaveScreenshot('filled-idle.png');
  });

  test('filled hover', async ({ page }) => {
    const button = await openDefaultButton(page);
    await button.hover();
    await expect(button).toHaveScreenshot('filled-hover.png');
  });

  test('filled keyboard focus', async ({ page }) => {
    const button = await openDefaultButton(page);
    await page.keyboard.press('Tab');
    await expect(button).toBeFocused();
    await expect(button).toHaveScreenshot('filled-focus.png');
  });

  test('latest active interaction: focus after hover', async ({ page }) => {
    const button = await openDefaultButton(page);
    await button.hover();
    await page.keyboard.press('Tab');
    await expect(button).toBeFocused();
    await expect(button).toHaveScreenshot('filled-hover-then-focus.png');
  });

  test('latest active interaction: hover after focus', async ({ page }) => {
    const button = await openDefaultButton(page);
    await page.keyboard.press('Tab');
    await expect(button).toBeFocused();
    await button.hover();
    await expect(button).toHaveScreenshot('filled-focus-then-hover.png');
  });

  test('filled press ripple', async ({ page }) => {
    const button = await openDefaultButton(page);
    await button.hover();
    await page.mouse.down();

    try {
      await expect(button).toHaveScreenshot('filled-pressed.png');
    } finally {
      await page.mouse.up();
    }
  });
});
