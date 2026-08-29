import { expect, test } from '@playwright/test';

test('no-handle levitated pane exposes a semantic resize action without replacing its region', async ({
  page,
}) => {
  await page.goto(
    '/iframe.html?id=layout-dragtoresizepanesemantics--no-handle&viewMode=story',
    { waitUntil: 'networkidle' },
  );
  await page.evaluate(async () => {
    await document.fonts.ready;
  });

  const pane = page.getByRole('region', { name: 'Tertiary pane' });
  const resizeAction = page.getByRole('button', { name: 'Resize pane' });
  const innerAction = page.getByTestId('inner-action');

  await expect(pane).toHaveAttribute('data-resize-state', 'default');
  await expect(resizeAction).toHaveAttribute('data-resize-state', 'default');
  await expect(resizeAction).toHaveAttribute(
    'aria-description',
    'partially expanded. expand',
  );

  // Pointer and keyboard activation owned by pane contents must not bubble
  // into the whole-pane resize gesture/click target.
  await innerAction.click();
  await expect(pane).toHaveAttribute('data-resize-state', 'default');
  await innerAction.focus();
  await page.keyboard.press('Enter');
  await expect(pane).toHaveAttribute('data-resize-state', 'default');

  // The browser-native semantic delegate supplies keyboard and AT activation.
  // Pointer ownership stays on the whole pane to avoid a double-cycle through
  // nested pointer bubbling after the delegate becomes focus-visible.
  await resizeAction.focus();
  await expect(resizeAction).toHaveCSS('pointer-events', 'none');
  await page.keyboard.press('Enter');
  await expect(pane).toHaveAttribute('data-resize-state', 'expanded');
  await expect(resizeAction).toHaveAttribute('aria-description', 'expanded. collapse');

  await resizeAction.dispatchEvent('click');
  await expect(pane).toHaveAttribute('data-resize-state', 'collapsed');
  await expect(resizeAction).toHaveAttribute(
    'aria-description',
    'collapsed. partially expand',
  );

  // A pointer click on non-interactive pane content keeps AndroidX whole-pane
  // click-to-resize behavior.
  await pane.click({ position: { x: 8, y: 8 } });
  await expect(pane).toHaveAttribute('data-resize-state', 'default');
});
