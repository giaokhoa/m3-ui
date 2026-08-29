import * as token from '@m3-ui/tokens';
import type { CSSProperties } from 'react';
import type { ElevationLevel } from '../../internal/elevation';

export type NavigationBarStyle = CSSProperties &
  Record<`--${string}`, string | number>;

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

export const navigationBarTokens = {
  containerColor: token.ComponentNavigationBarContainerColor,
  containerElevation:
    token.ComponentNavigationBarContainerElevation as ElevationLevel,
  containerHeight: token.ComponentNavigationBarContainerHeight,
  tallContainerHeight: token.ComponentNavigationBarTallContainerHeight,
  activeIconColor: token.ComponentNavigationBarItemActiveIconColor,
  activeIndicatorColor: token.ComponentNavigationBarItemActiveIndicatorColor,
  activeIndicatorShape: token.ComponentNavigationBarItemActiveIndicatorShape,
  activeLabelTextColor: token.ComponentNavigationBarItemActiveLabelTextColor,
  inactiveIconColor: token.ComponentNavigationBarItemInactiveIconColor,
  inactiveLabelTextColor: token.ComponentNavigationBarItemInactiveLabelTextColor,
  iconSize: token.ComponentNavigationBarVerticalItemIconSize,
  indicatorHeight: token.ComponentNavigationBarVerticalItemActiveIndicatorHeight,
  indicatorWidth: token.ComponentNavigationBarVerticalItemActiveIndicatorWidth,
  iconLabelSpace: token.ComponentNavigationBarItemActiveIndicatorIconLabelSpace,
  labelTextTypography: token.ComponentNavigationBarLabelTextTypography,
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

export const navigationBarRuntime = {
  // NavigationBar.kt deliberately renders Level0 even though the generated
  // NavigationBarTokens.ContainerElevation remains Level2. Level0 has no
  // shadow paint, so this renderer must not invoke the legacy shadow serializer.
  runtimeElevation: 'level0' as ElevationLevel,
  horizontalItemSpacing: 8,
  itemToIconMinimumPadding: 44,
  indicatorVerticalOffset: 12,
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
  state: NavigationBarItemInteractionState,
) {
  if (selected) {
    if (state.isPressed) return navigationBarTokens.activePressedStateLayerColor;
    if (state.isFocusVisible) return navigationBarTokens.activeFocusStateLayerColor;
    return navigationBarTokens.activeHoverStateLayerColor;
  }

  if (state.isPressed) return navigationBarTokens.inactivePressedStateLayerColor;
  if (state.isFocusVisible) return navigationBarTokens.inactiveFocusStateLayerColor;
  return navigationBarTokens.inactiveHoverStateLayerColor;
}

export function getNavigationBarStyle(
  options: NavigationBarStyleOptions = {},
): NavigationBarStyle {
  return {
    '--_navigation-bar-height': navigationBarTokens.tallContainerHeight,
    '--_navigation-bar-container-color':
      options.containerColor ?? navigationBarTokens.containerColor,
    '--_navigation-bar-content-color':
      options.contentColor ?? token.ColorRoleOnSurface,
    '--_navigation-bar-item-spacing': `${navigationBarRuntime.horizontalItemSpacing}px`,
    '--_navigation-bar-box-shadow': 'none',
  };
}

export function getNavigationBarItemStyle(
  selected: boolean,
  state: NavigationBarItemInteractionState = {},
  options: NavigationBarItemStyleOptions = {},
): NavigationBarStyle {
  const disabledAlpha = state.isDisabled ? navigationBarRuntime.disabledAlpha : 1;
  const centeredIndicatorTop =
    (dimensionNumber(navigationBarTokens.tallContainerHeight) -
      dimensionNumber(navigationBarTokens.indicatorHeight)) /
    2;

  return {
    '--_navigation-bar-item-height': navigationBarTokens.tallContainerHeight,
    '--_navigation-bar-item-min-width': `${
      dimensionNumber(navigationBarTokens.iconSize) +
      navigationBarRuntime.itemToIconMinimumPadding * 2
    }px`,
    '--_navigation-bar-indicator-width': navigationBarTokens.indicatorWidth,
    '--_navigation-bar-indicator-height': navigationBarTokens.indicatorHeight,
    '--_navigation-bar-indicator-top': `${navigationBarRuntime.indicatorVerticalOffset}px`,
    '--_navigation-bar-indicator-centered-top': `${centeredIndicatorTop}px`,
    '--_navigation-bar-indicator-radius': token.ShapeFull,
    '--_navigation-bar-icon-size': navigationBarTokens.iconSize,
    '--_navigation-bar-icon-label-space': navigationBarTokens.iconLabelSpace,
    '--_navigation-bar-icon-color': selected
      ? options.selectedIconColor ?? navigationBarTokens.activeIconColor
      : options.unselectedIconColor ?? navigationBarTokens.inactiveIconColor,
    '--_navigation-bar-label-color': selected
      ? options.selectedLabelColor ?? navigationBarTokens.activeLabelTextColor
      : options.unselectedLabelColor ?? navigationBarTokens.inactiveLabelTextColor,
    '--_navigation-bar-indicator-color':
      options.indicatorColor ?? navigationBarTokens.activeIndicatorColor,
    '--_navigation-bar-content-opacity': disabledAlpha,
    '--_ripple-color': interactionStateLayer(selected, state),
    '--_ripple-hover-opacity': navigationBarTokens.hoverStateLayerOpacity,
    '--_ripple-focus-opacity': navigationBarTokens.focusStateLayerOpacity,
    '--_ripple-pressed-opacity': navigationBarTokens.pressedStateLayerOpacity,
    '--_navigation-bar-indicator-size-duration':
      navigationBarRuntime.motion.indicatorSize.duration,
    '--_navigation-bar-indicator-size-easing':
      navigationBarRuntime.motion.indicatorSize.easing,
    '--_navigation-bar-indicator-opacity-duration':
      navigationBarRuntime.motion.indicatorOpacity.duration,
    '--_navigation-bar-indicator-opacity-easing':
      navigationBarRuntime.motion.indicatorOpacity.easing,
    '--_navigation-bar-label-font-family': token.TypographyLabelMediumFontFamily,
    '--_navigation-bar-label-font-size': token.TypographyLabelMediumFontSize,
    '--_navigation-bar-label-line-height': token.TypographyLabelMediumLineHeight,
    '--_navigation-bar-label-font-weight': token.TypographyLabelMediumFontWeight,
    '--_navigation-bar-label-letter-spacing':
      token.TypographyLabelMediumLetterSpacing,
  };
}
