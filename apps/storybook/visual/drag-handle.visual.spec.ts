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

function expectClose(actual: number | undefined, expected: number) {
  expect(actual).not.toBeUndefined();
  expect(Math.abs((actual ?? 0) - expected)).toBeLessThan(0.6);
}

async function geometry(page: Page, testId: string) {
  const handle = page.getByTestId(testId);
  return {
    root: await handle.boundingBox(),
    container: await handle.locator('.drag-handle__container').boundingBox(),
    bar: await handle.locator('.drag-handle__bar').boundingBox(),
  };
}

test.describe('Material 3 VerticalDragHandle browser contract', () => {
  test('default state keeps a 48px hit target around the canonical 24px container and 4x48 bar', async ({
    page,
  }) => {
    await openStory(page, 'components-draghandle--default');
    const handle = page.getByTestId('default-handle');
    const boxes = await geometry(page, 'default-handle');

    await expect(handle).toHaveAttribute('data-state', 'default');
    await expect(handle).toHaveAttribute('role', 'separator');
    await expect(handle).toHaveAttribute('aria-orientation', 'vertical');
    expectClose(boxes.root?.width, 48);
    expectClose(boxes.root?.height, 48);
    expectClose(boxes.container?.width, 24);
    expectClose(boxes.container?.height, 48);
    expectClose(boxes.bar?.width, 4);
    expectClose(boxes.bar?.height, 48);
  });

  test('real pointer press expands to the canonical pressed 12x52 geometry and releases cleanly', async ({
    page,
  }) => {
    await openStory(page, 'components-draghandle--default');
    const handle = page.getByTestId('default-handle');
    const before = await handle.boundingBox();

    await page.mouse.move(
      (before?.x ?? 0) + (before?.width ?? 0) / 2,
      (before?.y ?? 0) + (before?.height ?? 0) / 2,
    );
    await page.mouse.down();
    await expect(handle).toHaveAttribute('data-state', 'pressed');

    const pressed = await geometry(page, 'default-handle');
    expectClose(pressed.root?.width, 48);
    expectClose(pressed.root?.height, 52);
    expectClose(pressed.container?.width, 24);
    expectClose(pressed.container?.height, 52);
    expectClose(pressed.bar?.width, 12);
    expectClose(pressed.bar?.height, 52);

    await page.mouse.up();
    await expect(handle).toHaveAttribute('data-state', 'default');
    const released = await geometry(page, 'default-handle');
    expectClose(released.bar?.width, 4);
    expectClose(released.bar?.height, 48);
  });

  test('controlled dragged state uses the canonical dragged treatment without changing the 48px hit width', async ({
    page,
  }) => {
    await openStory(page, 'components-draghandle--dragged');
    const handle = page.getByTestId('dragged-handle');
    const boxes = await geometry(page, 'dragged-handle');

    await expect(handle).toHaveAttribute('data-dragged', 'true');
    await expect(handle).toHaveAttribute('data-state', 'dragged');
    expectClose(boxes.root?.width, 48);
    expectClose(boxes.root?.height, 52);
    expectClose(boxes.container?.width, 24);
    expectClose(boxes.bar?.width, 12);
    expectClose(boxes.bar?.height, 52);
  });

  test('hover and keyboard focus are sourced from real browser interaction state', async ({
    page,
  }) => {
    await openStory(page, 'components-draghandle--default');
    const handle = page.getByTestId('default-handle');
    const ripple = handle.locator('.ripple');

    await handle.hover();
    await expect(handle).toHaveAttribute('data-hovered', 'true');
    await expect(ripple).toHaveAttribute('data-hovered', 'true');

    await page.keyboard.press('Tab');
    await expect(handle).toBeFocused();
    await expect(handle).toHaveAttribute('data-focus-visible', 'true');
    await expect(ripple).toHaveAttribute('data-focus-visible', 'true');
  });

  test('resize owner can drive isDragged while pointer capture keeps movement flowing through the handle', async ({
    page,
  }) => {
    await openStory(page, 'components-draghandle--resizable-pane');
    const handle = page.getByRole('separator', { name: 'Resize panes' });
    const pane = page.getByTestId('left-pane');
    const startHandle = await handle.boundingBox();
    const startPane = await pane.boundingBox();

    await page.mouse.move(
      (startHandle?.x ?? 0) + (startHandle?.width ?? 0) / 2,
      (startHandle?.y ?? 0) + (startHandle?.height ?? 0) / 2,
    );
    await page.mouse.down();
    await expect(handle).toHaveAttribute('data-dragged', 'true');
    await page.mouse.move((startHandle?.x ?? 0) + 70, (startHandle?.y ?? 0) + 24);

    const movedPane = await pane.boundingBox();
    expect((movedPane?.width ?? 0) - (startPane?.width ?? 0)).toBeGreaterThan(20);
    await expect(handle).toHaveAttribute('aria-valuenow', /2[4-9][0-9]|3[0-2][0-9]/);

    await page.mouse.up();
    await expect(handle).not.toHaveAttribute('data-dragged');
  });
});
