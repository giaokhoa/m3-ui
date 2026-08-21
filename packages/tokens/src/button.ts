import type { ElevationLevel } from './elevation.js';
import type { TypefaceRole } from './typography.js';

export interface ButtonPaddingTokens {
  readonly block: number;
  readonly inlineStart: number;
  readonly inlineEnd: number;
}

export interface TypographyStyleTokens {
  readonly fontFamily: TypefaceRole;
  readonly fontSize: number;
  readonly lineHeight: number;
  readonly fontWeight: number;
  readonly letterSpacing: number;
}

export type ButtonColorRole =
  | 'onPrimary'
  | 'onSecondaryContainer'
  | 'onSurface'
  | 'onSurfaceVariant'
  | 'outlineVariant'
  | 'primary'
  | 'secondaryContainer'
  | 'surfaceContainerLow';

export type ButtonContainerColor = ButtonColorRole | 'transparent';

export interface ButtonVariantTokens {
  readonly minWidth: number;
  readonly minHeight: number;
  readonly contentPadding: ButtonPaddingTokens;
  readonly iconContentPadding: ButtonPaddingTokens;
  readonly containerShape: 'full';
  readonly containerColor: ButtonContainerColor;
  readonly contentColor: ButtonColorRole;
  readonly disabledContainerColor: ButtonContainerColor;
  readonly disabledContainerOpacity: number;
  readonly disabledContentColor: ButtonColorRole;
  readonly disabledContentOpacity: number;
  readonly outlineColor: ButtonColorRole | 'transparent';
  readonly outlineWidth: number;
  readonly disabledOutlineOpacity: number;
  readonly defaultElevation: ElevationLevel;
  readonly hoveredElevation: ElevationLevel;
  readonly focusedElevation: ElevationLevel;
  readonly pressedElevation: ElevationLevel;
  readonly disabledElevation: ElevationLevel;
  readonly iconSize: number;
  readonly iconSpacing: number;
  readonly labelTypography: TypographyStyleTokens;
}

export type ButtonSize =
  | 'extraSmall'
  | 'small'
  | 'medium'
  | 'large'
  | 'extraLarge';

export type ButtonPressedShape = 'small' | 'medium' | 'large';

export interface ButtonSizeTokens {
  readonly minHeight: number;
  readonly contentPadding: ButtonPaddingTokens;
  readonly iconContentPadding: ButtonPaddingTokens;
  readonly iconSize: number;
  readonly iconSpacing: number;
  readonly typography: TypographyStyleTokens;
  readonly pressedShape: ButtonPressedShape;
}

const labelLarge = {
  fontFamily: 'plain',
  fontSize: 14,
  lineHeight: 20,
  fontWeight: 500,
  letterSpacing: 0.1,
} as const satisfies TypographyStyleTokens;

const titleMedium = {
  fontFamily: 'plain',
  fontSize: 16,
  lineHeight: 24,
  fontWeight: 500,
  letterSpacing: 0.2,
} as const satisfies TypographyStyleTokens;

const headlineSmall = {
  fontFamily: 'brand',
  fontSize: 24,
  lineHeight: 32,
  fontWeight: 400,
  letterSpacing: 0,
} as const satisfies TypographyStyleTokens;

const headlineLarge = {
  fontFamily: 'brand',
  fontSize: 32,
  lineHeight: 40,
  fontWeight: 400,
  letterSpacing: 0,
} as const satisfies TypographyStyleTokens;

const commonButtonTokens = {
  minWidth: 58,
  minHeight: 40,
  containerShape: 'full',
  disabledContainerOpacity: 0.1,
  disabledContentOpacity: 0.38,
  outlineColor: 'transparent',
  outlineWidth: 0,
  disabledOutlineOpacity: 0,
  iconSize: 18,
  iconSpacing: 8,
  labelTypography: labelLarge,
} as const;

const standardContentPadding = {
  block: 8,
  inlineStart: 24,
  inlineEnd: 24,
} as const;

const standardIconContentPadding = {
  block: 8,
  inlineStart: 16,
  inlineEnd: 24,
} as const;

/** Baseline high-emphasis filled button values from AndroidX Material3. */
export const filledButtonTokens = {
  ...commonButtonTokens,
  contentPadding: standardContentPadding,
  iconContentPadding: standardIconContentPadding,
  containerColor: 'primary',
  contentColor: 'onPrimary',
  disabledContainerColor: 'onSurface',
  disabledContentColor: 'onSurfaceVariant',
  defaultElevation: 'level0',
  hoveredElevation: 'level1',
  focusedElevation: 'level0',
  pressedElevation: 'level0',
  disabledElevation: 'level0',
} as const satisfies ButtonVariantTokens;

