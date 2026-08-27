import * as token from '@m3/tokens';
import type { CSSProperties } from 'react';
import type { ElevationLevel } from '../../internal/elevation';
import { pxNumber } from '../../internal/tokenValues';
import { fabSizeTokens, fabVariantColors } from '../Fab';

export type FabMenuStyle = CSSProperties & Record<`--${string}`, string | number>;
export type ToggleFabSize = 'baseline' | 'medium' | 'large';

const logicalViewportMargin = 16;
const triggerBottomPadding = 16;
const staggerStepMs = Number.parseFloat(token.MotionDurationShort1);

function cssLength(value: CSSProperties['maxHeight']): string | number | undefined {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
}

export const fabMenuTokens = {
  closeButton: {
    betweenSpace: pxNumber(token.ComponentFabMenuCloseButtonBetweenSpace),
    height: pxNumber(token.ComponentFabMenuCloseButtonContainerHeight),
    width: pxNumber(token.ComponentFabMenuCloseButtonContainerWidth),
    iconSize: pxNumber(token.ComponentFabMenuCloseButtonIconSize),
  },
  listItem: {
    betweenSpace: pxNumber(token.ComponentFabMenuListItemBetweenSpace),
    height: pxNumber(token.ComponentFabMenuListItemContainerHeight),
    minWidth: pxNumber(token.ComponentFabMenuListItemContainerHeight),
    iconSize: pxNumber(token.ComponentFabMenuListItemIconSize),
    iconLabelSpace: pxNumber(token.ComponentFabMenuListItemIconLabelSpace),
    leadingSpace: pxNumber(token.ComponentFabMenuListItemLeadingSpace),
    trailingSpace: pxNumber(token.ComponentFabMenuListItemTrailingSpace),
    shape: token.ShapeFull,
    elevation: token.ComponentFabMenuListItemContainerElevation as ElevationLevel,
  },
  layout: {
    horizontalPadding: logicalViewportMargin,
    triggerBottomPadding,
  },
  motion: {
    staggerStepMs,
    itemSpatialDuration: token.MotionSpringFastSpatialDuration,
    itemSpatialEasing: token.MotionSpringFastSpatialEasing,
    itemEffectsDuration: token.MotionSpringFastEffectsDuration,
    itemEffectsEasing: token.MotionSpringFastEffectsEasing,
  },
} as const;

export function getFabMenuStyle(
  maxMenuHeight: CSSProperties['maxHeight'] = 'calc(100dvh - 96px)',
): FabMenuStyle {
  return {
    '--_fab-menu-horizontal-padding': `${fabMenuTokens.layout.horizontalPadding}px`,
    '--_fab-menu-trigger-bottom-padding': `${fabMenuTokens.layout.triggerBottomPadding}px`,
    '--_fab-menu-close-between-space': `${fabMenuTokens.closeButton.betweenSpace}px`,
    '--_fab-menu-item-between-space': `${fabMenuTokens.listItem.betweenSpace}px`,
    '--_fab-menu-item-height': `${fabMenuTokens.listItem.height}px`,
    '--_fab-menu-item-min-width': `${fabMenuTokens.listItem.minWidth}px`,
    '--_fab-menu-item-icon-size': `${fabMenuTokens.listItem.iconSize}px`,
    '--_fab-menu-item-icon-label-space': `${fabMenuTokens.listItem.iconLabelSpace}px`,
    '--_fab-menu-item-leading-space': `${fabMenuTokens.listItem.leadingSpace}px`,
    '--_fab-menu-item-trailing-space': `${fabMenuTokens.listItem.trailingSpace}px`,
    '--_fab-menu-item-shape': fabMenuTokens.listItem.shape,
    '--_fab-menu-item-spatial-duration': fabMenuTokens.motion.itemSpatialDuration,
    '--_fab-menu-item-spatial-easing': fabMenuTokens.motion.itemSpatialEasing,
    '--_fab-menu-item-effects-duration': fabMenuTokens.motion.itemEffectsDuration,
    '--_fab-menu-item-effects-easing': fabMenuTokens.motion.itemEffectsEasing,
    '--_fab-menu-max-height': cssLength(maxMenuHeight) ?? 'calc(100dvh - 96px)',
    '--_fab-menu-label-font-family': `var(--font-family-${token.TypographyTitleMediumFontFamily})`,
    '--_fab-menu-label-font-size': token.TypographyTitleMediumFontSize,
    '--_fab-menu-label-font-weight': token.TypographyTitleMediumFontWeight,
    '--_fab-menu-label-line-height': token.TypographyTitleMediumLineHeight,
    '--_fab-menu-label-letter-spacing': token.TypographyTitleMediumLetterSpacing,
  };
}

export interface ToggleFabStyleOptions {
  readonly containerColor?: CSSProperties['backgroundColor'];
  readonly checkedContainerColor?: CSSProperties['backgroundColor'];
  readonly contentColor?: CSSProperties['color'];
  readonly checkedContentColor?: CSSProperties['color'];
}

export function getToggleFabStyle(
  size: ToggleFabSize,
  checked: boolean,
  options: ToggleFabStyleOptions = {},
): FabMenuStyle {
  const initial = fabSizeTokens[size];
  const finalSize = fabMenuTokens.closeButton.height;
  const finalRadius = finalSize / 2;
  const initialColors = fabVariantColors.primaryContainer;
  const finalColors = fabVariantColors.primary;

  return {
    '--_fab-target-size': `${initial.height}px`,
    '--_fab-container-width': `${checked ? finalSize : initial.width}px`,
    '--_fab-container-height': `${checked ? finalSize : initial.height}px`,
    '--_fab-container-radius': `${checked ? finalRadius : size === 'baseline' ? 16 : size === 'medium' ? 20 : 28}px`,
    '--_fab-container-color': checked
      ? options.checkedContainerColor ?? finalColors.containerColor
      : options.containerColor ?? initialColors.containerColor,
    '--_fab-content-color': checked
      ? options.checkedContentColor ?? finalColors.contentColor
      : options.contentColor ?? initialColors.contentColor,
    '--_fab-state-layer-color': checked
      ? options.checkedContentColor ?? finalColors.contentColor
      : options.contentColor ?? initialColors.contentColor,
    '--_fab-icon-size': `${checked ? fabMenuTokens.closeButton.iconSize : initial.iconSize}px`,
    '--_fab-toggle-spatial-duration': token.MotionSpringFastSpatialDuration,
    '--_fab-toggle-spatial-easing': token.MotionSpringFastSpatialEasing,
    '--_fab-toggle-effects-duration': token.MotionSpringFastEffectsDuration,
    '--_fab-toggle-effects-easing': token.MotionSpringFastEffectsEasing,
  };
}
