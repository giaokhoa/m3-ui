import * as token from '@m3-ui/tokens';
import type { CSSProperties } from 'react';
import type { ElevationLevel } from '../../internal/elevation';
import { pxNumber } from '../../internal/tokenValues';
import type {
  ExtendedFabSize,
  FabElevation,
  FabSize,
  FabVariant,
} from './Fab.types';

export type FabStyle = CSSProperties & Record<`--${string}`, string | number>;

interface FabSizeTokens {
  readonly height: number;
  readonly width: number;
  readonly iconSize: number;
  readonly shape: keyof typeof shapeRadius;
}

interface TypographyTokens {
  readonly fontFamily: string;
  readonly fontSize: string;
  readonly lineHeight: string;
  readonly fontWeight: number;
  readonly letterSpacing: string;
}

interface ExtendedFabSizeTokens {
  readonly height: number;
  readonly iconSize: number;
  readonly shape: keyof typeof shapeRadius;
  readonly leadingSpace: number;
  readonly trailingSpace: number;
  readonly iconLabelSpace: number;
  readonly expandedMinWidth: number;
  readonly textOnlyLeadingSpace: number;
  readonly textOnlyTrailingSpace: number;
  readonly typography: TypographyTokens;
}

interface FabVariantColors {
  readonly containerColor: string;
  readonly contentColor: string;
  readonly loweredContainerColor?: string;
}

export interface FabStyleOptions {
  readonly variant?: FabVariant;
  readonly elevation?: FabElevation;
  readonly containerColor?: CSSProperties['backgroundColor'];
  readonly contentColor?: CSSProperties['color'];
  readonly shape?: CSSProperties['borderRadius'];
}

export interface BrandedFabStyleOptions {
  readonly elevation?: FabElevation;
  readonly containerColor?: CSSProperties['backgroundColor'];
  readonly shape?: CSSProperties['borderRadius'];
}

const minimumInteractiveSize = 48;
const baselineExtendedMinWidth = 80;
const baselineExtendedTextPadding = 20;

const shapeRadius = {
  medium: token.ShapeMedium,
  large: token.ShapeLarge,
  largeIncreased: token.ShapeLargeIncreased,
  extraLarge: token.ShapeExtraLarge,
} as const;

type ShapeName = keyof typeof shapeRadius;
type TypographyRole = keyof typeof typography;

const typography = {
  labelLarge: {
    fontFamily: token.TypographyLabelLargeFontFamily,
    fontSize: token.TypographyLabelLargeFontSize,
    lineHeight: token.TypographyLabelLargeLineHeight,
    fontWeight: token.TypographyLabelLargeFontWeight,
    letterSpacing: token.TypographyLabelLargeLetterSpacing,
  },
  titleMedium: {
    fontFamily: token.TypographyTitleMediumFontFamily,
    fontSize: token.TypographyTitleMediumFontSize,
    lineHeight: token.TypographyTitleMediumLineHeight,
    fontWeight: token.TypographyTitleMediumFontWeight,
    letterSpacing: token.TypographyTitleMediumLetterSpacing,
  },
  titleLarge: {
    fontFamily: token.TypographyTitleLargeFontFamily,
    fontSize: token.TypographyTitleLargeFontSize,
    lineHeight: token.TypographyTitleLargeLineHeight,
    fontWeight: token.TypographyTitleLargeFontWeight,
    letterSpacing: token.TypographyTitleLargeLetterSpacing,
  },
  headlineSmall: {
    fontFamily: token.TypographyHeadlineSmallFontFamily,
    fontSize: token.TypographyHeadlineSmallFontSize,
    lineHeight: token.TypographyHeadlineSmallLineHeight,
    fontWeight: token.TypographyHeadlineSmallFontWeight,
    letterSpacing: token.TypographyHeadlineSmallLetterSpacing,
  },
} as const satisfies Record<string, TypographyTokens>;

function fabSize(
  height: string,
  width: string,
  iconSize: string,
  shape: string,
): FabSizeTokens {
  return {
    height: pxNumber(height),
    width: pxNumber(width),
    iconSize: pxNumber(iconSize),
    shape: shape as ShapeName,
  };
}

