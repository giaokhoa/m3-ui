import { describe, expect, it } from 'vitest';
import {
  PredictiveBackMinScale,
  calculatePredictiveBackReturnSpringDurationMs,
  calculatePredictiveBackScale,
  getPredictiveBackLayerStyle,
  getPredictiveBackScale,
  samplePredictiveBackReturnSpring,
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

  it('exposes no seek scale outside predictive back', () => {
    expect(getPredictiveBackScale(undefined)).toBeUndefined();
    expect(
      getPredictiveBackScale({
        progressFraction: 0.5,
        isPredictiveBackInProgress: false,
      }),
    ).toBeUndefined();
  });

  it('uses Animatable default Float spring duration when returning to 1', () => {
    expect(
      calculatePredictiveBackReturnSpringDurationMs(
        calculatePredictiveBackScale(0.25),
      ),
    ).toBe(74);
    expect(
      calculatePredictiveBackReturnSpringDurationMs(
        calculatePredictiveBackScale(0.5),
      ),
    ).toBe(75);
    expect(
      calculatePredictiveBackReturnSpringDurationMs(
        calculatePredictiveBackScale(1),
      ),
    ).toBe(76);
  });

  it('samples the critically damped return spring at Compose millisecond precision', () => {
    const initialScale = calculatePredictiveBackScale(0.5);
    expect(samplePredictiveBackReturnSpring(initialScale, 0)).toBe(initialScale);
    expect(samplePredictiveBackReturnSpring(initialScale, 16)).toBeCloseTo(
      0.95849630499,
      10,
    );
    expect(samplePredictiveBackReturnSpring(initialScale, 32)).toBeCloseTo(
      0.96912132237,
      10,
    );
    expect(samplePredictiveBackReturnSpring(initialScale, 64)).toBeCloseTo(
      0.98610978208,
      10,
    );
    expect(samplePredictiveBackReturnSpring(initialScale, 75)).toBe(1);
  });

  it('finishes immediately when the snapped scale is already within the Float threshold', () => {
    const initialScale = calculatePredictiveBackScale(0.005);
    expect(initialScale).toBeCloseTo(0.9916666667, 9);
    expect(calculatePredictiveBackReturnSpringDurationMs(initialScale)).toBe(0);
    expect(samplePredictiveBackReturnSpring(initialScale, 1)).toBe(1);
  });

  it('keeps predictive scale on a dedicated center-origin graphics layer', () => {
    expect(getPredictiveBackLayerStyle(calculatePredictiveBackScale(0.5))).toEqual({
      scale: 0.9523809523809523,
      transformOrigin: 'center center',
    });
  });

  it('validates return-spring input', () => {
    expect(() => calculatePredictiveBackReturnSpringDurationMs(0)).toThrow(RangeError);
    expect(() => samplePredictiveBackReturnSpring(0.95, Number.NaN)).toThrow(RangeError);
  });
});
