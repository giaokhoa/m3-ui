import * as token from '@m3-ui/tokens';
import type { CSSProperties } from 'react';

export type TabsVariant = 'primary' | 'secondary';
export type TabsMode = 'fixed' | 'scrollable';

export type TabsStyle = CSSProperties &
  Record<`--${string}`, string | number>;

export interface TabsStyleOptions {
  containerColor?: CSSProperties['backgroundColor'];
  indicatorColor?: CSSProperties['backgroundColor'];
}

export interface TabStyleOptions {
  selected?: boolean;
  disabled?: boolean;
}

export const tabsTokens = {
  primary: {
    activeIndicatorColor: token.ComponentNavigationTabPrimaryActiveIndicatorColor,
    activeIndicatorHeight: token.ComponentNavigationTabPrimaryActiveIndicatorHeight,
    activeIndicatorShape: token.ComponentNavigationTabPrimaryWebActiveIndicatorShape,
    containerColor: token.ComponentNavigationTabPrimaryContainerColor,
    containerHeight: token.ComponentNavigationTabPrimaryContainerHeight,
    iconAndLabelTextContainerHeight:
      token.ComponentNavigationTabPrimaryIconAndLabelTextContainerHeight,
    iconSize: token.ComponentNavigationTabPrimaryIconSize,
    activeIconColor: token.ComponentNavigationTabPrimaryActiveIconColor,
    inactiveIconColor: token.ComponentNavigationTabPrimaryInactiveIconColor,
    activeLabelTextColor: token.ComponentNavigationTabPrimaryActiveLabelTextColor,
    inactiveLabelTextColor:
      token.ComponentNavigationTabPrimaryInactiveLabelTextColor,
    activeFocusStateLayerColor:
      token.ComponentNavigationTabPrimaryActiveFocusStateLayerColor,
    activeHoverStateLayerColor:
      token.ComponentNavigationTabPrimaryActiveHoverStateLayerColor,
    activePressedStateLayerColor:
      token.ComponentNavigationTabPrimaryActivePressedStateLayerColor,
    inactiveFocusStateLayerColor:
      token.ComponentNavigationTabPrimaryInactiveFocusStateLayerColor,
    inactiveHoverStateLayerColor:
      token.ComponentNavigationTabPrimaryInactiveHoverStateLayerColor,
    inactivePressedStateLayerColor:
      token.ComponentNavigationTabPrimaryInactivePressedStateLayerColor,
    focusStateLayerOpacity:
      token.ComponentNavigationTabPrimaryActiveFocusStateLayerOpacity,
    hoverStateLayerOpacity:
      token.ComponentNavigationTabPrimaryActiveHoverStateLayerOpacity,
    pressedStateLayerOpacity:
      token.ComponentNavigationTabPrimaryActivePressedStateLayerOpacity,
  },
  secondary: {
    activeIndicatorColor:
      token.ComponentNavigationTabSecondaryActiveIndicatorColor,
    activeIndicatorHeight:
      token.ComponentNavigationTabSecondaryActiveIndicatorHeight,
    containerColor: token.ComponentNavigationTabSecondaryContainerColor,
    containerHeight: token.ComponentNavigationTabSecondaryContainerHeight,
    iconSize: token.ComponentNavigationTabSecondaryIconSize,
    activeIconColor: token.ComponentNavigationTabSecondaryActiveIconColor,
    inactiveIconColor: token.ComponentNavigationTabSecondaryInactiveIconColor,
    activeLabelTextColor:
      token.ComponentNavigationTabSecondaryActiveLabelTextColor,
    inactiveLabelTextColor:
      token.ComponentNavigationTabSecondaryInactiveLabelTextColor,
    focusStateLayerColor:
      token.ComponentNavigationTabSecondaryFocusStateLayerColor,
    hoverStateLayerColor:
      token.ComponentNavigationTabSecondaryHoverStateLayerColor,
    pressedStateLayerColor:
      token.ComponentNavigationTabSecondaryPressedStateLayerColor,
    focusStateLayerOpacity:
      token.ComponentNavigationTabSecondaryFocusStateLayerOpacity,
    hoverStateLayerOpacity:
      token.ComponentNavigationTabSecondaryHoverStateLayerOpacity,
    pressedStateLayerOpacity:
      token.ComponentNavigationTabSecondaryPressedStateLayerOpacity,
  },
} as const;

/**
 * Renderer mechanics owned by AndroidX TabRow.kt / Tab.kt rather than the
 * canonical component token files. The canonical files remain untouched:
 * AndroidX currently lays out stacked icon+label tabs at 72dp (the canonical
 * token is 64px), and SecondaryIndicator defaults to the primary 3dp indicator
 * height (the canonical web secondary token is 2px).
 */
