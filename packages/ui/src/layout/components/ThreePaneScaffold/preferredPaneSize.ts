export interface PanePreferredSizeProportion {
  readonly proportion: number;
}

/**
 * Web representation of AndroidX PaneScaffoldScope preferred size overloads.
 * A number is an absolute logical CSS-pixel size; a proportion is resolved
 * against the full scaffold dimension before pane allocation.
 */
export type PanePreferredSize = number | PanePreferredSizeProportion;

function assertProportion(proportion: number, name: string) {
  if (!Number.isFinite(proportion) || proportion < 0 || proportion > 1) {
    throw new RangeError(`${name} must be a finite value in [0, 1], received ${proportion}`);
  }
}

export function preferredPaneSizeProportion(
  proportion: number,
): PanePreferredSizeProportion {
  assertProportion(proportion, 'proportion');
  return Object.freeze({ proportion });
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

  assertProportion(preferredSize.proportion, `${name} proportion`);
  return Math.trunc(scaffoldSize * preferredSize.proportion);
}
