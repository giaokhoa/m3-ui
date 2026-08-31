import { describe, expect, it } from 'vitest';
import {
  preferredPaneSizeProportion,
  resolvePanePreferredSize,
} from './preferredPaneSize';

describe('preferred pane size', () => {
  it('rounds positive absolute sizes like AndroidX Dp.roundToPx()', () => {
    expect(resolvePanePreferredSize(320, 1000, 360, 'preferredWidth')).toBe(320);
    expect(resolvePanePreferredSize(320.5, 1000, 360, 'preferredWidth')).toBe(321);
    expect(resolvePanePreferredSize(0.4, 1000, 360, 'preferredWidth')).toBe(0);
  });

  it('accepts the AndroidX Dp.Infinity case as Constraints.Infinity', () => {
    expect(
      resolvePanePreferredSize(Number.POSITIVE_INFINITY, 1000, 360, 'preferredWidth'),
    ).toBe(2147483647);
  });

  it('resolves proportions against the full scaffold dimension', () => {
    expect(
      resolvePanePreferredSize(
        preferredPaneSizeProportion(0.333),
        1000,
        360,
        'preferredWidth',
      ),
    ).toBe(333);
  });

  it('uses Compose Float arithmetic before truncating proportional sizes', () => {
    const preferredSize = preferredPaneSizeProportion(0.58);
    expect(preferredSize.proportion).toBe(Math.fround(0.58));

    // AndroidX computes (50 * 0.58f) as Float = 29f, then toInt() = 29.
    // Raw JS double arithmetic is 28.999999999999996 and would truncate to 28.
    expect(resolvePanePreferredSize(preferredSize, 50, 20, 'preferredWidth')).toBe(29);
    expect(resolvePanePreferredSize({ proportion: 0.58 }, 50, 20, 'preferredHeight')).toBe(29);
  });

  it('validates the Float value seen by the AndroidX proportion overload', () => {
    const roundsToOne = 1 + Number.EPSILON;
    expect(preferredPaneSizeProportion(roundsToOne).proportion).toBe(1);
    expect(resolvePanePreferredSize({ proportion: roundsToOne }, 50, 20, 'preferredWidth')).toBe(
      50,
    );
    expect(() => preferredPaneSizeProportion(1.0001)).toThrow(RangeError);
  });

  it('falls back to the directive preferred size when unspecified', () => {
    expect(resolvePanePreferredSize(undefined, 1000, 360, 'preferredWidth')).toBe(360);
  });

  it('accepts the AndroidX proportion edge values', () => {
    expect(resolvePanePreferredSize({ proportion: 0 }, 1000, 360, 'preferredWidth')).toBe(0);
    expect(resolvePanePreferredSize({ proportion: 1 }, 1000, 360, 'preferredWidth')).toBe(1000);
  });

  it('rejects invalid proportions and non-positive absolute sizes', () => {
    expect(() => preferredPaneSizeProportion(-0.01)).toThrow(RangeError);
    expect(() => preferredPaneSizeProportion(1.01)).toThrow(RangeError);
    expect(() =>
      resolvePanePreferredSize({ proportion: Number.NaN }, 1000, 360, 'preferredWidth'),
    ).toThrow(RangeError);
    expect(() => resolvePanePreferredSize(0, 1000, 360, 'preferredWidth')).toThrow(RangeError);
    expect(() => resolvePanePreferredSize(-1, 1000, 360, 'preferredWidth')).toThrow(RangeError);
  });
});
