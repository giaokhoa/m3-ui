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

function expectClose(actual: number | undefined, expected: number) {
  expect(actual).not.toBeUndefined();
  expect(Math.abs((actual ?? 0) - expected)).toBeLessThan(0.7);
}

test.describe('Material 3 Snackbar browser contract', () => {
  test('uses canonical surface, single-line geometry, Body Medium and polite status semantics', async ({
    page,
  }) => {
    await openStory(page, 'components-snackbar--default');
    const snackbar = page.getByTestId('snackbar-default');
    const message = snackbar.getByRole('status');
    const box = await snackbar.boundingBox();
    const surface = await snackbar.evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        minHeight: computed.minHeight,
        maxWidth: computed.maxWidth,
        paddingLeft: computed.paddingLeft,
        paddingRight: computed.paddingRight,
        borderRadius: computed.borderRadius,
        boxShadow: computed.boxShadow,
      };
    });
    const type = await message.evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        fontSize: computed.fontSize,
        lineHeight: computed.lineHeight,
        fontWeight: computed.fontWeight,
        letterSpacing: computed.letterSpacing,
      };
    });

    expectClose(box?.height, 48);
    expect(surface).toMatchObject({
      minHeight: '48px',
      maxWidth: '600px',
      paddingLeft: '16px',
      paddingRight: '8px',
      borderRadius: '4px',
    });
    expect(surface.boxShadow).not.toBe('none');
    expect(type).toEqual({
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: '400',
      letterSpacing: '0.2px',
    });
    await expect(message).toHaveAttribute('aria-live', 'polite');
    await expect(message).toHaveAttribute('aria-atomic', 'true');
  });

  test('two Body Medium lines naturally produce the canonical 68px container height', async ({
    page,
  }) => {
    await openStory(page, 'components-snackbar--two-line');
    const snackbar = page.getByTestId('snackbar-two-line');
    const box = await snackbar.boundingBox();

    expectClose(box?.height, 68);
  });

  test('fills available width only up to the Compose 600px maximum', async ({ page }) => {
    await openStory(page, 'components-snackbar--maximum-width');
    const snackbar = page.getByTestId('snackbar-max-width');
    const box = await snackbar.boundingBox();

    expectClose(box?.width, 600);
  });

  test('SnackbarAction keeps Label Large treatment and real RAC hover/focus behavior', async ({
    page,
  }) => {
    await openStory(page, 'components-snackbar--with-action');
    const surface = page.getByTestId('snackbar-action-surface');
    const action = page.getByTestId('snackbar-action');
    const type = await action.evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        fontSize: computed.fontSize,
        lineHeight: computed.lineHeight,
        fontWeight: computed.fontWeight,
        letterSpacing: computed.letterSpacing,
      };
    });

    expect(type).toEqual({
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: '500',
      letterSpacing: '0.1px',
    });

    await page.mouse.move(1, 1);
    await action.hover();
    const ripple = action.locator('.ripple');
    await expect(ripple).toHaveAttribute('data-hovered', 'true');
    const hoverOpacity = await ripple.evaluate((element) =>
      getComputedStyle(element).getPropertyValue('--_ripple-hover-opacity').trim(),
    );
    expect(hoverOpacity).toBe('0.08');

    await page.mouse.move(1, 1);
    await page.keyboard.press('Tab');
    await expect(action).toBeFocused();
    await expect(surface).toBeVisible();
  });

  test('dismiss action keeps the 24px Snackbar icon and remains next in keyboard order', async ({
    page,
  }) => {
    await openStory(page, 'components-snackbar--with-dismiss');
    const action = page.getByTestId('snackbar-dismiss-action');
    const dismiss = page.getByTestId('snackbar-dismiss');
    const icon = dismiss.locator('.icon-button__icon');
    const dismissBox = await dismiss.boundingBox();
    const iconSize = await icon.evaluate((element) => {
      const computed = getComputedStyle(element);
      return { width: computed.width, height: computed.height };
    });

    expectClose(dismissBox?.height, 48);
    expect(iconSize).toEqual({ width: '24px', height: '24px' });
    await page.keyboard.press('Tab');
    await expect(action).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(dismiss).toBeFocused();
  });

  test('long-action layout uses the Compose column spacing instead of forcing one row', async ({
    page,
  }) => {
    await openStory(page, 'components-snackbar--action-on-new-line');
    const snackbar = page.getByTestId('snackbar-new-line');
    const message = snackbar.getByRole('status');
    const actions = snackbar.locator('.snackbar__actions');
    const layout = await snackbar.evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        flexDirection: computed.flexDirection,
        paddingRight: computed.paddingRight,
      };
    });
    const messagePaddingRight = await message.evaluate(
      (element) => getComputedStyle(element).paddingRight,
    );
    const actionPadding = await actions.evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        paddingBottom: computed.paddingBottom,
        paddingRight: computed.paddingRight,
      };
    });

    expect(layout).toEqual({ flexDirection: 'column', paddingRight: '0px' });
    expect(messagePaddingRight).toBe('16px');
    expect(actionPadding).toEqual({ paddingBottom: '4px', paddingRight: '8px' });
  });
});
