import * as token from '@m3-ui/tokens';
import type { CSSProperties } from 'react';
import type { ElevationLevel } from '../../internal/elevation';

export type WideNavigationRailStyle = CSSProperties &
  Record<`--${string}`, string | number>;

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

export const wideNavigationRailTokens = {
  containerColor: token.ComponentNavigationRailCollapsedContainerColor,
  collapsedContainerElevation:
    token.ComponentNavigationRailCollapsedContainerElevation as ElevationLevel,
  collapsedContainerWidth: token.ComponentNavigationRailCollapsedContainerWidth,
  expandedContainerElevation:
    token.ComponentNavigationRailExpandedContainerElevation as ElevationLevel,
  expandedContainerWidthMinimum:
    token.ComponentNavigationRailExpandedContainerWidthMinimum,
  expandedContainerWidthMaximum:
    token.ComponentNavigationRailExpandedContainerWidthMaximum,
  topSpace: token.ComponentNavigationRailCollapsedTopSpace,
  collapsedItemSpace: token.ComponentNavigationRailCollapsedItemVerticalSpace,
  headerSpaceMinimum: token.ComponentNavigationRailBaselineItemHeaderSpaceMinimum,
  collapsedItemHeight: token.ComponentNavigationRailBaselineItemContainerHeight,
  iconSize: token.ComponentNavigationRailBaselineItemIconSize,
  activeIconColor: token.ComponentNavigationRailColorItemActiveIcon,
  activeIndicatorColor: token.ComponentNavigationRailColorItemActiveIndicator,
  activeTopLabelColor: token.ComponentNavigationRailColorItemActiveLabelText,
  inactiveIconColor: token.ComponentNavigationRailColorItemInactiveIcon,
  inactiveLabelColor: token.ComponentNavigationRailColorItemInactiveLabelText,
  verticalIndicatorWidth:
    token.ComponentNavigationRailVerticalItemActiveIndicatorWidth,
  verticalIndicatorHeight:
    token.ComponentNavigationRailVerticalItemActiveIndicatorHeight,
  verticalIconLabelSpace: token.ComponentNavigationRailVerticalItemIconLabelSpace,
  horizontalIndicatorHeight:
    token.ComponentNavigationRailHorizontalItemActiveIndicatorHeight,
  horizontalIndicatorLeadingSpace:
    token.ComponentNavigationRailHorizontalItemFullWidthLeadingSpace,
  horizontalIndicatorTrailingSpace:
    token.ComponentNavigationRailHorizontalItemFullWidthTrailingSpace,
  horizontalIconLabelSpace:
    token.ComponentNavigationRailHorizontalItemIconLabelSpace,
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
} as const;

export const wideNavigationRailRuntime = {
  itemHorizontalPadding: 20,
  disabledAlpha: 0.38,
  motion: {
    spatial: {
      duration: token.MotionSpringDefaultSpatialDuration,
      easing: token.MotionSpringDefaultSpatialEasing,
    },
    effects: {
      duration: token.MotionSpringDefaultEffectsDuration,
      easing: token.MotionSpringDefaultEffectsEasing,
    },
  },
} as const;

function interactionStateLayer(
  selected: boolean,
  state: WideNavigationRailItemInteractionState,
) {
  if (selected) {
    if (state.isPressed) return wideNavigationRailTokens.activePressedStateLayerColor;
    if (state.isFocusVisible) return wideNavigationRailTokens.activeFocusStateLayerColor;
    return wideNavigationRailTokens.activeHoverStateLayerColor;
  }
  if (state.isPressed) return wideNavigationRailTokens.inactivePressedStateLayerColor;
  if (state.isFocusVisible) return wideNavigationRailTokens.inactiveFocusStateLayerColor;
  return wideNavigationRailTokens.inactiveHoverStateLayerColor;
}

export function getWideNavigationRailStyle(
  options: WideNavigationRailStyleOptions = {},
): WideNavigationRailStyle {
  return {
    '--_wide-navigation-rail-collapsed-width':
      wideNavigationRailTokens.collapsedContainerWidth,
    '--_wide-navigation-rail-expanded-min-width':
      wideNavigationRailTokens.expandedContainerWidthMinimum,
    '--_wide-navigation-rail-expanded-max-width':
      wideNavigationRailTokens.expandedContainerWidthMaximum,
    '--_wide-navigation-rail-expanded-width':
      wideNavigationRailTokens.expandedContainerWidthMinimum,
    '--_wide-navigation-rail-container-color':
      options.containerColor ?? wideNavigationRailTokens.containerColor,
    '--_wide-navigation-rail-content-color':
      options.contentColor ?? token.ColorRoleOnSurface,
    '--_wide-navigation-rail-top-space': wideNavigationRailTokens.topSpace,
    '--_wide-navigation-rail-header-space':
      wideNavigationRailTokens.headerSpaceMinimum,
    '--_wide-navigation-rail-collapsed-item-space':
      wideNavigationRailTokens.collapsedItemSpace,
    '--_wide-navigation-rail-box-shadow': 'none',
    '--_wide-navigation-rail-spatial-duration':
      wideNavigationRailRuntime.motion.spatial.duration,
    '--_wide-navigation-rail-spatial-easing':
      wideNavigationRailRuntime.motion.spatial.easing,
    '--_wide-navigation-rail-effects-duration':
      wideNavigationRailRuntime.motion.effects.duration,
    '--_wide-navigation-rail-effects-easing':
      wideNavigationRailRuntime.motion.effects.easing,
  };
}

