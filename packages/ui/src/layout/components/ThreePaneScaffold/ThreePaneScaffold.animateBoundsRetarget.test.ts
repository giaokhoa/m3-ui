import { describe, expect, it } from 'vitest';
import { PaneMotion } from '../../adaptive/paneMotion';
import { samplePaneMotionVectorSpringAtProgress } from '../../adaptive/paneMotionSpring';
import {
  interpolateThreePaneScaffoldTransitionFrames,
  type PaneTransitionFrame,
  type ThreePaneScaffoldTransitionFrame,
} from './ThreePaneScaffold.transition';

function pane(
  motion: PaneTransitionFrame['motion'],
  placement: PaneTransitionFrame['placement'],
  overrides: Partial<PaneTransitionFrame> = {},
): PaneTransitionFrame {
  return {
    placement,
    translateX: 0,
    opacity: 1,
    inlineClipFraction: 1,
    motion,
    levitated: false,
    ...overrides,
  };
}

function frame(primary: PaneTransitionFrame): ThreePaneScaffoldTransitionFrame {
  return { primary, scrimOpacity: 0 };
}

describe('AnimateBounds retargeting', () => {
  it('restarts the private bounds spring from the exact captured rendered bounds', () => {
    const captured = frame(
      pane(
        PaneMotion.EnterFromRight,
        { left: 250, top: 0, width: 400, height: 800 },
        { translateX: 80, opacity: 0.6, inlineClipFraction: 0.75 },
      ),
    );
    const target = frame(
      pane(PaneMotion.AnimateBounds, { left: 800, top: 0, width: 200, height: 800 }),
    );

    const result = interpolateThreePaneScaffoldTransitionFrames(captured, target, 0.5);
    const expectedRect = samplePaneMotionVectorSpringAtProgress(
      [250, 0, 650, 800],
      [800, 0, 1000, 800],
      0.5,
      [1, 1, 1, 1],
    );

    expect(result.primary?.placement).toEqual({
      left: expectedRect[0],
      top: expectedRect[1],
      width: expectedRect[2]! - expectedRect[0]!,
      height: expectedRect[3]! - expectedRect[1]!,
    });
    expect(result.primary?.placement.left).not.toBe(525);

    // AnimatedVisibility interruption is intentionally left on the existing
    // fallback path in this slice; only private BoundsTracker parity changes.
    expect(result.primary?.translateX).toBe(40);
    expect(result.primary?.opacity).toBe(0.8);
    expect(result.primary?.inlineClipFraction).toBe(0.875);
  });

  it('keeps the existing linear placement fallback for non-bounds retargets', () => {
    const captured = frame(
      pane(PaneMotion.ExitToLeft, { left: 100, top: 10, width: 300, height: 600 }),
    );
    const target = frame(
      pane(PaneMotion.EnterFromRight, { left: 500, top: 30, width: 500, height: 700 }),
    );

    const result = interpolateThreePaneScaffoldTransitionFrames(captured, target, 0.25);

    expect(result.primary?.placement).toEqual({
      left: 200,
      top: 15,
      width: 350,
      height: 625,
    });
  });
});
