import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, {
    waitUntil: 'networkidle',
  });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

function expectClose(actual: number | undefined, expected: number) {
  expect(actual).not.toBeUndefined();
  expect(Math.abs((actual ?? 0) - expected)).toBeLessThan(0.7);
}

test.describe('Material 3 Scrim browser contract', () => {
  test('fills its positioned owner with the canonical color and 0.32 opacity', async ({
    page,
  }) => {
    await openStory(page, 'components-scrim--default');
    const scrim = page.getByTestId('scrim-default');
    const frame = scrim.locator('..');
    const scrimBox = await scrim.boundingBox();
    const frameBox = await frame.boundingBox();
    const surface = await scrim.evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        position: computed.position,
        top: computed.top,
        right: computed.right,
        bottom: computed.bottom,
        left: computed.left,
        backgroundColor: computed.backgroundColor,
        opacity: computed.opacity,
        zIndex: computed.zIndex,
      };
    });

    expectClose(scrimBox?.width, frameBox?.width ?? 0);
    expectClose(scrimBox?.height, frameBox?.height ?? 0);
    expect(surface).toEqual({
      position: 'absolute',
      top: '0px',
      right: '0px',
      bottom: '0px',
      left: '0px',
      backgroundColor: 'rgb(0, 0, 0)',
      opacity: '0.32',
      zIndex: 'auto',
    });
  });

  test('passive scrims stay decorative and expose no dismiss action', async ({
    page,
  }) => {
    await openStory(page, 'components-scrim--default');
    const scrim = page.getByTestId('scrim-default');

    await expect(scrim).toHaveAttribute('aria-hidden', 'true');
    expect(await scrim.evaluate((element) => element.tagName)).toBe('DIV');
    await expect(page.getByRole('button')).toHaveCount(0);
  });

  test('dismissible scrims expose a native labelled action without entering tab order', async ({
    page,
  }) => {
    await openStory(page, 'components-scrim--dismissible');
    const scrim = page.getByRole('button', { name: 'Dismiss modal' });
    const dismissals = page.getByTestId('scrim-dismissals');

    await expect(scrim).toHaveAttribute('tabindex', '-1');
    await expect(dismissals).toHaveText('Dismissed: 0');
    await scrim.click();
    await expect(dismissals).toHaveText('Dismissed: 1');
  });

  test('renderer alpha multiplies the Material opacity instead of replacing its token', async ({
    page,
  }) => {
    await openStory(page, 'components-scrim--half-alpha');
    const scrim = page.getByTestId('scrim-half-alpha');

    await expect(scrim).toHaveCSS('opacity', '0.16');
  });
});
