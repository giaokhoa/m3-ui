import { expect, test, type Locator, type Page } from '@playwright/test';

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await expect(page.locator('#storybook-root')).toBeVisible();
}

function segment(page: Page, role: 'radio' | 'checkbox', name: string) {
  const control = page.getByRole(role, { name, exact: true });
  const root = page.locator('.segmented-button').filter({ has: control });
  return {
    control,
    root,
    surface: root.locator('.segmented-button__surface'),
    content: root.locator('.segmented-button__content'),
  };
}

async function resolvedColor(root: Locator, value: string): Promise<string> {
  return root.evaluate((element, colorValue) => {
    const probe = document.createElement('span');
    probe.style.color = colorValue;
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    element.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, value);
}

test.describe('Material 3 SegmentedButton parity', () => {
  test('keeps 2/3/4 segment rows equally sized at the 40px container height', async ({ page }) => {
    await openStory(page, 'components-segmentedbutton--geometry');
    const rows = page.locator('.segmented-button-row');
    await expect(rows).toHaveCount(3);

    for (const [index, count] of [2, 3, 4].entries()) {
      const row = rows.nth(index);
      const buttons = row.locator('.segmented-button');
      await expect(buttons).toHaveCount(count);
      const geometry = await buttons.evaluateAll((elements) =>
        elements.map((element) => {
          const root = element.getBoundingClientRect();
          const surface = element.querySelector<HTMLElement>('.segmented-button__surface')!.getBoundingClientRect();
          return { width: root.width, height: surface.height };
        }),
      );
      expect(geometry.every(({ height }) => height === 40)).toBe(true);
      const widths = geometry.map(({ width }) => width);
      expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(0.1);
    }
  });

  test('overlaps adjacent borders by exactly one stroke instead of drawing a double seam', async ({ page }) => {
    await openStory(page, 'components-segmentedbutton--geometry');
    const surfaces = page.locator('.segmented-button-row').nth(1).locator('.segmented-button__surface');
    const geometry = await surfaces.evaluateAll((elements) =>
      elements.map((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return {
          left: rect.left,
          right: rect.right,
          borderLeft: style.borderLeftWidth,
          borderRight: style.borderRightWidth,
        };
      }),
    );
    expect(geometry[0].borderRight).toBe('1px');
    expect(geometry[1].borderLeft).toBe('1px');
    expect(Math.abs(geometry[0].right - geometry[1].left - 1)).toBeLessThan(0.1);
    expect(Math.abs(geometry[1].right - geometry[2].left - 1)).toBeLessThan(0.1);
  });

  test('assigns full shape only to logical row ends', async ({ page }) => {
    await openStory(page, 'components-segmentedbutton--geometry');
    const surfaces = page.locator('.segmented-button-row').nth(1).locator('.segmented-button__surface');
    const radii = await surfaces.evaluateAll((elements) =>
      elements.map((element) => {
        const style = getComputedStyle(element);
        return [
          style.borderTopLeftRadius,
          style.borderTopRightRadius,
          style.borderBottomRightRadius,
          style.borderBottomLeftRadius,
        ];
      }),
    );
    expect(radii[0][0]).not.toBe('0px');
    expect(radii[0][3]).not.toBe('0px');
    expect(radii[0][1]).toBe('0px');
    expect(radii[1]).toEqual(['0px', '0px', '0px', '0px']);
    expect(radii[2][1]).not.toBe('0px');
    expect(radii[2][2]).not.toBe('0px');
    expect(radii[2][0]).toBe('0px');
  });

  test('single choice exposes radio-group semantics and native arrow-key exclusivity', async ({ page }) => {
    await openStory(page, 'components-segmentedbutton--single-choice');
    await expect(page.getByRole('radiogroup', { name: 'Sort order' })).toBeVisible();
    const recent = page.getByRole('radio', { name: 'Recent', exact: true });
    const popular = page.getByRole('radio', { name: 'Popular', exact: true });
    const saved = page.getByRole('radio', { name: 'Saved', exact: true });
    await expect(recent).toBeChecked();
    await expect(popular).not.toBeChecked();
    await recent.focus();
    await page.keyboard.press('ArrowRight');
    await expect(popular).toBeChecked();
    await expect(recent).not.toBeChecked();
    await page.keyboard.press('ArrowRight');
    await expect(saved).toBeChecked();
    await expect(page.getByRole('radio', { checked: true })).toHaveCount(1);
  });

  test('multi choice exposes checkbox semantics and allows simultaneous checked segments', async ({ page }) => {
    await openStory(page, 'components-segmentedbutton--multi-choice');
    const photos = page.getByRole('checkbox', { name: 'Photos', exact: true });
    const videos = page.getByRole('checkbox', { name: 'Videos', exact: true });
    const files = page.getByRole('checkbox', { name: 'Files', exact: true });
    await expect(photos).toBeChecked();
    await expect(files).toBeChecked();
    await expect(videos).not.toBeChecked();
    await segment(page, 'checkbox', 'Videos').root.click();
    await expect(videos).toBeChecked();
    await expect(page.getByRole('checkbox', { checked: true })).toHaveCount(3);
  });

  test('keeps disabled selected container while applying disabled content and outline alpha', async ({ page }) => {
    await openStory(page, 'components-segmentedbutton--disabled');
    const selected = segment(page, 'checkbox', 'Selected disabled');
    const disabled = segment(page, 'checkbox', 'Disabled');
    await expect(selected.control).toBeDisabled();
    await expect(disabled.control).toBeDisabled();

    const selectedContainer = await resolvedColor(selected.root, 'var(--secondary-container)');
    const disabledContent = await resolvedColor(
      selected.root,
      'color-mix(in srgb, var(--on-surface) 38%, transparent)',
    );
    const disabledOutline = await resolvedColor(
      selected.root,
      'color-mix(in srgb, var(--on-surface) 12%, transparent)',
    );
    await expect(selected.surface).toHaveCSS('background-color', selectedContainer);
    await expect(selected.surface.locator('.segmented-button__label')).toHaveCSS('color', disabledContent);
    await expect(selected.surface).toHaveCSS('border-color', disabledOutline);
    await expect(disabled.surface).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  });

  test('animates default selected icon appearance and FastSpatial label displacement', async ({ page }) => {
    await openStory(page, 'components-segmentedbutton--icon-motion');
    const grid = segment(page, 'radio', 'Grid');
    const label = grid.root.locator('.segmented-button__label');
    const activeIcon = grid.root.locator('.segmented-button__icon--active');
    const before = await label.boundingBox();
    expect(before).not.toBeNull();
    await expect(activeIcon).toHaveCSS('opacity', '0');
    await expect(grid.content).toHaveCSS('transition-duration', '0.137s');
    await expect(activeIcon).toHaveCSS(
      'transition-duration',
      '0.166s, 0.166s, 0.166s',
    );

    await grid.root.click();
    await expect(grid.control).toBeChecked();
    await expect(activeIcon).toHaveCSS('opacity', '1');
    const after = await label.boundingBox();
    expect(after).not.toBeNull();
    expect(after!.x - before!.x).toBeGreaterThan(10);
    expect(after!.x - before!.x).toBeLessThan(16);
  });

  test('crossfades caller-provided inactive and selected icons', async ({ page }) => {
    await openStory(page, 'components-segmentedbutton--icon-motion');
    const week = segment(page, 'radio', 'Week');
    const inactive = week.root.locator('.segmented-button__icon--inactive');
    const active = week.root.locator('.segmented-button__icon--active');
    await expect(inactive).toHaveCSS('opacity', '1');
    await expect(active).toHaveCSS('opacity', '0');
    await week.root.click();
    await expect(inactive).toHaveCSS('opacity', '0');
    await expect(active).toHaveCSS('opacity', '1');
  });

  test('raises hovered, pressed and focus-visible segments above overlapping siblings and reuses Ripple', async ({ page }) => {
    await openStory(page, 'components-segmentedbutton--focus-and-ripple');
    const alpha = segment(page, 'radio', 'Alpha');
    const beta = segment(page, 'radio', 'Beta');
    await expect(alpha.root).toHaveCSS('z-index', '5');

    await beta.root.hover();
    await expect(beta.root).toHaveAttribute('data-hovered', 'true');
    await expect(beta.root).toHaveCSS('z-index', '10');
    await expect(beta.root.locator('.ripple')).toHaveAttribute('data-hovered', 'true');

    const box = await beta.surface.boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.mouse.down();
    await expect(beta.root).toHaveAttribute('data-pressed', 'true');
    await expect(beta.root.locator('.ripple__wave')).toHaveCount(1);
    await expect(beta.root).toHaveCSS('z-index', '10');
    await page.mouse.up();

    await alpha.control.focus();
    await page.keyboard.press('Tab');
    await expect(beta.root).toHaveAttribute('data-focus-visible', 'true');
    await expect(beta.root).toHaveCSS('z-index', '10');
    const ripple = beta.root.locator('.ripple');
    const focusMode = await ripple.evaluate((element) =>
      element.hasAttribute('data-focus-visible') || element.hasAttribute('data-inset-focus-visible'),
    );
    expect(focusMode).toBe(true);
  });

  test('mirrors logical first/last corners in RTL', async ({ page }) => {
    await openStory(page, 'components-segmentedbutton--rtl');
    const surfaces = page.locator('.segmented-button__surface');
    const first = await surfaces.nth(0).evaluate((element) => {
      const style = getComputedStyle(element);
      return { left: style.borderTopLeftRadius, right: style.borderTopRightRadius };
    });
    const middle = await surfaces.nth(1).evaluate((element) => {
      const style = getComputedStyle(element);
      return { left: style.borderTopLeftRadius, right: style.borderTopRightRadius };
    });
    const last = await surfaces.nth(2).evaluate((element) => {
      const style = getComputedStyle(element);
      return { left: style.borderTopLeftRadius, right: style.borderTopRightRadius };
    });
    expect(first.right).not.toBe('0px');
    expect(first.left).toBe('0px');
    expect(middle).toEqual({ left: '0px', right: '0px' });
    expect(last.left).not.toBe('0px');
    expect(last.right).toBe('0px');
  });

  test('removes component icon and displacement motion under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'components-segmentedbutton--icon-motion');
    const grid = segment(page, 'radio', 'Grid');
    await expect(grid.content).toHaveCSS('transition-duration', '0s');
    await expect(grid.root.locator('.segmented-button__icon--active')).toHaveCSS(
      'transition-duration',
      '0s',
    );
  });
});
