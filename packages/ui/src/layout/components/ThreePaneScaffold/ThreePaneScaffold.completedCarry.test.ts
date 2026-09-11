import { describe, expect, it } from 'vitest';
import {
  retargetPaneTransitionTrack,
  samplePaneTransitionTrack,
  type PaneTransitionTrack,
} from './ThreePaneScaffold.interruption';

function track(
  initialValue: number,
  targetValue: number,
  playTimeMs: number,
  initialValueAnimation?: PaneTransitionTrack,
): PaneTransitionTrack {
  return {
    initialValue,
    targetValue,
    initialVelocity: 0,
    playTimeMs,
    visibilityThreshold: 1,
    quantizationStep: 1,
    spec: 'material',
    initialValueAnimation,
  };
}

describe('ThreePaneScaffold completed interruption carry', () => {
  it('does not retain a completed direct source child', () => {
    const source = track(0, 100, 10_000);
    const destination = track(100, -100, 0);
    const current = samplePaneTransitionTrack(source);

    const retargeted = retargetPaneTransitionTrack({
      fromValue: current.value,
      toValue: -100,
      fromTrack: source,
      toTrack: destination,
      fallbackVisibilityThreshold: 1,
      fallbackQuantizationStep: 1,
    });

    expect(current.value).toBe(100);
    expect(retargeted?.initialValueAnimation).toBeUndefined();
    expect(retargeted?.initialVelocity).toBe(0);
  });

  it('retains a completed child while its initial-value animation is still moving', () => {
    const movingInitial = track(0, 100, 0);
    const source = track(0, -100, 10_000, movingInitial);
    const destination = track(-100, 200, 0);
    const current = samplePaneTransitionTrack(source);

    const retargeted = retargetPaneTransitionTrack({
      fromValue: current.value,
      toValue: 200,
      fromTrack: source,
      toTrack: destination,
      fallbackVisibilityThreshold: 1,
      fallbackQuantizationStep: 1,
    });

    expect(current.value).toBe(-100);
    expect(retargeted?.initialValueAnimation).toBe(source);
  });
});
