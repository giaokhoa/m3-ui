export interface PanePreferredSizeProportion {
  readonly proportion: number;
}

/**
 * Web representation of AndroidX PaneScaffoldScope preferred size overloads.
 * A number is an absolute logical CSS-pixel size; a proportion is resolved
 * against the full scaffold dimension before pane allocation.
 */
export type PanePreferredSize = number | PanePreferredSizeProportion;

function composeFloat(value: number) {
  return Math.fround(value);
}

function normalizeProportion(proportion: number, name: string) {
  const floatProportion = composeFloat(proportion);
  if (!Number.isFinite(floatProportion) || floatProportion < 0 || floatProportion > 1) {
    throw new RangeError(`${name} must be a finite value in [0, 1], received ${proportion}`);
  }
  return floatProportion;
}

export function preferredPaneSizeProportion(
  proportion: number,
): PanePreferredSizeProportion {
  return Object.freeze({ proportion: normalizeProportion(proportion, 'proportion') });
}

export function resolvePanePreferredSize(
  preferredSize: PanePreferredSize | undefined,
  scaffoldSize: number,
  fallbackSize: number,
  name: string,
): number {
  if (preferredSize === undefined) return fallbackSize;
  if (typeof preferredSize === 'number') {
    if (!Number.isFinite(preferredSize) || preferredSize < 0) {
      throw new RangeError(
        `${name} must be a finite, non-negative CSS pixel value, received ${preferredSize}`,
      );
    }
    return preferredSize;
  }

  const proportion = normalizeProportion(preferredSize.proportion, `${name} proportion`);
  return Math.trunc(composeFloat(composeFloat(scaffoldSize) * proportion));
}
