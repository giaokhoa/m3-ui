export interface VisibleViewport {
  top: number;
  bottom: number;
}

export interface AnchorBounds {
  top: number;
  bottom: number;
}

/**
 * @deprecated ExposedDropdownMenu now delegates live popup geometry to React Aria Popover.
 * Retained as a public compatibility helper for callers that use the calculation directly.
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
