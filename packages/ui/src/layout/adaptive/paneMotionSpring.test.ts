import { describe, expect, it } from 'vitest';
import {
  PaneMotionDefaultDisplacementThreshold,
  calculatePaneMotionDelayedSpringDurationMs,
  calculatePaneMotionSpringDurationMs,
  calculatePaneMotionVectorSpringDurationMs,
  samplePaneMotionDelayedSpringAtPlayTime,
  samplePaneMotionDelayedVectorSpringAtPlayTime,
  samplePaneMotionSpring,
  samplePaneMotionVectorSpringAtPlayTime,
  samplePaneMotionVectorSpringAtProgress,
} from './paneMotionSpring';

describe('pane motion spring parity', () => {
  it('uses the AndroidX default Float spring threshold', () => {
    expect(PaneMotionDefaultDisplacementThreshold).toBe(0.01);
    expect(
      calculatePaneMotionSpringDurationMs(
        0,
        1,
        PaneMotionDefaultDisplacementThreshold,
      ),
    ).toBe(328);
  });

  it('samples the pinned under-damped SpringSimulation Float response', () => {
    expect(samplePaneMotionSpring(0, 1, 0)).toBe(0);
    expect(samplePaneMotionSpring(0, 1, 50)).toBe(0.28017744421958923);
    expect(samplePaneMotionSpring(0, 1, 100)).toBe(0.6598310470581055);
    expect(samplePaneMotionSpring(0, 1, 328)).toBe(1.0097393989562988);
  });

  it('preserves initial velocity for pane-expansion anchor settling', () => {
    expect(samplePaneMotionSpring(510, 750, 50, 250)).toBe(582.6529541015625);
    expect(samplePaneMotionSpring(510, 750, 100, 250)).toBe(672.4965209960938);
    expect(calculatePaneMotionSpringDurationMs(510, 750, 1, 250)).toBe(381);
  });

  it('keeps spring motion when position already equals target but velocity remains', () => {
    expect(samplePaneMotionSpring(500, 500, 50, 250)).toBe(505.410400390625);
    expect(samplePaneMotionSpring(500, 500, 100, 250)).toBe(504.1370544433594);
    expect(calculatePaneMotionSpringDurationMs(500, 500, 1, 250)).toBe(196);
  });

  it('uses the slowest vector dimension as TargetBasedAnimation duration', () => {
    expect(calculatePaneMotionVectorSpringDurationMs([0, 0], [500, 100])).toBe(431);
    const halfway = samplePaneMotionVectorSpringAtProgress(
      [0, 0],
      [500, 100],
      0.5,
    );
    expect(halfway[0]).toBeGreaterThan(400);
    expect(halfway[1]).toBeGreaterThan(90);
  });

  it('quantizes AnimateBounds progress through Float nanoseconds before spring sampling', () => {
    const initialRect = [0, 0, 500, 100];
    const targetRect = [500, 100, 1000, 200];
    expect(calculatePaneMotionVectorSpringDurationMs(initialRect, targetRect)).toBe(431);

    // AndroidX BoundsTracker evaluates
    // (431_000_000L * 0.354988396f).toLong() as 153_000_000ns because the
    // Long duration is first converted to Float. Sampling durationMs * progress
    // in Double instead lands just below 153ms and truncates to 152ms.
    const progress = Math.fround(0.3549883961677551);
    expect(
      samplePaneMotionVectorSpringAtPlayTime(initialRect, targetRect, 152),
    ).toEqual([449, 90, 949, 190]);
    expect(
      samplePaneMotionVectorSpringAtPlayTime(initialRect, targetRect, 153),
    ).toEqual([450, 90, 950, 190]);
    expect(
      samplePaneMotionVectorSpringAtProgress(initialRect, targetRect, progress),
    ).toEqual([450, 90, 950, 190]);
  });

  it('saturates Int converters after an extreme spring overshoot', () => {
    const raw = samplePaneMotionSpring(-2147483648, 2147483647, 269);
    expect(raw).toBe(2212613120);
    expect(
      samplePaneMotionVectorSpringAtPlayTime(
        [-2147483648],
        [2147483647],
        269,
        1,
      ),
    ).toEqual([2147483647]);
  });

  it('rounds IntRect, IntOffset, and IntSize vector samples but keeps Float visibility continuous', () => {
    const raw = samplePaneMotionSpring(0, 500, 100);
    const intOffset = samplePaneMotionVectorSpringAtPlayTime([0, 0], [500, 0], 100, 1);
    expect(intOffset).toEqual([Math.round(raw), 0]);
    expect(Number.isInteger(intOffset[0])).toBe(true);

    const intRect = samplePaneMotionVectorSpringAtProgress(
      [0, 0, 500, 400],
      [24, 16, 824, 716],
      0.5,
      [1, 1, 1, 1],
    );
    expect(intRect.every(Number.isInteger)).toBe(true);

    const delayedIntOffset = samplePaneMotionDelayedVectorSpringAtPlayTime(
      [500, 0],
      [0, 0],
      250,
      1,
    );
    expect(delayedIntOffset.every(Number.isInteger)).toBe(true);

    const floatVisibility = samplePaneMotionVectorSpringAtPlayTime(
      [0],
      [1],
      100,
      PaneMotionDefaultDisplacementThreshold,
    )[0]!;
    expect(floatVisibility).toBe(samplePaneMotionSpring(0, 1, 100));
    expect(Number.isInteger(floatVisibility)).toBe(false);
  });

  it('ports DelayedSpringSpec nanos duration and hold phase', () => {
    // 431ms spring duration -> (431_000_000L * 0.1f).toLong() = 43.1ms delay.
    expect(calculatePaneMotionDelayedSpringDurationMs([0], [500])).toBeCloseTo(474.1, 6);
    expect(samplePaneMotionDelayedSpringAtPlayTime(0, 500, 43.1, 431)).toBe(0);
    // The delayed spring then truncates its own play time to whole milliseconds,
    // so 44ms still has only 0.9ms of spring time and remains at the start value.
    expect(samplePaneMotionDelayedSpringAtPlayTime(0, 500, 44, 431)).toBe(0);
    expect(samplePaneMotionDelayedSpringAtPlayTime(0, 500, 44.1, 431)).toBeGreaterThan(0);
  });
});
