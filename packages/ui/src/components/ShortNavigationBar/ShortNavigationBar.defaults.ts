import type { CSSProperties } from 'react';

export type ShortNavigationBarArrangement = 'equal-weight' | 'centered';
export type ShortNavigationBarIconPosition = 'top' | 'start';
export type ShortNavigationBarStyle = CSSProperties & Record<`--${string}`, string | number>;
export interface ShortNavigationBarStyleOptions {
  containerColor?: CSSProperties['backgroundColor'];
  contentColor?: CSSProperties['color'];
}
export interface ShortNavigationBarItemStyleOptions {
  selectedIconColor?: CSSProperties['color'];
  selectedLabelColor?: CSSProperties['color'];
  selectedStartLabelColor?: CSSProperties['color'];
  indicatorColor?: CSSProperties['backgroundColor'];
  unselectedIconColor?: CSSProperties['color'];
  unselectedLabelColor?: CSSProperties['color'];
}
export interface ShortNavigationBarItemInteractionState {
  isHovered?: boolean;
  isPressed?: boolean;
  isFocusVisible?: boolean;
  isDisabled?: boolean;
}

export const shortNavigationBarRuntime = {
  disabledAlpha: 0.38,
  topIndicatorToLabelPadding: 4,
  centeredOccupancy: { 3: 0.6, 4: 0.7, 5: 0.8, 6: 0.9 } as const,
} as const;

export function getCenteredOccupancy(itemsCount: number): number {
  if (itemsCount > 6) return 1;
  if (itemsCount < 3) return shortNavigationBarRuntime.centeredOccupancy[3];
  return shortNavigationBarRuntime.centeredOccupancy[
    itemsCount as keyof typeof shortNavigationBarRuntime.centeredOccupancy
  ];
}

export function getShortNavigationBarStyle(options: ShortNavigationBarStyleOptions = {}): ShortNavigationBarStyle {
  return {
    ...(options.containerColor !== undefined ? { '--_short-navigation-bar-container-color': options.containerColor } : {}),
    ...(options.contentColor !== undefined ? { '--_short-navigation-bar-content-color': options.contentColor } : {}),
  };
}

export function getShortNavigationBarItemStyle(
  _isSelected: boolean,
  _iconPosition: ShortNavigationBarIconPosition,
  _state: ShortNavigationBarItemInteractionState = {},
  options: ShortNavigationBarItemStyleOptions = {},
): ShortNavigationBarStyle {
  return {
    ...(options.selectedIconColor !== undefined ? { '--_short-navigation-bar-selected-icon-override': options.selectedIconColor } : {}),
    ...(options.selectedLabelColor !== undefined ? { '--_short-navigation-bar-selected-label-override': options.selectedLabelColor } : {}),
    ...(options.selectedStartLabelColor !== undefined ? { '--_short-navigation-bar-selected-start-label-override': options.selectedStartLabelColor } : {}),
    ...(options.indicatorColor !== undefined ? { '--_short-navigation-bar-indicator-override': options.indicatorColor } : {}),
    ...(options.unselectedIconColor !== undefined ? { '--_short-navigation-bar-unselected-icon-override': options.unselectedIconColor } : {}),
    ...(options.unselectedLabelColor !== undefined ? { '--_short-navigation-bar-unselected-label-override': options.unselectedLabelColor } : {}),
  };
}
