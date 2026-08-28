import * as token from '@m3-ui/tokens';
import type { CSSProperties } from 'react';

export type MaterialTypeRole =
  | 'displayLarge'
  | 'displayMedium'
  | 'displaySmall'
  | 'headlineLarge'
  | 'headlineMedium'
  | 'headlineSmall'
  | 'titleLarge'
  | 'titleMedium'
  | 'titleSmall'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'bodySmall'
  | 'labelLarge'
  | 'labelMedium'
  | 'labelSmall';

export type MaterialTypeEmphasis = 'standard' | 'emphasized';

export interface MaterialTypeStyle {
  readonly fontFamily: string;
  readonly fontSize: string;
  readonly lineHeight: string;
  readonly fontWeight: number;
  readonly letterSpacing: string;
}

type TypeStyleTokenSet = {
  readonly fontFamily: string;
  readonly fontSize: string;
  readonly lineHeight: string;
  readonly fontWeight: number;
  readonly letterSpacing: string;
};

function typefaceRoleVariable(role: string): string {
  return `var(--font-family-${role})`;
}

function typeStyle(
  fontFamily: string,
  fontSize: string,
  lineHeight: string,
  fontWeight: number,
  letterSpacing: string,
): TypeStyleTokenSet {
  return {
    fontFamily,
    fontSize,
    lineHeight,
    fontWeight,
    letterSpacing,
  };
}

const standardTypeScale = {
  displayLarge: typeStyle(token.TypographyDisplayLargeFontFamily, token.TypographyDisplayLargeFontSize, token.TypographyDisplayLargeLineHeight, token.TypographyDisplayLargeFontWeight, token.TypographyDisplayLargeLetterSpacing),
  displayMedium: typeStyle(token.TypographyDisplayMediumFontFamily, token.TypographyDisplayMediumFontSize, token.TypographyDisplayMediumLineHeight, token.TypographyDisplayMediumFontWeight, token.TypographyDisplayMediumLetterSpacing),
  displaySmall: typeStyle(token.TypographyDisplaySmallFontFamily, token.TypographyDisplaySmallFontSize, token.TypographyDisplaySmallLineHeight, token.TypographyDisplaySmallFontWeight, token.TypographyDisplaySmallLetterSpacing),
  headlineLarge: typeStyle(token.TypographyHeadlineLargeFontFamily, token.TypographyHeadlineLargeFontSize, token.TypographyHeadlineLargeLineHeight, token.TypographyHeadlineLargeFontWeight, token.TypographyHeadlineLargeLetterSpacing),
  headlineMedium: typeStyle(token.TypographyHeadlineMediumFontFamily, token.TypographyHeadlineMediumFontSize, token.TypographyHeadlineMediumLineHeight, token.TypographyHeadlineMediumFontWeight, token.TypographyHeadlineMediumLetterSpacing),
  headlineSmall: typeStyle(token.TypographyHeadlineSmallFontFamily, token.TypographyHeadlineSmallFontSize, token.TypographyHeadlineSmallLineHeight, token.TypographyHeadlineSmallFontWeight, token.TypographyHeadlineSmallLetterSpacing),
  titleLarge: typeStyle(token.TypographyTitleLargeFontFamily, token.TypographyTitleLargeFontSize, token.TypographyTitleLargeLineHeight, token.TypographyTitleLargeFontWeight, token.TypographyTitleLargeLetterSpacing),
  titleMedium: typeStyle(token.TypographyTitleMediumFontFamily, token.TypographyTitleMediumFontSize, token.TypographyTitleMediumLineHeight, token.TypographyTitleMediumFontWeight, token.TypographyTitleMediumLetterSpacing),
  titleSmall: typeStyle(token.TypographyTitleSmallFontFamily, token.TypographyTitleSmallFontSize, token.TypographyTitleSmallLineHeight, token.TypographyTitleSmallFontWeight, token.TypographyTitleSmallLetterSpacing),
  bodyLarge: typeStyle(token.TypographyBodyLargeFontFamily, token.TypographyBodyLargeFontSize, token.TypographyBodyLargeLineHeight, token.TypographyBodyLargeFontWeight, token.TypographyBodyLargeLetterSpacing),
  bodyMedium: typeStyle(token.TypographyBodyMediumFontFamily, token.TypographyBodyMediumFontSize, token.TypographyBodyMediumLineHeight, token.TypographyBodyMediumFontWeight, token.TypographyBodyMediumLetterSpacing),
  bodySmall: typeStyle(token.TypographyBodySmallFontFamily, token.TypographyBodySmallFontSize, token.TypographyBodySmallLineHeight, token.TypographyBodySmallFontWeight, token.TypographyBodySmallLetterSpacing),
  labelLarge: typeStyle(token.TypographyLabelLargeFontFamily, token.TypographyLabelLargeFontSize, token.TypographyLabelLargeLineHeight, token.TypographyLabelLargeFontWeight, token.TypographyLabelLargeLetterSpacing),
  labelMedium: typeStyle(token.TypographyLabelMediumFontFamily, token.TypographyLabelMediumFontSize, token.TypographyLabelMediumLineHeight, token.TypographyLabelMediumFontWeight, token.TypographyLabelMediumLetterSpacing),
  labelSmall: typeStyle(token.TypographyLabelSmallFontFamily, token.TypographyLabelSmallFontSize, token.TypographyLabelSmallLineHeight, token.TypographyLabelSmallFontWeight, token.TypographyLabelSmallLetterSpacing),
} as const satisfies Record<MaterialTypeRole, TypeStyleTokenSet>;

