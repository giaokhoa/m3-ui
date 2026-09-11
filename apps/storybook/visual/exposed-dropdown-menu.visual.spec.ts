import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

test.describe('Material 3 ExposedDropdownMenu browser contract', () => {
  test('read-only field opens, exposes combobox/listbox semantics, selects and dismisses', async ({ page }) => {
    await openStory(page, 'components-exposeddropdownmenu--filled-read-only');
    const input = page.getByRole('combobox', { name: 'Density' });
    await input.click();
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('listbox')).toBeVisible();
    await page.getByRole('option', { name: 'Comfortable' }).click();
    await expect(page.getByTestId('selected-value')).toHaveText('comfortable');
    await expect(input).toHaveValue('Comfortable');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  test('editable typing keeps focus and Arrow+Enter selects without component filtering', async ({ page }) => {
    await openStory(page, 'components-exposeddropdownmenu--editable');
    const input = page.getByRole('combobox', { name: 'Density' });
    await input.focus();
    await input.fill('Com');
    await expect(input).toBeFocused();
    await expect(page.getByRole('option')).toHaveCount(4);
    await input.press('ArrowDown');
    await input.press('Enter');
    await expect(page.getByTestId('selected-value')).not.toHaveText('medium');
    await expect(input).toBeFocused();
  });

  test('Escape and outside press dismiss controlled open state', async ({ page }) => {
    await openStory(page, 'components-exposeddropdownmenu--controlled');
    const input = page.getByRole('combobox', { name: 'Controlled density' });
    await expect(page.getByTestId('open-state')).toHaveText('true');
    await input.press('Escape');
    await expect(page.getByTestId('open-state')).toHaveText('false');
    await input.click();
    await expect(page.getByTestId('open-state')).toHaveText('true');
    await page.mouse.click(2, 2);
    await expect(page.getByTestId('open-state')).toHaveText('false');
  });

  test('disabled primary and secondary anchors do not open', async ({ page }) => {
    await openStory(page, 'components-exposeddropdownmenu--disabled');
    const input = page.getByRole('combobox', { name: 'Disabled density' });
    await expect(input).toBeDisabled();
    const trigger = page.getByRole('button', { name: 'Toggle options' });
    await expect(trigger).toBeDisabled();
    await expect(page.getByRole('listbox')).toBeHidden();
  });

  test('matched width follows anchor while width opt-out is independent', async ({ page }) => {
    await openStory(page, 'components-exposeddropdownmenu--filled-read-only');
    const input = page.getByRole('combobox', { name: 'Density' });
    await input.click();
    const field = input.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " text-field ")][1]');
    const popover = page.locator('.exposed-dropdown-menu__popover');
    const fieldBox = await field.boundingBox();
    const popoverBox = await popover.boundingBox();
    expect(Math.abs((fieldBox?.width ?? 0) - (popoverBox?.width ?? 0))).toBeLessThan(2);

    await openStory(page, 'components-exposeddropdownmenu--width-not-matched');
    const freeField = page.getByRole('combobox', { name: 'Free width density' });
    const freePopover = page.locator('.exposed-dropdown-menu__popover');
    const freeFieldBox = await freeField.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " text-field ")][1]').boundingBox();
    const freePopoverBox = await freePopover.boundingBox();
    expect(Math.abs((freeFieldBox?.width ?? 0) - (freePopoverBox?.width ?? 0))).toBeGreaterThan(2);
  });

  test('edge placement and long list remain inside viewport with internal scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 300 });
    await openStory(page, 'components-exposeddropdownmenu--edge-placement');
    const popover = page.locator('.exposed-dropdown-menu__popover');
    const box = await popover.boundingBox();
    expect(box).not.toBeNull();
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(352.5);
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(292.5);

    await openStory(page, 'components-exposeddropdownmenu--long-list');
    const listbox = page.getByRole('listbox');
    const metrics = await listbox.evaluate((node) => ({ clientHeight: node.clientHeight, scrollHeight: node.scrollHeight }));
    expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight);
  });

  test('secondary trigger reports expanded state and returns focus to editable anchor contract', async ({ page }) => {
    await openStory(page, 'components-exposeddropdownmenu--secondary-trigger');
    const input = page.getByRole('combobox', { name: 'Density' });
    const trigger = page.getByRole('button', { name: 'Toggle options' });
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(input).toBeFocused();
    await expect(page.getByRole('listbox')).toBeVisible();
  });

  test('RTL uses logical alignment and selected value participates in forms', async ({ page }) => {
    await openStory(page, 'components-exposeddropdownmenu--rtl');
    await page.getByRole('combobox', { name: 'Density' }).click();
    await expect(page.getByRole('option').first()).toHaveCSS('text-align', 'start');

    await openStory(page, 'components-exposeddropdownmenu--form-participation');
    await page.getByRole('combobox', { name: 'Form density' }).click();
    await page.getByRole('option', { name: 'Comfortable' }).click();
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByTestId('form-value')).toHaveText('comfortable');
  });
});
