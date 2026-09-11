import { describe, expect, it } from 'vitest';
import { PaneMotion } from '../../adaptive/paneMotion';
import {
  interpolateThreePaneScaffoldTransitionFrames,
  type PaneTransitionFrame,
} from './ThreePaneScaffold.transition';

function frame(left: number, width: number): PaneTransitionFrame {
  return {
    placement: { left, top: 0, width, height: 100 },
    translateX: 0,
    opacity: 1,
    inlineClipFraction: 1,
    motion: PaneMotion.AnimateBounds,
    levitated: false,
  };
}

describe('AnimateBounds IntRect overflow parity', () => {
  it('wraps placement edges before sampling the IntRect spring', () => {
    const result = interpolateThreePaneScaffoldTransitionFrames(
      {
        primary: frame(2147483647, 2147483647),
        scrimOpacity: 0,
      },
      {
        primary: frame(0, 100),
        scrimOpacity: 0,
      },
      0.5,
    );

    // AndroidX constructs Bounds.rect as IntRect(topLeft, size), so the
    // origin right edge wraps first: Int.MAX_VALUE + Int.MAX_VALUE == -2.
    // Its IntRectToVector spring therefore samples [MAX, 0, -2, 100], not a
    // JavaScript double right edge of 4_294_967_294.
    expect(result.primary?.placement).toEqual({
      left: 30674,
      top: 0,
      width: -30574,
      height: 100,
    });
  });
});
