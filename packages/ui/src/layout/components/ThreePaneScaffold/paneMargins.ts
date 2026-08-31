import type { PanePlacement } from './ThreePaneScaffold.layout';

/**
 * Physical safe-content edges in scaffold-local CSS pixels.
 *
 * These are the browser-native analogue of AndroidX RectRulers consumed by
 * PaneMargins: left/top are lower bounds while right/bottom are upper bounds.
 */
export interface PaneMarginInsetBounds {
  left?: number;
  top?: number;
  right?: number;
  bottom?: number;
}

/**
 * Per-pane outer margins, expressed against the scaffold edges.
 *
 * Logical inline margins follow the scaffold direction. These values do not
 * replace the scaffold's partition spacers and therefore must not be modeled
 * as CSS `margin` on the pane element.
 */
export interface PaneMargins {
  inlineStart?: number;
  blockStart?: number;
  inlineEnd?: number;
  blockEnd?: number;
  insetBounds?: readonly PaneMarginInsetBounds[];
}

const ComposeIntMax = 2147483647;
const ComposeIntMin = -2147483648;

function composeRoundToInt(value: number) {
  if (Number.isNaN(value)) {
    throw new RangeError('Cannot round NaN value');
  }
  if (value >= ComposeIntMax) return ComposeIntMax;
  if (value <= ComposeIntMin) return ComposeIntMin;
  return Math.round(value);
}

function nonNegativeMargin(value: number | undefined, name: string) {
  if (value === undefined) return 0;
  if (Number.isNaN(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative CSS pixel value`);
  }
  // AndroidX resolves fixed PaddingValues with roundToPx() before the pane
  // edge clamp. Positive infinity is valid Dp and becomes Int.MAX_VALUE.
  return composeRoundToInt(value);
}

function roundedEdge(value: number | undefined, fallback: number) {
  if (value === undefined) return fallback;
  // RectRuler.current() is Float in Compose, and PaneMargins immediately calls
  // roundToInt(). Infinity saturates to Int bounds; only NaN is invalid.
  return composeRoundToInt(value);
}

/**
 * Applies AndroidX PaneMargins edge-clamping semantics to an already measured
 * pane placement.
 *
 * Each edge is clamped independently against the scaffold outer bounds and the
 * union of supplied inset bounds. This intentionally shrinks a pane when one of
 * its measured edges violates a margin; it does not translate the pane to keep
 * its original size.
 */
export function applyPaneMargins(
  placement: PanePlacement,
  margins: PaneMargins | undefined,
  scaffoldWidth: number,
  scaffoldHeight: number,
  direction: 'ltr' | 'rtl' = 'ltr',
): PanePlacement {
  if (margins === undefined) return placement;
  if (!Number.isFinite(scaffoldWidth) || scaffoldWidth < 0) {
    throw new RangeError('scaffoldWidth must be a finite, non-negative CSS pixel value');
  }
  if (!Number.isFinite(scaffoldHeight) || scaffoldHeight < 0) {
    throw new RangeError('scaffoldHeight must be a finite, non-negative CSS pixel value');
  }

  const inlineStart = nonNegativeMargin(margins.inlineStart, 'inlineStart');
  const inlineEnd = nonNegativeMargin(margins.inlineEnd, 'inlineEnd');
  const blockStart = nonNegativeMargin(margins.blockStart, 'blockStart');
  const blockEnd = nonNegativeMargin(margins.blockEnd, 'blockEnd');
  const fixedLeft = direction === 'ltr' ? inlineStart : inlineEnd;
  const fixedRight = direction === 'ltr' ? inlineEnd : inlineStart;

  let insetLeft = 0;
  let insetTop = 0;
  let insetRight = scaffoldWidth;
  let insetBottom = scaffoldHeight;
  for (const bounds of margins.insetBounds ?? []) {
    insetLeft = Math.max(insetLeft, roundedEdge(bounds.left, 0));
    insetTop = Math.max(insetTop, roundedEdge(bounds.top, 0));
    insetRight = Math.min(insetRight, roundedEdge(bounds.right, scaffoldWidth));
    insetBottom = Math.min(insetBottom, roundedEdge(bounds.bottom, scaffoldHeight));
  }

  const measuredRight = placement.left + placement.width;
  const measuredBottom = placement.top + placement.height;
  const left = Math.max(placement.left, fixedLeft, insetLeft);
  const top = Math.max(placement.top, blockStart, insetTop);
  const right = Math.min(measuredRight, scaffoldWidth - fixedRight, insetRight);
  const bottom = Math.min(measuredBottom, scaffoldHeight - blockEnd, insetBottom);

  return {
    left,
    top,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  };
}
