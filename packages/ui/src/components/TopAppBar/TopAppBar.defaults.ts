import * as token from '@m3-ui/tokens';
import type { CSSProperties } from 'react';
import {
  getElevationBoxShadow,
  type ElevationLevel,
} from '../../internal/elevation';

export type TopAppBarVariant =
  | 'small'
  | 'center-aligned'
  | 'medium'
  | 'medium-flexible'
  | 'large'
  | 'large-flexible';

export type TopAppBarStyle = CSSProperties &
  Record<`--${string}`, string | number>;

export interface TopAppBarStyleOptions {
  containerColor?: CSSProperties['backgroundColor'];
  scrolledContainerColor?: CSSProperties['backgroundColor'];
  titleColor?: CSSProperties['color'];
  subtitleColor?: CSSProperties['color'];
  navigationIconColor?: CSSProperties['color'];
  actionIconColor?: CSSProperties['color'];
}

export const topAppBarTokens = {
  containerColor: token.ComponentAppBarBaseContainerColor,
  containerElevation:
    token.ComponentAppBarBaseContainerElevation as ElevationLevel,
  scrolledContainerColor: token.ComponentAppBarBaseOnScrollContainerColor,
  scrolledContainerElevation:
    token.ComponentAppBarBaseOnScrollContainerElevation as ElevationLevel,
  titleColor: token.ComponentAppBarBaseTitleColor,
  subtitleColor: token.ComponentAppBarBaseSubtitleColor,
  navigationIconColor: token.ComponentAppBarBaseLeadingIconColor,
  actionIconColor: token.ComponentAppBarBaseTrailingIconColor,
  leadingSpace: token.ComponentAppBarBaseLeadingSpace,
  trailingSpace: token.ComponentAppBarBaseTrailingSpace,
  smallHeight: token.ComponentAppBarVariantSmallContainerHeight,
  mediumHeight: token.ComponentAppBarVariantMediumContainerHeight,
  mediumFlexibleHeight:
    token.ComponentAppBarVariantMediumFlexibleContainerHeight,
  mediumFlexibleLargeHeight:
    token.ComponentAppBarVariantMediumFlexibleLargeContainerHeight,
  largeHeight: token.ComponentAppBarVariantLargeContainerHeight,
  largeFlexibleHeight: token.ComponentAppBarVariantLargeFlexibleContainerHeight,
  largeFlexibleLargeHeight:
    token.ComponentAppBarVariantLargeFlexibleLargeContainerHeight,
} as const;

export const topAppBarRuntime = {
  horizontalPadding: 4,
  titleInset: 16,
  mediumTitleBottomPadding: 24,
  largeTitleBottomPadding: 28,
  motion: {
    duration: token.MotionSpringDefaultEffectsDuration,
    easing: token.MotionSpringDefaultEffectsEasing,
  },
} as const;

export function dimensionNumber(value: string | number): number {
  const numeric = typeof value === 'number' ? value : Number.parseFloat(value);
  if (!Number.isFinite(numeric)) {
    throw new TypeError(`Expected a CSS dimension, received ${String(value)}`);
  }
  return numeric;
}