export const fabSizeTokens = {
  small: fabSize(
    token.ComponentFabSizeSmallContainerHeight,
    token.ComponentFabSizeSmallContainerWidth,
    token.ComponentFabSizeSmallIconSize,
    token.ComponentFabSizeSmallContainerShape,
  ),
  baseline: fabSize(
    token.ComponentFabSizeBaselineContainerHeight,
    token.ComponentFabSizeBaselineContainerWidth,
    token.ComponentFabSizeBaselineIconSize,
    token.ComponentFabSizeBaselineContainerShape,
  ),
  medium: fabSize(
    token.ComponentFabSizeMediumContainerHeight,
    token.ComponentFabSizeMediumContainerWidth,
    token.ComponentFabSizeMediumIconSize,
    token.ComponentFabSizeMediumContainerShape,
  ),
  large: fabSize(
    token.ComponentFabSizeLargeContainerHeight,
    token.ComponentFabSizeLargeContainerWidth,
    token.ComponentFabSizeLargeIconSize,
    token.ComponentFabSizeLargeContainerShape,
  ),
} as const satisfies Record<FabSize, FabSizeTokens>;

function extendedFabSize(
  height: string,
  iconSize: string,
  shape: string,
  leadingSpace: string,
  trailingSpace: string,
  iconLabelSpace: string,
  typographyRole: string,
  options: {
    expandedMinWidth?: number;
    textOnlyLeadingSpace?: number;
    textOnlyTrailingSpace?: number;
  } = {},
): ExtendedFabSizeTokens {
  const resolvedHeight = pxNumber(height);
  const resolvedLeadingSpace = pxNumber(leadingSpace);
  const resolvedTrailingSpace = pxNumber(trailingSpace);
  return {
    height: resolvedHeight,
    iconSize: pxNumber(iconSize),
    shape: shape as ShapeName,
    leadingSpace: resolvedLeadingSpace,
    trailingSpace: resolvedTrailingSpace,
    iconLabelSpace: pxNumber(iconLabelSpace),
    expandedMinWidth: options.expandedMinWidth ?? resolvedHeight,
    textOnlyLeadingSpace: options.textOnlyLeadingSpace ?? resolvedLeadingSpace,
    textOnlyTrailingSpace: options.textOnlyTrailingSpace ?? resolvedTrailingSpace,
    typography: typography[typographyRole as TypographyRole],
  };
}

export const extendedFabSizeTokens = {
  baseline: extendedFabSize(
    token.ComponentFabExtendedBaselineContainerHeight,
    token.ComponentFabExtendedBaselineIconSize,
    token.ComponentFabExtendedBaselineContainerShape,
    token.ComponentFabExtendedBaselineLeadingSpace,
    token.ComponentFabExtendedBaselineTrailingSpace,
    token.ComponentFabExtendedBaselineIconLabelSpace,
    token.ComponentFabExtendedBaselineLabelTextTypography,
    {
      expandedMinWidth: baselineExtendedMinWidth,
      textOnlyLeadingSpace: baselineExtendedTextPadding,
      textOnlyTrailingSpace: baselineExtendedTextPadding,
    },
  ),
  small: extendedFabSize(
    token.ComponentFabExtendedSizeSmallContainerHeight,
    token.ComponentFabExtendedSizeSmallIconSize,
    token.ComponentFabExtendedSizeSmallContainerShape,
    token.ComponentFabExtendedSizeSmallLeadingSpace,
    token.ComponentFabExtendedSizeSmallTrailingSpace,
    token.ComponentFabExtendedSizeSmallIconLabelSpace,
    token.ComponentFabExtendedSizeSmallLabelTextTypography,
  ),
  medium: extendedFabSize(
    token.ComponentFabExtendedSizeMediumContainerHeight,
    token.ComponentFabExtendedSizeMediumIconSize,
    token.ComponentFabExtendedSizeMediumContainerShape,
    token.ComponentFabExtendedSizeMediumLeadingSpace,
    token.ComponentFabExtendedSizeMediumTrailingSpace,
    token.ComponentFabExtendedSizeMediumIconLabelSpace,
    token.ComponentFabExtendedSizeMediumLabelTextTypography,
  ),
  large: extendedFabSize(
    token.ComponentFabExtendedSizeLargeContainerHeight,
    token.ComponentFabExtendedSizeLargeIconSize,
    token.ComponentFabExtendedSizeLargeContainerShape,
    token.ComponentFabExtendedSizeLargeLeadingSpace,
    token.ComponentFabExtendedSizeLargeTrailingSpace,
    token.ComponentFabExtendedSizeLargeIconLabelSpace,
    token.ComponentFabExtendedSizeLargeLabelTextTypography,
  ),
} as const satisfies Record<ExtendedFabSize, ExtendedFabSizeTokens>;

