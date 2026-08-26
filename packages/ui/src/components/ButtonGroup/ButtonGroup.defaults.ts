import * as token from '@m3/tokens';
import type { CSSProperties } from 'react';
import { getElevationBoxShadow, type ElevationLevel } from '../../internal/elevation';
import type { ButtonSize } from '../Button/Button.types';

export type ButtonGroupSize = ButtonSize;
export type ButtonGroupVariant = 'standard' | 'connected';
export type ButtonGroupStyle = CSSProperties & Record<`--${string}`, string | number>;

export interface ButtonGroupSizeTokenSet {
  readonly gap: string;
  readonly height: string;
}

export interface ConnectedButtonGroupSizeTokenSet extends ButtonGroupSizeTokenSet {
  readonly innerCorner: string;
  readonly pressedInnerCorner: string;
}

export const buttonGroupSizeTokens = {
  extraSmall: { gap: token.ComponentButtonGroupXSmallBetweenSpace, height: token.ComponentButtonGroupXSmallContainerHeight },
  small: { gap: token.ComponentButtonGroupSmallBetweenSpace, height: token.ComponentButtonGroupSmallContainerHeight },
  medium: { gap: token.ComponentButtonGroupMediumBetweenSpace, height: token.ComponentButtonGroupMediumContainerHeight },
  large: { gap: token.ComponentButtonGroupLargeBetweenSpace, height: token.ComponentButtonGroupLargeContainerHeight },
  extraLarge: { gap: token.ComponentButtonGroupXLargeBetweenSpace, height: token.ComponentButtonGroupXLargeContainerHeight },
} as const satisfies Record<ButtonGroupSize, ButtonGroupSizeTokenSet>;

export const connectedButtonGroupSizeTokens = {
  extraSmall: {
    gap: token.ComponentButtonGroupConnectedXSmallBetweenSpace,
    height: token.ComponentButtonGroupConnectedXSmallContainerHeight,
    innerCorner: token.ComponentButtonGroupConnectedXSmallInnerCornerSize,
    pressedInnerCorner: token.ComponentButtonGroupConnectedXSmallPressedInnerCornerSize,
  },
  small: {
    gap: token.ComponentButtonGroupConnectedSmallBetweenSpace,
    height: token.ComponentButtonGroupConnectedSmallContainerHeight,
    innerCorner: token.ComponentButtonGroupConnectedSmallInnerCornerSize,
    pressedInnerCorner: token.ComponentButtonGroupConnectedSmallPressedInnerCornerSize,
  },
  medium: {
    gap: token.ComponentButtonGroupConnectedMediumBetweenSpace,
    height: token.ComponentButtonGroupConnectedMediumContainerHeight,
    innerCorner: token.ComponentButtonGroupConnectedMediumInnerCornerSize,
    pressedInnerCorner: token.ComponentButtonGroupConnectedMediumPressedInnerCornerSize,
  },
  large: {
    gap: token.ComponentButtonGroupConnectedLargeBetweenSpace,
    height: token.ComponentButtonGroupConnectedLargeContainerHeight,
    innerCorner: token.ComponentButtonGroupConnectedLargeInnerCornerSize,
    pressedInnerCorner: token.ComponentButtonGroupConnectedLargePressedInnerCornerSize,
  },
  extraLarge: {
    gap: token.ComponentButtonGroupConnectedXLargeBetweenSpace,
    height: token.ComponentButtonGroupConnectedXLargeContainerHeight,
    innerCorner: token.ComponentButtonGroupConnectedXLargeInnerCornerSize,
    pressedInnerCorner: token.ComponentButtonGroupConnectedXLargePressedInnerCornerSize,
  },
} as const satisfies Record<ButtonGroupSize, ConnectedButtonGroupSizeTokenSet>;

export const buttonGroupMotionTokens = {
  duration: token.MotionSpringFastSpatialDuration,
  easing: token.MotionSpringFastSpatialEasing,
  dampingRatio: token.ComponentButtonGroupSmallPressedItemWidthMotionSpringDampingRatio,
  stiffness: token.ComponentButtonGroupSmallPressedItemWidthMotionSpringStiffness,
} as const;

export const buttonGroupOverflowMenuTokens = {
  containerColor: token.ComponentMenuBaseContainerColor,
  containerRadius: token.ShapeExtraSmall,
  containerElevation: token.ComponentMenuBaseContainerElevation as ElevationLevel,
  itemContainerColor: token.ComponentMenuStandardItemContainerColor,
  itemLabelColor: token.ComponentMenuStandardItemLabelTextColor,
  itemDisabledLabelColor: token.ComponentMenuStandardItemDisabledLabelTextColor,
  itemDisabledLabelOpacity: token.ComponentMenuStandardItemDisabledLabelTextOpacity,
  itemHeight: token.ComponentListBaseItemOneLineContainerHeight,
  itemPaddingInlineStart: token.ComponentListBaseItemLeadingSpace,
  itemPaddingInlineEnd: token.ComponentListBaseItemTrailingSpace,
  itemGap: token.ComponentListBaseItemBetweenSpace,
  itemIconSize: token.ComponentListBaseItemLeadingIconSize,
  hoverOpacity: token.StateLayerOpacityHover,
} as const;

export const connectedButtonGroupColorTokens = {
  unselectedContainer: token.ComponentButtonVariantFilledUnselectedContainerColor,
  unselectedContent: token.ComponentButtonVariantFilledUnselectedLabelTextColor,
  selectedContainer: token.ComponentButtonVariantFilledSelectedContainerColor,
  selectedContent: token.ComponentButtonVariantFilledSelectedLabelTextColor,
} as const;

