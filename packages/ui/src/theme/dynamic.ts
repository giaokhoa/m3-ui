import {
  argbFromHex,
  Hct,
  hexFromArgb,
  SchemeTonalSpot,
  type DynamicScheme,
} from '@material/material-color-utilities';
import type { ColorScheme, ThemeMode } from './types';

function toHex(argb: number) {
  return hexFromArgb(argb).toLowerCase();
}

export function dynamicSchemeToColorScheme(scheme: DynamicScheme): ColorScheme {
  return {
    background: toHex(scheme.background),
    onBackground: toHex(scheme.onBackground),
    surface: toHex(scheme.surface),
    surfaceDim: toHex(scheme.surfaceDim),
    surfaceBright: toHex(scheme.surfaceBright),
    surfaceContainerLowest: toHex(scheme.surfaceContainerLowest),
    surfaceContainerLow: toHex(scheme.surfaceContainerLow),
    surfaceContainer: toHex(scheme.surfaceContainer),
    surfaceContainerHigh: toHex(scheme.surfaceContainerHigh),
    surfaceContainerHighest: toHex(scheme.surfaceContainerHighest),
    onSurface: toHex(scheme.onSurface),
    surfaceVariant: toHex(scheme.surfaceVariant),
    onSurfaceVariant: toHex(scheme.onSurfaceVariant),
    inverseSurface: toHex(scheme.inverseSurface),
    inverseOnSurface: toHex(scheme.inverseOnSurface),
    outline: toHex(scheme.outline),
    outlineVariant: toHex(scheme.outlineVariant),
    shadow: toHex(scheme.shadow),
    scrim: toHex(scheme.scrim),
    surfaceTint: toHex(scheme.surfaceTint),
    primary: toHex(scheme.primary),
    onPrimary: toHex(scheme.onPrimary),
    primaryContainer: toHex(scheme.primaryContainer),
    onPrimaryContainer: toHex(scheme.onPrimaryContainer),
    inversePrimary: toHex(scheme.inversePrimary),
    primaryFixed: toHex(scheme.primaryFixed),
    primaryFixedDim: toHex(scheme.primaryFixedDim),
    onPrimaryFixed: toHex(scheme.onPrimaryFixed),
    onPrimaryFixedVariant: toHex(scheme.onPrimaryFixedVariant),
    secondary: toHex(scheme.secondary),
    onSecondary: toHex(scheme.onSecondary),
    secondaryContainer: toHex(scheme.secondaryContainer),
    onSecondaryContainer: toHex(scheme.onSecondaryContainer),
    secondaryFixed: toHex(scheme.secondaryFixed),
    secondaryFixedDim: toHex(scheme.secondaryFixedDim),
    onSecondaryFixed: toHex(scheme.onSecondaryFixed),
    onSecondaryFixedVariant: toHex(scheme.onSecondaryFixedVariant),
    tertiary: toHex(scheme.tertiary),
    onTertiary: toHex(scheme.onTertiary),
    tertiaryContainer: toHex(scheme.tertiaryContainer),
    onTertiaryContainer: toHex(scheme.onTertiaryContainer),
    tertiaryFixed: toHex(scheme.tertiaryFixed),
    tertiaryFixedDim: toHex(scheme.tertiaryFixedDim),
    onTertiaryFixed: toHex(scheme.onTertiaryFixed),
    onTertiaryFixedVariant: toHex(scheme.onTertiaryFixedVariant),
    error: toHex(scheme.error),
    onError: toHex(scheme.onError),
    errorContainer: toHex(scheme.errorContainer),
    onErrorContainer: toHex(scheme.onErrorContainer),
  };
}

export function createDynamicColorScheme(
  sourceColor: string,
  mode: ThemeMode = 'light',
  contrastLevel = 0,
): ColorScheme {
  if (contrastLevel < -1 || contrastLevel > 1) {
    throw new RangeError('contrastLevel must be between -1 and 1');
  }

  const source = Hct.fromInt(argbFromHex(sourceColor));
  const scheme = new SchemeTonalSpot(source, mode === 'dark', contrastLevel);
  return dynamicSchemeToColorScheme(scheme);
}
