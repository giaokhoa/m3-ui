import * as token from '@m3-ui/tokens';
import type { CSSProperties } from 'react';

export type ShortNavigationBarArrangement = 'equal-weight' | 'centered';
export type ShortNavigationBarIconPosition = 'top' | 'start';

export type ShortNavigationBarStyle = CSSProperties &
  Record<`--${string}`, string | number>;

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

export const shortNavigationBarTokens = {
  containerColor: token.ComponentNavigationBarContainerColor,
  containerHeight: token.ComponentNavigationBarContainerHeight,
  activeIconColor: token.ComponentNavigationBarItemActiveIconColor,
  activeIndicatorColor: token.ComponentNavigationBarItemActiveIndicatorColor,
  activeLabelTextColor: token.ComponentNavigationBarItemActiveLabelTextColor,
  inactiveIconColor: token.ComponentNavigationBarItemInactiveIconColor,
  inactiveLabelTextColor: token.ComponentNavigationBarItemInactiveLabelTextColor,
  topIconSize: token.ComponentNavigationBarVerticalItemIconSize,
  topIndicatorHeight: token.ComponentNavigationBarVerticalItemActiveIndicatorHeight,
  topIndicatorWidth: token.ComponentNavigationBarVerticalItemActiveIndicatorWidth,
  topContainerBetweenSpace: token.ComponentNavigationBarVerticalItemContainerBetweenSpace,
  startIconSize: token.ComponentNavigationBarHorizontalItemIconSize,
  startIndicatorHeight: token.ComponentNavigationBarHorizontalItemActiveIndicatorHeight,
  startIndicatorLeadingSpace:
    token.ComponentNavigationBarHorizontalItemActiveIndicatorLeadingSpace,
  iconLabelSpace: token.ComponentNavigationBarItemActiveIndicatorIconLabelSpace,
  activeFocusStateLayerColor:
    token.ComponentNavigationBarBaselineActiveFocusStateLayerColor,
  activeHoverStateLayerColor:
    token.ComponentNavigationBarBaselineActiveHoverStateLayerColor,
  activePressedStateLayerColor:
    token.ComponentNavigationBarBaselineActivePressedStateLayerColor,
  inactiveFocusStateLayerColor:
    token.ComponentNavigationBarBaselineInactiveFocusStateLayerColor,
  inactiveHoverStateLayerColor:
    token.ComponentNavigationBarBaselineInactiveHoverStateLayerColor,
  inactivePressedStateLayerColor:
    token.ComponentNavigationBarBaselineInactivePressedStateLayerColor,
  focusStateLayerOpacity:
    token.ComponentNavigationBarBaselineFocusStateLayerOpacity,
  hoverStateLayerOpacity:
    token.ComponentNavigationBarBaselineHoverStateLayerOpacity,
  pressedStateLayerOpacity:
    token.ComponentNavigationBarBaselinePressedStateLayerOpacity,
} as const;

export const shortNavigationBarRuntime = {
  disabledAlpha: 0.38,
  topIndicatorToLabelPadding: 4,
  centeredOccupancy: {
    3: 0.6,
    4: 0.7,
    5: 0.8,
    6: 0.9,
  } as const,
} as const;

function interactionStateLayer(
  selected: boolean,
  state: ShortNavigationBarItemInteractionState,
) {
  if (selected) {
    if (state.isPressed) return shortNavigationBarTokens.activePressedStateLayerColor;
    if (state.isFocusVisible) return shortNavigationBarTokens.activeFocusStateLayerColor;
    return shortNavigationBarTokens.activeHoverStateLayerColor;
  }

  if (state.isPressed) return shortNavigationBarTokens.inactivePressedStateLayerColor;
  if (state.isFocusVisible) return shortNavigationBarTokens.inactiveFocusStateLayerColor;
  return shortNavigationBarTokens.inactiveHoverStateLayerColor;
}

export function getCenteredOccupancy(itemsCount: number): number {
  if (itemsCount > 6) return 1;
  if (itemsCount < 3) return shortNavigationBarRuntime.centeredOccupancy[3];
  return shortNavigationBarRuntime.centeredOccupancy[
    itemsCount as keyof typeof shortNavigationBarRuntime.centeredOccupancy
  ];
}

