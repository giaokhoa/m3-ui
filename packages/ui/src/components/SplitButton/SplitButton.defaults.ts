import * as token from '@m3/tokens';
import type { CSSProperties } from 'react';
import type { SplitButtonSize } from './SplitButton.types';

export type SplitButtonStyle = CSSProperties & Record<`--${string}`, string | number>;

interface SplitButtonSizeTokens {
  readonly spacing: string;
  readonly containerHeight: string;
  readonly innerCorner: string;
  readonly innerPressedCorner: string;
  readonly leadingPaddingStart: string;
  readonly leadingPaddingEnd: string;
  readonly trailingPaddingStart: string;
  readonly trailingPaddingEnd: string;
  readonly trailingIconSize: string;
}

export const splitButtonSizeTokens = {
  extraSmall: {
    spacing: token.ComponentSplitButtonSizeXSmallBetweenSpace,
    containerHeight: token.ComponentSplitButtonSizeXSmallContainerHeight,
    innerCorner: token.ComponentSplitButtonSizeXSmallInnerCornerSize,
    innerPressedCorner: token.ComponentSplitButtonSizeXSmallInnerPressedCornerSize,
    leadingPaddingStart: token.ComponentSplitButtonSizeXSmallLeadingButtonLeadingSpace,
    leadingPaddingEnd: token.ComponentSplitButtonSizeXSmallLeadingButtonTrailingSpace,
    trailingPaddingStart: token.ComponentSplitButtonSizeXSmallTrailingButtonLeadingSpace,
    trailingPaddingEnd: token.ComponentSplitButtonSizeXSmallTrailingButtonTrailingSpace,
    trailingIconSize: token.ComponentSplitButtonSizeXSmallTrailingIconSize,
  },
  small: {
    spacing: token.ComponentSplitButtonSizeSmallBetweenSpace,
    containerHeight: token.ComponentSplitButtonSizeSmallContainerHeight,
    innerCorner: token.ComponentSplitButtonSizeSmallInnerCornerSize,
    innerPressedCorner: token.ComponentSplitButtonSizeSmallInnerPressedCornerSize,
    leadingPaddingStart: token.ComponentSplitButtonSizeSmallLeadingButtonLeadingSpace,
    leadingPaddingEnd: token.ComponentSplitButtonSizeSmallLeadingButtonTrailingSpace,
    trailingPaddingStart: token.ComponentSplitButtonSizeSmallTrailingButtonLeadingSpace,
    trailingPaddingEnd: token.ComponentSplitButtonSizeSmallTrailingButtonTrailingSpace,
    trailingIconSize: token.ComponentSplitButtonSizeSmallTrailingIconSize,
  },
  medium: {
    spacing: token.ComponentSplitButtonSizeMediumBetweenSpace,
    containerHeight: token.ComponentSplitButtonSizeMediumContainerHeight,
    innerCorner: token.ComponentSplitButtonSizeMediumInnerCornerSize,
    innerPressedCorner: token.ComponentSplitButtonSizeMediumInnerPressedCornerSize,
    leadingPaddingStart: token.ComponentSplitButtonSizeMediumLeadingButtonLeadingSpace,
    leadingPaddingEnd: token.ComponentSplitButtonSizeMediumLeadingButtonTrailingSpace,
    trailingPaddingStart: token.ComponentSplitButtonSizeMediumTrailingButtonLeadingSpace,
    trailingPaddingEnd: token.ComponentSplitButtonSizeMediumTrailingButtonTrailingSpace,
    trailingIconSize: token.ComponentSplitButtonSizeMediumTrailingIconSize,
  },
  large: {
    spacing: token.ComponentSplitButtonSizeLargeBetweenSpace,
    containerHeight: token.ComponentSplitButtonSizeLargeContainerHeight,
    innerCorner: token.ComponentSplitButtonSizeLargeInnerCornerSize,
    innerPressedCorner: token.ComponentSplitButtonSizeLargeInnerPressedCornerSize,
    leadingPaddingStart: token.ComponentSplitButtonSizeLargeLeadingButtonLeadingSpace,
    leadingPaddingEnd: token.ComponentSplitButtonSizeLargeLeadingButtonTrailingSpace,
    trailingPaddingStart: token.ComponentSplitButtonSizeLargeTrailingButtonLeadingSpace,
    trailingPaddingEnd: token.ComponentSplitButtonSizeLargeTrailingButtonTrailingSpace,
    trailingIconSize: token.ComponentSplitButtonSizeLargeTrailingIconSize,
  },
  extraLarge: {
    spacing: token.ComponentSplitButtonSizeXLargeBetweenSpace,
    containerHeight: token.ComponentSplitButtonSizeXLargeContainerHeight,
    innerCorner: token.ComponentSplitButtonSizeXLargeInnerCornerSize,
    innerPressedCorner: token.ComponentSplitButtonSizeXLargeInnerPressedCornerSize,
    leadingPaddingStart: token.ComponentSplitButtonSizeXLargeLeadingButtonLeadingSpace,
    leadingPaddingEnd: token.ComponentSplitButtonSizeXLargeLeadingButtonTrailingSpace,
    trailingPaddingStart: token.ComponentSplitButtonSizeXLargeTrailingButtonLeadingSpace,
    trailingPaddingEnd: token.ComponentSplitButtonSizeXLargeTrailingButtonTrailingSpace,
    trailingIconSize: token.ComponentSplitButtonSizeXLargeTrailingIconSize,
  },
} as const satisfies Record<SplitButtonSize, SplitButtonSizeTokens>;

/** Runtime-only AndroidX contracts that are not canonical SplitButton component tokens. */
export const splitButtonRuntime = {
  minInteractiveSize: 48,
  checkedStateLayerOpacity: 0.1,
} as const;

export function getSplitButtonStyle(size: SplitButtonSize): SplitButtonStyle {
  const sizeTokens = splitButtonSizeTokens[size];
  return {
    '--_split-button-spacing': sizeTokens.spacing,
    '--_split-button-container-height': sizeTokens.containerHeight,
    '--_split-button-outer-corner': token.ShapeFull,
    '--_split-button-inner-corner': sizeTokens.innerCorner,
    '--_split-button-inner-pressed-corner': sizeTokens.innerPressedCorner,
    '--_split-button-leading-padding-start': sizeTokens.leadingPaddingStart,
    '--_split-button-leading-padding-end': sizeTokens.leadingPaddingEnd,
    '--_split-button-trailing-padding-start': sizeTokens.trailingPaddingStart,
    '--_split-button-trailing-padding-end': sizeTokens.trailingPaddingEnd,
    '--_split-button-trailing-icon-size': sizeTokens.trailingIconSize,
    '--_split-button-min-interactive-size': `${splitButtonRuntime.minInteractiveSize}px`,
    '--_split-button-checked-state-layer-opacity': `${splitButtonRuntime.checkedStateLayerOpacity * 100}%`,
  };
}