export const fabVariantColors = {
  primaryContainer: {
    containerColor: token.ComponentFabContainerPrimaryContainerColor,
    contentColor: token.ComponentFabContainerPrimaryIconColor,
  },
  secondaryContainer: {
    containerColor: token.ComponentFabContainerSecondaryContainerColor,
    contentColor: token.ComponentFabContainerSecondaryIconColor,
  },
  tertiaryContainer: {
    containerColor: token.ComponentFabContainerTertiaryContainerColor,
    contentColor: token.ComponentFabContainerTertiaryIconColor,
  },
  surface: {
    containerColor: token.ComponentFabSurfaceContainerColor,
    contentColor: token.ComponentFabSurfaceIconColor,
    loweredContainerColor: token.ComponentFabSurfaceLoweredContainerColor,
  },
  primary: {
    containerColor: token.ComponentFabVariantPrimaryContainerColor,
    contentColor: token.ComponentFabVariantPrimaryIconColor,
  },
  secondary: {
    containerColor: token.ComponentFabVariantSecondaryContainerColor,
    contentColor: token.ComponentFabVariantSecondaryIconColor,
  },
  tertiary: {
    containerColor: token.ComponentFabVariantTertiaryContainerColor,
    contentColor: token.ComponentFabVariantTertiaryIconColor,
  },
} as const satisfies Record<FabVariant, FabVariantColors>;

export const extendedFabVariantColors = {
  primaryContainer: {
    containerColor: token.ComponentFabExtendedContainerPrimaryContainerColor,
    contentColor: token.ComponentFabExtendedContainerPrimaryIconColor,
  },
  secondaryContainer: {
    containerColor: token.ComponentFabExtendedContainerSecondaryContainerColor,
    contentColor: token.ComponentFabExtendedContainerSecondaryIconColor,
  },
  tertiaryContainer: {
    containerColor: token.ComponentFabExtendedContainerTertiaryContainerColor,
    contentColor: token.ComponentFabExtendedContainerTertiaryIconColor,
  },
  surface: {
    containerColor: token.ComponentFabExtendedSurfaceContainerColor,
    contentColor: token.ComponentFabExtendedSurfaceIconColor,
    loweredContainerColor: token.ComponentFabExtendedSurfaceLoweredContainerColor,
  },
  primary: {
    containerColor: token.ComponentFabExtendedVariantPrimaryContainerColor,
    contentColor: token.ComponentFabExtendedVariantPrimaryIconColor,
  },
  secondary: {
    containerColor: token.ComponentFabExtendedVariantSecondaryContainerColor,
    contentColor: token.ComponentFabExtendedVariantSecondaryIconColor,
  },
  tertiary: {
    containerColor: token.ComponentFabExtendedVariantTertiaryContainerColor,
    contentColor: token.ComponentFabExtendedVariantTertiaryIconColor,
  },
} as const satisfies Record<FabVariant, FabVariantColors>;

export const brandedFabTokens = {
  height: pxNumber(token.ComponentFabBrandedContainerHeight),
  width: pxNumber(token.ComponentFabBrandedContainerWidth),
  iconSize: pxNumber(token.ComponentFabBrandedIconSize),
  shape: token.ComponentFabBrandedContainerShape as ShapeName,
  containerColor: token.ComponentFabBrandedContainerColor,
  loweredContainerColor: token.ComponentFabBrandedLoweredContainerColor,
  stateLayerColor: token.ComponentFabBrandedPressedStateLayerColor,
} as const;

