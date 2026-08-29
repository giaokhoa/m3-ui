import { describe, expect, it } from 'vitest';
import {
  preferredPaneSizeProportion,
  resolvePanePreferredSize,
} from './preferredPaneSize';

describe('preferred pane size', () => {
  it('keeps absolute CSS-pixel sizes unchanged', () => {
    expect(resolvePanePreferredSize(320, 1000, 360, 'preferredWidth')).toBe(320);
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

  it('falls back to the directive preferred size when unspecified', () => {
    expect(resolvePanePreferredSize(undefined, 1000, 360, 'preferredWidth')).toBe(360);
  });

  it('accepts the AndroidX proportion edge values', () => {
    expect(resolvePanePreferredSize({ proportion: 0 }, 1000, 360, 'preferredWidth')).toBe(0);
    expect(resolvePanePreferredSize({ proportion: 1 }, 1000, 360, 'preferredWidth')).toBe(1000);
  });

  it('rejects invalid proportions and absolute sizes', () => {
    expect(() => preferredPaneSizeProportion(-0.01)).toThrow(RangeError);
    expect(() => preferredPaneSizeProportion(1.01)).toThrow(RangeError);
    expect(() => resolvePanePreferredSize({ proportion: Number.NaN }, 1000, 360, 'preferredWidth')).toThrow(
      RangeError,
    );
    expect(() => resolvePanePreferredSize(-1, 1000, 360, 'preferredWidth')).toThrow(RangeError);
  });
});
