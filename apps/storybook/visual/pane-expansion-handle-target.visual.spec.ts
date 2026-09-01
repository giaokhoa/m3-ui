import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page) {
  await page.goto(
    '/iframe.html?id=layout-listdetailpanescaffold--resizable&viewMode=story',
    { waitUntil: 'networkidle' },
  );
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

test('preserves the pane-expansion minimum hit target at the clipped scaffold edge', async ({
  page,
}) => {
  await openStory(page);

  const scaffold = page.locator('#storybook-root .three-pane-scaffold');
  const handle = page.getByRole('button', { name: 'Pane expansion drag handle' });
  const [scaffoldBox, initialHandleBox] = await Promise.all([
    scaffold.boundingBox(),
    handle.boundingBox(),
  ]);
  if (!scaffoldBox || !initialHandleBox) {
    throw new Error('Pane expansion scaffold or drag handle has no visual bounds');
  }

  expect(initialHandleBox.width).toBeCloseTo(48, 0);

  await page.mouse.move(
    initialHandleBox.x + initialHandleBox.width / 2,
    initialHandleBox.y + initialHandleBox.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(scaffoldBox.x, initialHandleBox.y + initialHandleBox.height / 2);

  await expect.poll(async () => {
    const box = await handle.boundingBox();
    return box === null ? Number.NaN : box.x + box.width / 2 - scaffoldBox.x;
  }).toBeCloseTo(12, 0);
  const edgeHandleBox = await handle.boundingBox();
  if (!edgeHandleBox) throw new Error('Edge drag handle has no visual bounds');

  // AndroidX clamps the handle center by half the 24px partition spacer and
  // expands the 48px minimum target to 72px. The scaffold clips the outer
  // 24px, leaving the full 48px interactive target inside its visible bounds.
  expect(edgeHandleBox.width).toBeCloseTo(72, 0);
  expect(edgeHandleBox.x + edgeHandleBox.width / 2 - scaffoldBox.x).toBeCloseTo(12, 0);
  expect(edgeHandleBox.x + edgeHandleBox.width - scaffoldBox.x).toBeCloseTo(48, 0);

  await page.mouse.up();
  await expect.poll(async () => {
    const box = await handle.boundingBox();
    if (box === null) return Number.NaN;
    return (box.x + box.width / 2 - scaffoldBox.x) / scaffoldBox.width;
  }).toBeCloseTo(0.3, 2);
});
