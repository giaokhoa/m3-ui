import { describe, expect, it } from 'vitest';
import {
  retargetPaneTransitionTrack,
  samplePaneTransitionTrack,
  type PaneTransitionTrack,
} from './ThreePaneScaffold.interruption';

const MillisToNanos = 1_000_000;

function materialIntTrack(playTimeMs: number): PaneTransitionTrack {
  return {
    initialValue: 0,
    targetValue: 1000,
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
});
