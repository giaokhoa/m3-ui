import * as token from '@m3/tokens';
import type { CSSProperties } from 'react';
import {
  getElevationBoxShadow,
  type ElevationLevel,
} from '../../internal/elevation';

export type NavigationRailStyle = CSSProperties &
  Record<`--${string}`, string | number>;

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

export const navigationRailTokens = {
  containerColor: token.ComponentNavigationRailCollapsedContainerColor,
  containerElevation:
    token.ComponentNavigationRailCollapsedContainerElevation as ElevationLevel,
  containerWidth: token.ComponentNavigationRailCollapsedContainerWidth,
  narrowContainerWidth: token.ComponentNavigationRailCollapsedNarrowContainerWidth,
  activeIconColor: token.ComponentNavigationRailColorItemActiveIcon,
  activeIndicatorColor: token.ComponentNavigationRailColorItemActiveIndicator,
  activeLabelTextColor: token.ComponentNavigationRailColorItemActiveLabelText,
  inactiveIconColor: token.ComponentNavigationRailColorItemInactiveIcon,
  inactiveLabelTextColor: token.ComponentNavigationRailColorItemInactiveLabelText,
  activeIndicatorShape: token.ComponentNavigationRailBaselineItemActiveIndicatorShape,
  iconSize: token.ComponentNavigationRailBaselineItemIconSize,
  indicatorHeight: token.ComponentNavigationRailVerticalItemActiveIndicatorHeight,
  indicatorWidth: token.ComponentNavigationRailVerticalItemActiveIndicatorWidth,
  iconLabelSpace: token.ComponentNavigationRailVerticalItemIconLabelSpace,
  labelTextTypography: token.ComponentNavigationRailVerticalItemLabelTextTypography,
  activeFocusStateLayerColor:
    token.ComponentNavigationRailColorItemActiveFocusedStateLayer,
  activeHoverStateLayerColor:
    token.ComponentNavigationRailColorItemActiveHoveredStateLayer,
  activePressedStateLayerColor:
    token.ComponentNavigationRailColorItemActivePressedStateLayer,
  inactiveFocusStateLayerColor:
    token.ComponentNavigationRailColorItemInactiveFocusedStateLayer,
  inactiveHoverStateLayerColor:
    token.ComponentNavigationRailColorItemInactiveHoveredStateLayer,
  inactivePressedStateLayerColor:
    token.ComponentNavigationRailColorItemInactivePressedStateLayer,
  focusStateLayerOpacity: token.ComponentNavigationRailBaselineFocusStateLayerOpacity,
  hoverStateLayerOpacity: token.ComponentNavigationRailBaselineHoverStateLayerOpacity,
  pressedStateLayerOpacity: token.ComponentNavigationRailBaselinePressedStateLayerOpacity,
  noLabelIndicatorHeight:
    token.ComponentNavigationRailBaselineNoLabelActiveIndicatorHeight,
} as const;

export const navigationRailRuntime = {
  verticalPadding: 4,
  itemSpacing: 4,
  headerSpacerHeight: 8,
  itemHeight: 56,
  disabledAlpha: 0.38,
  motion: {
    indicatorSize: {
      duration: token.MotionSpringFastSpatialDuration,
      easing: token.MotionSpringFastSpatialEasing,
    },
    indicatorOpacity: {
      duration: token.MotionSpringDefaultEffectsDuration,
      easing: token.MotionSpringDefaultEffectsEasing,
    },
  },
} as const;

function dimensionNumber(value: string | number): number {
  const numeric = typeof value === 'number' ? value : Number.parseFloat(value);
  if (!Number.isFinite(numeric)) {
    throw new TypeError(`Expected a CSS dimension, received ${String(value)}`);
  }
  return numeric;
}

function interactionStateLayer(
  selected: boolean,
  state: NavigationRailItemInteractionState,
) {
  if (selected) {
    if (state.isPressed) return navigationRailTokens.activePressedStateLayerColor;
    if (state.isFocusVisible) return navigationRailTokens.activeFocusStateLayerColor;
    return navigationRailTokens.activeHoverStateLayerColor;
  }

  if (state.isPressed) return navigationRailTokens.inactivePressedStateLayerColor;
  if (state.isFocusVisible) return navigationRailTokens.inactiveFocusStateLayerColor;
  return navigationRailTokens.inactiveHoverStateLayerColor;
}

