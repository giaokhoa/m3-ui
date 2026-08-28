import { describe, expect, it } from 'vitest';
import {
  PredictiveBackMinScale,
  calculatePredictiveBackScale,
  getPredictiveBackScaffoldStyle,
} from './ThreePaneScaffold.predictiveBack';

describe('predictive-back scaffold scale', () => {
  it('matches the pinned AndroidX decay curve', () => {
    expect(calculatePredictiveBackScale(0)).toBe(1);
    expect(calculatePredictiveBackScale(0.25)).toBeCloseTo(0.9545454545, 9);
    expect(calculatePredictiveBackScale(0.5)).toBeCloseTo(0.9523809524, 9);
    expect(calculatePredictiveBackScale(1)).toBeCloseTo(0.9512195122, 9);
    expect(calculatePredictiveBackScale(1)).toBeGreaterThan(PredictiveBackMinScale);
  });

  it('decreases monotonically toward the 0.95 minimum scale', () => {
    const samples = [0, 0.25, 0.5, 0.75, 1].map(calculatePredictiveBackScale);
    for (let index = 1; index < samples.length; index += 1) {
      expect(samples[index]).toBeLessThan(samples[index - 1]!);
      expect(samples[index]).toBeGreaterThan(PredictiveBackMinScale);
    }
  });

  it('leaves static scaffold styles untouched', () => {
    const style = { width: 480 } as const;
    expect(
      getPredictiveBackScaffoldStyle(style, {
        progressFraction: 0.5,
        isPredictiveBackInProgress: false,
      }),
    ).toBe(style);
    expect(getPredictiveBackScaffoldStyle(style, undefined)).toBe(style);
  });

  it('scales around the center while preserving an existing transform', () => {
    expect(
      getPredictiveBackScaffoldStyle(
        { transform: 'translateX(8px)' },
        { progressFraction: 0.5, isPredictiveBackInProgress: true },
      ),
    ).toEqual({
      transform: 'translateX(8px) scale(0.9523809523809523)',
      transformOrigin: 'center center',
    });
  });

  it('preserves an explicit transform origin', () => {
    expect(
      getPredictiveBackScaffoldStyle(
        { transformOrigin: 'left top' },
        { progressFraction: 1, isPredictiveBackInProgress: true },
      ),
    ).toMatchObject({ transformOrigin: 'left top' });
  });
});
