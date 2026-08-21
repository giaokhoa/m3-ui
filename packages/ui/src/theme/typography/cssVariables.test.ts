import { materialTypefaceTokens } from '@m3/tokens/typography';
import { describe, expect, it } from 'vitest';
import { defaultTypographyThemeStyle } from './cssVariables';

describe('Material typography theme', () => {
  it('uses Roboto for the default Material plain and brand typefaces', () => {
    expect(materialTypefaceTokens).toEqual({
      plain: 'Roboto',
      brand: 'Roboto',
      fallback: 'sans-serif',
    });

    expect(defaultTypographyThemeStyle).toEqual({
      '--font-family-plain': "'Roboto', sans-serif",
      '--font-family-brand': "'Roboto', sans-serif",
      fontFamily: 'var(--font-family-plain)',
    });
  });
});
