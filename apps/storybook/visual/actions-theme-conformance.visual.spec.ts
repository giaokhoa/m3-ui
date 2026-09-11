import { expect, test, type Locator } from '@playwright/test';
import { openStory } from '../test-support/story';

async function background(locator: Locator) {
  return locator.evaluate((element) => getComputedStyle(element).backgroundColor);
}

async function expectFourThemeColors(cards: Locator, target: (card: Locator) => Locator) {
  await expect(cards).toHaveCount(4);
  const colors = await Promise.all(
    [0, 1, 2, 3].map((index) => background(target(cards.nth(index)))),
  );

  expect(colors[0]).not.toBe(colors[1]);
  expect(colors[2]).not.toBe(colors[0]);
  expect(colors[3]).not.toBe(colors[1]);
}

test.describe('Material 3 action-family theme conformance', () => {
  test('SplitButton consumes light, dark, and dynamic container roles', async ({ page }) => {
    await openStory(page, 'components-splitbutton--theme-matrix');
    await expectFourThemeColors(page.locator('.storybook-theme-card'), (card) =>
      card.getByRole('button', { name: 'Theme action', exact: true }),
    );
  });

  test('connected ButtonGroup consumes light, dark, and dynamic selected roles', async ({ page }) => {
    await openStory(page, 'components-buttongroup--theme-matrix');
    await expectFourThemeColors(page.locator('.storybook-theme-card'), (card) =>
      card.locator('.button-group__connected-item[data-selected]').first(),
    );
  });

  test('FAB Menu trigger consumes light, dark, and dynamic selected FAB roles', async ({ page }) => {
    await openStory(page, 'components-fabmenu--theme-matrix');
    await expectFourThemeColors(page.locator('.storybook-theme-card'), (card) =>
      card.getByRole('button', { name: 'More actions' }).locator('.fab__surface'),
    );
  });
});
