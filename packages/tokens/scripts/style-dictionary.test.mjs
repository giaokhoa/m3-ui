import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Style Dictionary emits runtime color strings and standard dimensions', async () => {
  const url = new URL('../dist/generated/tokens.js', import.meta.url);
  const generated = await import(`${url.href}?test=${Date.now()}`);

  assert.equal(generated.ComponentButtonVariantFilledContainerColor, 'var(--primary)');
  assert.equal(generated.ComponentButtonVariantElevatedContainerColor, 'var(--surface-container-low)');
  assert.equal(generated.ComponentButtonVariantOutlinedOutlineColor, 'var(--outline-variant)');
  assert.equal(generated.ComponentSwitchColorsCheckedTrack, 'var(--primary)');
  assert.equal(generated.ComponentButtonBaselineMinHeight, '40px');
  assert.equal(generated.ComponentButtonSizeMediumPaddingBlock, '16px');
  assert.equal(generated.ShapeMedium, '12px');
  assert.equal(generated.ComponentButtonVariantElevatedHoveredElevation, 'level2');
});

test('Style Dictionary emits shared motion, typography and ripple tokens', async () => {
  const url = new URL('../dist/generated/tokens.js', import.meta.url);
  const generated = await import(`${url.href}?core=${Date.now()}`);

  assert.equal(generated.MotionSpringFastSpatialDuration, '137ms');
  assert.match(generated.MotionSpringFastEffectsEasing, /^linear\(/);
  assert.equal(generated.TypographyBodyLargeFontSize, '16px');
  assert.equal(generated.TypefacePlain, 'Roboto');
  assert.equal(generated.RippleFadeOutDuration, '150ms');
  assert.equal(generated.RippleFocusRingOuterStrokeColor, 'var(--secondary)');
  assert.equal(generated.ComponentSwitchMotionGeometryDuration, '137ms');
});

test('Style Dictionary emits TypeScript declarations with literal string values', async () => {
  const declarations = await readFile(
    new URL('../dist/generated/tokens.d.ts', import.meta.url),
    'utf8',
  );

  assert.match(declarations, /ComponentButtonVariantFilledContainerColor/);
  assert.match(declarations, /var\(--primary\)/);
  assert.match(declarations, /ComponentButtonSizeMediumPaddingBlock/);
  assert.match(declarations, /ShapeMedium/);
  assert.match(declarations, /MotionSpringFastSpatialDuration/);
  assert.match(declarations, /RippleFocusRingOuterStrokeColor/);
});
