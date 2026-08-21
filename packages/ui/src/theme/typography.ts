import { materialTypefaceTokens } from '@m3/tokens/typography';
import type { CSSProperties } from 'react';

type TypographyThemeStyle = CSSProperties &
  Record<`--font-family-${string}`, string>;

function toFontFamily(fontFamily: string, fallback: string): string {
  return `'${fontFamily}', ${fallback}`;
}

export const defaultTypographyThemeStyle = {
  '--font-family-plain': toFontFamily(
    materialTypefaceTokens.plain,
    materialTypefaceTokens.fallback,
  ),
  '--font-family-brand': toFontFamily(
    materialTypefaceTokens.brand,
    materialTypefaceTokens.fallback,
  ),
  fontFamily: 'var(--font-family-plain)',
} as const satisfies TypographyThemeStyle;
