import { expect, test, type Locator, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

function expectClose(actual: number | undefined, expected: number) {
  expect(actual).not.toBeUndefined();
  expect(Math.abs((actual ?? 0) - expected)).toBeLessThan(0.8);
}

async function expectFrameSettled(frame: Locator) {
  await expect.poll(async () => (await frame.boundingBox())?.x).toBeCloseTo(0, 0);
}

test.describe('Material 3 ModalWideNavigationRail browser contract', () => {
  test('keeps the 96px collapsed rail in layout when hideOnCollapse is false', async ({ page }) => {
    await openStory(page, 'components-widenavigationrail--modal');
    const host = page.getByTestId('modal-wide-navigation-rail-host');
    const stage = page.getByTestId('modal-wide-navigation-rail-stage');
    const collapsedRail = page.locator('.modal-wide-navigation-rail__collapsed-rail');
    const main = page.getByTestId('modal-wide-navigation-rail-main');

    await expect(host).toHaveAttribute('data-state', 'collapsed');
    await expect(page.locator('.modal-wide-navigation-rail-overlay')).toHaveCount(0);
    const stageBox = await stage.boundingBox();
    const railBox = await collapsedRail.boundingBox();
    const mainBox = await main.boundingBox();
    expectClose(railBox?.width, 96);
    expectClose((railBox?.x ?? 0) - (stageBox?.x ?? 0), 0);
    expectClose((mainBox?.x ?? 0) - (stageBox?.x ?? 0), 96);
    await expect(collapsedRail.getByRole('tablist')).toHaveAttribute(
      'aria-orientation',
      'vertical',
    );
  });

  test('overlays a 220px Level2 large surface without moving app content', async ({ page }) => {
    await openStory(page, 'components-widenavigationrail--modal-expanded');
    const stage = page.getByTestId('modal-wide-navigation-rail-stage');
    const collapsedRail = page.locator('.modal-wide-navigation-rail__collapsed-rail');
    const modalRail = page.locator('.modal-wide-navigation-rail__rail');
    const main = page.getByTestId('modal-wide-navigation-rail-main');
    const scrim = page.locator('.modal-wide-navigation-rail__scrim');
    const home = page.getByTestId('modal-wide-navigation-rail-item-home');

    const stageBox = await stage.boundingBox();
    expectClose((await collapsedRail.boundingBox())?.width, 96);
    expectClose((await main.boundingBox())?.x - (stageBox?.x ?? 0), 96);
    await expect.poll(async () => (await modalRail.boundingBox())?.width).toBeCloseTo(220, 0);
    await expect(home).toHaveAttribute('data-icon-position', 'start');

    const visual = await modalRail.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        backgroundColor: style.backgroundColor,
        borderRadius: style.borderRadius,
        boxShadow: style.boxShadow,
      };
    });
    expect(visual.backgroundColor).toBe('rgb(243, 237, 247)');
    expect(visual.borderRadius).toBe('16px');
    expect(visual.boxShadow).not.toBe('none');
    expect(visual.boxShadow).not.toMatch(/^rgb\([^)]*\) 0px 0px 0px 0px/);
    await expect
      .poll(async () =>
        scrim.evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity)),
      )
      .toBeCloseTo(0.32, 2);
  });

  test('moves focus into the modal and Escape collapses it', async ({ page }) => {
    await openStory(page, 'components-widenavigationrail--modal');
    const host = page.getByTestId('modal-wide-navigation-rail-host');
    await page.getByTestId('modal-wide-navigation-rail-toggle').click();

    const overlay = page.locator('.modal-wide-navigation-rail-overlay');
    const headerButton = overlay.getByRole('button', {
      name: 'Toggle navigation rail',
    });
    await expect(overlay).toBeVisible();
    await expect(headerButton).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(host).toHaveAttribute('data-state', 'collapsed');
    await expect(overlay).toHaveCount(0);
    await expect(page.locator('.modal-wide-navigation-rail__collapsed-rail').getByRole('tab')).toHaveCount(4);
  });

  test('scrim backdrop dismisses the expanded modal rail', async ({ page }) => {
    await openStory(page, 'components-widenavigationrail--modal-expanded');
    const host = page.getByTestId('modal-wide-navigation-rail-host');
    const overlay = page.locator('.modal-wide-navigation-rail-overlay');
    const scrim = page.locator('.modal-wide-navigation-rail__scrim');
    await expect(overlay).toBeVisible();
    await expect(scrim).toBeVisible();
    const box = await overlay.boundingBox();
    expect(box).not.toBeNull();
    await overlay.click({
      position: {
        x: Math.max(1, (box?.width ?? 800) - 24),
        y: 24,
      },
    });
    await expect(host).toHaveAttribute('data-state', 'collapsed');
    await expect(overlay).toHaveCount(0);
  });

  test('dismissible mode reserves no collapsed layout space and slides in as a standalone modal', async ({ page }) => {
    await openStory(page, 'components-widenavigationrail--modal-dismissible');
    const host = page.getByTestId('modal-wide-navigation-rail-host');
    const stage = page.getByTestId('modal-wide-navigation-rail-stage');
    const main = page.getByTestId('modal-wide-navigation-rail-main');

    await expect(host).toHaveAttribute('data-state', 'collapsed');
    await expect(page.locator('.modal-wide-navigation-rail__collapsed-rail')).toHaveCount(0);
    await expect(page.locator('.modal-wide-navigation-rail-overlay')).toHaveCount(0);
    expectClose(
      (await main.boundingBox())?.x - ((await stage.boundingBox())?.x ?? 0),
      0,
    );

    await page.getByTestId('modal-wide-navigation-rail-toggle').click();
    const frame = page.locator('.modal-wide-navigation-rail__frame');
    const modalRail = page.locator('.modal-wide-navigation-rail__rail');
    await expect(host).toHaveAttribute('data-state', 'expanded');
    await expect(frame).toHaveAttribute('data-hide-on-collapse', 'true');
    await expectFrameSettled(frame);
    await expect.poll(async () => (await modalRail.boundingBox())?.width).toBeCloseTo(220, 0);
    expectClose(
      (await main.boundingBox())?.x - ((await stage.boundingBox())?.x ?? 0),
      0,
    );
  });

  test('dismissible drag uses the AndroidX 50 percent positional threshold', async ({ page }) => {
    await openStory(page, 'components-widenavigationrail--modal-dismissible-expanded');
    const host = page.getByTestId('modal-wide-navigation-rail-host');
    const frame = page.locator('.modal-wide-navigation-rail__frame');
    await expectFrameSettled(frame);

    const firstBox = await frame.boundingBox();
    expect(firstBox).not.toBeNull();
    const width = firstBox?.width ?? 220;
    const startX = (firstBox?.x ?? 0) + width - 16;
    const y = (firstBox?.y ?? 0) + 220;

    await page.mouse.move(startX, y);
    await page.mouse.down();
    await page.mouse.move(startX - width * 0.4, y, { steps: 6 });
    await expect(frame).toHaveAttribute('data-dragging', 'true');
    await page.mouse.up();
    await expect(host).toHaveAttribute('data-state', 'expanded');
    await expectFrameSettled(frame);

    const secondBox = await frame.boundingBox();
    const secondStartX = (secondBox?.x ?? 0) + (secondBox?.width ?? width) - 16;
    await page.mouse.move(secondStartX, y);
    await page.mouse.down();
    await page.mouse.move(secondStartX - width * 0.6, y, { steps: 6 });
    await expect(frame).toHaveAttribute('data-dragging', 'true');
    await page.mouse.up();
    await expect(host).toHaveAttribute('data-state', 'collapsed');
    await expect(page.locator('.modal-wide-navigation-rail-overlay')).toHaveCount(0);
  });
});
