import * as token from '@m3/tokens';
import type { CSSProperties } from 'react';
import {
  getElevationBoxShadow,
  type ElevationLevel,
} from '../../internal/elevation';

export type NavigationDrawerStyle = CSSProperties &
  Record<`--${string}`, string | number>;

type CssLength = NonNullable<CSSProperties['width']>;

export interface PermanentDrawerSheetStyleOptions {
  containerColor?: CSSProperties['backgroundColor'];
  width?: CSSProperties['width'];
}

export interface NavigationDrawerItemInteractionState {
  isHovered?: boolean;
  isPressed?: boolean;
  isFocusVisible?: boolean;
}

export const navigationDrawerTokens = {
  activeFocusIconColor: token.ComponentNavigationDrawerActiveFocusIconColor,
  activeFocusLabelTextColor:
    token.ComponentNavigationDrawerActiveFocusLabelTextColor,
  activeHoverIconColor: token.ComponentNavigationDrawerActiveHoverIconColor,
  activeHoverLabelTextColor:
    token.ComponentNavigationDrawerActiveHoverLabelTextColor,
  activeIconColor: token.ComponentNavigationDrawerActiveIconColor,
  activeIndicatorColor: token.ComponentNavigationDrawerActiveIndicatorColor,
  activeIndicatorHeight: token.ComponentNavigationDrawerActiveIndicatorHeight,
  activeIndicatorShape: token.ComponentNavigationDrawerActiveIndicatorShape,
  activeIndicatorWidth: token.ComponentNavigationDrawerActiveIndicatorWidth,
  activeLabelTextColor: token.ComponentNavigationDrawerActiveLabelTextColor,
  activePressedIconColor: token.ComponentNavigationDrawerActivePressedIconColor,
  activePressedLabelTextColor:
    token.ComponentNavigationDrawerActivePressedLabelTextColor,
  activeFocusStateLayerColor:
    token.ComponentNavigationDrawerActiveFocusStateLayerColor,
  activeHoverStateLayerColor:
    token.ComponentNavigationDrawerActiveHoverStateLayerColor,
  activePressedStateLayerColor:
    token.ComponentNavigationDrawerActivePressedStateLayerColor,
  inactiveFocusIconColor: token.ComponentNavigationDrawerInactiveFocusIconColor,
  inactiveFocusLabelTextColor:
    token.ComponentNavigationDrawerInactiveFocusLabelTextColor,
  inactiveHoverIconColor: token.ComponentNavigationDrawerInactiveHoverIconColor,
  inactiveHoverLabelTextColor:
    token.ComponentNavigationDrawerInactiveHoverLabelTextColor,
  inactiveIconColor: token.ComponentNavigationDrawerInactiveIconColor,
  inactiveLabelTextColor: token.ComponentNavigationDrawerInactiveLabelTextColor,
  inactivePressedIconColor:
    token.ComponentNavigationDrawerInactivePressedIconColor,
  inactivePressedLabelTextColor:
    token.ComponentNavigationDrawerInactivePressedLabelTextColor,
  inactiveFocusStateLayerColor:
    token.ComponentNavigationDrawerInactiveFocusStateLayerColor,
  inactiveHoverStateLayerColor:
    token.ComponentNavigationDrawerInactiveHoverStateLayerColor,
  inactivePressedStateLayerColor:
    token.ComponentNavigationDrawerInactivePressedStateLayerColor,
  focusStateLayerOpacity: token.ComponentNavigationDrawerFocusStateLayerOpacity,
  hoverStateLayerOpacity: token.ComponentNavigationDrawerHoverStateLayerOpacity,
  pressedStateLayerOpacity: token.ComponentNavigationDrawerPressedStateLayerOpacity,
  focusIndicatorColor: token.ComponentNavigationDrawerFocusIndicatorColor,
  containerWidth: token.ComponentNavigationDrawerContainerWidth,
  iconSize: token.ComponentNavigationDrawerIconSize,
  labelTextTypography: token.ComponentNavigationDrawerLabelTextTypography,
  largeBadgeLabelColor: token.ComponentNavigationDrawerLargeBadgeLabelColor,
  largeBadgeLabelTypography:
    token.ComponentNavigationDrawerLargeBadgeLabelTypography,
  headlineColor: token.ComponentNavigationDrawerHeadlineColor,
  headlineTypography: token.ComponentNavigationDrawerHeadlineTypography,
  standardContainerColor: token.ComponentNavigationDrawerStandardContainerColor,
  standardContainerElevation:
    token.ComponentNavigationDrawerStandardContainerElevation as ElevationLevel,
} as const;

function dimensionNumber(value: string | number): number {
  const numeric =
    typeof value === 'number' ? value : Number.parseFloat(value);
  if (!Number.isFinite(numeric)) {
    throw new TypeError(`Expected a CSS dimension, received ${String(value)}`);
  }
  return numeric;
}

function cssLength(value: CssLength): string {
  return typeof value === 'number' ? `${value}px` : value;
}

export const navigationDrawerRuntime = {
  minimumDrawerWidth: 240,
  itemOuterPadding:
    (dimensionNumber(navigationDrawerTokens.containerWidth) -
      dimensionNumber(navigationDrawerTokens.activeIndicatorWidth)) /
    2,
  itemPaddingStart: 16,
  itemPaddingEnd: 24,
  iconLabelSpace: 12,
  labelBadgeSpace: 12,
} as const;