export const brandedExtendedFabTokens = {
  height: pxNumber(token.ComponentFabExtendedBrandedContainerHeight),
  iconSize: pxNumber(token.ComponentFabExtendedBrandedIconSize),
  shape: token.ComponentFabExtendedBrandedContainerShape as ShapeName,
  containerColor: token.ComponentFabExtendedBrandedContainerColor,
  loweredContainerColor: token.ComponentFabExtendedBrandedLoweredContainerColor,
  stateLayerColor: token.ComponentFabExtendedBrandedPressedStateLayerColor,
  labelColor: token.ComponentFabExtendedBrandedLabelTextColor,
  focusLabelColor: token.ComponentFabExtendedBrandedFocusLabelTextColor,
  hoverLabelColor: token.ComponentFabExtendedBrandedHoverLabelTextColor,
  pressedLabelColor: token.ComponentFabExtendedBrandedPressedLabelTextColor,
  typography:
    typography[token.ComponentFabExtendedBrandedLabelTextTypography as TypographyRole],
} as const;

const defaultElevation = {
  default: token.ComponentFabContainerPrimaryContainerElevation as ElevationLevel,
  focused: token.ComponentFabContainerPrimaryFocusedContainerElevation as ElevationLevel,
  hovered: token.ComponentFabContainerPrimaryHoveredContainerElevation as ElevationLevel,
  pressed: token.ComponentFabContainerPrimaryPressedContainerElevation as ElevationLevel,
} as const;

const loweredElevation = {
  default: token.ComponentFabSurfaceLoweredContainerElevation as ElevationLevel,
  focused: token.ComponentFabSurfaceLoweredFocusContainerElevation as ElevationLevel,
  hovered: token.ComponentFabSurfaceLoweredHoverContainerElevation as ElevationLevel,
  pressed: token.ComponentFabSurfaceLoweredPressedContainerElevation as ElevationLevel,
} as const;

export const fabElevationTokens = {
  default: defaultElevation,
  lowered: loweredElevation,
} as const satisfies Record<FabElevation, Record<'default' | 'focused' | 'hovered' | 'pressed', ElevationLevel>>;

function typefaceRoleVariable(role: string): string {
  return `var(--font-family-${role})`;
}

function cssLength(value: CSSProperties['borderRadius'], fallback: string): string | number {
  if (value === undefined) return fallback;
  return typeof value === 'number' ? `${value}px` : value;
}

function colorsFor(
  colors: FabVariantColors,
  elevation: FabElevation,
  options: FabStyleOptions,
) {
  return {
    containerColor:
      options.containerColor ??
      (elevation === 'lowered' && colors.loweredContainerColor
        ? colors.loweredContainerColor
        : colors.containerColor),
    contentColor: options.contentColor ?? colors.contentColor,
  };
}

export function getFabStyle(
  size: FabSize,
  options: FabStyleOptions = {},
): FabStyle {
  const sizes = fabSizeTokens[size];
  const variant = options.variant ?? 'primaryContainer';
  const elevation = options.elevation ?? 'default';
  const colors = colorsFor(fabVariantColors[variant], elevation, options);
  return {
    '--_fab-target-size': `${Math.max(minimumInteractiveSize, sizes.height)}px`,
    '--_fab-container-width': `${sizes.width}px`,
    '--_fab-container-height': `${sizes.height}px`,
    '--_fab-container-radius': cssLength(options.shape, shapeRadius[sizes.shape]),
    '--_fab-container-color': colors.containerColor,
    '--_fab-content-color': colors.contentColor,
    '--_fab-state-layer-color': colors.contentColor,
    '--_fab-icon-size': `${sizes.iconSize}px`,
  };
}

export function getBrandedFabStyle(
  options: BrandedFabStyleOptions = {},
): FabStyle {
  const elevation = options.elevation ?? 'default';
  return {
    '--_fab-target-size': `${Math.max(minimumInteractiveSize, brandedFabTokens.height)}px`,
    '--_fab-container-width': `${brandedFabTokens.width}px`,
    '--_fab-container-height': `${brandedFabTokens.height}px`,
    '--_fab-container-radius': cssLength(options.shape, shapeRadius[brandedFabTokens.shape]),
    '--_fab-container-color':
      options.containerColor ??
      (elevation === 'lowered'
        ? brandedFabTokens.loweredContainerColor
        : brandedFabTokens.containerColor),
    '--_fab-content-color': 'inherit',
    '--_fab-state-layer-color': brandedFabTokens.stateLayerColor,
    '--_fab-icon-size': `${brandedFabTokens.iconSize}px`,
  };
}

