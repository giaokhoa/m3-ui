import * as token from '@m3-ui/tokens';
import type { CSSProperties } from 'react';
import { getElevationBoxShadow, type ElevationLevel } from '../../internal/elevation';

export type SearchBarStyle = CSSProperties & Record<`--${string}`, string | number>;
type SearchShape = 'full' | 'extraLarge' | 'none';
type SearchTypography = 'bodyLarge';

const shapeRadius: Record<SearchShape, string | number> = {
  full: token.ShapeFull,
  extraLarge: token.ShapeExtraLarge,
  none: 0,
};

const typography = {
  bodyLarge: {
    fontFamilyRole: token.TypographyBodyLargeFontFamily,
    fontSize: token.TypographyBodyLargeFontSize,
    lineHeight: token.TypographyBodyLargeLineHeight,
    fontWeight: token.TypographyBodyLargeFontWeight,
    letterSpacing: token.TypographyBodyLargeLetterSpacing,
  },
} as const;

export const searchBarTokens = {
  containerColor: token.ComponentSearchBarContainerColor,
  containerElevation: token.ComponentSearchBarContainerElevation as ElevationLevel,
  containerHeight: token.ComponentSearchBarContainerHeight,
  containerShape: token.ComponentSearchBarContainerShape as SearchShape,
  inputTextColor: token.ComponentSearchBarInputTextColor,
  inputTextTypography: token.ComponentSearchBarInputTextFont as SearchTypography,
  leadingIconColor: token.ComponentSearchBarLeadingIconColor,
  supportingTextColor: token.ComponentSearchBarSupportingTextColor,
  trailingIconColor: token.ComponentSearchBarTrailingIconColor,
} as const;

export const searchViewTokens = {
  containerColor: token.ComponentSearchViewContainerColor,
  containerElevation: token.ComponentSearchViewContainerElevation as ElevationLevel,
  dockedContainerShape: token.ComponentSearchViewDockedContainerShape as SearchShape,
  dockedHeaderHeight: token.ComponentSearchViewDockedHeaderContainerHeight,
  fullScreenContainerShape: token.ComponentSearchViewFullScreenContainerShape as SearchShape,
  fullScreenHeaderHeight: token.ComponentSearchViewFullScreenHeaderContainerHeight,
  inputTextColor: token.ComponentSearchViewHeaderInputTextColor,
  inputTextTypography: token.ComponentSearchViewHeaderInputTextFont as SearchTypography,
  leadingIconColor: token.ComponentSearchViewHeaderLeadingIconColor,
  supportingTextColor: token.ComponentSearchViewHeaderSupportingTextColor,
  trailingIconColor: token.ComponentSearchViewHeaderTrailingIconColor,
} as const;

// AndroidX SearchBar.kt renderer constraints at ff9a7111. These are layout
// mechanics, not new design tokens, so they stay beside the consumer.
// AndroidX expands with SlowSpatial and collapses with DefaultSpatial. CSS
// cannot express Compose's spring physics directly, so the web renderer uses
// the canonical DefaultSpatial sampled curve instead of inventing timing.
export const searchBarRuntime = {
  minWidth: 360,
  maxWidth: 720,
  dockedMinHeight: 240,
  dockedMaxHeightScreenRatio: 2 / 3,
  horizontalPadding: 16,
  iconSize: 24,
  motion: {
    expand: {
      duration: token.MotionSpringDefaultSpatialDuration,
      easing: token.MotionSpringDefaultSpatialEasing,
    },
  },
} as const;

function typefaceRoleVariable(role: string) {
  return `var(--font-family-${role})`;
}

function typographyVariables(role: SearchTypography) {
  const value = typography[role];
  return {
    '--_search-font-family': typefaceRoleVariable(value.fontFamilyRole),
    '--_search-font-size': value.fontSize,
    '--_search-line-height': value.lineHeight,
    '--_search-font-weight': value.fontWeight,
    '--_search-letter-spacing': value.letterSpacing,
  } as SearchBarStyle;
}

function runtimeVariables(): SearchBarStyle {
  return {
    '--_search-min-width': `${searchBarRuntime.minWidth}px`,
    '--_search-max-width': `${searchBarRuntime.maxWidth}px`,
    '--_search-horizontal-padding': `${searchBarRuntime.horizontalPadding}px`,
    '--_search-icon-size': `${searchBarRuntime.iconSize}px`,
    '--_search-expand-duration': searchBarRuntime.motion.expand.duration,
    '--_search-expand-easing': searchBarRuntime.motion.expand.easing,
  };
}

export function getSearchBarStyle(): SearchBarStyle {
  return {
    '--_search-container-color': searchBarTokens.containerColor,
    '--_search-container-height': searchBarTokens.containerHeight,
    '--_search-container-radius': shapeRadius[searchBarTokens.containerShape],
    '--_search-input-color': searchBarTokens.inputTextColor,
    '--_search-supporting-color': searchBarTokens.supportingTextColor,
    '--_search-leading-icon-color': searchBarTokens.leadingIconColor,
    '--_search-trailing-icon-color': searchBarTokens.trailingIconColor,
    '--_search-box-shadow': getElevationBoxShadow(searchBarTokens.containerElevation, 'var(--shadow)'),
    ...runtimeVariables(),
    ...typographyVariables(searchBarTokens.inputTextTypography),
  };
}

export function getSearchViewStyle(mode: 'docked' | 'fullscreen'): SearchBarStyle {
  const fullScreen = mode === 'fullscreen';
  return {
    '--_search-view-container-color': searchViewTokens.containerColor,
    '--_search-view-radius': shapeRadius[
      fullScreen ? searchViewTokens.fullScreenContainerShape : searchViewTokens.dockedContainerShape
    ],
    '--_search-view-header-height': fullScreen
      ? searchViewTokens.fullScreenHeaderHeight
      : searchViewTokens.dockedHeaderHeight,
    '--_search-view-box-shadow': getElevationBoxShadow(searchViewTokens.containerElevation, 'var(--shadow)'),
    '--_search-input-color': searchViewTokens.inputTextColor,
    '--_search-leading-icon-color': searchViewTokens.leadingIconColor,
    '--_search-supporting-color': searchViewTokens.supportingTextColor,
    '--_search-trailing-icon-color': searchViewTokens.trailingIconColor,
    ...runtimeVariables(),
    ...typographyVariables(searchViewTokens.inputTextTypography),
  };
}
