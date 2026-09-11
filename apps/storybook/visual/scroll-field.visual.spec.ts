import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

async function field(page: Page) {
  return page.locator('.scroll-field').first();
}

test.describe('Material 3 ScrollField browser contract', () => {
  test('uncontrolled starts centered and exposes current value', async ({ page }) => {
    await openStory(page, 'components-scrollfield--uncontrolled');
    const control = await field(page);
    await expect(control).toHaveAttribute('role', 'spinbutton');
    await expect(control).toHaveAttribute('data-selected-index', '2');
    await expect(control).toHaveAttribute('aria-valuetext', '02');
    const selected = control.locator('[data-selected="true"]');
    const [controlBox, selectedBox] = await Promise.all([control.boundingBox(), selected.boundingBox()]);
    expect(Math.abs(((selectedBox?.y ?? 0) + (selectedBox?.height ?? 0) / 2) - ((controlBox?.y ?? 0) + (controlBox?.height ?? 0) / 2))).toBeLessThan(1);
  });

  test('Arrow keys change exactly one option and wrap', async ({ page }) => {
    await openStory(page, 'components-scrollfield--controlled');
    const control = page.getByTestId('scroll-field');
    await control.focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByTestId('controlled-value')).toHaveText('2');
    await page.keyboard.press('ArrowUp');
    await expect(page.getByTestId('controlled-value')).toHaveText('1');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    await expect(page.getByTestId('controlled-value')).toHaveText('5');
  });

  test('clicking adjacent option selects it once', async ({ page }) => {
    await openStory(page, 'components-scrollfield--controlled');
    const control = page.getByTestId('scroll-field');
    await control.locator('[data-offset="1"]').click();
    await expect(page.getByTestId('controlled-value')).toHaveText('2');
  });

  test('wheel settles to nearest item', async ({ page }) => {
    await openStory(page, 'components-scrollfield--controlled');
    const control = page.getByTestId('scroll-field');
    await control.hover();
    await page.mouse.wheel(0, 80);
    await expect.poll(async () => page.getByTestId('controlled-value').textContent()).toBe('2');
  });

  test('pointer drag settles and keeps selected row centered', async ({ page }) => {
    await openStory(page, 'components-scrollfield--controlled');
    const control = page.getByTestId('scroll-field');
    const box = await control.boundingBox();
    if (!box) throw new Error('ScrollField missing');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 - 80, { steps: 5 });
    await page.mouse.up();
    await expect(page.getByTestId('controlled-value')).toHaveText('2');
    const selected = control.locator('[data-selected="true"]');
    const selectedBox = await selected.boundingBox();
    expect(Math.abs(((selectedBox?.y ?? 0) + (selectedBox?.height ?? 0) / 2) - (box.y + box.height / 2))).toBeLessThan(1);
  });

  test('disabled control is not focusable or interactive', async ({ page }) => {
    await openStory(page, 'components-scrollfield--disabled');
    const control = await field(page);
    await expect(control).toHaveAttribute('aria-disabled', 'true');
    await expect(control).toHaveAttribute('tabindex', '-1');
    await control.hover();
    await page.mouse.wheel(0, 100);
    await expect(control).toHaveAttribute('data-selected-index', '3');
  });

  test('custom labels expose accessible current value', async ({ page }) => {
    await openStory(page, 'components-scrollfield--custom-labels');
    const control = await field(page);
    await expect(control).toHaveAttribute('aria-label', 'Planet');
    await expect(control).toHaveAttribute('aria-valuetext', 'Planet Venus');
  });

  test('resize keeps snap center and does not grow DOM with item count', async ({ page }) => {
    await openStory(page, 'components-scrollfield--long-labels');
    const control = await field(page);
    await control.evaluate((element) => { (element as HTMLElement).style.height = '260px'; });
    const selected = control.locator('[data-selected="true"]');
    await expect.poll(async () => {
      const [a, b] = await Promise.all([control.boundingBox(), selected.boundingBox()]);
      return Math.abs(((b?.y ?? 0) + (b?.height ?? 0) / 2) - ((a?.y ?? 0) + (a?.height ?? 0) / 2));
    }).toBeLessThan(1);
    await expect(control.locator('[data-scroll-field-item]')).toHaveCount(5);
  });

  test('reduced motion still settles without transition dependency', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'components-scrollfield--reduced-motion');
    const control = await field(page);
    await control.focus();
    await page.keyboard.press('ArrowDown');
    await expect(control).toHaveAttribute('data-selected-index', '5');
    expect(await control.locator('[data-selected="true"]').evaluate((element) => getComputedStyle(element).transitionDuration)).toBe('0s');
  });
});
