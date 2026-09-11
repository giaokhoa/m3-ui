import * as token from '@m3-ui/tokens';
import '@m3-ui/tokens/top-app-bar.css';
import type { CSSProperties } from 'react';
import type { ElevationLevel } from '../../internal/elevation';

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

// AndroidX renderer mechanics used for centered-title measurement and expanded
// row placement. They are not design-token aliases and intentionally remain
// beside the runtime consumer rather than becoming a second token source.
export const topAppBarRuntime = {
  horizontalPadding: 4,
  titleInset: 16,
  mediumTitleBottomPadding: 24,
  largeTitleBottomPadding: 28,
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

function setOverride(
  style: TopAppBarStyle,
  name: `--${string}`,
  value: CSSProperties['color'] | CSSProperties['backgroundColor'] | undefined,
) {
  if (value !== undefined) style[name] = value as string | number;
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
  const isScrolled = twoRow ? fraction > 0 : overlap > 0.01;

  const style: TopAppBarStyle = {
    '--_top-app-bar-height': `${currentHeight}px`,
    '--_top-app-bar-expanded-height': `${expandedHeight}px`,
    '--_top-app-bar-scroll-fraction': fraction,
    '--_top-app-bar-overlapped-fraction': overlap,
    '--_top-app-bar-expanded-alpha':
      variant === 'small' || variant === 'center-aligned' ? 1 : 1 - fraction,
    '--_top-app-bar-collapsed-alpha':
      variant === 'small' || variant === 'center-aligned' ? 1 : fraction,
  };

  setOverride(
    style,
    '--_top-app-bar-container-color',
    isScrolled ? options.scrolledContainerColor : options.containerColor,
  );
  setOverride(style, '--_top-app-bar-title-color', options.titleColor);
  setOverride(style, '--_top-app-bar-subtitle-color', options.subtitleColor);
  setOverride(
    style,
    '--_top-app-bar-navigation-icon-color',
    options.navigationIconColor,
  );
  setOverride(style, '--_top-app-bar-action-icon-color', options.actionIconColor);
  return style;
}