const emphasizedTypeScale = {
  displayLarge: typeStyle(token.TypographyDisplayLargeEmphasizedFontFamily, token.TypographyDisplayLargeEmphasizedFontSize, token.TypographyDisplayLargeEmphasizedLineHeight, token.TypographyDisplayLargeEmphasizedFontWeight, token.TypographyDisplayLargeEmphasizedLetterSpacing),
  displayMedium: typeStyle(token.TypographyDisplayMediumEmphasizedFontFamily, token.TypographyDisplayMediumEmphasizedFontSize, token.TypographyDisplayMediumEmphasizedLineHeight, token.TypographyDisplayMediumEmphasizedFontWeight, token.TypographyDisplayMediumEmphasizedLetterSpacing),
  displaySmall: typeStyle(token.TypographyDisplaySmallEmphasizedFontFamily, token.TypographyDisplaySmallEmphasizedFontSize, token.TypographyDisplaySmallEmphasizedLineHeight, token.TypographyDisplaySmallEmphasizedFontWeight, token.TypographyDisplaySmallEmphasizedLetterSpacing),
  headlineLarge: typeStyle(token.TypographyHeadlineLargeEmphasizedFontFamily, token.TypographyHeadlineLargeEmphasizedFontSize, token.TypographyHeadlineLargeEmphasizedLineHeight, token.TypographyHeadlineLargeEmphasizedFontWeight, token.TypographyHeadlineLargeEmphasizedLetterSpacing),
  headlineMedium: typeStyle(token.TypographyHeadlineMediumEmphasizedFontFamily, token.TypographyHeadlineMediumEmphasizedFontSize, token.TypographyHeadlineMediumEmphasizedLineHeight, token.TypographyHeadlineMediumEmphasizedFontWeight, token.TypographyHeadlineMediumEmphasizedLetterSpacing),
  headlineSmall: typeStyle(token.TypographyHeadlineSmallEmphasizedFontFamily, token.TypographyHeadlineSmallEmphasizedFontSize, token.TypographyHeadlineSmallEmphasizedLineHeight, token.TypographyHeadlineSmallEmphasizedFontWeight, token.TypographyHeadlineSmallEmphasizedLetterSpacing),
  titleLarge: typeStyle(token.TypographyTitleLargeEmphasizedFontFamily, token.TypographyTitleLargeEmphasizedFontSize, token.TypographyTitleLargeEmphasizedLineHeight, token.TypographyTitleLargeEmphasizedFontWeight, token.TypographyTitleLargeEmphasizedLetterSpacing),
  titleMedium: typeStyle(token.TypographyTitleMediumEmphasizedFontFamily, token.TypographyTitleMediumEmphasizedFontSize, token.TypographyTitleMediumEmphasizedLineHeight, token.TypographyTitleMediumEmphasizedFontWeight, token.TypographyTitleMediumEmphasizedLetterSpacing),
  titleSmall: typeStyle(token.TypographyTitleSmallEmphasizedFontFamily, token.TypographyTitleSmallEmphasizedFontSize, token.TypographyTitleSmallEmphasizedLineHeight, token.TypographyTitleSmallEmphasizedFontWeight, token.TypographyTitleSmallEmphasizedLetterSpacing),
  bodyLarge: typeStyle(token.TypographyBodyLargeEmphasizedFontFamily, token.TypographyBodyLargeEmphasizedFontSize, token.TypographyBodyLargeEmphasizedLineHeight, token.TypographyBodyLargeEmphasizedFontWeight, token.TypographyBodyLargeEmphasizedLetterSpacing),
  bodyMedium: typeStyle(token.TypographyBodyMediumEmphasizedFontFamily, token.TypographyBodyMediumEmphasizedFontSize, token.TypographyBodyMediumEmphasizedLineHeight, token.TypographyBodyMediumEmphasizedFontWeight, token.TypographyBodyMediumEmphasizedLetterSpacing),
  bodySmall: typeStyle(token.TypographyBodySmallEmphasizedFontFamily, token.TypographyBodySmallEmphasizedFontSize, token.TypographyBodySmallEmphasizedLineHeight, token.TypographyBodySmallEmphasizedFontWeight, token.TypographyBodySmallEmphasizedLetterSpacing),
  labelLarge: typeStyle(token.TypographyLabelLargeEmphasizedFontFamily, token.TypographyLabelLargeEmphasizedFontSize, token.TypographyLabelLargeEmphasizedLineHeight, token.TypographyLabelLargeEmphasizedFontWeight, token.TypographyLabelLargeEmphasizedLetterSpacing),
  labelMedium: typeStyle(token.TypographyLabelMediumEmphasizedFontFamily, token.TypographyLabelMediumEmphasizedFontSize, token.TypographyLabelMediumEmphasizedLineHeight, token.TypographyLabelMediumEmphasizedFontWeight, token.TypographyLabelMediumEmphasizedLetterSpacing),
  labelSmall: typeStyle(token.TypographyLabelSmallEmphasizedFontFamily, token.TypographyLabelSmallEmphasizedFontSize, token.TypographyLabelSmallEmphasizedLineHeight, token.TypographyLabelSmallEmphasizedFontWeight, token.TypographyLabelSmallEmphasizedLetterSpacing),
} as const satisfies Record<MaterialTypeRole, TypeStyleTokenSet>;

export function getMaterialTypeStyle(
  role: MaterialTypeRole,
  emphasis: MaterialTypeEmphasis = 'standard',
): MaterialTypeStyle {
  const value = emphasis === 'emphasized' ? emphasizedTypeScale[role] : standardTypeScale[role];
  return {
    ...value,
    fontFamily: typefaceRoleVariable(value.fontFamily),
  };
}

export function getMaterialTypeCssProperties(
  role: MaterialTypeRole,
  emphasis: MaterialTypeEmphasis = 'standard',
): CSSProperties {
  return getMaterialTypeStyle(role, emphasis);
}
