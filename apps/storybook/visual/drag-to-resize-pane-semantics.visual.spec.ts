import { expect, test, type Locator } from '@playwright/test';

async function expectCollapsedPaneSettled(pane: Locator) {
  await expect
    .poll(async () => (await pane.boundingBox())?.height ?? Number.POSITIVE_INFINITY)
    .toBeCloseTo(48, 0);
}

test('no-handle levitated pane exposes a semantic resize action without replacing its region', async ({
  page,
}) => {
  page.on('pageerror', (error) => {
    console.error(`[storybook pageerror] ${error.stack ?? error.message}`);
  });
  page.on('console', (message) => {
    if (message.type() === 'error') {
      console.error(`[storybook console] ${message.text()}`);
    }
  });

  await page.goto(
    '/iframe.html?id=layout-dragtoresizepanesemantics--no-handle&viewMode=story',
    { waitUntil: 'networkidle' },
  );
  await page.evaluate(async () => {
    await document.fonts.ready;
  });

  const pane = page.getByRole('region', { name: 'Tertiary pane' });
  const resizeAction = pane.locator('.three-pane-scaffold__levitated-resize-action');
  const innerAction = page.getByTestId('inner-action');

  await expect(pane).toBeVisible({ timeout: 15_000 });
  await expect(pane).toHaveAttribute('data-resize-state', 'default');
  await expect(resizeAction).toHaveAttribute('data-resize-state', 'default');
  await expect(resizeAction).toHaveAttribute('aria-label', 'expand');
  await expect(resizeAction).toHaveAttribute('aria-description', 'partially expanded');

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
  await expect(resizeAction).toHaveAttribute('aria-label', 'collapse');
  await expect(resizeAction).toHaveAttribute('aria-description', 'expanded');

  await resizeAction.dispatchEvent('click');
  await expect(pane).toHaveAttribute('data-resize-state', 'collapsed');
  await expect(resizeAction).toHaveAttribute('aria-label', 'partially expand');
  await expect(resizeAction).toHaveAttribute('aria-description', 'collapsed');
  // The state label updates when the spring starts. Wait for the previous
  // transition to finish before starting a second resize action so its spring
  // cannot keep writing the old boundary state over the new target.
  await expectCollapsedPaneSettled(pane);

  // A pointer click on non-interactive pane content keeps AndroidX whole-pane
  // click-to-resize behavior.
  await pane.click({ position: { x: 8, y: 8 } });
  await expect(pane).toHaveAttribute('data-resize-state', 'default');
  await expect(resizeAction).toHaveAttribute('aria-label', 'expand');
  await expect(resizeAction).toHaveAttribute('aria-description', 'partially expanded');
});
