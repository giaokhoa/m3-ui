import type { CSSProperties } from 'react';

export type WideNavigationRailStyle = CSSProperties & Record<`--${string}`, string | number>;
export interface WideNavigationRailStyleOptions {
  containerColor?: CSSProperties['backgroundColor'];
  contentColor?: CSSProperties['color'];
}
export interface WideNavigationRailItemStyleOptions {
  selectedIconColor?: CSSProperties['color'];
  selectedTopLabelColor?: CSSProperties['color'];
  selectedStartLabelColor?: CSSProperties['color'];
  indicatorColor?: CSSProperties['backgroundColor'];
  unselectedIconColor?: CSSProperties['color'];
  unselectedLabelColor?: CSSProperties['color'];
}
export interface WideNavigationRailItemInteractionState {
  isHovered?: boolean;
  isPressed?: boolean;
  isFocusVisible?: boolean;
  isDisabled?: boolean;
}

/** Width bounds are required synchronously by the JS content measurement pass. */
export const wideNavigationRailTokens = {
  expandedContainerWidthMinimum: '220px',
  expandedContainerWidthMaximum: '360px',
} as const;
export const wideNavigationRailRuntime = { itemHorizontalPadding: 20, disabledAlpha: 0.38 } as const;

export function getWideNavigationRailStyle(
  options: WideNavigationRailStyleOptions = {},
): WideNavigationRailStyle {
  return {
    ...(options.containerColor !== undefined ? { '--_wide-navigation-rail-container-color': options.containerColor } : {}),
    ...(options.contentColor !== undefined ? { '--_wide-navigation-rail-content-color': options.contentColor } : {}),
  };
}

export function getWideNavigationRailItemStyle(
  _selected: boolean,
  _expanded: boolean,
  _hasLabel: boolean,
  _state: WideNavigationRailItemInteractionState = {},
  options: WideNavigationRailItemStyleOptions = {},
): WideNavigationRailStyle {
  return {
    ...(options.selectedIconColor !== undefined ? { '--_wide-navigation-rail-selected-icon-override': options.selectedIconColor } : {}),
    ...(options.selectedTopLabelColor !== undefined ? { '--_wide-navigation-rail-selected-top-label-override': options.selectedTopLabelColor } : {}),
    ...(options.selectedStartLabelColor !== undefined ? { '--_wide-navigation-rail-selected-start-label-override': options.selectedStartLabelColor } : {}),
    ...(options.indicatorColor !== undefined ? { '--_wide-navigation-rail-indicator-override': options.indicatorColor } : {}),
    ...(options.unselectedIconColor !== undefined ? { '--_wide-navigation-rail-unselected-icon-override': options.unselectedIconColor } : {}),
    ...(options.unselectedLabelColor !== undefined ? { '--_wide-navigation-rail-unselected-label-override': options.unselectedLabelColor } : {}),
  };
}