export const tabsRuntime = {
  scrollableEdgePadding: 52,
  scrollableMinTabWidth: 90,
  horizontalTextPadding: 16,
  leadingIconLabelGap: 8,
  stackedIconLabelGap: 4,
  stackedIconAndLabelHeight: 72,
  secondaryIndicatorHeight: 3,
  disabledAlpha: 0.38,
  motion: {
    indicator: {
      duration: token.MotionSpringDefaultSpatialDuration,
      easing: token.MotionSpringDefaultSpatialEasing,
    },
    scroll: {
      duration: token.MotionSpringDefaultSpatialDuration,
      easing: token.MotionSpringDefaultSpatialEasing,
    },
  },
} as const;

export function getTabsStyle(
  variant: TabsVariant,
  mode: TabsMode,
  options: TabsStyleOptions = {},
): TabsStyle {
  const family = tabsTokens[variant];
  return {
    '--_tabs-container-color':
      options.containerColor ?? family.containerColor,
    '--_tabs-indicator-color':
      options.indicatorColor ?? family.activeIndicatorColor,
    '--_tabs-indicator-height':
      variant === 'secondary'
        ? `${tabsRuntime.secondaryIndicatorHeight}px`
        : family.activeIndicatorHeight,
    '--_tabs-indicator-radius':
      variant === 'primary' ? tabsTokens.primary.activeIndicatorShape : '0px',
    '--_tabs-edge-padding': `${tabsRuntime.scrollableEdgePadding}px`,
    '--_tabs-min-tab-width': `${tabsRuntime.scrollableMinTabWidth}px`,
    '--_tabs-motion-duration': tabsRuntime.motion.indicator.duration,
    '--_tabs-motion-easing': tabsRuntime.motion.indicator.easing,
    '--_tabs-mode': mode,
  };
}

export function getTabStyle(
  variant: TabsVariant,
  options: TabStyleOptions = {},
): TabsStyle {
  const family = tabsTokens[variant];
  const selected = options.selected ?? false;
  const disabled = options.disabled ?? false;

  const iconColor = selected
    ? family.activeIconColor
    : family.inactiveIconColor;
  const labelColor = selected
    ? family.activeLabelTextColor
    : family.inactiveLabelTextColor;

  const focusLayer =
    variant === 'primary'
      ? selected
        ? tabsTokens.primary.activeFocusStateLayerColor
        : tabsTokens.primary.inactiveFocusStateLayerColor
      : tabsTokens.secondary.focusStateLayerColor;
  const hoverLayer =
    variant === 'primary'
      ? selected
        ? tabsTokens.primary.activeHoverStateLayerColor
        : tabsTokens.primary.inactiveHoverStateLayerColor
      : tabsTokens.secondary.hoverStateLayerColor;
  const pressedLayer =
    variant === 'primary'
      ? selected
        ? tabsTokens.primary.activePressedStateLayerColor
        : tabsTokens.primary.inactivePressedStateLayerColor
      : tabsTokens.secondary.pressedStateLayerColor;

  return {
    '--_tabs-tab-height': family.containerHeight,
    '--_tabs-tab-large-height': `${tabsRuntime.stackedIconAndLabelHeight}px`,
    '--_tabs-icon-size': family.iconSize,
    '--_tabs-icon-color': iconColor,
    '--_tabs-label-color': labelColor,
    '--_tabs-content-opacity': disabled ? tabsRuntime.disabledAlpha : 1,
    '--_tabs-horizontal-text-padding':
      `${tabsRuntime.horizontalTextPadding}px`,
    '--_tabs-leading-gap': `${tabsRuntime.leadingIconLabelGap}px`,
    '--_tabs-stacked-gap': `${tabsRuntime.stackedIconLabelGap}px`,
    '--_ripple-color': pressedLayer,
    '--_ripple-hover-color': hoverLayer,
    '--_ripple-focus-color': focusLayer,
    '--_ripple-hover-opacity': family.hoverStateLayerOpacity,
    '--_ripple-focus-opacity': family.focusStateLayerOpacity,
    '--_ripple-pressed-opacity': family.pressedStateLayerOpacity,
    '--_tabs-label-font-family': token.TypographyTitleSmallFontFamily,
    '--_tabs-label-font-size': token.TypographyTitleSmallFontSize,
    '--_tabs-label-line-height': token.TypographyTitleSmallLineHeight,
    '--_tabs-label-font-weight': token.TypographyTitleSmallFontWeight,
    '--_tabs-label-letter-spacing': token.TypographyTitleSmallLetterSpacing,
  };
}
