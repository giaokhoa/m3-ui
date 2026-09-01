import type { CSSProperties } from 'react';

export type NavigationRailStyle = CSSProperties & Record<`--${string}`, string | number>;
export interface NavigationRailStyleOptions {
  containerColor?: CSSProperties['backgroundColor'];
  contentColor?: CSSProperties['color'];
}
export interface NavigationRailItemStyleOptions {
  selectedIconColor?: CSSProperties['color'];
  selectedLabelColor?: CSSProperties['color'];
  indicatorColor?: CSSProperties['backgroundColor'];
  unselectedIconColor?: CSSProperties['color'];
  unselectedLabelColor?: CSSProperties['color'];
}
export interface NavigationRailItemInteractionState {
  isHovered?: boolean;
  isPressed?: boolean;
  isFocusVisible?: boolean;
  isDisabled?: boolean;
}

export const navigationRailRuntime = {
  verticalPadding: 4,
  itemSpacing: 4,
  headerSpacerHeight: 8,
  itemHeight: 56,
  disabledAlpha: 0.38,
} as const;

export function getNavigationRailStyle(options: NavigationRailStyleOptions = {}): NavigationRailStyle {
  return {
    ...(options.containerColor !== undefined ? { '--_navigation-rail-container-color': options.containerColor } : {}),
    ...(options.contentColor !== undefined ? { '--_navigation-rail-content-color': options.contentColor } : {}),
  };
}

export function getNavigationRailItemStyle(
  _selected: boolean,
  _hasLabel: boolean,
  _state: NavigationRailItemInteractionState = {},
  options: NavigationRailItemStyleOptions = {},
): NavigationRailStyle {
  return {
    ...(options.selectedIconColor !== undefined ? { '--_navigation-rail-selected-icon-override': options.selectedIconColor } : {}),
    ...(options.selectedLabelColor !== undefined ? { '--_navigation-rail-selected-label-override': options.selectedLabelColor } : {}),
    ...(options.indicatorColor !== undefined ? { '--_navigation-rail-indicator-override': options.indicatorColor } : {}),
    ...(options.unselectedIconColor !== undefined ? { '--_navigation-rail-unselected-icon-override': options.unselectedIconColor } : {}),
    ...(options.unselectedLabelColor !== undefined ? { '--_navigation-rail-unselected-label-override': options.unselectedLabelColor } : {}),
  };
}
