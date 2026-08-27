export interface VisibleViewport {
  top: number;
  bottom: number;
}

export interface AnchorBounds {
  top: number;
  bottom: number;
}

/**
 * Mirrors AndroidX exposed dropdown sizing: constrain the popup to the larger
 * visible region above or below the anchor, keeping a viewport margin.
 */
export function calculateExposedDropdownMaxHeight(
  viewport: VisibleViewport,
  anchor: AnchorBounds,
  margin: number,
) {
  const above = Math.max(0, anchor.top - viewport.top - margin);
  const below = Math.max(0, viewport.bottom - anchor.bottom - margin);
  return Math.max(above, below);
}