export function getNavigationRailStyle(
  options: NavigationRailStyleOptions = {},
): NavigationRailStyle {
  return {
    '--_navigation-rail-width': navigationRailTokens.narrowContainerWidth,
    '--_navigation-rail-container-color':
      options.containerColor ?? navigationRailTokens.containerColor,
    '--_navigation-rail-content-color':
      options.contentColor ?? token.ColorRoleOnSurface,
    '--_navigation-rail-vertical-padding': `${navigationRailRuntime.verticalPadding}px`,
    '--_navigation-rail-item-spacing': `${navigationRailRuntime.itemSpacing}px`,
    '--_navigation-rail-header-spacer-height': `${navigationRailRuntime.headerSpacerHeight}px`,
    '--_navigation-rail-box-shadow': getElevationBoxShadow(
      navigationRailTokens.containerElevation,
    ),
  };
}

export function getNavigationRailItemStyle(
  selected: boolean,
  hasLabel: boolean,
  state: NavigationRailItemInteractionState = {},
  options: NavigationRailItemStyleOptions = {},
): NavigationRailStyle {
  const disabledAlpha = state.isDisabled ? navigationRailRuntime.disabledAlpha : 1;
  const indicatorHeight = hasLabel
    ? navigationRailTokens.indicatorHeight
    : navigationRailTokens.noLabelIndicatorHeight;
  const centeredIndicatorTop =
    (navigationRailRuntime.itemHeight - dimensionNumber(indicatorHeight)) / 2;

  return {
    '--_navigation-rail-item-height': `${navigationRailRuntime.itemHeight}px`,
    '--_navigation-rail-item-width': navigationRailTokens.narrowContainerWidth,
    '--_navigation-rail-indicator-width': navigationRailTokens.indicatorWidth,
    '--_navigation-rail-indicator-height': indicatorHeight,
    '--_navigation-rail-indicator-top': hasLabel ? '0px' : `${centeredIndicatorTop}px`,
    '--_navigation-rail-indicator-centered-top': `${
      (navigationRailRuntime.itemHeight -
        dimensionNumber(navigationRailTokens.indicatorHeight)) /
      2
    }px`,
    '--_navigation-rail-indicator-radius': token.ShapeFull,
    '--_navigation-rail-icon-size': navigationRailTokens.iconSize,
    '--_navigation-rail-icon-label-space': navigationRailTokens.iconLabelSpace,
    '--_navigation-rail-icon-color': selected
      ? options.selectedIconColor ?? navigationRailTokens.activeIconColor
      : options.unselectedIconColor ?? navigationRailTokens.inactiveIconColor,
    '--_navigation-rail-label-color': selected
      ? options.selectedLabelColor ?? navigationRailTokens.activeLabelTextColor
      : options.unselectedLabelColor ?? navigationRailTokens.inactiveLabelTextColor,
    '--_navigation-rail-indicator-color':
      options.indicatorColor ?? navigationRailTokens.activeIndicatorColor,
    '--_navigation-rail-content-opacity': disabledAlpha,
    '--_ripple-color': interactionStateLayer(selected, state),
    '--_ripple-hover-opacity': navigationRailTokens.hoverStateLayerOpacity,
    '--_ripple-focus-opacity': navigationRailTokens.focusStateLayerOpacity,
    '--_ripple-pressed-opacity': navigationRailTokens.pressedStateLayerOpacity,
    '--_navigation-rail-indicator-size-duration':
      navigationRailRuntime.motion.indicatorSize.duration,
    '--_navigation-rail-indicator-size-easing':
      navigationRailRuntime.motion.indicatorSize.easing,
    '--_navigation-rail-indicator-opacity-duration':
      navigationRailRuntime.motion.indicatorOpacity.duration,
    '--_navigation-rail-indicator-opacity-easing':
      navigationRailRuntime.motion.indicatorOpacity.easing,
    '--_navigation-rail-label-font-family': token.TypographyLabelMediumFontFamily,
    '--_navigation-rail-label-font-size': token.TypographyLabelMediumFontSize,
    '--_navigation-rail-label-line-height': token.TypographyLabelMediumLineHeight,
    '--_navigation-rail-label-font-weight': token.TypographyLabelMediumFontWeight,
    '--_navigation-rail-label-letter-spacing':
      token.TypographyLabelMediumLetterSpacing,
  };
}
