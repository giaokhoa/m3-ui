import type { ElevationLevel } from './elevation.js';

export interface ButtonPaddingTokens {
  readonly block: number;
  readonly inline: number;
}

export interface TypographyStyleTokens {
  readonly fontFamily: 'sans-serif';
  readonly fontSize: number;
  readonly lineHeight: number;
  readonly fontWeight: number;
  readonly letterSpacing: number;
}

export interface FilledButtonTokens {
  readonly minWidth: number;
  readonly minHeight: number;
  readonly contentPadding: ButtonPaddingTokens;
  readonly containerShape: 'full';
  readonly containerColor: 'primary';
  readonly contentColor: 'onPrimary';
  readonly disabledContainerColor: 'onSurface';
  readonly disabledContainerOpacity: number;
  readonly disabledContentColor: 'onSurfaceVariant';
  readonly disabledContentOpacity: number;
  readonly defaultElevation: ElevationLevel;
  readonly hoveredElevation: ElevationLevel;
  readonly focusedElevation: ElevationLevel;
  readonly pressedElevation: ElevationLevel;
  readonly disabledElevation: ElevationLevel;
  readonly iconSize: number;
  readonly iconSpacing: number;
  readonly labelTypography: TypographyStyleTokens;
}

/**
 * Baseline filled button values from AndroidX Material3 `androidx-main`.
 *
 * Sources:
 * - ButtonDefaults in Button.kt
 * - FilledButtonTokens v0_11_0
 * - ButtonSmallTokens v0_11_0
 * - TypeScaleTokens LabelLarge
 */
export const filledButtonTokens = {
  minWidth: 58,
  minHeight: 40,
  contentPadding: {
    block: 8,
    inline: 24,
  },
  containerShape: 'full',
  containerColor: 'primary',
  contentColor: 'onPrimary',
  disabledContainerColor: 'onSurface',
  disabledContainerOpacity: 0.1,
  disabledContentColor: 'onSurfaceVariant',
  disabledContentOpacity: 0.38,
  defaultElevation: 'level0',
  hoveredElevation: 'level1',
  focusedElevation: 'level0',
  pressedElevation: 'level0',
  disabledElevation: 'level0',
  iconSize: 18,
  iconSpacing: 8,
  labelTypography: {
    fontFamily: 'sans-serif',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
    letterSpacing: 0.1,
  },
} as const satisfies FilledButtonTokens;
