import { describe, expect, it } from 'vitest';
import {
  PredictiveBackMinScale,
  PredictiveBackScaleCollector,
  calculatePredictiveBackReturnSpringDurationMs,
  calculatePredictiveBackScale,
  collectPredictiveBackScaleEmission,
  getPredictiveBackLayerStyle,
  getPredictiveBackScale,
  samplePredictiveBackReturnSpring,
} from './ThreePaneScaffold.predictiveBack';

describe('predictive-back scaffold scale', () => {
  it('matches the pinned AndroidX Float decay curve', () => {
    expect(calculatePredictiveBackScale(0)).toBe(1);
    expect(calculatePredictiveBackScale(0.25)).toBe(0.9545454382896423);
    expect(calculatePredictiveBackScale(0.5)).toBe(0.9523809552192688);
    expect(calculatePredictiveBackScale(1)).toBe(0.9512194991111755);
    expect(calculatePredictiveBackScale(1)).toBeGreaterThan(PredictiveBackMinScale);
  });

  it('decreases monotonically toward the 0.95 minimum scale', () => {
    const samples = [0, 0.25, 0.5, 0.75, 1].map(calculatePredictiveBackScale);
    for (let index = 1; index < samples.length; index += 1) {
      expect(samples[index]).toBeLessThan(samples[index - 1]!);
      expect(samples[index]).toBeGreaterThan(PredictiveBackMinScale);
    }
  });

  it('collects only progress-fraction changes like snapshotFlow', () => {
    let previousProgress = 0;

    const predictive = collectPredictiveBackScaleEmission(previousProgress, {
      progressFraction: 0.5,
      isPredictiveBackInProgress: true,
    });
    expect(predictive).toEqual({
      type: 'snap',
      progressFraction: 0.5,
      scale: 0.9523809552192688,
    });
    previousProgress = predictive.progressFraction;

    // CollectPredictiveBackScale observes snapshotFlow { progressFraction }.
    // A flag-only change therefore emits nothing and leaves Animatable untouched.
    expect(
      collectPredictiveBackScaleEmission(previousProgress, {
        progressFraction: 0.5,
        isPredictiveBackInProgress: false,
      }),
    ).toEqual({ type: 'none', progressFraction: 0.5 });

    expect(
      collectPredictiveBackScaleEmission(previousProgress, {
        progressFraction: 0.6,
        isPredictiveBackInProgress: false,
      }),
    ).toEqual({ type: 'return', progressFraction: Math.fround(0.6) });
  });

  it('serializes return animation and conflates pending snapshotFlow changes', () => {
    const collector = new PredictiveBackScaleCollector();

    expect(
      collector.collect({
        progressFraction: 0.5,
        isPredictiveBackInProgress: true,
      }),
    ).toEqual({
      type: 'snap',
      progressFraction: 0.5,
      scale: 0.9523809552192688,
    });

    expect(
      collector.collect({
        progressFraction: 0.6,
        isPredictiveBackInProgress: false,
      }),
    ).toEqual({ type: 'return', progressFraction: Math.fround(0.6) });

    // Flow collection is suspended inside Animatable.animateTo(1f). The
    // one-slot snapshotFlow channel only records that another read is needed;
    // intermediate fractions do not restart the in-flight spring.
    expect(
      collector.collect({
        progressFraction: 0.7,
        isPredictiveBackInProgress: false,
      }),
    ).toEqual({ type: 'none', progressFraction: Math.fround(0.6) });
    expect(
      collector.collect({
        progressFraction: 0.8,
        isPredictiveBackInProgress: false,
      }),
    ).toEqual({ type: 'none', progressFraction: Math.fround(0.6) });

    expect(collector.completeReturn(false)).toEqual({
      type: 'return',
      progressFraction: Math.fround(0.8),
    });
  });

  it('reads the latest predictive flag when a pending flow value resumes', () => {
    const collector = new PredictiveBackScaleCollector();
    collector.collect({ progressFraction: 0.5, isPredictiveBackInProgress: true });
    collector.collect({ progressFraction: 0.6, isPredictiveBackInProgress: false });
    collector.collect({ progressFraction: 0.75, isPredictiveBackInProgress: false });

    // The collect lambda reads isPredictiveBackInProgress only after the
    // suspended return animation finishes, so a flag-only change in between is
    // visible even though it did not itself trigger snapshotFlow.
    expect(collector.completeReturn(true)).toEqual({
      type: 'snap',
      progressFraction: 0.75,
      scale: calculatePredictiveBackScale(0.75),
    });
  });

  it('drops pending flow work when LaunchedEffect state identity is cancelled', () => {
    const collector = new PredictiveBackScaleCollector();
    collector.collect({ progressFraction: 0.5, isPredictiveBackInProgress: true });
    collector.collect({ progressFraction: 0.6, isPredictiveBackInProgress: false });
    collector.collect({ progressFraction: 0.8, isPredictiveBackInProgress: false });

    collector.cancelReturn();

    // previousValue is remembered outside LaunchedEffect, but the old
    // snapshotFlow channel is discarded. The replacement collector starts from
    // the new state's current progress instead of replaying 0.8.
    expect(
      collector.collect({
        progressFraction: 0.7,
        isPredictiveBackInProgress: true,
      }),
    ).toEqual({
      type: 'snap',
      progressFraction: Math.fround(0.7),
      scale: calculatePredictiveBackScale(0.7),
    });
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

  it('samples the critically damped return spring at Compose Float precision', () => {
    const initialScale = calculatePredictiveBackScale(0.5);
    expect(samplePredictiveBackReturnSpring(initialScale, 0)).toBe(initialScale);
    expect(samplePredictiveBackReturnSpring(initialScale, 16)).toBe(
      0.9584963321685791,
    );
    expect(samplePredictiveBackReturnSpring(initialScale, 32)).toBe(
      0.9691213369369507,
    );
    expect(samplePredictiveBackReturnSpring(initialScale, 64)).toBe(
      0.9861097931861877,
    );
    expect(samplePredictiveBackReturnSpring(initialScale, 75)).toBe(1);
  });

  it('preserves Compose estimator semantics around the Float visibility threshold', () => {
    const nonZeroWithinThreshold = calculatePredictiveBackScale(0.0032);
    expect(1 - nonZeroWithinThreshold).toBeLessThan(0.01);
    expect(calculatePredictiveBackReturnSpringDurationMs(nonZeroWithinThreshold)).toBe(35);
    expect(samplePredictiveBackReturnSpring(nonZeroWithinThreshold, 0)).toBe(
      nonZeroWithinThreshold,
    );
    expect(samplePredictiveBackReturnSpring(nonZeroWithinThreshold, 35)).toBe(1);

    const immediateWithinThreshold = calculatePredictiveBackScale(0.005);
    expect(1 - immediateWithinThreshold).toBeLessThan(0.01);
    expect(calculatePredictiveBackReturnSpringDurationMs(immediateWithinThreshold)).toBe(0);
    expect(samplePredictiveBackReturnSpring(immediateWithinThreshold, 0)).toBe(1);
  });

  it('keeps predictive scale on a dedicated center-origin graphics layer', () => {
    expect(getPredictiveBackLayerStyle(calculatePredictiveBackScale(0.5))).toEqual({
      scale: 0.9523809552192688,
      transformOrigin: 'center center',
    });
  });

  it('validates return-spring input', () => {
    expect(() => calculatePredictiveBackReturnSpringDurationMs(0)).toThrow(RangeError);
    expect(() =>
      calculatePredictiveBackReturnSpringDurationMs(Number.MAX_VALUE),
    ).toThrow(RangeError);
    expect(() => samplePredictiveBackReturnSpring(0.95, Number.NaN)).toThrow(RangeError);
  });
});
