// Source-level AndroidX renderer mechanics used by Carousel.geometry.ts.
// These are runtime layout algorithm inputs rather than canonical design tokens.
export const carouselDefaults = {
  minSmallItemWidth: 40,
  maxSmallItemWidth: 56,
  anchorSize: 10,
  mediumLargeItemDiffThreshold: 0.85,
} as const;
