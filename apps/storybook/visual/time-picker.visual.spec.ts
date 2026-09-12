import { expect, test, type Locator, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => { await document.fonts.ready; });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

async function cssNumber(locator: Locator, property: string) {
  return locator.evaluate(
    (element, name) => Number.parseFloat(getComputedStyle(element).getPropertyValue(name)),
    property,
  );
}

test.describe('Material 3 TimePicker browser contract', () => {
  test('renders canonical selector, handle, center, track and dial geometry', async ({ page }) => {
    await openStory(page, 'components-timepicker--default');
    const dial = page.getByRole('slider', { name: 'Hour dial' });
    const box = await dial.boundingBox();
    expect(box?.width).toBe(256);
    expect(box?.height).toBe(256);
    const selectors = page.locator('.time-picker__time-selector');
    expect((await selectors.first().boundingBox())?.width).toBe(96);
    expect((await selectors.first().boundingBox())?.height).toBe(80);
    await expect(selectors.first()).toHaveText('10');
    await expect(selectors.nth(1)).toHaveText('30');
    const selected = dial.locator('.time-picker__dial-label[data-selected]');
    expect((await selected.boundingBox())?.width).toBe(48);
    expect((await selected.boundingBox())?.height).toBe(48);
    expect((await dial.locator('.time-picker__center').boundingBox())?.width).toBe(8);
    expect(await cssNumber(dial.locator('.time-picker__track'), 'width')).toBe(101);
    expect(await cssNumber(dial.locator('.time-picker__track'), 'height')).toBe(2);
    const twelve = dial.locator('.time-picker__dial-label', { hasText: '12' });
    const twelveBox = await twelve.boundingBox();
    expect((twelveBox?.y ?? 999) + (twelveBox?.height ?? 0) / 2).toBeLessThan((box?.y ?? 0) + 40);
  });

  test('applies canonical typography roles to picker, dial, period and input', async ({ page }) => {
    await openStory(page, 'components-timepicker--midnight');
    expect(await cssNumber(page.locator('.time-picker__time-selector').first(), 'font-size')).toBe(57);
    expect(await cssNumber(page.locator('.time-picker__dial-label').first(), 'font-size')).toBe(16);
    expect(await cssNumber(page.locator('.time-picker__period-button').first(), 'font-size')).toBe(16);
    expect(await cssNumber(page.locator('.time-picker__separator'), 'font-size')).toBe(57);

    await openStory(page, 'components-timepicker--input');
    expect(await cssNumber(page.getByRole('textbox', { name: 'Hour' }), 'font-size')).toBe(45);
    expect(await cssNumber(page.locator('.time-input__separator'), 'font-size')).toBe(57);
  });

  test('maps midnight and noon to 12 AM/PM', async ({ page }) => {
    await openStory(page, 'components-timepicker--midnight');
    await expect(page.locator('.time-picker__time-selector').first()).toHaveText('12');
    await expect(page.getByRole('radio', { name: 'AM' })).toBeChecked();
    await openStory(page, 'components-timepicker--noon');
    await expect(page.locator('.time-picker__time-selector').first()).toHaveText('12');
    await expect(page.getByRole('radio', { name: 'PM' })).toBeChecked();
  });

  test('dial click selects the mapped hour and automatically advances to minute', async ({ page }) => {
    await openStory(page, 'components-timepicker--midnight');
    const dial = page.getByRole('slider', { name: 'Hour dial' });
    await dial.click({ position: { x: 229, y: 128 } });
    await expect(page.locator('.time-picker__time-selector').first()).toHaveText('03');
    await expect(page.getByRole('slider', { name: 'Minute dial' })).toBeVisible();
  });

  test('minute drag across the 0 degree boundary wraps continuously to 01, not a distant value', async ({ page }) => {
    await openStory(page, 'components-timepicker--midnight');
    await page.locator('.time-picker__time-selector').nth(1).click();
    const dial = page.getByRole('slider', { name: 'Minute dial' });
    const box = await dial.boundingBox();
    const cx = (box?.x ?? 0) + (box?.width ?? 0) / 2;
    const cy = (box?.y ?? 0) + (box?.height ?? 0) / 2;
    await page.mouse.move(cx - 10, cy - 101);
    await page.mouse.down();
    await expect(page.locator('.time-picker__time-selector').nth(1)).toHaveText('59');
    await page.mouse.move(cx + 10, cy - 101, { steps: 3 });
    await page.mouse.up();
    await expect(page.locator('.time-picker__time-selector').nth(1)).toHaveText('01');
  });

  test('24h dial distinguishes representative outer and inner ring values', async ({ page }) => {
    await openStory(page, 'components-timepicker--twenty-four-hour');
    let dial = page.getByRole('slider', { name: 'Hour dial' });
    await expect(dial).toHaveAttribute('aria-valuemin', '0');
    await expect(dial).toHaveAttribute('aria-valuemax', '23');
    await expect(dial.locator('.time-picker__dial-label')).toHaveCount(24);
    await dial.click({ position: { x: 128, y: 27 } });
    await expect(page.locator('.time-picker__time-selector').first()).toHaveText('12');

    await openStory(page, 'components-timepicker--twenty-four-hour');
    dial = page.getByRole('slider', { name: 'Hour dial' });
    await dial.click({ position: { x: 128, y: 59 } });
    await expect(page.locator('.time-picker__time-selector').first()).toHaveText('00');
  });

  test('keyboard adjusts values, exposes focus-visible, and toggles hour/minute selection', async ({ page }) => {
    await openStory(page, 'components-timepicker--midnight');
    await page.keyboard.press('Tab');
    const hourButton = page.locator('.time-picker__time-selector').first();
    await expect(hourButton).toBeFocused();
    expect(await cssNumber(hourButton, 'outline-width')).toBeGreaterThanOrEqual(3);
    const dial = page.getByRole('slider', { name: 'Hour dial' });
    await dial.focus();
    await page.keyboard.press('ArrowRight');
    await expect(hourButton).toHaveText('01');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('slider', { name: 'Minute dial' })).toBeFocused();
  });

  test('AM/PM toggle preserves 12-hour display while changing canonical period', async ({ page }) => {
    await openStory(page, 'components-timepicker--default');
    await page.locator('.time-picker__period-button', { hasText: 'PM' }).click();
    await expect(page.getByRole('radio', { name: 'PM' })).toBeChecked();
    await expect(page.locator('.time-picker__time-selector').first()).toHaveText('10');
  });

  test('disabled picker removes controls from interaction and exposes dial disabled semantics', async ({ page }) => {
    await openStory(page, 'components-timepicker--disabled');
    await expect(page.locator('.time-picker__time-selector').first()).toBeDisabled();
    await expect(page.getByRole('radio', { name: 'AM' })).toBeDisabled();
    const dial = page.getByRole('slider', { name: 'Hour dial' });
    await expect(dial).toHaveAttribute('aria-disabled', 'true');
    await expect(dial).toHaveAttribute('tabindex', '-1');
  });

  test('TimeInput commits valid input, preserves invalid raw draft, and advances focus', async ({ page }) => {
    await openStory(page, 'components-timepicker--input');
    const hour = page.getByRole('textbox', { name: 'Hour' });
    const minute = page.getByRole('textbox', { name: 'Minute' });
    await hour.fill('11');
    await expect(minute).toBeFocused();
    await minute.fill('59');
    await expect(minute).not.toHaveAttribute('aria-invalid', 'true');
    await minute.fill('99');
    await expect(minute).toHaveAttribute('aria-invalid', 'true');
    await minute.blur();
    await expect(minute).toHaveValue('99');
  });

  test('dial and input share controlled time state in both directions', async ({ page }) => {
    await openStory(page, 'components-timepicker--shared-state');
    await page.locator('.time-picker__time-selector').nth(1).click();
    const dial = page.getByRole('slider', { name: 'Minute dial' });
    await dial.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByTestId('time-value')).toHaveText('11:26');
    await expect(page.getByRole('textbox', { name: 'Minute' })).toHaveValue('26');
    await page.getByRole('textbox', { name: 'Minute' }).fill('27');
    await expect(page.getByTestId('time-value')).toHaveText('11:27');
    await expect(page.locator('.time-picker__time-selector').nth(1)).toHaveText('27');
  });

  test('horizontal layout uses 216x38 period selector while vertical uses 52x80', async ({ page }) => {
    await openStory(page, 'components-timepicker--horizontal');
    let period = page.getByRole('radiogroup', { name: 'AM or PM' });
    expect((await period.boundingBox())?.width).toBe(216);
    expect((await period.boundingBox())?.height).toBe(38);
    await openStory(page, 'components-timepicker--midnight');
    period = page.getByRole('radiogroup', { name: 'AM or PM' });
    expect((await period.boundingBox())?.width).toBe(52);
    expect((await period.boundingBox())?.height).toBe(80);
  });

  test('auto layout responds to parent container size rather than viewport', async ({ page }) => {
    await openStory(page, 'components-timepicker--responsive');
    const picker = page.getByTestId('responsive-time-picker');
    await expect(picker).toHaveAttribute('data-layout', 'vertical');
    await page.getByRole('button', { name: 'Wide' }).click();
    await expect(picker).toHaveAttribute('data-layout', 'horizontal');
    await page.getByRole('button', { name: 'Narrow' }).click();
    await expect(picker).toHaveAttribute('data-layout', 'vertical');
  });

  test('vibrant geometry/colors, RTL, and reduced motion remain explicit', async ({ page }) => {
    await openStory(page, 'components-timepicker--vibrant');
    const picker = page.locator('.time-picker');
    expect((await picker.boundingBox())?.width).toBeGreaterThan(256);
    await expect(picker.locator('.time-picker__dial')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    const vibrantField = await picker.locator('.time-picker__time-selector').first().boundingBox();
    expect(vibrantField?.width).toBe(100);
    expect(vibrantField?.height).toBe(120);
    const vibrantPeriod = await picker.getByRole('radiogroup', { name: 'AM or PM' }).boundingBox();
    expect(vibrantPeriod?.width).toBe(56);
    expect(vibrantPeriod?.height).toBe(120);
    expect(await cssNumber(picker.locator('.time-picker__time-selector').first(), 'border-radius')).toBeGreaterThan(8);

    await openStory(page, 'components-timepicker--vibrant-input');
    const vibrantInput = page.getByRole('textbox', { name: 'Hour' });
    expect((await vibrantInput.boundingBox())?.width).toBe(100);
    expect((await vibrantInput.boundingBox())?.height).toBe(120);

    await openStory(page, 'components-timepicker--rtl');
    await expect(page.locator('.time-picker__dial')).toHaveCSS('direction', 'ltr');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('.time-picker__track')).toHaveCSS('transition-duration', '0s');
    await expect(page.locator('.time-picker__dial-label').first()).toHaveCSS('transition-duration', '0s');
  });

  test('TimeScroll reuses scroll-field keyboard, wheel, and pointer selection with accessible value text', async ({ page }) => {
    await openStory(page, 'components-timepicker--scroll');
    const hour = page.getByRole('spinbutton', { name: 'Hour' });
    const minute = page.getByRole('spinbutton', { name: 'Minute' });
    await expect(hour).toHaveAttribute('aria-valuetext', '10 AM');
    await expect(minute).toHaveAttribute('aria-valuetext', '30 minutes');
    expect((await hour.boundingBox())?.width).toBe(100);
    expect((await hour.boundingBox())?.height).toBe(120);

    await hour.focus();
    await page.keyboard.press('ArrowDown');
    await expect(hour).toHaveAttribute('aria-valuetext', '11 AM');

    await minute.hover();
    await page.mouse.wheel(0, 40);
    await page.waitForTimeout(120);
    await expect(minute).toHaveAttribute('aria-valuetext', '31 minutes');

    const nextHour = hour.locator('[data-scroll-field-item][data-offset="1"]');
    await nextHour.click();
    await expect(hour).toHaveAttribute('aria-valuetext', '12 AM');
  });

  test('TimeScroll preserves normalized 24-hour state without an AM/PM control', async ({ page }) => {
    await openStory(page, 'components-timepicker--scroll-twenty-four-hour');
    const hour = page.getByRole('spinbutton', { name: 'Hour' });
    const minute = page.getByRole('spinbutton', { name: 'Minute' });
    await expect(hour).toHaveAttribute('aria-valuenow', '18');
    await expect(hour).toHaveAttribute('aria-valuetext', '18 hours');
    await expect(minute).toHaveAttribute('aria-valuenow', '45');
    await expect(page.getByRole('radiogroup', { name: 'AM or PM' })).toHaveCount(0);
    await hour.focus();
    await page.keyboard.press('ArrowDown');
    await expect(hour).toHaveAttribute('aria-valuetext', '19 hours');
  });

  test('controlled raw TimeInput draft remains distinct from the last valid time', async ({ page }) => {
    await openStory(page, 'components-timepicker--draft-state');
    const minute = page.getByRole('textbox', { name: 'Minute' });
    await minute.fill('99');
    await expect(minute).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByTestId('draft-raw-value')).toHaveText('10:99');
    await expect(page.getByTestId('draft-time-value')).toHaveText('10:30');
    await minute.blur();
    await expect(minute).toHaveValue('99');
    await expect(page.getByTestId('draft-time-value')).toHaveText('10:30');

    await minute.fill('45');
    await expect(page.getByTestId('draft-raw-value')).toHaveText('10:45');
    await expect(page.getByTestId('draft-time-value')).toHaveText('10:45');
  });

  test('dial, input, and scroll modes preserve one controlled TimeOfDay while switching', async ({ page }) => {
    await openStory(page, 'components-timepicker--mode-switch');
    await expect(page.getByTestId('switch-time-value')).toHaveText('11:25');
    await page.getByRole('button', { name: 'Scroll' }).click();
    const minute = page.getByRole('spinbutton', { name: 'Minute' });
    await minute.focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByTestId('switch-time-value')).toHaveText('11:26');

    await page.getByRole('button', { name: 'Input' }).click();
    await expect(page.getByRole('textbox', { name: 'Minute' })).toHaveValue('26');
    await page.getByRole('textbox', { name: 'Hour' }).fill('09');
    await expect(page.getByTestId('switch-time-value')).toHaveText('09:26');

    await page.getByRole('button', { name: 'Dial' }).click();
    await expect(page.locator('.time-picker__time-selector').first()).toHaveText('09');
    await expect(page.locator('.time-picker__time-selector').nth(1)).toHaveText('26');
  });

  test('TimeScroll keeps numeric fields LTR, period logically trailing in RTL, survives zoom, and reduces motion', async ({ page }) => {
    await openStory(page, 'components-timepicker--scroll-rtl');
    const root = page.getByTestId('time-scroll');
    const fields = root.locator('.time-scroll__fields');
    const period = root.getByRole('radiogroup', { name: 'AM or PM' });
    await expect(fields).toHaveCSS('direction', 'ltr');
    const fieldsBox = await fields.boundingBox();
    const periodBox = await period.boundingBox();
    expect(periodBox?.x ?? 0).toBeLessThan(fieldsBox?.x ?? 0);

    await root.evaluate((element) => { (element as HTMLElement).style.zoom = '1.5'; });
    const hourBox = await root.getByRole('spinbutton', { name: 'Hour' }).boundingBox();
    const minuteBox = await root.getByRole('spinbutton', { name: 'Minute' }).boundingBox();
    expect((hourBox?.x ?? 0) + (hourBox?.width ?? 0)).toBeLessThanOrEqual(minuteBox?.x ?? 0);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(root.locator('.scroll-field__item').first()).toHaveCSS('transition-duration', '0s');
  });

});
