import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, {
    waitUntil: 'networkidle',
  });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

function expectClose(actual: number | undefined, expected: number) {
  expect(actual).not.toBeUndefined();
  expect(Math.abs((actual ?? 0) - expected)).toBeLessThan(0.8);
}

async function openDefaultDialog(page: Page) {
  await openStory(page, 'components-dialog--default');
  const trigger = page.getByRole('button', { name: 'Open dialog' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Discard draft?' });
  await expect(dialog).toBeVisible();
  return { trigger, dialog };
}

test.describe('Material 3 Dialog browser contract', () => {
  test('uses AndroidX minimum geometry, padding, shape and text styles', async ({
    page,
  }) => {
    await openStory(page, 'components-dialog--geometry');
    const dialog = page.getByTestId('dialog-geometry');
    const modal = page.locator('.dialog-modal');
    const modalBox = await modal.boundingBox();
    const surface = await dialog.evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        paddingInline: computed.paddingInline,
        paddingBlock: computed.paddingBlock,
        borderRadius: computed.borderRadius,
        backgroundColor: computed.backgroundColor,
        boxShadow: computed.boxShadow,
      };
    });
    const title = dialog.locator('.dialog__title');
    const description = dialog.locator('.dialog__description');

    expectClose(modalBox?.width, 280);
    expect(surface.paddingInline).toBe('24px');
    expect(surface.paddingBlock).toBe('24px');
    expect(surface.borderRadius).toBe('28px');
    expect(surface.boxShadow).not.toBe('none');
    await expect(title).toHaveCSS('font-size', '24px');
    await expect(title).toHaveCSS('line-height', '32px');
    await expect(description).toHaveCSS('font-size', '14px');
    await expect(description).toHaveCSS('line-height', '20px');
    await expect(description).toHaveCSS('margin-bottom', '24px');
  });

  test('caps intrinsic content at the AndroidX 560px maximum width', async ({
    page,
  }) => {
    await openStory(page, 'components-dialog--maximum-width');
    const modalBox = await page.locator('.dialog-modal').boundingBox();
    const dialogBox = await page.getByTestId('dialog-maximum-width').boundingBox();

    expectClose(modalBox?.width, 560);
    expectClose(dialogBox?.width, 560);
  });

  test('paints the shared Scrim recipe without stealing RAC underlay interaction', async ({
    page,
  }) => {
    await openDefaultDialog(page);
    const overlay = page.locator('.dialog-overlay');
    const pseudo = await overlay.evaluate((element) => {
      const computed = getComputedStyle(element, '::before');
      return {
        backgroundColor: computed.backgroundColor,
        opacity: computed.opacity,
        pointerEvents: computed.pointerEvents,
      };
    });

    expect(pseudo).toEqual({
      backgroundColor: 'rgb(0, 0, 0)',
      opacity: '0.32',
      pointerEvents: 'none',
    });

    await overlay.click({ position: { x: 4, y: 4 } });
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('keeps confirm callbacks caller-owned while RAC close slot dismisses', async ({
    page,
  }) => {
    const { trigger, dialog } = await openDefaultDialog(page);
    const confirm = page.getByRole('button', { name: 'Discard' });
    const cancel = page.getByRole('button', { name: 'Cancel' });

    await confirm.click();
    await expect(dialog).toBeVisible();

    await cancel.click();
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('RAC traps focus, handles Escape, and restores focus to the trigger', async ({
    page,
  }) => {
    const { trigger, dialog } = await openDefaultDialog(page);

    for (let index = 0; index < 5; index += 1) {
      await page.keyboard.press('Tab');
      const focusInsideModal = await page.evaluate(() =>
        Boolean(document.activeElement?.closest('.dialog-modal')),
      );
      expect(focusInsideModal).toBe(true);
    }

    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('icon, centered title and actions follow Material geometry and typography', async ({
    page,
  }) => {
    await openStory(page, 'components-dialog--with-icon');
    await page.getByRole('button', { name: 'Open icon dialog' }).click();
    const dialog = page.getByTestId('dialog-icon');
    const icon = dialog.locator('.dialog__icon');
    const title = dialog.locator('.dialog__title');
    const actions = dialog.locator('.dialog__actions');
    const cancel = page.getByRole('button', { name: 'Cancel' });
    const confirm = page.getByRole('button', { name: 'Discard' });
    const iconBox = await icon.boundingBox();
    const titleBox = await title.boundingBox();
    const dialogBox = await dialog.boundingBox();
    const cancelBox = await cancel.boundingBox();
    const confirmBox = await confirm.boundingBox();

    expectClose(iconBox?.width, 24);
    expectClose(iconBox?.height, 24);
    await expect(icon).toHaveCSS('margin-bottom', '16px');
    await expect(title).toHaveCSS('margin-bottom', '16px');
    expectClose(
      (titleBox?.x ?? 0) + (titleBox?.width ?? 0) / 2,
      (dialogBox?.x ?? 0) + (dialogBox?.width ?? 0) / 2,
    );
    await expect(actions).toHaveCSS('gap', '8px');
    await expect(cancel).toHaveCSS('font-size', '14px');
    await expect(cancel).toHaveCSS('line-height', '20px');
    expect((cancelBox?.x ?? 0) < (confirmBox?.x ?? 0)).toBe(true);
  });
});
