import * as token from '@m3-ui/tokens';

export const carouselTokens = {
  containerColor: token.ComponentCarouselItemContainerColor,
  disabledContainerOpacity: token.ComponentCarouselItemDisabledContainerOpacity,
  outlineWidth: token.ComponentCarouselItemWithOutlineOutlineWidth,
  outlineColor: token.ComponentCarouselItemWithOutlineOutlineColor,
  disabledOutlineColor: token.ComponentCarouselItemWithOutlineDisabledOutlineColor,
  disabledOutlineOpacity: token.ComponentCarouselItemWithOutlineDisabledOutlineOpacity,
} as const;

export const carouselDefaults = {
  minSmallItemWidth: 40,
  maxSmallItemWidth: 56,
  anchorSize: 10,
  mediumLargeItemDiffThreshold: 0.85,
} as const;
