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
  assert.equal(token.ComponentSwitchColorsCheckedTrack, 'var(--primary)');
  assert.equal(token.ComponentButtonBaselineMinHeight, '40px');
  assert.equal(token.ShapeMedium, '12px');
});

test('Style Dictionary emits shared motion, typography, ripple and elevation tokens', async () => {
  const token = await generated('core');
  assert.equal(token.MotionSpringFastSpatialDuration, '137ms');
  assert.equal(token.TypographyBodyLargeFontSize, '16px');
  assert.equal(token.TypefacePlain, 'Roboto');
  assert.equal(token.RippleFadeOutDuration, '150ms');
  assert.equal(token.RippleFocusRingOuterStrokeColor, 'var(--secondary)');
  assert.equal(token.ElevationShadowLevel4Layer2SpreadRadius, '1px');
  assert.equal(token.ElevationShadowLevel5Layer3Opacity, 0.12);
});

test('Style Dictionary emits canonical current component families', async () => {
  const token = await generated('components');
  assert.equal(token.ComponentSwitchLabelGap, '8px');
  assert.equal(token.ComponentCardVariantFilledContainerColor, 'var(--surface-container-highest)');
  assert.equal(token.ComponentCheckboxMotionBoxInDuration, '166ms');
  assert.equal(token.ComponentRadioButtonMotionDotDuration, '137ms');
  assert.equal(token.ComponentTextFieldSharedTypographyBodyLargeFontSize, '16px');
  assert.equal(token.ComponentTextFieldOutlinedColorsOutline, 'var(--outline)');
  assert.equal(token.ComponentChipActionBaseHeight, '32px');
  assert.equal(token.ComponentChipVariantFilterSelectedContainerColor, 'var(--secondary-container)');
  assert.equal(token.ComponentChipShapeSelectedRadius, '9999px');
  assert.equal(token.ComponentChipInputPaddingCompact, '4px');
});

test('Style Dictionary emits TypeScript declarations with literal string values', async () => {
  const declarations = await readFile(new URL('../dist/generated/tokens.d.ts', import.meta.url), 'utf8');
  assert.match(declarations, /ComponentButtonVariantFilledContainerColor/);
  assert.match(declarations, /ComponentSwitchLabelGap/);
  assert.match(declarations, /MotionSpringFastSpatialDuration/);
  assert.match(declarations, /RippleFocusRingOuterStrokeColor/);
  assert.match(declarations, /ElevationShadowLevel5Layer3Opacity/);
  assert.match(declarations, /ComponentChipVariantFilterSelectedContainerColor/);
  assert.match(declarations, /ComponentTextFieldOutlinedColorsOutline/);
});
