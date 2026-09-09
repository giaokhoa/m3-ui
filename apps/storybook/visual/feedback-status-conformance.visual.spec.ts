import { expect, test, type Locator } from '@playwright/test';
import { openStory } from '../test-support/story';

const themePortalSelector = '[data-' + 'm3' + '-theme-portal]';

async function resolvedColor(scope: Locator, value: string): Promise<string> {
  return scope.evaluate((element, colorValue) => {
    const probe = document.createElement('span');
    probe.style.color = colorValue;
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    element.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, value);
}

test.describe('Material 3 Lane 6 feedback/status shared conformance', () => {
  test('dynamic roles reach progress, loading, snackbar, and nested tooltip portals', async ({
    page,
  }) => {
    await openStory(page, 'conformance-feedbackstatus--dynamic-theme');

    const theme = page.locator('.feedback-status-dynamic-theme');
    const [
      primary,
      secondaryContainer,
      primaryContainer,
      onPrimaryContainer,
      inverseSurface,
      inverseOnSurface,
      inversePrimary,
      surfaceContainer,
    ] = await Promise.all([
      resolvedColor(theme, 'var(--primary)'),
      resolvedColor(theme, 'var(--secondary-container)'),
      resolvedColor(theme, 'var(--primary-container)'),
      resolvedColor(theme, 'var(--on-primary-container)'),
      resolvedColor(theme, 'var(--inverse-surface)'),
      resolvedColor(theme, 'var(--inverse-on-surface)'),
      resolvedColor(theme, 'var(--inverse-primary)'),
      resolvedColor(theme, 'var(--surface-container)'),
    ]);

    const progress = page.getByTestId('theme-progress');
    await expect(progress).toHaveCSS('color', primary);
    await expect(progress.locator('.progress-indicator__track')).toHaveCSS(
      'stroke',
      secondaryContainer,
    );

    const loading = page.getByTestId('theme-loading');
    await expect(loading).toHaveCSS('background-color', primaryContainer);
    await expect(loading).toHaveCSS('color', onPrimaryContainer);

    const snackbar = page.getByTestId('theme-snackbar');
    await expect(snackbar).toHaveCSS('background-color', inverseSurface);
    await expect(snackbar.getByRole('status')).toHaveCSS('color', inverseOnSurface);
    await expect(page.getByTestId('theme-snackbar-action')).toHaveCSS('color', inversePrimary);

    await page.mouse.move(1, 1);
    const plainTrigger = page.getByTestId('theme-plain-tooltip-trigger');
    await plainTrigger.hover();
    const plainTooltip = page.getByTestId('theme-plain-tooltip');
    await expect(plainTooltip).toBeVisible();
    await expect(plainTooltip).toHaveCSS('background-color', inverseSurface);
    await expect(plainTooltip).toHaveCSS('color', inverseOnSurface);
    await expect(page.locator(themePortalSelector).filter({ has: plainTooltip })).toHaveCount(1);

    await page.mouse.move(1, 1);
    await expect(plainTooltip).toBeHidden();

    const richTrigger = page.getByTestId('theme-rich-tooltip-trigger');
    await richTrigger.hover();
    const richTooltip = page.getByTestId('theme-rich-tooltip');
    await expect(richTooltip).toBeVisible();
    await expect(richTooltip).toHaveCSS('background-color', surfaceContainer);
    await expect(page.locator(themePortalSelector).filter({ has: richTooltip })).toHaveCount(1);
  });

  test('ProgressIndicator owns RTL linear direction flipping', async ({ page }) => {
    await openStory(page, 'conformance-feedbackstatus--rtl-progress');

    const progress = page.getByTestId('rtl-progress');
    await expect(progress).toHaveCSS('direction', 'rtl');
    await expect(progress.locator('.progress-indicator__svg')).toHaveCSS(
      'transform',
      'matrix(-1, 0, 0, 1, 0, 0)',
    );
  });

  test('Tooltip removes component-owned entrance motion when reduced motion is requested', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'conformance-feedbackstatus--dynamic-theme');

    await page.mouse.move(1, 1);
    const trigger = page.getByTestId('theme-plain-tooltip-trigger');
    await trigger.hover();
    const tooltip = page.getByTestId('theme-plain-tooltip');
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveCSS('transition-duration', '0s');
    await expect(tooltip).toHaveCSS('opacity', '1');
    await expect(tooltip).toHaveCSS('scale', '1');
  });
});
