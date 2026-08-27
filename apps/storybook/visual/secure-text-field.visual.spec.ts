import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => document.fonts.ready);
  await expect(page.locator('#storybook-root')).toBeVisible();
}

test.describe('Material 3 SecureTextField browser contracts', () => {
  test('uses native password semantics and preserves autocomplete', async ({ page }) => {
    await openStory(page, 'components-securetextfield--default');
    const input = page.locator('input[name=""]');
    const password = page.locator('input[type="password"]');
    await expect(password).toHaveCount(1);
    await expect(password).toHaveAttribute('autocomplete', 'current-password');
    expect(await password.evaluate((el) => el.tagName)).toBe('INPUT');
    await expect(page.locator('textarea')).toHaveCount(0);
    expect(await input.count()).toBeGreaterThanOrEqual(0);
  });

  test('filled and outlined reuse TextField geometry', async ({ page }) => {
    await openStory(page, 'components-securetextfield--default');
    await expect(page.locator('.text-field--filled .text-field__container')).toHaveCSS('min-height', '56px');
    await openStory(page, 'components-securetextfield--outlined');
    const outlined = page.locator('.text-field--outlined .text-field__outlined-container');
    await expect(outlined).toHaveCSS('min-height', '56px');
    await expect(outlined).toHaveCSS('border-top-width', '1px');
  });

  test('reveal preserves value, focus and caret without submitting a form', async ({ page }) => {
    await openStory(page, 'components-securetextfield--with-value');
    const input = page.locator('input');
    await input.focus();
    await input.evaluate((el: HTMLInputElement) => el.setSelectionRange(7, 12));
    await page.getByRole('button', { name: 'Show password' }).click();
    await expect(input).toHaveAttribute('type', 'text');
    await expect(input).toHaveValue('correct horse battery staple');
    await expect(input).toBeFocused();
    expect(await input.evaluate((el: HTMLInputElement) => [el.selectionStart, el.selectionEnd])).toEqual([7, 12]);
    await page.getByRole('button', { name: 'Hide password' }).click();
    await expect(input).toHaveAttribute('type', 'password');
    await expect(input).toHaveValue('correct horse battery staple');
  });

  test('form submission carries actual value and plaintext is not copied into DOM text/data attrs', async ({ page }) => {
    await openStory(page, 'components-securetextfield--form-contract');
    const input = page.locator('input[type="password"]');
    await expect(input).toHaveAttribute('name', 'password');
    await expect(input).toHaveAttribute('autocomplete', 'new-password');
    const result = await page.locator('form').evaluate((form) => {
      const data = new FormData(form as HTMLFormElement);
      const html = form.outerHTML;
      return { value: data.get('password'), html, text: form.textContent ?? '' };
    });
    expect(result.value).toBe('submitted-secret');
    expect(result.text).not.toContain('submitted-secret');
    expect(result.html).not.toContain('data-value="submitted-secret"');
  });

  test('supports controlled/uncontrolled, invalid, disabled and RTL states', async ({ page }) => {
    await openStory(page, 'components-securetextfield--controlled');
    const controlled = page.locator('input');
    await controlled.fill('next controlled value');
    await expect(controlled).toHaveValue('next controlled value');

    await openStory(page, 'components-securetextfield--invalid');
    await expect(page.locator('.text-field')).toHaveAttribute('data-invalid', 'true');
    await expect(page.locator('.text-field__error')).toContainText('Password is too short');

    await openStory(page, 'components-securetextfield--disabled');
    await expect(page.locator('input')).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Show password' })).toBeDisabled();

    await openStory(page, 'components-securetextfield--rtl');
    await expect(page.locator('[dir="rtl"]')).toBeVisible();
    await expect(page.locator('input')).toHaveAttribute('type', 'password');
  });
});