export function getWideNavigationRailItemStyle(
  selected: boolean,
  expanded: boolean,
  hasLabel: boolean,
  state: WideNavigationRailItemInteractionState = {},
  options: WideNavigationRailItemStyleOptions = {},
): WideNavigationRailStyle {
  const disabledAlpha = state.isDisabled ? wideNavigationRailRuntime.disabledAlpha : 1;
  const labelColor = selected
    ? expanded
      ? options.selectedStartLabelColor ?? wideNavigationRailTokens.activeIconColor
      : options.selectedTopLabelColor ?? wideNavigationRailTokens.activeTopLabelColor
    : options.unselectedLabelColor ?? wideNavigationRailTokens.inactiveLabelColor;

  return {
    '--_wide-navigation-rail-item-collapsed-height':
      wideNavigationRailTokens.collapsedItemHeight,
    '--_wide-navigation-rail-item-expanded-height':
      wideNavigationRailTokens.horizontalIndicatorHeight,
    '--_wide-navigation-rail-item-horizontal-padding':
      `${wideNavigationRailRuntime.itemHorizontalPadding}px`,
    '--_wide-navigation-rail-indicator-width':
      wideNavigationRailTokens.verticalIndicatorWidth,
    '--_wide-navigation-rail-indicator-height': hasLabel
      ? expanded
        ? wideNavigationRailTokens.horizontalIndicatorHeight
        : wideNavigationRailTokens.verticalIndicatorHeight
      : wideNavigationRailTokens.verticalIndicatorWidth,
    '--_wide-navigation-rail-indicator-collapsed-height': hasLabel
      ? wideNavigationRailTokens.verticalIndicatorHeight
      : wideNavigationRailTokens.verticalIndicatorWidth,
    '--_wide-navigation-rail-indicator-expanded-height': hasLabel
      ? wideNavigationRailTokens.horizontalIndicatorHeight
      : wideNavigationRailTokens.verticalIndicatorWidth,
    '--_wide-navigation-rail-indicator-leading-space':
      wideNavigationRailTokens.horizontalIndicatorLeadingSpace,
    '--_wide-navigation-rail-indicator-trailing-space':
      wideNavigationRailTokens.horizontalIndicatorTrailingSpace,
    '--_wide-navigation-rail-icon-size': wideNavigationRailTokens.iconSize,
    '--_wide-navigation-rail-collapsed-icon-label-space':
      wideNavigationRailTokens.verticalIconLabelSpace,
    '--_wide-navigation-rail-expanded-icon-label-space':
      wideNavigationRailTokens.horizontalIconLabelSpace,
    '--_wide-navigation-rail-icon-color': selected
      ? options.selectedIconColor ?? wideNavigationRailTokens.activeIconColor
      : options.unselectedIconColor ?? wideNavigationRailTokens.inactiveIconColor,
    '--_wide-navigation-rail-label-color': labelColor,
    '--_wide-navigation-rail-indicator-color':
      options.indicatorColor ?? wideNavigationRailTokens.activeIndicatorColor,
    '--_wide-navigation-rail-content-opacity': disabledAlpha,
    '--_ripple-color': interactionStateLayer(selected, state),
    '--_ripple-hover-opacity': wideNavigationRailTokens.hoverStateLayerOpacity,
    '--_ripple-focus-opacity': wideNavigationRailTokens.focusStateLayerOpacity,
    '--_ripple-pressed-opacity': wideNavigationRailTokens.pressedStateLayerOpacity,
    '--_wide-navigation-rail-label-font-family': expanded
      ? token.TypographyLabelLargeFontFamily
      : token.TypographyLabelMediumFontFamily,
    '--_wide-navigation-rail-label-font-size': expanded
      ? token.TypographyLabelLargeFontSize
      : token.TypographyLabelMediumFontSize,
    '--_wide-navigation-rail-label-line-height': expanded
      ? token.TypographyLabelLargeLineHeight
      : token.TypographyLabelMediumLineHeight,
    '--_wide-navigation-rail-label-font-weight': expanded
      ? token.TypographyLabelLargeFontWeight
      : token.TypographyLabelMediumFontWeight,
    '--_wide-navigation-rail-label-letter-spacing': expanded
      ? token.TypographyLabelLargeLetterSpacing
      : token.TypographyLabelMediumLetterSpacing,
  };
}
