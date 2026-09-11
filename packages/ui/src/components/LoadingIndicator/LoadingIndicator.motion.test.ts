import { describe, expect, it } from 'vitest';
import {
  estimateSpringDurationMs,
  indeterminateLoadingFrame,
  loadingIndicatorSpringDurationMs,
  springMorphProgress,
} from './LoadingIndicator.motion';

describe('Material 3 Loading Indicator motion', () => {
  it('matches the AndroidX under-damped spring duration estimate', () => {
    expect(estimateSpringDurationMs()).toBe(297);
    expect(loadingIndicatorSpringDurationMs).toBe(297);
  });

  it('preserves spring overshoot before settling', () => {
    expect(springMorphProgress(0)).toBe(0);
    expect(springMorphProgress(200)).toBeGreaterThan(1);
    expect(springMorphProgress(296)).toBeGreaterThan(1);
  });

  it('snaps to the target for the hold portion of the 650ms interval', () => {
    expect(springMorphProgress(297)).toBe(1);
    expect(springMorphProgress(649)).toBe(1);
  });

  it('advances one morph exactly at the next 650ms cadence', () => {
    expect(indeterminateLoadingFrame(649, 7)).toMatchObject({
      morphIndex: 0,
      morphProgress: 1,
    });
    expect(indeterminateLoadingFrame(650, 7)).toMatchObject({
      morphIndex: 1,
      morphProgress: 0,
    });
  });

  it('wraps the seven-shape sequence', () => {
    expect(indeterminateLoadingFrame(650 * 7, 7).morphIndex).toBe(0);
  });
});
