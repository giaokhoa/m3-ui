import { expect, test, type Locator } from '@playwright/test';
import { openStory } from '../test-support/story';

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

test.describe('Material 3 Lane 9 interaction/layout utility shared conformance', () => {
  test('nested source-color roles reach family-owned utility paint', async ({ page }) => {
    await openStory(page, 'conformance-interactionutilities--dynamic-theme');

    const theme = page.locator('.interaction-utilities-dynamic-theme');
    const [
      secondary,
      surfaceContainerHigh,
      primary,
      surfaceContainerLowest,
      onSurface,
      outline,
      scrollbarThumb,
    ] = await Promise.all([
      resolvedColor(theme, 'var(--secondary)'),
      resolvedColor(theme, 'var(--surface-container-high)'),
      resolvedColor(theme, 'var(--primary)'),
      resolvedColor(theme, 'var(--surface-container-lowest)'),
      resolvedColor(theme, 'var(--on-surface)'),
      resolvedColor(theme, 'var(--outline)'),
      resolvedColor(theme, 'color-mix(in srgb, var(--outline) 70%, transparent)'),
    ]);

    const carouselViewport = page
      .getByTestId('theme-carousel')
      .locator('.carousel__viewport');
    await carouselViewport.focus();
    await expect(carouselViewport).toHaveCSS('outline-color', secondary);

    const pullSurface = page
      .getByTestId('theme-pull-to-refresh')
      .locator('.pull-to-refresh__indicator-surface');
    await expect(pullSurface).toHaveCSS('background-color', surfaceContainerHigh);
    await expect(pullSurface).toHaveCSS('color', primary);

    const scrollField = page.getByTestId('theme-scroll-field');
    await expect(scrollField).toHaveCSS('background-color', surfaceContainerLowest);
    await expect(scrollField.locator('[data-scroll-field-item][data-selected]')).toHaveCSS(
      'color',
      onSurface,
    );

    const dragHandle = page.getByTestId('theme-drag-handle');
    await expect(dragHandle.locator('.drag-handle__bar')).toHaveCSS(
      'background-color',
      outline,
    );

    const scrollbar = page.getByTestId('theme-scrollbar');
    await expect(scrollbar).toHaveAttribute('data-overflow', 'true');
    await expect(scrollbar.locator('.non-interactive-scrollbar__thumb')).toHaveCSS(
      'background-color',
      scrollbarThumb,
    );
  });
});
