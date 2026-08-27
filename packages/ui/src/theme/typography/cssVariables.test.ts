import { TypefaceBrand, TypefaceFallback, TypefacePlain } from '@m3-ui/tokens';
import { describe, expect, it } from 'vitest';
import { defaultTypographyThemeStyle } from './cssVariables';

describe('Material typography theme', () => {
  it('uses generated Roboto defaults for the Material plain and brand typefaces', () => {
    expect({ plain: TypefacePlain, brand: TypefaceBrand, fallback: TypefaceFallback }).toEqual({
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
