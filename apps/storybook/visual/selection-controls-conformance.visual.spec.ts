import { expect, test, type Locator, type Page } from '@playwright/test';
import { setDocumentDirection } from '../test-support/browser';
import { openStory } from '../test-support/story';

async function resolvedColor(scope: Locator, value: string): Promise<string> {
  return scope.evaluate((element, colorValue) => {
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

async function background(locator: Locator, pseudo?: string) {
  return locator.evaluate(
    (element, pseudoElement) =>
      getComputedStyle(element, pseudoElement || null).backgroundColor,
    pseudo ?? '',
  );
}

async function foreground(locator: Locator) {
  return locator.evaluate((element) => getComputedStyle(element).color);
}

async function expectRoleMapping({
  page,
  storyId,
  role,
  target,
  readActual,
}: {
  page: Page;
  storyId: string;
  role: string;
  target: (card: Locator) => Locator;
  readActual: (target: Locator) => Promise<string>;
}) {
  await openStory(page, storyId);
  const cards = page.locator('.storybook-theme-card');
  await expect(cards).toHaveCount(4);

  const baseline = cards.nth(0);
  const dynamic = cards.nth(2);
  const baselineRole = await resolvedColor(baseline, `var(--${role})`);
  const dynamicRole = await resolvedColor(dynamic, `var(--${role})`);

  expect(dynamicRole).not.toBe(baselineRole);
  expect(await readActual(target(baseline))).toBe(baselineRole);
  expect(await readActual(target(dynamic))).toBe(dynamicRole);
}

async function expectControlBeforeLabelOnInlineStart(
  root: Locator,
  control: Locator,
  label: Locator,
) {
  await expect(root).toBeVisible();
  const [controlBox, labelBox] = await Promise.all([
    control.boundingBox(),
    label.boundingBox(),
  ]);
  expect(controlBox).not.toBeNull();
  expect(labelBox).not.toBeNull();
  expect(
    controlBox!.x,
    'control should remain on logical inline-start, which is the right side in RTL',
  ).toBeGreaterThan(labelBox!.x);
}

test.describe('Material 3 selection-control cross-family conformance', () => {
  test('dynamic source color propagates through each family semantic role', async ({ page }) => {
    await expectRoleMapping({
      page,
      storyId: 'components-checkbox--theme-matrix',
      role: 'primary',
      target: (card) => card.locator('.checkbox').nth(1).locator('.checkbox__box'),
      readActual: (target) => background(target),
    });

    await expectRoleMapping({
      page,
      storyId: 'components-radiobutton--theme-matrix',
      role: 'primary',
      target: (card) =>
        card.locator('.radio-button').first().locator('.radio-button__control'),
      readActual: foreground,
    });

    await expectRoleMapping({
      page,
      storyId: 'components-switch--theme-matrix',
      role: 'primary',
      target: (card) => card.locator('.switch').nth(1).locator('.switch__track'),
      readActual: (target) => background(target),
    });

    await expectRoleMapping({
      page,
      storyId: 'components-slider--theme-matrix',
      role: 'primary',
      target: (card) =>
        card.locator('.slider').first().locator('.slider__segment--active'),
      readActual: (target) => background(target, '::before'),
    });

    await expectRoleMapping({
      page,
      storyId: 'components-segmentedbutton--theme-matrix',
      role: 'secondary-container',
      target: (card) =>
        card.locator('.segmented-button__surface[data-selected]').first(),
      readActual: (target) => background(target),
    });
  });

  test('checkbox and radio place their control on logical inline-start in RTL', async ({ page }) => {
    await openStory(page, 'components-checkbox--states');
    await setDocumentDirection(page, 'rtl');
    const checkbox = page.locator('.checkbox').first();
    await expectControlBeforeLabelOnInlineStart(
      checkbox,
      checkbox.locator('.checkbox__control-slot'),
      checkbox.locator('.checkbox__label'),
    );

    await openStory(page, 'components-radiobutton--horizontal-group');
    await setDocumentDirection(page, 'rtl');
    const radio = page.locator('.radio-button').first();
    await expectControlBeforeLabelOnInlineStart(
      radio,
      radio.locator('.radio-button__control-slot'),
      radio.locator('.radio-button__label'),
    );
  });

  test('radio and switch remove component transitions under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await openStory(page, 'components-radiobutton--states');
    const radio = page.locator('.radio-button').first();
    await expect(radio.locator('.radio-button__control')).toHaveCSS(
      'transition-duration',
      '0s',
    );
    await expect(radio.locator('.radio-button__dot')).toHaveCSS(
      'transition-duration',
      '0s',
    );

    await openStory(page, 'components-switch--default');
    await expect(page.locator('.switch__thumb-shell')).toHaveCSS(
      'transition-duration',
      '0s',
    );
  });
});
