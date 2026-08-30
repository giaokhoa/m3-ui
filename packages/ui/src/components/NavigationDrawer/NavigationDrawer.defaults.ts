import * as token from '@m3-ui/tokens';
import type { CSSProperties } from 'react';
import type { ElevationLevel } from '../../internal/elevation';
import { getScrimStyle } from '../Scrim';

export type NavigationDrawerStyle = CSSProperties &
  Record<`--${string}`, string | number>;

type CssLength = NonNullable<CSSProperties['width']>;

export interface DrawerSheetStyleOptions {
  containerColor?: CSSProperties['backgroundColor'];
  contentColor?: CSSProperties['color'];
  width?: CSSProperties['width'];
  shape?: CSSProperties['borderRadius'];
}

export type PermanentDrawerSheetStyleOptions = DrawerSheetStyleOptions;
export type DismissibleDrawerSheetStyleOptions = DrawerSheetStyleOptions;
export type ModalDrawerSheetStyleOptions = DrawerSheetStyleOptions;

export interface ModalNavigationDrawerOverlayStyleOptions {
  scrimColor?: CSSProperties['backgroundColor'];
  scrimOpacity?: number;
  alpha?: number;
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
  containerShape: token.ComponentNavigationDrawerContainerShape,
  containerWidth: token.ComponentNavigationDrawerContainerWidth,
  iconSize: token.ComponentNavigationDrawerIconSize,
  labelTextTypography: token.ComponentNavigationDrawerLabelTextTypography,
  largeBadgeLabelColor: token.ComponentNavigationDrawerLargeBadgeLabelColor,
  largeBadgeLabelTypography:
    token.ComponentNavigationDrawerLargeBadgeLabelTypography,
  headlineColor: token.ComponentNavigationDrawerHeadlineColor,
  headlineTypography: token.ComponentNavigationDrawerHeadlineTypography,
  modalContainerColor: token.ComponentNavigationDrawerModalContainerColor,
  modalContainerElevation:
    token.ComponentNavigationDrawerModalContainerElevation as ElevationLevel,
  standardContainerColor: token.ComponentNavigationDrawerStandardContainerColor,
  standardContainerElevation:
    token.ComponentNavigationDrawerStandardContainerElevation as ElevationLevel,
} as const;

function dimensionNumber(value: string | number): number {
  const numeric = typeof value === 'number' ? value : Number.parseFloat(value);
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
  maximumDrawerWidth: dimensionNumber(navigationDrawerTokens.containerWidth),
  positionalThreshold: 0.5,
  velocityThreshold: 400,
  dragSlop: 4,
  itemOuterPadding:
    (dimensionNumber(navigationDrawerTokens.containerWidth) -
      dimensionNumber(navigationDrawerTokens.activeIndicatorWidth)) /
    2,
  itemPaddingStart: 16,
  itemPaddingEnd: 24,
  iconLabelSpace: 12,
  labelBadgeSpace: 12,
  // AndroidX DrawerDefaults deliberately renders modal drawers at Level0 even
  // though the generated component token still reports modal level1.
  modalRuntimeElevation: 'level0' as ElevationLevel,
  motion: {
    open: {
      duration: token.MotionSpringDefaultSpatialDuration,
      easing: token.MotionSpringDefaultSpatialEasing,
    },
    settle: {
      duration: token.MotionSpringDefaultSpatialDuration,
      easing: token.MotionSpringDefaultSpatialEasing,
    },
    close: {
      duration: token.MotionSpringFastEffectsDuration,
      easing: token.MotionSpringFastEffectsEasing,
    },
  },
} as const;

