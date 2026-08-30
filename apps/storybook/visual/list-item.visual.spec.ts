import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

function expectClose(actual: number | undefined, expected: number) {
  expect(actual).not.toBeUndefined();
  expect(Math.abs((actual ?? 0) - expected)).toBeLessThan(0.8);
}

test.describe('Material 3 ListItem browser contract', () => {
  test('uses canonical 56/72/88 one/two/three-line geometry', async ({ page }) => {
    await openStory(page, 'components-listitem--geometry');
    const one = page.getByTestId('list-one');
    const two = page.getByTestId('list-two');
    const three = page.getByTestId('list-three');
    expectClose((await one.boundingBox())?.height, 56);
    expectClose((await two.boundingBox())?.height, 72);
    expectClose((await three.boundingBox())?.height, 88);
    const visual = await one.evaluate((element) => ({ background: getComputedStyle(element, '::before').backgroundColor, radius: getComputedStyle(element).borderRadius }));
    expect(visual.background).toBe('rgb(254, 247, 255)');
    expect(visual.radius).toBe('0px');
  });

  test('aligns leading/trailing slots and uses logical placement', async ({ page }) => {
    await openStory(page, 'components-listitem--geometry');
    const item = page.getByTestId('list-two');
    const leading = item.locator('.list-item__leading');
    const trailing = item.locator('.list-item__trailing');
    const text = item.locator('.list-item__text');
    const [itemBox, leadingBox, trailingBox, textBox] = await Promise.all([item.boundingBox(), leading.boundingBox(), trailing.boundingBox(), text.boundingBox()]);
    expectClose((leadingBox?.y ?? 0) + (leadingBox?.height ?? 0) / 2, (itemBox?.y ?? 0) + (itemBox?.height ?? 0) / 2);
    expectClose((trailingBox?.y ?? 0) + (trailingBox?.height ?? 0) / 2, (itemBox?.y ?? 0) + (itemBox?.height ?? 0) / 2);
    expect(leadingBox?.x ?? 0).toBeLessThan(textBox?.x ?? 0);
    expect(trailingBox?.x ?? 0).toBeGreaterThan(textBox?.x ?? 0);
  });

  test('disabled item is visually disabled and cannot dispatch press', async ({ page }) => {
    await openStory(page, 'components-listitem--disabled');
    const passive = page.getByTestId('list-disabled-passive');
    const clickable = page.getByTestId('list-disabled-clickable');
    await expect(passive).toHaveAttribute('aria-disabled', 'true');
    await expect(clickable).toBeDisabled();
    const opacity = await clickable.locator('.list-item__headline').evaluate((element) => getComputedStyle(element).opacity);
    expect(opacity).toBe('0.38');
  });

  test('clickable item exposes button semantics, focus and the shared ripple', async ({ page }) => {
    await openStory(page, 'components-listitem--clickable');
    const item = page.getByTestId('list-clickable');
    await expect(item).toHaveAttribute('type', 'button');
    await item.hover();
    const ripple = item.locator(':scope > .ripple');
    await expect(ripple).toHaveAttribute('data-hovered', 'true');
    await item.focus();
    await expect(item).toBeFocused();
    await item.click();
    await expect(item.locator('.list-item__supporting')).toHaveText('Pressed 1 times');
  });

  test('single selection uses radio semantics and arrow-key selection in a group', async ({ page }) => {
    await openStory(page, 'components-listitem--single-selection');
    const alpha = page.getByTestId('single-alpha');
    const beta = page.getByTestId('single-beta');
    await expect(alpha).toHaveAttribute('role', 'radio');
    await expect(alpha).toHaveAttribute('aria-checked', 'true');
    await expect(beta).toHaveAttribute('aria-checked', 'false');
    await alpha.focus();
    await page.keyboard.press('ArrowDown');
    await expect(beta).toBeFocused();
    await expect(beta).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByTestId('single-selection-value')).toHaveText('Selected: beta');
  });

  test('multi selection uses checkbox semantics and toggles checked state', async ({ page }) => {
    await openStory(page, 'components-listitem--multiple-selection');
    const item = page.getByTestId('multi-item');
    await expect(item).toHaveAttribute('role', 'checkbox');
    await expect(item).toHaveAttribute('aria-checked', 'false');
    await item.click();
    await expect(item).toHaveAttribute('aria-checked', 'true');
    await expect(item.locator('.list-item__trailing')).toHaveText('On');
  });

  test('selected and dragged states resolve canonical container/shape/elevation visuals', async ({ page }) => {
    await openStory(page, 'components-listitem--visual-states');
    const selected = page.getByTestId('selected-item');
    const dragged = page.getByTestId('dragged-item');
    await expect(selected).toHaveAttribute('data-selected', 'true');
    await expect(selected).toHaveAttribute('data-elevation', 'level0');
    await expect(dragged).toHaveAttribute('data-dragged', 'true');
    await expect(dragged).toHaveAttribute('data-elevation', 'level4');
    const selectedVisual = await selected.evaluate((element) => ({
      background: getComputedStyle(element, '::before').backgroundColor,
      radius: getComputedStyle(element).borderRadius,
      shadow: getComputedStyle(element).boxShadow,
    }));
    const draggedVisual = await dragged.evaluate((element) => ({ radius: getComputedStyle(element).borderRadius, shadow: getComputedStyle(element).boxShadow }));
    expect(selectedVisual.background).toBe('rgb(232, 222, 248)');
    expect(selectedVisual.radius).toBe('16px');
    expect(selectedVisual.shadow).toBe('none');
    expect(draggedVisual.radius).toBe('16px');
    expect(draggedVisual.shadow).not.toMatch(/^none$/);
  });

  test('RTL swaps physical slot placement while preserving logical leading/trailing', async ({ page }) => {
    await openStory(page, 'components-listitem--rtl');
    const item = page.getByTestId('rtl-item');
    const [leadingBox, trailingBox] = await Promise.all([item.locator('.list-item__leading').boundingBox(), item.locator('.list-item__trailing').boundingBox()]);
    expect(leadingBox?.x ?? 0).toBeGreaterThan(trailingBox?.x ?? 0);
  });
});