function extendedLayoutStyle(sizes: ExtendedFabSizeTokens): FabStyle {
  return {
    '--_fab-leading-space': `${sizes.leadingSpace}px`,
    '--_fab-trailing-space': `${sizes.trailingSpace}px`,
    '--_fab-icon-label-space': `${sizes.iconLabelSpace}px`,
    '--_fab-expanded-min-width': `${sizes.expandedMinWidth}px`,
    '--_fab-text-only-leading-space': `${sizes.textOnlyLeadingSpace}px`,
    '--_fab-text-only-trailing-space': `${sizes.textOnlyTrailingSpace}px`,
  };
}

function extendedTypographyStyle(typographyTokens: TypographyTokens): FabStyle {
  return {
    '--_fab-label-font-family': typefaceRoleVariable(typographyTokens.fontFamily),
    '--_fab-label-font-size': typographyTokens.fontSize,
    '--_fab-label-line-height': typographyTokens.lineHeight,
    '--_fab-label-font-weight': typographyTokens.fontWeight,
    '--_fab-label-letter-spacing': typographyTokens.letterSpacing,
  };
}

function extendedMotionStyle(): FabStyle {
  return {
    '--_fab-expand-size-duration': token.MotionSpringFastSpatialDuration,
    '--_fab-expand-size-easing': token.MotionSpringFastSpatialEasing,
    '--_fab-expand-opacity-duration': token.MotionSpringFastEffectsDuration,
    '--_fab-expand-opacity-easing': token.MotionSpringFastEffectsEasing,
  };
}

export function getExtendedFabStyle(
  size: ExtendedFabSize,
  options: FabStyleOptions = {},
): FabStyle {
  const sizes = extendedFabSizeTokens[size];
  const variant = options.variant ?? 'primaryContainer';
  const elevation = options.elevation ?? 'default';
  const colors = colorsFor(extendedFabVariantColors[variant], elevation, options);
  return {
    '--_fab-target-size': `${sizes.height}px`,
    '--_fab-container-width': `${sizes.height}px`,
    '--_fab-container-height': `${sizes.height}px`,
    '--_fab-container-radius': cssLength(options.shape, shapeRadius[sizes.shape]),
    '--_fab-container-color': colors.containerColor,
    '--_fab-content-color': colors.contentColor,
    '--_fab-state-layer-color': colors.contentColor,
    '--_fab-icon-size': `${sizes.iconSize}px`,
    '--_fab-label-color': colors.contentColor,
    ...extendedLayoutStyle(sizes),
    ...extendedTypographyStyle(sizes.typography),
    ...extendedMotionStyle(),
  };
}

export function getBrandedExtendedFabStyle(
  options: BrandedFabStyleOptions = {},
): FabStyle {
  const elevation = options.elevation ?? 'default';
  const layout = extendedFabSizeTokens.baseline;
  return {
    '--_fab-target-size': `${brandedExtendedFabTokens.height}px`,
    '--_fab-container-width': `${brandedExtendedFabTokens.height}px`,
    '--_fab-container-height': `${brandedExtendedFabTokens.height}px`,
    '--_fab-container-radius': cssLength(
      options.shape,
      shapeRadius[brandedExtendedFabTokens.shape],
    ),
    '--_fab-container-color':
      options.containerColor ??
      (elevation === 'lowered'
        ? brandedExtendedFabTokens.loweredContainerColor
        : brandedExtendedFabTokens.containerColor),
    '--_fab-content-color': 'inherit',
    '--_fab-state-layer-color': brandedExtendedFabTokens.stateLayerColor,
    '--_fab-icon-size': `${brandedExtendedFabTokens.iconSize}px`,
    '--_fab-label-color': brandedExtendedFabTokens.labelColor,
    '--_fab-focus-label-color': brandedExtendedFabTokens.focusLabelColor,
    '--_fab-hover-label-color': brandedExtendedFabTokens.hoverLabelColor,
    '--_fab-pressed-label-color': brandedExtendedFabTokens.pressedLabelColor,
    ...extendedLayoutStyle(layout),
    ...extendedTypographyStyle(brandedExtendedFabTokens.typography),
    ...extendedMotionStyle(),
  };
}