function labelTypographyStyle(): NavigationDrawerStyle {
  return {
    '--_navigation-drawer-item-font-family': token.TypographyLabelLargeFontFamily,
    '--_navigation-drawer-item-font-size': token.TypographyLabelLargeFontSize,
    '--_navigation-drawer-item-line-height': token.TypographyLabelLargeLineHeight,
    '--_navigation-drawer-item-font-weight': token.TypographyLabelLargeFontWeight,
    '--_navigation-drawer-item-letter-spacing': token.TypographyLabelLargeLetterSpacing,
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

function sheetStyle(
  variant: 'permanent' | 'dismissible' | 'modal',
  options: DrawerSheetStyleOptions = {},
): NavigationDrawerStyle {
  const modal = variant === 'modal';
  const shape = options.shape;

  return {
    '--_navigation-drawer-min-width': `${navigationDrawerRuntime.minimumDrawerWidth}px`,
    '--_navigation-drawer-width': cssLength(
      (options.width ?? navigationDrawerTokens.containerWidth) as CssLength,
    ),
    '--_navigation-drawer-container-color':
      options.containerColor ??
      (modal
        ? navigationDrawerTokens.modalContainerColor
        : navigationDrawerTokens.standardContainerColor),
    '--_navigation-drawer-content-color': options.contentColor ?? token.ColorRoleOnSurface,
    '--_navigation-drawer-radius-start-start':
      shape ?? (modal ? token.ShapeCornerLargeEndTopStart : token.ShapeNone),
    '--_navigation-drawer-radius-start-end':
      shape ?? (modal ? token.ShapeCornerLargeEndTopEnd : token.ShapeNone),
    '--_navigation-drawer-radius-end-end':
      shape ?? (modal ? token.ShapeCornerLargeEndBottomEnd : token.ShapeNone),
    '--_navigation-drawer-radius-end-start':
      shape ?? (modal ? token.ShapeCornerLargeEndBottomStart : token.ShapeNone),
    '--_navigation-drawer-box-shadow': 'none',
  };
}

export function getPermanentDrawerSheetStyle(
  options: PermanentDrawerSheetStyleOptions = {},
): NavigationDrawerStyle {
  return sheetStyle('permanent', options);
}

export function getDismissibleDrawerSheetStyle(
  options: DismissibleDrawerSheetStyleOptions = {},
): NavigationDrawerStyle {
  return sheetStyle('dismissible', options);
}

export function getModalDrawerSheetStyle(
  options: ModalDrawerSheetStyleOptions = {},
): NavigationDrawerStyle {
  return sheetStyle('modal', options);
}

export function getModalNavigationDrawerOverlayStyle(
  options: ModalNavigationDrawerOverlayStyleOptions = {},
): NavigationDrawerStyle {
  return {
    ...getScrimStyle({
      containerColor: options.scrimColor,
      containerOpacity: options.scrimOpacity,
      alpha: options.alpha,
    }),
    '--_navigation-drawer-open-duration': navigationDrawerRuntime.motion.open.duration,
    '--_navigation-drawer-open-easing': navigationDrawerRuntime.motion.open.easing,
    '--_navigation-drawer-close-duration': navigationDrawerRuntime.motion.close.duration,
    '--_navigation-drawer-close-easing': navigationDrawerRuntime.motion.close.easing,
  };
}

export function getNavigationDrawerMotionStyle(
  offset: number,
  drawerWidth: number,
): NavigationDrawerStyle {
  return {
    '--_navigation-drawer-offset': `${offset}px`,
    '--_navigation-drawer-closed-offset': `${-drawerWidth}px`,
    '--_navigation-drawer-content-offset': `${drawerWidth + offset}px`,
    '--_navigation-drawer-open-duration': navigationDrawerRuntime.motion.open.duration,
    '--_navigation-drawer-open-easing': navigationDrawerRuntime.motion.open.easing,
    '--_navigation-drawer-settle-duration': navigationDrawerRuntime.motion.settle.duration,
    '--_navigation-drawer-settle-easing': navigationDrawerRuntime.motion.settle.easing,
    '--_navigation-drawer-close-duration': navigationDrawerRuntime.motion.close.duration,
    '--_navigation-drawer-close-easing': navigationDrawerRuntime.motion.close.easing,
  };
}

export function getNavigationDrawerItemStyle(
  selected: boolean,
  state: NavigationDrawerItemInteractionState = {},
): NavigationDrawerStyle {
  const colors = interactionColors(selected, state);
  return {
    '--_navigation-drawer-item-height': navigationDrawerTokens.activeIndicatorHeight,
    '--_navigation-drawer-item-radius': token.ShapeFull,
    '--_navigation-drawer-item-outer-padding': `${navigationDrawerRuntime.itemOuterPadding}px`,
    '--_navigation-drawer-item-padding-start': `${navigationDrawerRuntime.itemPaddingStart}px`,
    '--_navigation-drawer-item-padding-end': `${navigationDrawerRuntime.itemPaddingEnd}px`,
    '--_navigation-drawer-item-icon-label-space': `${navigationDrawerRuntime.iconLabelSpace}px`,
    '--_navigation-drawer-item-label-badge-space': `${navigationDrawerRuntime.labelBadgeSpace}px`,
    '--_navigation-drawer-item-icon-size': navigationDrawerTokens.iconSize,
    '--_navigation-drawer-item-container-color': selected
      ? navigationDrawerTokens.activeIndicatorColor
      : 'transparent',
    '--_navigation-drawer-item-icon-color': colors.icon,
    '--_navigation-drawer-item-label-color': colors.label,
    '--_navigation-drawer-item-badge-color': selected
      ? navigationDrawerTokens.activeLabelTextColor
      : navigationDrawerTokens.largeBadgeLabelColor,
    '--_navigation-drawer-focus-indicator-color': navigationDrawerTokens.focusIndicatorColor,
    '--_ripple-color': colors.stateLayer,
    '--_ripple-hover-opacity': navigationDrawerTokens.hoverStateLayerOpacity,
    '--_ripple-focus-opacity': navigationDrawerTokens.focusStateLayerOpacity,
    '--_ripple-pressed-opacity': navigationDrawerTokens.pressedStateLayerOpacity,
    ...labelTypographyStyle(),
  };
}
