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

test.describe('Material 3 Divider browser contract', () => {
  test('horizontal divider exposes separator semantics and canonical thickness', async ({
    page,
  }) => {
    await openStory(page, 'components-divider--default');
    const divider = page.getByRole('separator', {
      name: 'Horizontal divider',
    });
    const box = await divider.boundingBox();

    await expect(divider).toHaveAttribute('aria-orientation', 'horizontal');
    await expect(divider).toHaveAttribute('data-orientation', 'horizontal');
    expect(box?.width).toBe(320);
    expect(box?.height).toBe(1);
  });

  test('vertical divider fills the constrained axis at canonical thickness', async ({
    page,
  }) => {
    await openStory(page, 'components-divider--vertical');
    const divider = page.getByRole('separator', {
      name: 'Vertical divider',
    });
    const box = await divider.boundingBox();

    await expect(divider).toHaveAttribute('aria-orientation', 'vertical');
    await expect(divider).toHaveAttribute('data-orientation', 'vertical');
    expect(box?.width).toBe(1);
    expect(box?.height).toBe(120);
  });

  test('public color and thickness overrides remain local to the divider', async ({
    page,
  }) => {
    await openStory(page, 'components-divider--overrides');
    const horizontal = page.getByRole('separator', {
      name: 'Custom horizontal divider',
    });
    const vertical = page.getByRole('separator', {
      name: 'Custom vertical divider',
    });
    const horizontalBox = await horizontal.boundingBox();
    const verticalBox = await vertical.boundingBox();
    const horizontalColor = await horizontal.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );
    const verticalColor = await vertical.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );

    expect(horizontalBox?.height).toBe(4);
    expect(verticalBox?.width).toBe(4);
    expect(horizontalColor).toBe('rgb(179, 38, 30)');
    expect(verticalColor).toBe('rgb(179, 38, 30)');
  });
});