function labelTypographyStyle(): NavigationDrawerStyle {
  return {
    '--_navigation-drawer-item-font-family':
      token.TypographyLabelLargeFontFamily,
    '--_navigation-drawer-item-font-size':
      token.TypographyLabelLargeFontSize,
    '--_navigation-drawer-item-line-height':
      token.TypographyLabelLargeLineHeight,
    '--_navigation-drawer-item-font-weight':
      token.TypographyLabelLargeFontWeight,
    '--_navigation-drawer-item-letter-spacing':
      token.TypographyLabelLargeLetterSpacing,
  };
}

function interactionColors(
  selected: boolean,
  state: NavigationDrawerItemInteractionState,
) {
  if (selected) {
    if (state.isPressed) {
      return {
        icon: navigationDrawerTokens.activePressedIconColor,
        label: navigationDrawerTokens.activePressedLabelTextColor,
        stateLayer: navigationDrawerTokens.activePressedStateLayerColor,
      };
    }
    if (state.isFocusVisible) {
      return {
        icon: navigationDrawerTokens.activeFocusIconColor,
        label: navigationDrawerTokens.activeFocusLabelTextColor,
        stateLayer: navigationDrawerTokens.activeFocusStateLayerColor,
      };
    }
    if (state.isHovered) {
      return {
        icon: navigationDrawerTokens.activeHoverIconColor,
        label: navigationDrawerTokens.activeHoverLabelTextColor,
        stateLayer: navigationDrawerTokens.activeHoverStateLayerColor,
      };
    }
    return {
      icon: navigationDrawerTokens.activeIconColor,
      label: navigationDrawerTokens.activeLabelTextColor,
      stateLayer: navigationDrawerTokens.activePressedStateLayerColor,
    };
  }

  if (state.isPressed) {
    return {
      icon: navigationDrawerTokens.inactivePressedIconColor,
      label: navigationDrawerTokens.inactivePressedLabelTextColor,
      stateLayer: navigationDrawerTokens.inactivePressedStateLayerColor,
    };
  }
  if (state.isFocusVisible) {
    return {
      icon: navigationDrawerTokens.inactiveFocusIconColor,
      label: navigationDrawerTokens.inactiveFocusLabelTextColor,
      stateLayer: navigationDrawerTokens.inactiveFocusStateLayerColor,
    };
  }
  if (state.isHovered) {
    return {
      icon: navigationDrawerTokens.inactiveHoverIconColor,
      label: navigationDrawerTokens.inactiveHoverLabelTextColor,
      stateLayer: navigationDrawerTokens.inactiveHoverStateLayerColor,
    };
  }
  return {
    icon: navigationDrawerTokens.inactiveIconColor,
    label: navigationDrawerTokens.inactiveLabelTextColor,
    stateLayer: navigationDrawerTokens.inactivePressedStateLayerColor,
  };
}

export function getPermanentDrawerSheetStyle(
  options: PermanentDrawerSheetStyleOptions = {},
): NavigationDrawerStyle {
  return {
    '--_navigation-drawer-min-width': `${navigationDrawerRuntime.minimumDrawerWidth}px`,
    '--_navigation-drawer-width': cssLength(
      (options.width ?? navigationDrawerTokens.containerWidth) as CssLength,
    ),
    '--_navigation-drawer-container-color':
      options.containerColor ?? navigationDrawerTokens.standardContainerColor,
    '--_navigation-drawer-container-radius': token.ShapeNone,
    '--_navigation-drawer-box-shadow': getElevationBoxShadow(
      navigationDrawerTokens.standardContainerElevation,
    ),
  };
}

export function getNavigationDrawerItemStyle(
  selected: boolean,
  state: NavigationDrawerItemInteractionState = {},
): NavigationDrawerStyle {
  const colors = interactionColors(selected, state);
  return {
    '--_navigation-drawer-item-height':
      navigationDrawerTokens.activeIndicatorHeight,
    '--_navigation-drawer-item-radius': token.ShapeFull,
    '--_navigation-drawer-item-outer-padding':
      `${navigationDrawerRuntime.itemOuterPadding}px`,
    '--_navigation-drawer-item-padding-start':
      `${navigationDrawerRuntime.itemPaddingStart}px`,
    '--_navigation-drawer-item-padding-end':
      `${navigationDrawerRuntime.itemPaddingEnd}px`,
    '--_navigation-drawer-item-icon-label-space':
      `${navigationDrawerRuntime.iconLabelSpace}px`,
    '--_navigation-drawer-item-label-badge-space':
      `${navigationDrawerRuntime.labelBadgeSpace}px`,
    '--_navigation-drawer-item-icon-size': navigationDrawerTokens.iconSize,
    '--_navigation-drawer-item-container-color': selected
      ? navigationDrawerTokens.activeIndicatorColor
      : 'transparent',
    '--_navigation-drawer-item-icon-color': colors.icon,
    '--_navigation-drawer-item-label-color': colors.label,
    '--_navigation-drawer-item-badge-color': selected
      ? navigationDrawerTokens.activeLabelTextColor
      : navigationDrawerTokens.largeBadgeLabelColor,
    '--_navigation-drawer-focus-indicator-color':
      navigationDrawerTokens.focusIndicatorColor,
    '--_ripple-color': colors.stateLayer,
    '--_ripple-hover-opacity': navigationDrawerTokens.hoverStateLayerOpacity,
    '--_ripple-focus-opacity': navigationDrawerTokens.focusStateLayerOpacity,
    '--_ripple-pressed-opacity': navigationDrawerTokens.pressedStateLayerOpacity,
    ...labelTypographyStyle(),
  };
}
