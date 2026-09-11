import { expect, type Page } from '@playwright/test';

export interface OpenStoryOptions {
  /** Wait for document fonts before returning when screenshots/geometry depend on them. */
  waitForFonts?: boolean;
}

/**
 * Open a Storybook iframe through the rendered-story readiness contract rather
 * than waiting for global network idle. Individual specs still own their
 * Material assertions and any extra readiness required by the story itself.
 */
export async function openStory(
  page: Page,
  id: string,
  options: OpenStoryOptions = {},
) {
  const { waitForFonts = true } = options;
  const response = await page.goto(
    `/iframe.html?id=${encodeURIComponent(id)}&viewMode=story`,
    { waitUntil: 'domcontentloaded' },
  );

  expect(response, `Expected Storybook to respond for ${id}`).not.toBeNull();
  expect(response!.status(), `Expected Storybook story ${id} to load`).toBeLessThan(400);

  const root = page.locator('#storybook-root');
  await expect(root).toBeVisible();

  if (waitForFonts) {
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
  }

  return root;
}
