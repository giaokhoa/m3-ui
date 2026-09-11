import type { CSSProperties } from 'react';
import { elevationLevels, type ElevationLevel } from '../../internal/elevation';

// These role expressions intentionally remain runtime sentinels. Surface must
// distinguish the canonical theme surface from an arbitrary caller-supplied
// color before applying the absolute tonal-elevation overlay. Moving these
// values to static CSS would not remove that runtime branch and would require a
// second opt-out mechanism for custom colors.
export const defaultSurfaceColor = 'var(--surface)';
export const defaultSurfaceContentColor = 'var(--on-surface)';

export function elevationLevelToPx(level: ElevationLevel): number {
  return elevationLevels[level];
}

export function tonalOverlayPercent(absoluteElevationPx: number): number {
  if (absoluteElevationPx <= 0) return 0;
  return ((4.5 * Math.log(absoluteElevationPx + 1)) + 2) / 100 * 100;
}

export function getSurfaceBackground(
  color: CSSProperties['backgroundColor'] | undefined,
  absoluteTonalElevationPx: number,
): CSSProperties['backgroundColor'] {
  const resolved = color ?? defaultSurfaceColor;
  const shouldApplyTonal = color === undefined || color === defaultSurfaceColor;
  const overlay = tonalOverlayPercent(absoluteTonalElevationPx);
  if (!shouldApplyTonal || overlay <= 0) return resolved;
  return `color-mix(in srgb, var(--surface-tint) ${overlay}%, var(--surface))`;
}

export function getSurfaceContentColor(
  color: CSSProperties['backgroundColor'] | undefined,
  contentColor: CSSProperties['color'] | undefined,
): CSSProperties['color'] | undefined {
  if (contentColor !== undefined) return contentColor;
  if (color === undefined || color === defaultSurfaceColor) return defaultSurfaceContentColor;
  return undefined;
}
