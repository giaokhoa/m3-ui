import { describe, expect, it } from 'vitest';
import {
  PaneMotionDefaultDisplacementThreshold,
  calculatePaneMotionDelayedSpringDurationMs,
  calculatePaneMotionSpringDurationMs,
  calculatePaneMotionVectorSpringDurationMs,
  samplePaneMotionDelayedSpringAtPlayTime,
  samplePaneMotionSpring,
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

  it('samples the pinned under-damped SpringSimulation response', () => {
    expect(samplePaneMotionSpring(0, 1, 0)).toBe(0);
    expect(samplePaneMotionSpring(0, 1, 50)).toBeCloseTo(0.28017744, 7);
    expect(samplePaneMotionSpring(0, 1, 100)).toBeCloseTo(0.65983106, 7);
    expect(samplePaneMotionSpring(0, 1, 328)).toBeCloseTo(1.00973937, 7);
  });

  it('preserves initial velocity for pane-expansion anchor settling', () => {
    expect(samplePaneMotionSpring(510, 750, 50, 250)).toBeCloseTo(582.65297362, 7);
    expect(samplePaneMotionSpring(510, 750, 100, 250)).toBeCloseTo(672.49651081, 7);
    expect(calculatePaneMotionSpringDurationMs(510, 750, 1, 250)).toBe(381);
  });

  it('keeps spring motion when position already equals target but velocity remains', () => {
    expect(samplePaneMotionSpring(500, 500, 50, 250)).toBeCloseTo(505.41038803, 7);
    expect(samplePaneMotionSpring(500, 500, 100, 250)).toBeCloseTo(504.13705697, 7);
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

  it('ports DelayedSpringSpec duration and hold phase', () => {
    expect(calculatePaneMotionDelayedSpringDurationMs([0], [500])).toBe(474);
    expect(samplePaneMotionDelayedSpringAtPlayTime(0, 500, 43, 431)).toBe(0);
    expect(samplePaneMotionDelayedSpringAtPlayTime(0, 500, 44, 431)).toBeGreaterThan(0);
  });
});