/** Baseline elevated button values from AndroidX Material3. */
export const elevatedButtonTokens = {
  ...commonButtonTokens,
  contentPadding: standardContentPadding,
  iconContentPadding: standardIconContentPadding,
  containerColor: 'surfaceContainerLow',
  contentColor: 'primary',
  disabledContainerColor: 'onSurface',
  disabledContentColor: 'onSurfaceVariant',
  defaultElevation: 'level1',
  hoveredElevation: 'level2',
  focusedElevation: 'level1',
  pressedElevation: 'level1',
  disabledElevation: 'level0',
} as const satisfies ButtonVariantTokens;

/** Baseline filled tonal button values from AndroidX Material3. */
export const filledTonalButtonTokens = {
  ...commonButtonTokens,
  contentPadding: standardContentPadding,
  iconContentPadding: standardIconContentPadding,
  containerColor: 'secondaryContainer',
  contentColor: 'onSecondaryContainer',
  disabledContainerColor: 'onSurface',
  disabledContentColor: 'onSurfaceVariant',
  defaultElevation: 'level0',
  hoveredElevation: 'level1',
  focusedElevation: 'level0',
  pressedElevation: 'level0',
  disabledElevation: 'level0',
} as const satisfies ButtonVariantTokens;

/** Baseline outlined button values from current AndroidX Material3. */
export const outlinedButtonTokens = {
  ...commonButtonTokens,
  contentPadding: standardContentPadding,
  iconContentPadding: standardIconContentPadding,
  containerColor: 'transparent',
  contentColor: 'onSurfaceVariant',
  disabledContainerColor: 'transparent',
  disabledContentColor: 'onSurfaceVariant',
  outlineColor: 'outlineVariant',
  outlineWidth: 1,
  disabledOutlineOpacity: 0.1,
  defaultElevation: 'level0',
  hoveredElevation: 'level0',
  focusedElevation: 'level0',
  pressedElevation: 'level0',
  disabledElevation: 'level0',
} as const satisfies ButtonVariantTokens;

/** Baseline text button values from current AndroidX Material3. */
export const textButtonTokens = {
  ...commonButtonTokens,
  contentPadding: {
    block: 8,
    inlineStart: 12,
    inlineEnd: 12,
  },
  iconContentPadding: {
    block: 8,
    inlineStart: 12,
    inlineEnd: 16,
  },
  containerColor: 'transparent',
  contentColor: 'primary',
  disabledContainerColor: 'transparent',
  disabledContentColor: 'onSurfaceVariant',
  defaultElevation: 'level0',
  hoveredElevation: 'level0',
  focusedElevation: 'level0',
  pressedElevation: 'level0',
  disabledElevation: 'level0',
} as const satisfies ButtonVariantTokens;

export const buttonVariantTokens = {
  filled: filledButtonTokens,
  elevated: elevatedButtonTokens,
  filledTonal: filledTonalButtonTokens,
  outlined: outlinedButtonTokens,
  text: textButtonTokens,
} as const;

/**
 * Current AndroidX expressive size helpers, represented as immutable web geometry.
 * Omitting the web `size` prop keeps the non-expressive baseline button defaults above.
 */
export const buttonSizeTokens = {
  extraSmall: {
    minHeight: 32,
    contentPadding: { block: 6, inlineStart: 12, inlineEnd: 12 },
    iconContentPadding: { block: 6, inlineStart: 12, inlineEnd: 12 },
    iconSize: 20,
    iconSpacing: 4,
    typography: labelLarge,
    pressedShape: 'small',
  },
  small: {
    minHeight: 40,
    contentPadding: { block: 10, inlineStart: 16, inlineEnd: 16 },
    iconContentPadding: { block: 10, inlineStart: 16, inlineEnd: 16 },
    iconSize: 20,
    iconSpacing: 8,
    typography: labelLarge,
    pressedShape: 'small',
  },
  medium: {
    minHeight: 56,
    contentPadding: { block: 16, inlineStart: 24, inlineEnd: 24 },
    iconContentPadding: { block: 16, inlineStart: 24, inlineEnd: 24 },
    iconSize: 24,
    iconSpacing: 8,
    typography: titleMedium,
    pressedShape: 'medium',
  },
  large: {
    minHeight: 96,
    contentPadding: { block: 32, inlineStart: 48, inlineEnd: 48 },
    iconContentPadding: { block: 32, inlineStart: 48, inlineEnd: 48 },
    iconSize: 32,
    iconSpacing: 12,
    typography: headlineSmall,
    pressedShape: 'large',
  },
  extraLarge: {
    minHeight: 136,
    contentPadding: { block: 48, inlineStart: 64, inlineEnd: 64 },
    iconContentPadding: { block: 48, inlineStart: 64, inlineEnd: 64 },
    iconSize: 40,
    iconSpacing: 16,
    typography: headlineLarge,
    pressedShape: 'large',
  },
} as const satisfies Record<ButtonSize, ButtonSizeTokens>;

export type ButtonVariant = keyof typeof buttonVariantTokens;
