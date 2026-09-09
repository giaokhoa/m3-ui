import { expect, type Page } from '@playwright/test';

export type DocumentDirection = 'ltr' | 'rtl';

/** Set document direction without encoding component-specific RTL expectations. */
export async function setDocumentDirection(
  page: Page,
  direction: DocumentDirection,
) {
  await page.evaluate((nextDirection) => {
    document.documentElement.dir = nextDirection;
    document.body.dir = nextDirection;
  }, direction);
}

/** Return positive horizontal document overflow in CSS pixels. */
export async function horizontalDocumentOverflow(page: Page) {
  return page.evaluate(() =>
    Math.max(
      0,
      document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  );
}

/** Assert page-level overflow only; component geometry remains the caller's contract. */
export async function expectNoHorizontalDocumentOverflow(
  page: Page,
  tolerance = 1,
) {
  expect(await horizontalDocumentOverflow(page)).toBeLessThanOrEqual(tolerance);
}
