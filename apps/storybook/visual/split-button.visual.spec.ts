import { expect, test, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

test.describe('Material 3 SplitButton browser contracts', () => {
  test('resolves representative filled, tonal, elevated and outlined variants', async ({ page }) => {
    await openStory(page, 'components-splitbutton--variants');
    const buttons = page.getByRole('button');
    await expect(buttons).toHaveCount(8);

    const styles = await Promise.all(
      [buttons.nth(0), buttons.nth(2), buttons.nth(4), buttons.nth(6)].map((button) =>
        button.evaluate((element) => {
          const style = getComputedStyle(element);
          return {
            backgroundColor: style.backgroundColor,
            borderWidth: style.borderTopWidth,
            boxShadow: style.boxShadow,
          };
        }),
      ),
    );

    expect(styles[0]!.backgroundColor).not.toBe(styles[1]!.backgroundColor);
    expect(styles[2]!.boxShadow).not.toBe('none');
    expect(styles[3]!.borderWidth).toBe('1px');
  });

  test('routes pointer and keyboard activation to only the targeted half', async ({ page }) => {
    await openStory(page, 'components-splitbutton--interactions');
    let leading = page.getByRole('button', { name: 'Run', exact: true });
    let trailing = page.getByRole('button', { name: 'Run options', exact: true });
    let leadingCount = page.getByTestId('leading-press-count');
    let trailingCount = page.getByTestId('trailing-press-count');

    await expect(leadingCount).toHaveText('Leading presses: 0');
    await expect(trailingCount).toHaveText('Trailing presses: 0');
    await leading.click();
    await expect(leadingCount).toHaveText('Leading presses: 1');
    await expect(trailingCount).toHaveText('Trailing presses: 0');
    await trailing.click();
    await expect(leadingCount).toHaveText('Leading presses: 1');
    await expect(trailingCount).toHaveText('Trailing presses: 1');

    // Reload the story so keyboard traversal starts from the document rather than
    // inheriting focus from the preceding pointer click.
    await openStory(page, 'components-splitbutton--interactions');
    leading = page.getByRole('button', { name: 'Run', exact: true });
    trailing = page.getByRole('button', { name: 'Run options', exact: true });
    leadingCount = page.getByTestId('leading-press-count');
    trailingCount = page.getByTestId('trailing-press-count');

    await page.keyboard.press('Tab');
    await expect(leading).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(leadingCount).toHaveText('Leading presses: 1');
    await expect(trailingCount).toHaveText('Trailing presses: 0');
    await page.keyboard.press('Tab');
    await expect(trailing).toBeFocused();
    await page.keyboard.press('Space');
    await expect(leadingCount).toHaveText('Leading presses: 1');
    await expect(trailingCount).toHaveText('Trailing presses: 1');
  });

  test('keeps exact spacing and equal visual heights with unequal content', async ({ page }) => {
    await openStory(page, 'components-splitbutton--equal-height');
    const buttons = page.getByRole('button');
    const leading = buttons.nth(0);
    const trailing = buttons.nth(1);
    const [a, b] = await Promise.all([leading.boundingBox(), trailing.boundingBox()]);
    expect(a).not.toBeNull();
    expect(b).not.toBeNull();
    expect(Math.abs(a!.height - b!.height)).toBeLessThanOrEqual(1);
    expect(Math.abs(b!.x - (a!.x + a!.width) - 2)).toBeLessThanOrEqual(1);
  });

  test('preserves trailing intrinsic width when width is constrained', async ({ page }) => {
    await openStory(page, 'components-splitbutton--constrained');
    const unconstrainedTrailing = page.getByRole('button', {
      name: 'Unconstrained options',
      exact: true,
    });
    const constrainedTrailing = page.getByRole('button', {
      name: 'Constrained options',
      exact: true,
    });
    const unconstrainedWidth = await unconstrainedTrailing.evaluate(
      (element) => element.getBoundingClientRect().width,
    );
    const constrainedWidth = await constrainedTrailing.evaluate(
      (element) => element.getBoundingClientRect().width,
    );
    expect(Math.abs(constrainedWidth - unconstrainedWidth)).toBeLessThanOrEqual(1);

    const constrainedRoot = page.getByTestId('split-constrained');
    const leading = constrainedRoot.getByRole('button').nth(0);
    const totalWidth = await constrainedRoot.evaluate(
      (element) => element.getBoundingClientRect().width,
    );
    const leadingWidth = await leading.evaluate(
      (element) => element.getBoundingClientRect().width,
    );
    expect(totalWidth).toBeCloseTo(220, 0);
    expect(leadingWidth).toBeLessThan(totalWidth - constrainedWidth);
  });

  test('projects all five visual container heights', async ({ page }) => {
    await openStory(page, 'components-splitbutton--sizes');
    const expected = [32, 40, 56, 96, 136];
    const buttons = page.getByRole('button');
    for (let index = 0; index < expected.length; index += 1) {
      const height = await buttons
        .nth(index * 2)
        .evaluate((element) => element.getBoundingClientRect().height);
      expect(Math.abs(height - expected[index]!)).toBeLessThanOrEqual(1);
    }
  });

  test('morphs each pressed half independently with DefaultEffects shape motion', async ({ page }) => {
    await openStory(page, 'components-splitbutton--default');
    const leading = page.getByRole('button', { name: 'Save', exact: true });
    const trailing = page.getByRole('button', { name: 'More save options', exact: true });
    const leadingRadius = () =>
      leading.evaluate((element) => getComputedStyle(element).borderTopRightRadius);
    const trailingRadius = () =>
      trailing.evaluate((element) => getComputedStyle(element).borderTopLeftRadius);
    const leadingBefore = await leadingRadius();
    const trailingBefore = await trailingRadius();
    const motion = await leading.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        property: style.transitionProperty,
        duration: style.transitionDuration,
        timing: style.transitionTimingFunction,
      };
    });
    expect(motion.property).toContain('border-radius');
    expect(motion.duration).toContain('0.166s');
    expect(motion.timing).toContain('linear(');

    const leadingBox = await leading.boundingBox();
    expect(leadingBox).not.toBeNull();
    await page.mouse.move(
      leadingBox!.x + leadingBox!.width / 2,
      leadingBox!.y + leadingBox!.height / 2,
    );
    await page.mouse.down();
    try {
      await expect(leading).toHaveAttribute('data-pressed', 'true');
      await expect.poll(leadingRadius).not.toBe(leadingBefore);
      expect(await trailingRadius()).toBe(trailingBefore);
    } finally {
      await page.mouse.up();
    }
    await expect.poll(leadingRadius).toBe(leadingBefore);

    const trailingBox = await trailing.boundingBox();
    expect(trailingBox).not.toBeNull();
    await page.mouse.move(
      trailingBox!.x + trailingBox!.width / 2,
      trailingBox!.y + trailingBox!.height / 2,
    );
    await page.mouse.down();
    try {
      await expect(trailing).toHaveAttribute('data-pressed', 'true');
      await expect.poll(trailingRadius).not.toBe(trailingBefore);
      expect(await leadingRadius()).toBe(leadingBefore);
    } finally {
      await page.mouse.up();
    }
    await expect.poll(trailingRadius).toBe(trailingBefore);
  });

  test('exposes independent disabled and checkable trailing semantics', async ({ page }) => {
    await openStory(page, 'components-splitbutton--independent-disabled');
    await expect(
      page.getByRole('button', { name: 'Primary disabled', exact: true }),
    ).toBeDisabled();
    await expect(page.getByRole('button', { name: 'More options', exact: true })).toBeEnabled();
    await expect(
      page.getByRole('button', { name: 'More options disabled', exact: true }),
    ).toBeDisabled();

    await openStory(page, 'components-splitbutton--checkable-trailing');
    const checkable = page.getByRole('button', { name: 'Pin favorite', exact: true });
    const checkedRadius = () =>
      checkable.evaluate((element) => getComputedStyle(element).borderTopLeftRadius);
    const fullRadius = await checkable.evaluate((element) =>
      getComputedStyle(element).getPropertyValue('--_split-button-outer-corner').trim(),
    );
    await expect(checkable).toHaveAttribute('aria-pressed', 'false');
    await checkable.click();
    await expect(checkable).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(checkedRadius).toBe(fullRadius);

    const box = await checkable.boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.mouse.down();
    try {
      await expect(checkable).toHaveAttribute('data-pressed', 'true');
      await expect.poll(checkedRadius).not.toBe(fullRadius);
    } finally {
      // Release outside the target so this remains a cancelled press rather than
      // a second activation that would legitimately toggle aria-pressed back off.
      await page.mouse.move(box!.x + box!.width + 20, box!.y + box!.height + 20);
      await page.mouse.up();
    }
    await expect(checkable).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(checkedRadius).toBe(fullRadius);
  });

  test('exposes expanded state and logical RTL placement', async ({ page }) => {
    await openStory(page, 'components-splitbutton--expanded-trailing');
    await expect(page.getByRole('button', { name: 'Export menu', exact: true })).toHaveAttribute(
      'aria-expanded',
      'true',
    );

    await openStory(page, 'components-splitbutton--rtl');
    const buttons = page.getByRole('button');
    const leading = await buttons.nth(0).boundingBox();
    const trailing = await buttons.nth(1).boundingBox();
    expect(leading).not.toBeNull();
    expect(trailing).not.toBeNull();
    expect(leading!.x).toBeGreaterThan(trailing!.x);
  });

  test('keeps focus/hover/ripple behavior and disables shape motion when reduced', async ({ page }) => {
    await openStory(page, 'components-splitbutton--default');
    const leading = page.getByRole('button', { name: 'Save', exact: true });
    await leading.hover();
    await expect(leading.locator('.ripple')).toHaveAttribute('data-hovered', 'true');

    await page.keyboard.press('Tab');
    await expect(leading).toBeFocused();
    await expect(leading.locator('.ripple')).toHaveAttribute('data-focus-visible', 'true');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(leading).toHaveCSS('transition-duration', '0s');
  });
});