export function getShortNavigationBarStyle(
  options: ShortNavigationBarStyleOptions = {},
): ShortNavigationBarStyle {
  return {
    '--_short-navigation-bar-min-height': shortNavigationBarTokens.containerHeight,
    '--_short-navigation-bar-container-color':
      options.containerColor ?? shortNavigationBarTokens.containerColor,
    '--_short-navigation-bar-content-color':
      options.contentColor ?? token.ColorRoleOnSurface,
  };
}

export function getShortNavigationBarItemStyle(
  isSelected: boolean,
  iconPosition: ShortNavigationBarIconPosition,
  state: ShortNavigationBarItemInteractionState = {},
  options: ShortNavigationBarItemStyleOptions = {},
): ShortNavigationBarStyle {
  const isTop = iconPosition === 'top';
  const iconSize = isTop
    ? shortNavigationBarTokens.topIconSize
    : shortNavigationBarTokens.startIconSize;
  const indicatorHeight = isTop
    ? shortNavigationBarTokens.topIndicatorHeight
    : shortNavigationBarTokens.startIndicatorHeight;
  const indicatorHorizontalPadding = isTop
    ? `calc((${shortNavigationBarTokens.topIndicatorWidth} - ${iconSize}) / 2)`
    : shortNavigationBarTokens.startIndicatorLeadingSpace;

  return {
    '--_short-navigation-bar-icon-size': iconSize,
    '--_short-navigation-bar-indicator-height': indicatorHeight,
    '--_short-navigation-bar-indicator-width': isTop
      ? shortNavigationBarTokens.topIndicatorWidth
      : 'auto',
    '--_short-navigation-bar-indicator-horizontal-padding':
      indicatorHorizontalPadding,
    '--_short-navigation-bar-indicator-vertical-padding': `calc((${indicatorHeight} - ${iconSize}) / 2)`,
    '--_short-navigation-bar-icon-label-space': isTop
      ? `${shortNavigationBarRuntime.topIndicatorToLabelPadding}px`
      : shortNavigationBarTokens.iconLabelSpace,
    '--_short-navigation-bar-top-item-padding':
      shortNavigationBarTokens.topContainerBetweenSpace,
    '--_short-navigation-bar-icon-color': isSelected
      ? options.selectedIconColor ?? shortNavigationBarTokens.activeIconColor
      : options.unselectedIconColor ?? shortNavigationBarTokens.inactiveIconColor,
    '--_short-navigation-bar-label-color': isSelected
      ? iconPosition === 'start'
        ? options.selectedStartLabelColor ??
          options.selectedIconColor ??
          shortNavigationBarTokens.activeIconColor
        : options.selectedLabelColor ?? shortNavigationBarTokens.activeLabelTextColor
      : options.unselectedLabelColor ?? shortNavigationBarTokens.inactiveLabelTextColor,
    '--_short-navigation-bar-indicator-color':
      options.indicatorColor ?? shortNavigationBarTokens.activeIndicatorColor,
    '--_short-navigation-bar-content-opacity': state.isDisabled
      ? shortNavigationBarRuntime.disabledAlpha
      : 1,
    '--_ripple-color': interactionStateLayer(isSelected, state),
    '--_ripple-hover-opacity': shortNavigationBarTokens.hoverStateLayerOpacity,
    '--_ripple-focus-opacity': shortNavigationBarTokens.focusStateLayerOpacity,
    '--_ripple-pressed-opacity': shortNavigationBarTokens.pressedStateLayerOpacity,
    '--_short-navigation-bar-label-font-family':
      token.TypographyLabelMediumFontFamily,
    '--_short-navigation-bar-label-font-size': token.TypographyLabelMediumFontSize,
    '--_short-navigation-bar-label-line-height': token.TypographyLabelMediumLineHeight,
    '--_short-navigation-bar-label-font-weight': token.TypographyLabelMediumFontWeight,
    '--_short-navigation-bar-label-letter-spacing':
      token.TypographyLabelMediumLetterSpacing,
  };
}
