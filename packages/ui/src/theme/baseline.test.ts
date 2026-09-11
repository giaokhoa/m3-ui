import { describe, expect, it } from 'vitest';
import { darkColorScheme, lightColorScheme } from './baseline';

// Independent fixtures from Google Material 3 generated tokens:
// Material Web v0.192 reference palette + system role mapping:
// https://github.com/material-components/material-web/blob/main/tokens/versions/v0_192/_md-ref-palette.scss
// https://github.com/material-components/material-web/blob/main/tokens/versions/v0_192/_md-sys-color.scss
//
// Jetpack Compose Material3 uses the same baseline role -> palette-tone mapping
// through ColorLightTokens / ColorDarkTokens and lightColorScheme / darkColorScheme.
const expectedLight = {
  background: '#fef7ff',
  onBackground: '#1d1b20',
  surface: '#fef7ff',
  surfaceDim: '#ded8e1',
  surfaceBright: '#fef7ff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f7f2fa',
  surfaceContainer: '#f3edf7',
  surfaceContainerHigh: '#ece6f0',
  surfaceContainerHighest: '#e6e0e9',
  onSurface: '#1d1b20',
  surfaceVariant: '#e7e0ec',
  onSurfaceVariant: '#49454f',
  inverseSurface: '#322f35',
  inverseOnSurface: '#f5eff7',
  outline: '#79747e',
  outlineVariant: '#cac4d0',
  shadow: '#000000',
  scrim: '#000000',
  surfaceTint: '#6750a4',
  primary: '#6750a4',
  onPrimary: '#ffffff',
  primaryContainer: '#eaddff',
  onPrimaryContainer: '#21005d',
  inversePrimary: '#d0bcff',
  primaryFixed: '#eaddff',
  primaryFixedDim: '#d0bcff',
  onPrimaryFixed: '#21005d',
  onPrimaryFixedVariant: '#4f378b',
  secondary: '#625b71',
  onSecondary: '#ffffff',
  secondaryContainer: '#e8def8',
  onSecondaryContainer: '#1d192b',
  secondaryFixed: '#e8def8',
  secondaryFixedDim: '#ccc2dc',
  onSecondaryFixed: '#1d192b',
  onSecondaryFixedVariant: '#4a4458',
  tertiary: '#7d5260',
  onTertiary: '#ffffff',
  tertiaryContainer: '#ffd8e4',
  onTertiaryContainer: '#31111d',
  tertiaryFixed: '#ffd8e4',
  tertiaryFixedDim: '#efb8c8',
  onTertiaryFixed: '#31111d',
  onTertiaryFixedVariant: '#633b48',
  error: '#b3261e',
  onError: '#ffffff',
  errorContainer: '#f9dedc',
  onErrorContainer: '#410e0b',
};

const expectedDark = {
  background: '#141218',
  onBackground: '#e6e0e9',
  surface: '#141218',
  surfaceDim: '#141218',
  surfaceBright: '#3b383e',
  surfaceContainerLowest: '#0f0d13',
  surfaceContainerLow: '#1d1b20',
  surfaceContainer: '#211f26',
  surfaceContainerHigh: '#2b2930',
  surfaceContainerHighest: '#36343b',
  onSurface: '#e6e0e9',
  surfaceVariant: '#49454f',
  onSurfaceVariant: '#cac4d0',
  inverseSurface: '#e6e0e9',
  inverseOnSurface: '#322f35',
  outline: '#938f99',
  outlineVariant: '#49454f',
  shadow: '#000000',
  scrim: '#000000',
  surfaceTint: '#d0bcff',
  primary: '#d0bcff',
  onPrimary: '#381e72',
  primaryContainer: '#4f378b',
  onPrimaryContainer: '#eaddff',
  inversePrimary: '#6750a4',
  primaryFixed: '#eaddff',
  primaryFixedDim: '#d0bcff',
  onPrimaryFixed: '#21005d',
  onPrimaryFixedVariant: '#4f378b',
  secondary: '#ccc2dc',
  onSecondary: '#332d41',
  secondaryContainer: '#4a4458',
  onSecondaryContainer: '#e8def8',
  secondaryFixed: '#e8def8',
  secondaryFixedDim: '#ccc2dc',
  onSecondaryFixed: '#1d192b',
  onSecondaryFixedVariant: '#4a4458',
  tertiary: '#efb8c8',
  onTertiary: '#492532',
  tertiaryContainer: '#633b48',
  onTertiaryContainer: '#ffd8e4',
  tertiaryFixed: '#ffd8e4',
  tertiaryFixedDim: '#efb8c8',
  onTertiaryFixed: '#31111d',
  onTertiaryFixedVariant: '#633b48',
  error: '#f2b8b5',
  onError: '#601410',
  errorContainer: '#8c1d18',
  onErrorContainer: '#f9dedc',
};

describe('Material 3 baseline color schemes', () => {
  it('matches the official Material Web light baseline', () => {
    expect(lightColorScheme).toEqual(expectedLight);
  });

  it('matches the official Material Web dark baseline', () => {
    expect(darkColorScheme).toEqual(expectedDark);
  });

  it('matches Compose baseline anchor roles', () => {
    expect({
      lightPrimary: lightColorScheme.primary,
      lightSecondary: lightColorScheme.secondary,
      lightTertiary: lightColorScheme.tertiary,
      lightSurface: lightColorScheme.surface,
      lightOnSurface: lightColorScheme.onSurface,
      lightError: lightColorScheme.error,
      darkPrimary: darkColorScheme.primary,
      darkSecondary: darkColorScheme.secondary,
      darkTertiary: darkColorScheme.tertiary,
      darkSurface: darkColorScheme.surface,
      darkOnSurface: darkColorScheme.onSurface,
      darkError: darkColorScheme.error,
    }).toEqual({
      lightPrimary: '#6750a4',
      lightSecondary: '#625b71',
      lightTertiary: '#7d5260',
      lightSurface: '#fef7ff',
      lightOnSurface: '#1d1b20',
      lightError: '#b3261e',
      darkPrimary: '#d0bcff',
      darkSecondary: '#ccc2dc',
      darkTertiary: '#efb8c8',
      darkSurface: '#141218',
      darkOnSurface: '#e6e0e9',
      darkError: '#f2b8b5',
    });
  });
});
