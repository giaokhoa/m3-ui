import * as token from '@m3-ui/tokens';
import '@m3-ui/tokens/search-bar.css';
import type { CSSProperties } from 'react';
import type { ElevationLevel } from '../../internal/elevation';

export type SearchBarStyle = CSSProperties & Record<`--${string}`, string | number>;
type SearchShape = 'full' | 'extraLarge' | 'none';
type SearchTypography = 'bodyLarge';

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
// mechanics, not design-token aliases, so they remain runtime-owned.
export const searchBarRuntime = {
  minWidth: 360,
  maxWidth: 720,
  dockedMinHeight: 240,
  dockedMaxHeightScreenRatio: 2 / 3,
  horizontalPadding: 16,
  iconSize: 24,
} as const;

function runtimeVariables(): SearchBarStyle {
  return {
    '--_search-min-width': `${searchBarRuntime.minWidth}px`,
    '--_search-max-width': `${searchBarRuntime.maxWidth}px`,
    '--_search-horizontal-padding': `${searchBarRuntime.horizontalPadding}px`,
    '--_search-icon-size': `${searchBarRuntime.iconSize}px`,
  };
}

// These helpers now project only renderer mechanics. Immutable Material
// color/shape/type/motion defaults are compiled once by search-bar.css.
export function getSearchBarStyle(): SearchBarStyle {
  return runtimeVariables();
}

export function getSearchViewStyle(_mode: 'docked' | 'fullscreen'): SearchBarStyle {
  return runtimeVariables();
}
