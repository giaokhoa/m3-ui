export type TypefaceRole = 'plain' | 'brand';

export interface MaterialTypefaceTokens {
  readonly plain: string;
  readonly brand: string;
  readonly fallback: string;
}

/**
 * Material reference typefaces used by the default web theme.
 *
 * Material Web uses Roboto for both plain and brand typefaces by default.
 * The fallback remains generic so consumers can still render if the webfont
 * has not loaded yet.
 */
export const materialTypefaceTokens = {
  plain: 'Roboto',
  brand: 'Roboto',
  fallback: 'sans-serif',
} as const satisfies MaterialTypefaceTokens;
