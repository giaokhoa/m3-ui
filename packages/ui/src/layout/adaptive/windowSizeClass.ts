import * as token from '@m3-ui/tokens';
import { pxNumber } from '../../internal/tokenValues';

export interface WindowSize {
  /** Available layout-viewport width in CSS pixels. */
  width: number;
  /** Available layout-viewport height in CSS pixels. */
  height: number;
}

export type WindowWidthSizeClass =
  | 'compact'
  | 'medium'
  | 'expanded'
  | 'large'
  | 'extra-large';

export type WindowHeightSizeClass = 'compact' | 'medium' | 'expanded';

export interface WindowSizeClass {
  width: WindowWidthSizeClass;
  height: WindowHeightSizeClass;
}

/**
 * Material 3 V2 window-size-class lower bounds.
 *
 * Android uses density-independent dp. CSS pixels are the corresponding
 * logical viewport unit on the web, so calculations intentionally use the
 * layout viewport in CSS px rather than device pixels.
 */
export const windowSizeClassBreakpoints = {
  width: {
    medium: pxNumber(token.LayoutWindowSizeClassWidthMediumLowerBound),
    expanded: pxNumber(token.LayoutWindowSizeClassWidthExpandedLowerBound),
    large: pxNumber(token.LayoutWindowSizeClassWidthLargeLowerBound),
    extraLarge: pxNumber(token.LayoutWindowSizeClassWidthExtraLargeLowerBound),
  },
  height: {
    medium: pxNumber(token.LayoutWindowSizeClassHeightMediumLowerBound),
    expanded: pxNumber(token.LayoutWindowSizeClassHeightExpandedLowerBound),
  },
} as const;

export function calculateWindowWidthSizeClass(
  width: number,
): WindowWidthSizeClass {
  if (width >= windowSizeClassBreakpoints.width.extraLarge) return 'extra-large';
  if (width >= windowSizeClassBreakpoints.width.large) return 'large';
  if (width >= windowSizeClassBreakpoints.width.expanded) return 'expanded';
  if (width >= windowSizeClassBreakpoints.width.medium) return 'medium';
  return 'compact';
}

export function calculateWindowHeightSizeClass(
  height: number,
): WindowHeightSizeClass {
  if (height >= windowSizeClassBreakpoints.height.expanded) return 'expanded';
  if (height >= windowSizeClassBreakpoints.height.medium) return 'medium';
  return 'compact';
}

/** Material 3 V2 window-size classification, equivalent to Adaptive V2 defaults. */
export function calculateWindowSizeClass({
  width,
  height,
}: WindowSize): WindowSizeClass {
  return {
    width: calculateWindowWidthSizeClass(width),
    height: calculateWindowHeightSizeClass(height),
  };
}
