import * as token from '@m3-ui/tokens';
import { describe, expect, it } from 'vitest';
import {
  getMaterialTypeCssProperties,
  getMaterialTypeStyle,
  type MaterialTypeRole,
} from './typeScale';

const roles: MaterialTypeRole[] = [
  'displayLarge',
  'displayMedium',
  'displaySmall',
  'headlineLarge',
  'headlineMedium',
  'headlineSmall',
  'titleLarge',
  'titleMedium',
  'titleSmall',
  'bodyLarge',
  'bodyMedium',
  'bodySmall',
  'labelLarge',
  'labelMedium',
  'labelSmall',
];

describe('Material type scale', () => {
  it('exposes every Material type role without design literals', () => {
    expect(roles).toHaveLength(15);

    for (const role of roles) {
      const style = getMaterialTypeStyle(role);
      expect(style.fontFamily).toMatch(/^var\(--font-family-(plain|brand)\)$/);
      expect(style.fontSize).toMatch(/px$/);
      expect(style.lineHeight).toMatch(/px$/);
      expect(style.letterSpacing).toMatch(/px$/);
      expect(style.fontWeight).toBeTypeOf('number');
    }
  });

  it('maps standard bodyLarge directly from canonical generated tokens', () => {
    expect(getMaterialTypeStyle('bodyLarge')).toEqual({
      fontFamily: `var(--font-family-${token.TypographyBodyLargeFontFamily})`,
      fontSize: token.TypographyBodyLargeFontSize,
      lineHeight: token.TypographyBodyLargeLineHeight,
      fontWeight: token.TypographyBodyLargeFontWeight,
      letterSpacing: token.TypographyBodyLargeLetterSpacing,
    });
  });

  it('maps emphasized headlineLarge directly from canonical generated tokens', () => {
    expect(getMaterialTypeStyle('headlineLarge', 'emphasized')).toEqual({
      fontFamily: `var(--font-family-${token.TypographyHeadlineLargeEmphasizedFontFamily})`,
      fontSize: token.TypographyHeadlineLargeEmphasizedFontSize,
      lineHeight: token.TypographyHeadlineLargeEmphasizedLineHeight,
      fontWeight: token.TypographyHeadlineLargeEmphasizedFontWeight,
      letterSpacing: token.TypographyHeadlineLargeEmphasizedLetterSpacing,
    });
  });

  it('returns CSSProperties-compatible values for app-level prose mapping', () => {
    expect(getMaterialTypeCssProperties('titleMedium')).toEqual(
      getMaterialTypeStyle('titleMedium'),
    );
  });
});
