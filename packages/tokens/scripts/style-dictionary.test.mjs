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

test('Style Dictionary emits the current Material 3 shape scale', async () => {
  const token = await generated('shape');
  assert.equal(token.ShapeCornerNone, '0px');
  assert.equal(token.ShapeCornerExtraSmall, '4px');
  assert.equal(token.ShapeCornerSmall, '8px');
  assert.equal(token.ShapeCornerMedium, '12px');
  assert.equal(token.ShapeCornerLarge, '16px');
  assert.equal(token.ShapeCornerLargeIncreased, '20px');
  assert.equal(token.ShapeCornerExtraLarge, '28px');
  assert.equal(token.ShapeCornerExtraLargeIncreased, '32px');
  assert.equal(token.ShapeCornerExtraExtraLarge, '48px');
  assert.equal(token.ShapeCornerLargeStartTopEnd, '0px');
  assert.equal(token.ShapeCornerExtraLargeTopTopStart, '28px');
});

test('Style Dictionary emits all baseline and emphasized Material 3 type styles', async () => {
  const token = await generated('typography');
  const baseline = ['display', 'headline', 'title', 'body', 'label'];
  const sizes = ['Large', 'Medium', 'Small'];
  for (const role of baseline) {
    for (const size of sizes) {
      const prefix = `Typography${role[0].toUpperCase()}${role.slice(1)}${size}`;
      assert.ok(Object.hasOwn(token, `${prefix}FontSize`), `${prefix}FontSize`);
      assert.ok(Object.hasOwn(token, `${prefix}LineHeight`), `${prefix}LineHeight`);
      assert.ok(Object.hasOwn(token, `${prefix}FontWeight`), `${prefix}FontWeight`);
      assert.ok(Object.hasOwn(token, `${prefix}LetterSpacing`), `${prefix}LetterSpacing`);
      assert.ok(Object.hasOwn(token, `${prefix}EmphasizedFontSize`), `${prefix}EmphasizedFontSize`);
      assert.ok(Object.hasOwn(token, `${prefix}EmphasizedFontWeight`), `${prefix}EmphasizedFontWeight`);
    }
  }
  assert.equal(token.TypographyDisplayLargeFontSize, '57px');
  assert.equal(token.TypographyDisplayLargeLetterSpacing, '-0.2px');
  assert.equal(token.TypographyTitleMediumEmphasizedFontWeight, 700);
  assert.equal(token.TypographyBodyLargeEmphasizedLetterSpacing, '0.15px');
  assert.equal(token.TypefaceWeightRegular, 400);
  assert.equal(token.TypefaceWeightMedium, 500);
  assert.equal(token.TypefaceWeightBold, 700);
});

test('Style Dictionary emits shared motion, ripple and elevation tokens', async () => {
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

test('Style Dictionary emits TypeScript declarations with full foundation symbols', async () => {
  const declarations = await readFile(new URL('../dist/generated/tokens.d.ts', import.meta.url), 'utf8');
  assert.match(declarations, /ComponentButtonVariantFilledContainerColor/);
  assert.match(declarations, /ShapeCornerExtraExtraLarge/);
  assert.match(declarations, /TypographyDisplayLargeEmphasizedFontSize/);
  assert.match(declarations, /TypefaceWeightBold/);
  assert.match(declarations, /MotionSpringFastSpatialDuration/);
  assert.match(declarations, /RippleFocusRingOuterStrokeColor/);
  assert.match(declarations, /ElevationShadowLevel5Layer3Opacity/);
  assert.match(declarations, /ComponentChipVariantFilterSelectedContainerColor/);
  assert.match(declarations, /ComponentTextFieldOutlinedColorsOutline/);
});
