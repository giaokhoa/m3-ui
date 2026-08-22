import { TypefaceBrand, TypefaceFallback, TypefacePlain } from '@m3/tokens';
import type { CSSProperties } from 'react';

type TypographyThemeStyle = CSSProperties &
  Record<`--font-family-${string}`, string>;

function toFontFamily(fontFamily: string, fallback: string): string {
  return `'${fontFamily}', ${fallback}`;
}

export const defaultTypographyThemeStyle = {
  '--font-family-plain': toFontFamily(TypefacePlain, TypefaceFallback),
  '--font-family-brand': toFontFamily(TypefaceBrand, TypefaceFallback),
  fontFamily: 'var(--font-family-plain)',
} as const satisfies TypographyThemeStyle;
