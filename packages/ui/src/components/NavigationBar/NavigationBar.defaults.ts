import type { CSSProperties } from 'react';
import type { ElevationLevel } from '../../internal/elevation';

export type NavigationBarStyle = CSSProperties & Record<`--${string}`, string | number>;
export interface NavigationBarStyleOptions {
  containerColor?: CSSProperties['backgroundColor'];
  contentColor?: CSSProperties['color'];
}
export interface NavigationBarItemStyleOptions {
  selectedIconColor?: CSSProperties['color'];
  selectedLabelColor?: CSSProperties['color'];
  indicatorColor?: CSSProperties['backgroundColor'];
  unselectedIconColor?: CSSProperties['color'];
  unselectedLabelColor?: CSSProperties['color'];
}
export interface NavigationBarItemInteractionState {
  isHovered?: boolean;
  isPressed?: boolean;
  isFocusVisible?: boolean;
  isDisabled?: boolean;
}

/** Compose deliberately renders NavigationBar at Level0; paint defaults are CSS-owned. */
export const navigationBarRuntime = {
  runtimeElevation: 'level0' as ElevationLevel,
  horizontalItemSpacing: 8,
  itemToIconMinimumPadding: 44,
  indicatorVerticalOffset: 12,
  disabledAlpha: 0.38,
} as const;

export function getNavigationBarStyle(options: NavigationBarStyleOptions = {}): NavigationBarStyle {
  return {
    ...(options.containerColor !== undefined ? { '--_navigation-bar-container-color': options.containerColor } : {}),
    ...(options.contentColor !== undefined ? { '--_navigation-bar-content-color': options.contentColor } : {}),
  };
}

/** Generated CSS owns selected/interaction state; this bridge only exposes public overrides. */
export function getNavigationBarItemStyle(
  _selected: boolean,
  _state: NavigationBarItemInteractionState = {},
  options: NavigationBarItemStyleOptions = {},
): NavigationBarStyle {
  return {
    ...(options.selectedIconColor !== undefined ? { '--_navigation-bar-selected-icon-override': options.selectedIconColor } : {}),
    ...(options.selectedLabelColor !== undefined ? { '--_navigation-bar-selected-label-override': options.selectedLabelColor } : {}),
    ...(options.indicatorColor !== undefined ? { '--_navigation-bar-indicator-override': options.indicatorColor } : {}),
    ...(options.unselectedIconColor !== undefined ? { '--_navigation-bar-unselected-icon-override': options.unselectedIconColor } : {}),
    ...(options.unselectedLabelColor !== undefined ? { '--_navigation-bar-unselected-label-override': options.unselectedLabelColor } : {}),
  };
}
