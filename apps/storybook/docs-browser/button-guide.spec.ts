import { expect, test } from '@playwright/test';
import { installRuntimeGuard } from './runtimeGuard';

test('Button guide renders official spec links, usage guidance, and visible copyable examples', async ({
  page,
}) => {
  const runtime = installRuntimeGuard(page);
  const response = await page.goto('/docs/components/button', {
    waitUntil: 'domcontentloaded',
  });
  expect(response).not.toBeNull();
  expect(response!.status()).toBeLessThan(400);

  await expect(
    page.getByRole('link', { name: 'Material 3 Buttons overview' }),
  ).toHaveAttribute('href', 'https://m3.material.io/components/buttons/overview');
  await expect(
    page.getByRole('link', { name: 'Material 3 Buttons specs' }),
  ).toHaveAttribute('href', 'https://m3.material.io/components/buttons/specs');

  await expect(
    page.getByRole('heading', { name: 'Material 3 specification' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Usage and variant hierarchy' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: "Do and don't" })).toBeVisible();
  await expect(
    page.getByRole('table', { name: 'button Material specification' }),
  ).toBeVisible();

  const previews = page.locator('.docs-live-example__preview');
  const sources = page.locator('.docs-live-example__source');
  await expect(previews).toHaveCount(6);
  await expect(sources).toHaveCount(6);
  await expect(page.getByRole('button', { name: 'Hide code' })).toHaveCount(6);

  const sourceText = (await sources.allTextContents()).join('\n');
  expect(sourceText).toContain("import { Button } from '@m3-ui/ui';");
  expect(sourceText).toContain('FilledTonalButton');
  expect(sourceText).toContain('startIcon');
  expect(sourceText).toContain('size="extraLarge"');
  expect(sourceText).toContain("buttonShapesForSize('medium', 'square')");
  expect(sourceText).toContain('isDisabled');

  runtime.assertClean();
});
