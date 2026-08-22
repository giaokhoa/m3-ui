import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const generatedUrl = new URL('../dist/generated/tokens.js', import.meta.url);

async function generated(suffix) {
  return import(`${generatedUrl.href}?${suffix}=${Date.now()}`);
}

test('Style Dictionary emits runtime color strings and standard dimensions', async () => {
  const token = await generated('base');

  assert.equal(token.ComponentButtonVariantFilledContainerColor, 'var(--primary)');
  assert.equal(token.ComponentButtonVariantElevatedContainerColor, 'var(--surface-container-low)');
  assert.equal(token.ComponentSwitchColorsCheckedTrack, 'var(--primary)');
  assert.equal(token.ComponentButtonBaselineMinHeight, '40px');
  assert.equal(token.ComponentButtonSizeMediumPaddingBlock, '16px');
  assert.equal(token.ShapeMedium, '12px');
});

test('Style Dictionary emits shared motion, typography and ripple tokens', async () => {
  const token = await generated('core');

  assert.equal(token.MotionSpringFastSpatialDuration, '137ms');
  assert.match(token.MotionSpringFastEffectsEasing, /^linear\(/);
  assert.equal(token.TypographyBodyLargeFontSize, '16px');
  assert.equal(token.TypefacePlain, 'Roboto');
  assert.equal(token.RippleFadeOutDuration, '150ms');
  assert.equal(token.RippleFocusRingOuterStrokeColor, 'var(--secondary)');
  assert.equal(token.ComponentSwitchMotionGeometryDuration, '137ms');
});

test('Style Dictionary emits canonical current component families', async () => {
  const token = await generated('components');

  assert.equal(token.ComponentCardVariantFilledContainerColor, 'var(--surface-container-highest)');
  assert.equal(token.ComponentCardBaseShapeRadius, '12px');
  assert.equal(token.ComponentCheckboxMotionBoxInDuration, '166ms');
  assert.equal(token.ComponentCheckboxColorsSelectedContainer, 'var(--primary)');
  assert.equal(token.ComponentRadioButtonMotionDotDuration, '137ms');
  assert.equal(token.ComponentRadioButtonColorsUnselected, 'var(--on-surface-variant)');
  assert.equal(token.ComponentTextFieldSharedTypographyBodyLargeFontSize, '16px');
  assert.equal(token.ComponentTextFieldFilledColorsContainer, 'var(--surface-container-highest)');
  assert.equal(token.ComponentTextFieldOutlinedColorsOutline, 'var(--outline)');
});

test('Style Dictionary emits TypeScript declarations with literal string values', async () => {
  const declarations = await readFile(
    new URL('../dist/generated/tokens.d.ts', import.meta.url),
    'utf8',
  );

  assert.match(declarations, /ComponentButtonVariantFilledContainerColor/);
  assert.match(declarations, /var\(--primary\)/);
  assert.match(declarations, /MotionSpringFastSpatialDuration/);
  assert.match(declarations, /RippleFocusRingOuterStrokeColor/);
  assert.match(declarations, /ComponentCardVariantFilledContainerColor/);
  assert.match(declarations, /ComponentTextFieldOutlinedColorsOutline/);
});
