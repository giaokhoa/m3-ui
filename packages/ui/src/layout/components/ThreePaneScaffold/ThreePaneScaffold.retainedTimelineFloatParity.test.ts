import { describe, expect, it } from 'vitest';
import {
  retargetPaneTransitionTrack,
  samplePaneTransitionTrack,
  type PaneTransitionTrack,
} from './ThreePaneScaffold.interruption';

const MillisToNanos = 1_000_000;

function materialIntTrack(playTimeMs: number, targetValue = 1000): PaneTransitionTrack {
  return {
    initialValue: 0,
    targetValue,
    initialVelocity: 0,
    playTimeMs,
    visibilityThreshold: 1,
    quantizationStep: 1,
    spec: 'material',
  };
}

describe('ThreePaneScaffold retained timeline Float parity', () => {
  it('samples a retained child from SeekingAnimationState Float progress instead of adding elapsed ms', () => {
    const sourceDurationMs = 175;
    const sourceDurationNanos = sourceDurationMs * MillisToNanos;
    const sourceProgressFraction = Math.fround(0.9103273749351501);
    const sourcePlayTimeMs =
      Math.round(sourceDurationNanos * sourceProgressFraction) / MillisToNanos;
    const source = materialIntTrack(sourcePlayTimeMs);

    const retained = retargetPaneTransitionTrack({
      fromValue: samplePaneTransitionTrack(source).value,
      toValue: source.targetValue,
      fromTrack: source,
      sourceTransitionDurationMs: sourceDurationMs,
      sourceTransitionProgressFraction: sourceProgressFraction,
      fallbackVisibilityThreshold: 1,
      fallbackQuantizationStep: 1,
    });

    expect(retained?.useOnlyInitialValue).toBe(true);
    expect(retained?.initialValueAnimation).toBeDefined();

    const elapsedMs = 2.692709;
    const sampled = samplePaneTransitionTrack(retained!, 0, elapsedMs).value;

    // AndroidX updateInitialValue():
    //   animationSpecDuration = round(175ms * (1 - startFraction)) = 15.692709ms
    //   value = Float lerp(startFraction, 1f, 2.692709 / 15.692709)
    //   initialPlayTime = round(175ms * value.toDouble()) = 161.999995ms
    // FloatSpringSpec then truncates to 161ms before sampling the spring.
    const composeSample = samplePaneTransitionTrack(source, 161.999995).value;
    const oldAddedElapsedSample = samplePaneTransitionTrack(source, 162).value;

    expect(composeSample).toBe(922);
    expect(oldAddedElapsedSample).toBe(924);
    expect(sampled).toBe(composeSample);
    expect(sampled).not.toBe(oldAddedElapsedSample);
  });

  it('continues the original running SeekingAnimationState instead of restarting from its current fraction', () => {
    const sourceDurationMs = 344;
    const sourceDurationNanos = sourceDurationMs * MillisToNanos;
    const runningStartFraction = Math.fround(0.4611676335334778);
    const runningProgressMs = 43.281411;
    const animationSpecDurationNanos = Math.round(
      sourceDurationNanos * (1 - runningStartFraction),
    );
    const runningTimelineFraction = Math.fround(
      Math.fround(runningProgressMs * MillisToNanos) /
        Math.fround(animationSpecDurationNanos),
    );
    const currentFraction = Math.fround(
      Math.fround(
        Math.fround(1 - runningTimelineFraction) * runningStartFraction,
      ) + runningTimelineFraction,
    );
    const sourcePlayTimeMs =
      Math.round(sourceDurationNanos * currentFraction) / MillisToNanos;
    const source = materialIntTrack(sourcePlayTimeMs, 2000);

    const retained = retargetPaneTransitionTrack({
      fromValue: samplePaneTransitionTrack(source).value,
      toValue: source.targetValue,
      fromTrack: source,
      sourceTransitionDurationMs: sourceDurationMs,
      sourceTransitionProgressFraction: currentFraction,
      sourceTransitionRunningTimeline: {
        durationMs: sourceDurationMs,
        startFraction: runningStartFraction,
        progressMs: runningProgressMs,
      },
      fallbackVisibilityThreshold: 1,
      fallbackQuantizationStep: 1,
    });

    const elapsedMs = 22.076915;
    const sampled = samplePaneTransitionTrack(retained!, 0, elapsedMs).value;

    // Continuing the original SeekingAnimationState reaches 223.999984ms,
    // while restarting from currentFraction reaches 224.000004ms. The
    // FloatSpringSpec millisecond truncation therefore samples 223ms vs 224ms.
    expect(samplePaneTransitionTrack(source, 223.999984).value).toBe(2011);
    expect(samplePaneTransitionTrack(source, 224.000004).value).toBe(2012);
    expect(sampled).toBe(2011);
  });
});