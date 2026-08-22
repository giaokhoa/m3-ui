import * as token from '@m3/tokens/generated';

export type TypefaceRole = 'plain' | 'brand';

export interface MaterialTypefaceTokens {
  readonly plain: string;
  readonly brand: string;
  readonly fallback: string;
}

export const materialTypefaceTokens = {
  plain: token.TypefacePlain,
  brand: token.TypefaceBrand,
  fallback: token.TypefaceFallback,
} as const satisfies MaterialTypefaceTokens;
