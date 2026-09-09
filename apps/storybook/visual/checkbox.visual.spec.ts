import { expect, test, type Page } from '@playwright/test';
import { openStory } from '../test-support/story';

async function openSelectedCheckbox(page: Page) {
  await openStory(page, 'components-checkbox--selected');
  const input = page.getByRole('checkbox', { name: 'Selected checkbox' });
  const root = page.locator('.checkbox');
  await expect(input).toBeVisible();
  await expect(root).toBeVisible();
  return { input, root };
}

test.describe('Material 3 Checkbox visual parity', () => {
  test('exposes native checked and indeterminate state and toggles from pointer and keyboard input', async ({
    page,
  }) => {
    await openStory(page, 'components-checkbox--states');
    const unchecked = page.getByRole('checkbox', { name: 'Unchecked', exact: true });
    const checked = page.getByRole('checkbox', { name: 'Checked', exact: true });
    const indeterminate = page.getByRole('checkbox', {
      name: 'Indeterminate',
      exact: true,
    });

    await expect(unchecked).not.toBeChecked();
    await expect(checked).toBeChecked();
    expect(
      await indeterminate.evaluate(
        (element) => (element as HTMLInputElement).indeterminate,
      ),
    ).toBe(true);

    const uncheckedRoot = page.locator('.checkbox').filter({ has: unchecked });
    await uncheckedRoot.click();
    await expect(unchecked).toBeChecked();

    await unchecked.focus();
    await page.keyboard.press('Space');
    await expect(unchecked).not.toBeChecked();
  });

  test('states', async ({ page }) => {
    await openStory(page, 'components-checkbox--states');
    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      'checkbox-states.png',
    );
  });

  test('disabled states', async ({ page }) => {
    await openStory(page, 'components-checkbox--disabled-states');
    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      'checkbox-disabled-states.png',
    );
  });

  test('control only', async ({ page }) => {
    await openStory(page, 'components-checkbox--control-only');
    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      'checkbox-control-only.png',
    );
  });

  test('theme matrix', async ({ page }) => {
    await openStory(page, 'components-checkbox--theme-matrix');
    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      'checkbox-theme-matrix.png',
    );
  });

  test('selected hover state layer', async ({ page }) => {
    const { root } = await openSelectedCheckbox(page);
    await root.hover();
    await expect(root).toHaveScreenshot('checkbox-selected-hover.png');
  });

  test('selected keyboard focus state layer', async ({ page }) => {
    const { input, root } = await openSelectedCheckbox(page);
    await page.keyboard.press('Tab');
    await expect(input).toBeFocused();
    await expect(root).toHaveScreenshot('checkbox-selected-focus.png');
  });

  test('selected press ripple', async ({ page }) => {
    const { root } = await openSelectedCheckbox(page);
    await root.hover();
    const box = await root.boundingBox();
    if (!box) throw new Error('Checkbox bounds unavailable');
    await page.mouse.move(box.x + 24, box.y + box.height / 2);
    await page.mouse.down();
    try {
      await expect(root).toHaveScreenshot('checkbox-selected-pressed.png');
    } finally {
      await page.mouse.up();
    }
  });

  test('removes box and mark transitions under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'components-checkbox--selected');
    const root = page.locator('.checkbox');
    await expect(root.locator('.checkbox__box')).toHaveCSS(
      'transition-duration',
      '0s',
    );
    await expect(root.locator('.checkbox__check-path')).toHaveCSS(
      'transition-duration',
      '0s',
    );
  });
});
