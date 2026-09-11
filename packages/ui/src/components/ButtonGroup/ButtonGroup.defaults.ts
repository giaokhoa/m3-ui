import * as token from '@m3-ui/tokens';
import type { ElevationLevel } from '../../internal/elevation';
import type { ButtonSize } from '../Button/Button.types';

export type ButtonGroupSize = ButtonSize;

/** Shared Elevation needs the overflow surface level at runtime; paint is generated CSS. */
export const buttonGroupOverflowMenuElevation =
  token.ComponentMenuBaseContainerElevation as ElevationLevel;

/** Runtime width redistribution ratio consumed by DOM measurement arithmetic. */
export const defaultButtonGroupExpandedRatio =
  token.ComponentButtonGroupSmallPressedItemWidthMultiplierPercent / 100;

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
