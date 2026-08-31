export interface PanePreferredSizeProportion {
  readonly proportion: number;
}

/**
 * Web representation of AndroidX PaneScaffoldScope preferred size overloads.
 * A number is an absolute logical CSS-pixel size; a proportion is resolved
 * against the full scaffold dimension before pane allocation.
 */
export type PanePreferredSize = number | PanePreferredSizeProportion;

const ComposeIntMax = 2147483647;
const ComposeIntMin = -2147483648;

function composeFloat(value: number) {
  return Math.fround(value);
}

function composeRoundToPx(value: number) {
  const floatValue = composeFloat(value);
  if (floatValue >= ComposeIntMax) return ComposeIntMax;
  if (floatValue <= ComposeIntMin) return ComposeIntMin;
  return Math.round(floatValue);
}

function composeFloatToInt(value: number) {
  const floatValue = composeFloat(value);
  if (Number.isNaN(floatValue)) return 0;
  if (floatValue >= ComposeIntMax) return ComposeIntMax;
  if (floatValue <= ComposeIntMin) return ComposeIntMin;
  return Math.trunc(floatValue);
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
    // AndroidX accepts Dp.Unspecified or any value > 0.dp, then resolves the
    // specified Dp with roundToPx() at pane measurement. Preserve NaN as the
    // Dp.Unspecified sentinel in addition to undefined, the idiomatic web form.
    if (Number.isNaN(preferredSize)) return fallbackSize;
    if (preferredSize <= 0) {
      throw new RangeError(
        `${name} must be a positive CSS pixel value, received ${preferredSize}`,
      );
    }
    return composeRoundToPx(preferredSize);
  }

  const proportion = normalizeProportion(preferredSize.proportion, `${name} proportion`);
  // AndroidX evaluates Int * Float as Float and then calls Float.toInt(), which
  // saturates values outside the Int range. Int.MAX_VALUE itself first rounds
  // up to 2147483648f, so a 1f proportion must still resolve back to Int.MAX.
  return composeFloatToInt(composeFloat(composeFloat(scaffoldSize) * proportion));
}