export const defaultButtonGroupExpandedRatio =
  token.ComponentButtonGroupSmallPressedItemWidthMultiplierPercent / 100;

export function buttonGroupStyle(
  variant: ButtonGroupVariant,
  size: ButtonGroupSize = 'small',
): ButtonGroupStyle {
  const sizeTokens = variant === 'connected'
    ? connectedButtonGroupSizeTokens[size]
    : buttonGroupSizeTokens[size];
  const connected = connectedButtonGroupSizeTokens[size];
  return {
    '--_button-group-gap': sizeTokens.gap,
    '--_button-group-height': sizeTokens.height,
    '--_button-group-motion-duration': buttonGroupMotionTokens.duration,
    '--_button-group-motion-easing': buttonGroupMotionTokens.easing,
    '--_button-group-inner-corner': connected.innerCorner,
    '--_button-group-pressed-inner-corner': connected.pressedInnerCorner,
    '--_button-group-full-corner': token.ShapeFull,
    '--_button-group-unselected-container': connectedButtonGroupColorTokens.unselectedContainer,
    '--_button-group-unselected-content': connectedButtonGroupColorTokens.unselectedContent,
    '--_button-group-selected-container': connectedButtonGroupColorTokens.selectedContainer,
    '--_button-group-selected-content': connectedButtonGroupColorTokens.selectedContent,
    '--_button-group-menu-container-color': buttonGroupOverflowMenuTokens.containerColor,
    '--_button-group-menu-container-radius': buttonGroupOverflowMenuTokens.containerRadius,
    '--_button-group-menu-container-shadow': getElevationBoxShadow(buttonGroupOverflowMenuTokens.containerElevation),
    '--_button-group-menu-item-color': buttonGroupOverflowMenuTokens.itemLabelColor,
    '--_button-group-menu-item-container-color': buttonGroupOverflowMenuTokens.itemContainerColor,
    '--_button-group-menu-item-disabled-color': buttonGroupOverflowMenuTokens.itemDisabledLabelColor,
    '--_button-group-menu-item-disabled-opacity': `${buttonGroupOverflowMenuTokens.itemDisabledLabelOpacity * 100}%`,
    '--_button-group-menu-item-height': buttonGroupOverflowMenuTokens.itemHeight,
    '--_button-group-menu-item-padding-start': buttonGroupOverflowMenuTokens.itemPaddingInlineStart,
    '--_button-group-menu-item-padding-end': buttonGroupOverflowMenuTokens.itemPaddingInlineEnd,
    '--_button-group-menu-item-gap': buttonGroupOverflowMenuTokens.itemGap,
    '--_button-group-menu-item-icon-size': buttonGroupOverflowMenuTokens.itemIconSize,
    '--_button-group-menu-item-hover-opacity': `${buttonGroupOverflowMenuTokens.hoverOpacity * 100}%`,
  };
}

export interface WidthDistributionInput {
  readonly widths: readonly number[];
  readonly maxCompression: readonly number[];
  readonly pressedIndex: number | null;
  readonly expandedRatio: number;
}

/**
 * Mirrors AndroidX ButtonGroup width redistribution: an edge press borrows from
 * its sole neighbor; a middle press borrows half from each neighbor. Growth is
 * clamped by each neighbor's compression allowance so content cannot collapse.
 */
export function distributePressedWidths({
  widths,
  maxCompression,
  pressedIndex,
  expandedRatio,
}: WidthDistributionInput): number[] {
  const next = [...widths];
  if (
    pressedIndex == null ||
    pressedIndex < 0 ||
    pressedIndex >= widths.length ||
    widths.length < 2 ||
    expandedRatio <= 0
  ) {
    return next;
  }

  const ratio = Math.min(1, expandedRatio);
  const target = widths[pressedIndex] * ratio;
  let growth = 0;

  if (pressedIndex === 0) {
    const shrink = Math.min(target, Math.max(0, maxCompression[1] ?? 0));
    next[1] -= shrink;
    growth = shrink;
  } else if (pressedIndex === widths.length - 1) {
    const shrink = Math.min(target, Math.max(0, maxCompression[pressedIndex - 1] ?? 0));
    next[pressedIndex - 1] -= shrink;
    growth = shrink;
  } else {
    const half = target / 2;
    const leftShrink = Math.min(half, Math.max(0, maxCompression[pressedIndex - 1] ?? 0));
    const rightShrink = Math.min(half, Math.max(0, maxCompression[pressedIndex + 1] ?? 0));
    next[pressedIndex - 1] -= leftShrink;
    next[pressedIndex + 1] -= rightShrink;
    growth = leftShrink + rightShrink;
  }

  next[pressedIndex] += growth;
  return next;
}

/** Returns the deterministic visible prefix when an overflow indicator is needed. */
export function visiblePrefixCount(
  widths: readonly number[],
  availableWidth: number,
  gap: number,
  overflowWidth: number,
): number {
  if (widths.length === 0) return 0;
  const allWidth = widths.reduce((sum, width) => sum + width, 0) + gap * (widths.length - 1);
  if (allWidth <= availableWidth) return widths.length;

  const budget = Math.max(0, availableWidth - overflowWidth - gap);
  let used = 0;
  let count = 0;
  for (const width of widths) {
    const next = width + (count > 0 ? gap : 0);
    if (used + next > budget) break;
    used += next;
    count += 1;
  }
  return count;
}