export function clampScrollFraction(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function topAppBarExpandedHeight(
  variant: TopAppBarVariant,
  hasSubtitle = false,
): number {
  switch (variant) {
    case 'medium':
      return dimensionNumber(topAppBarTokens.mediumHeight);
    case 'medium-flexible':
      return dimensionNumber(
        hasSubtitle
          ? topAppBarTokens.mediumFlexibleLargeHeight
          : topAppBarTokens.mediumFlexibleHeight,
      );
    case 'large':
      return dimensionNumber(topAppBarTokens.largeHeight);
    case 'large-flexible':
      return dimensionNumber(
        hasSubtitle
          ? topAppBarTokens.largeFlexibleLargeHeight
          : topAppBarTokens.largeFlexibleHeight,
      );
    default:
      return dimensionNumber(topAppBarTokens.smallHeight);
  }
}

function typographyVars(prefix: string, typography: string): TopAppBarStyle {
  const typographyMap: Record<string, readonly [string, string, string, string | number, string]> = {
    titleLarge: [
      token.TypographyTitleLargeFontFamily,
      token.TypographyTitleLargeFontSize,
      token.TypographyTitleLargeLineHeight,
      token.TypographyTitleLargeFontWeight,
      token.TypographyTitleLargeLetterSpacing,
    ],
    headlineSmall: [
      token.TypographyHeadlineSmallFontFamily,
      token.TypographyHeadlineSmallFontSize,
      token.TypographyHeadlineSmallLineHeight,
      token.TypographyHeadlineSmallFontWeight,
      token.TypographyHeadlineSmallLetterSpacing,
    ],
    headlineMedium: [
      token.TypographyHeadlineMediumFontFamily,
      token.TypographyHeadlineMediumFontSize,
      token.TypographyHeadlineMediumLineHeight,
      token.TypographyHeadlineMediumFontWeight,
      token.TypographyHeadlineMediumLetterSpacing,
    ],
    displaySmall: [
      token.TypographyDisplaySmallFontFamily,
      token.TypographyDisplaySmallFontSize,
      token.TypographyDisplaySmallLineHeight,
      token.TypographyDisplaySmallFontWeight,
      token.TypographyDisplaySmallLetterSpacing,
    ],
    labelMedium: [
      token.TypographyLabelMediumFontFamily,
      token.TypographyLabelMediumFontSize,
      token.TypographyLabelMediumLineHeight,
      token.TypographyLabelMediumFontWeight,
      token.TypographyLabelMediumLetterSpacing,
    ],
    labelLarge: [
      token.TypographyLabelLargeFontFamily,
      token.TypographyLabelLargeFontSize,
      token.TypographyLabelLargeLineHeight,
      token.TypographyLabelLargeFontWeight,
      token.TypographyLabelLargeLetterSpacing,
    ],
    titleMedium: [
      token.TypographyTitleMediumFontFamily,
      token.TypographyTitleMediumFontSize,
      token.TypographyTitleMediumLineHeight,
      token.TypographyTitleMediumFontWeight,
      token.TypographyTitleMediumLetterSpacing,
    ],
  };
  const values = typographyMap[typography] ?? typographyMap.titleLarge;
  return {
    [`--_${prefix}-font-family`]: values[0],
    [`--_${prefix}-font-size`]: values[1],
    [`--_${prefix}-line-height`]: values[2],
    [`--_${prefix}-font-weight`]: values[3],
    [`--_${prefix}-letter-spacing`]: values[4],
  };
}

function expandedTitleTypography(variant: TopAppBarVariant): string {
  switch (variant) {
    case 'medium':
      return 'headlineSmall';
    case 'medium-flexible':
      return 'headlineMedium';
    case 'large':
      return 'headlineMedium';
    case 'large-flexible':
      return 'displaySmall';
    default:
      return 'titleLarge';
  }
}

function expandedSubtitleTypography(variant: TopAppBarVariant): string {
  return variant === 'large-flexible' ? 'titleMedium' : 'labelLarge';
}

export function getTopAppBarStyle(
  variant: TopAppBarVariant,
  collapsedFraction = 0,
  hasSubtitle = false,
  options: TopAppBarStyleOptions = {},
  overlappedFraction = collapsedFraction,
): TopAppBarStyle {
  const fraction = clampScrollFraction(collapsedFraction);
  const overlap = clampScrollFraction(overlappedFraction);
  const collapsedHeight = dimensionNumber(topAppBarTokens.smallHeight);
  const expandedHeight = topAppBarExpandedHeight(variant, hasSubtitle);
  const currentHeight = expandedHeight - (expandedHeight - collapsedHeight) * fraction;
  const twoRow =
    variant === 'medium' ||
    variant === 'medium-flexible' ||
    variant === 'large' ||
    variant === 'large-flexible';
  // Compose single-row bars switch once content overlaps (> 0.01), while
  // two-row bars derive visual scroll state from collapsedFraction.
  const isScrolled = twoRow ? fraction > 0 : overlap > 0.01;
  const isLarge = variant === 'large' || variant === 'large-flexible';

  return {
    '--_top-app-bar-height': `${currentHeight}px`,
    '--_top-app-bar-collapsed-height': topAppBarTokens.smallHeight,
    '--_top-app-bar-expanded-height': `${expandedHeight}px`,
    '--_top-app-bar-scroll-fraction': fraction,
    '--_top-app-bar-overlapped-fraction': overlap,
    '--_top-app-bar-expanded-alpha': variant === 'small' || variant === 'center-aligned' ? 1 : 1 - fraction,
    '--_top-app-bar-collapsed-alpha': variant === 'small' || variant === 'center-aligned' ? 1 : fraction,
    '--_top-app-bar-container-color': isScrolled
      ? options.scrolledContainerColor ?? topAppBarTokens.scrolledContainerColor
      : options.containerColor ?? topAppBarTokens.containerColor,
    '--_top-app-bar-box-shadow': getElevationBoxShadow(
      isScrolled
        ? topAppBarTokens.scrolledContainerElevation
        : topAppBarTokens.containerElevation,
    ),
    '--_top-app-bar-title-color': options.titleColor ?? topAppBarTokens.titleColor,
    '--_top-app-bar-subtitle-color': options.subtitleColor ?? topAppBarTokens.subtitleColor,
    '--_top-app-bar-navigation-icon-color':
      options.navigationIconColor ?? topAppBarTokens.navigationIconColor,
    '--_top-app-bar-action-icon-color':
      options.actionIconColor ?? topAppBarTokens.actionIconColor,
    '--_top-app-bar-leading-space': topAppBarTokens.leadingSpace,
    '--_top-app-bar-trailing-space': topAppBarTokens.trailingSpace,
    '--_top-app-bar-horizontal-padding': `${topAppBarRuntime.horizontalPadding}px`,
    '--_top-app-bar-title-inset': `${topAppBarRuntime.titleInset}px`,
    '--_top-app-bar-title-start-space': `${
      topAppBarRuntime.titleInset - topAppBarRuntime.horizontalPadding
    }px`,
    '--_top-app-bar-title-bottom-padding': `${
      isLarge
        ? topAppBarRuntime.largeTitleBottomPadding
        : topAppBarRuntime.mediumTitleBottomPadding
    }px`,
    '--_top-app-bar-motion-duration': topAppBarRuntime.motion.duration,
    '--_top-app-bar-motion-easing': topAppBarRuntime.motion.easing,
    ...typographyVars('top-app-bar-collapsed-title', 'titleLarge'),
    ...typographyVars(
      'top-app-bar-expanded-title',
      expandedTitleTypography(variant),
    ),
    ...typographyVars('top-app-bar-collapsed-subtitle', 'labelMedium'),
    ...typographyVars(
      'top-app-bar-expanded-subtitle',
      expandedSubtitleTypography(variant),
    ),
  };
}
