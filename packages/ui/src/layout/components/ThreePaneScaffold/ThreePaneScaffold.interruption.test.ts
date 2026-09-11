import { describe, expect, it } from 'vitest';
import {
  AnimationCoreInterruptionSpringSpec,
  MaterialPaneSpringSpec,
  sampleAnimationSpringMotion,
} from '../../adaptive/animationSpring';
import {
  PaneMotionDefaultDisplacementThreshold,
  calculatePaneMotionDelayedSpringDurationMs,
} from '../../adaptive/paneMotionSpring';
import {
  calculatePaneTransitionTrackDurationMs,
  capturePaneTransitionTrack,
  retargetPaneTransitionTrack,
  samplePaneTransitionTrack,
  type PaneTransitionTrack,
} from './ThreePaneScaffold.interruption';

function offsetTrack(
  initialValue: number,
  targetValue: number,
  playTimeMs: number,
): PaneTransitionTrack {
  return {
    initialValue,
    targetValue,
    initialVelocity: 0,
    playTimeMs,
    visibilityThreshold: 1,
    quantizationStep: 1,
    spec: 'material',
  };
}

function opacityTrack(
  initialValue: number,
  targetValue: number,
  playTimeMs: number,
): PaneTransitionTrack {
  return {
    initialValue,
    targetValue,
    initialVelocity: 0,
    playTimeMs,
    visibilityThreshold: PaneMotionDefaultDisplacementThreshold,
    spec: 'material',
  };
}

describe('SeekableTransitionState child interruption', () => {
  it('continues the old child animation when its target value is unchanged', () => {
    const oldTrack = offsetTrack(1000, 0, 140);
    const current = samplePaneTransitionTrack(oldTrack).value;
    const retargeted = retargetPaneTransitionTrack({
      fromValue: current,
      toValue: 0,
      fromTrack: oldTrack,
      fallbackVisibilityThreshold: 1,
      fallbackQuantizationStep: 1,
    })!;

    expect(retargeted.useOnlyInitialValue).toBe(true);
    expect(samplePaneTransitionTrack(retargeted, 60, 60).value).toBe(
      samplePaneTransitionTrack(oldTrack, 200).value,
    );
  });

  it('keeps retained-only active velocity at zero on the next retarget', () => {
    const first = offsetTrack(1000, 0, 80);
    const firstNow = samplePaneTransitionTrack(first);
    const retainedOnly = retargetPaneTransitionTrack({
      fromValue: firstNow.value,
      toValue: 0,
      fromTrack: first,
      fallbackVisibilityThreshold: 1,
      fallbackQuantizationStep: 1,
    })!;
    const retainedSample = samplePaneTransitionTrack(retainedOnly, 40, 40);
    const next = retargetPaneTransitionTrack({
      fromValue: retainedSample.value,
      toValue: -1000,
      fromTrack: retainedOnly,
      toTrack: offsetTrack(0, -1000, 0),
      fallbackVisibilityThreshold: 1,
      fallbackQuantizationStep: 1,
    })!;

    expect(retainedOnly.useOnlyInitialValue).toBe(true);
    expect(retainedSample.velocity).toBe(0);
    expect(next.initialVelocity).toBe(0);
  });

  it('uses the animation-core interruption spring for derived offset tracks', () => {
    const oldTrack = offsetTrack(1000, 0, 140);
    const oldNow = samplePaneTransitionTrack(oldTrack);
    const retargeted = retargetPaneTransitionTrack({
      fromValue: oldNow.value,
      toValue: -1000,
      fromTrack: oldTrack,
      toTrack: offsetTrack(0, -1000, 0),
      fallbackVisibilityThreshold: 1,
      fallbackQuantizationStep: 1,
    })!;

    const elapsedMs = 60;
    const movingInitial = samplePaneTransitionTrack(oldTrack, 200).value;
    const expected = sampleAnimationSpringMotion(
      AnimationCoreInterruptionSpringSpec,
      movingInitial,
      -1000,
      elapsedMs,
      oldNow.velocity,
    );
    const actual = samplePaneTransitionTrack(retargeted, elapsedMs, elapsedMs);

    expect(retargeted.spec).toBe('interruption');
    expect(retargeted.initialVelocity).toBe(oldNow.velocity);
    expect(actual.value).toBe(Math.round(expected.value));
  });

  it('drops a delayed derived spec when the running target changes', () => {
    const oldTrack = offsetTrack(-600, 0, 80);
    const oldNow = samplePaneTransitionTrack(oldTrack);
    const delayedTarget: PaneTransitionTrack = {
      ...offsetTrack(0, 500, 0),
      spec: 'delayed-material',
    };
    const retargeted = retargetPaneTransitionTrack({
      fromValue: oldNow.value,
      toValue: 500,
      fromTrack: oldTrack,
      toTrack: delayedTarget,
      fallbackVisibilityThreshold: 1,
      fallbackQuantizationStep: 1,
    })!;

    expect(retargeted.spec).toBe('interruption');
    expect(samplePaneTransitionTrack(retargeted, 20, 20).value).not.toBe(oldNow.value);
  });

  it('keeps a newly created delayed child on its declared nanos-quantized spec', () => {
    const delayedTarget: PaneTransitionTrack = {
      ...offsetTrack(600, 0, 0),
      spec: 'delayed-material',
    };
    const retargeted = retargetPaneTransitionTrack({
      fromValue: 600,
      toValue: 0,
      toTrack: delayedTarget,
      fallbackVisibilityThreshold: 1,
      fallbackQuantizationStep: 1,
    })!;

    expect(retargeted.spec).toBe('delayed-material');
    expect(retargeted.initialValueAnimation).toBeUndefined();
    expect(calculatePaneTransitionTrackDurationMs(retargeted)).toBe(
      calculatePaneMotionDelayedSpringDurationMs([600, 0], [0, 0], [1, 1]),
    );
    expect(samplePaneTransitionTrack(retargeted, 1).value).toBe(600);
  });

  it('keeps the direct Material visibility SpringSpec and incoming velocity', () => {
    const oldTrack = opacityTrack(0, 1, 80);
    const oldNow = samplePaneTransitionTrack(oldTrack);
    const retargeted = retargetPaneTransitionTrack({
      fromValue: oldNow.value,
      toValue: 0,
      fromTrack: oldTrack,
      toTrack: opacityTrack(1, 0, 0),
      fallbackVisibilityThreshold: PaneMotionDefaultDisplacementThreshold,
    })!;

    const elapsedMs = 40;
    const movingInitial = samplePaneTransitionTrack(oldTrack, 120).value;
    const expected = sampleAnimationSpringMotion(
      MaterialPaneSpringSpec,
      movingInitial,
      0,
      elapsedMs,
      oldNow.velocity,
    );
    const actual = samplePaneTransitionTrack(retargeted, elapsedMs, elapsedMs);

    expect(retargeted.spec).toBe('material');
    expect(retargeted.initialVelocity).toBe(oldNow.velocity);
    expect(actual.value).toBe(expected.value);
  });

  it('delays a seek-time child target update until the current play time', () => {
    const updated: PaneTransitionTrack = {
      ...offsetTrack(600, 0, 0),
      seekStartPlayTimeMs: 80,
    };

    expect(samplePaneTransitionTrack(updated, 80).value).toBe(600);
    expect(samplePaneTransitionTrack(updated, 120).value).not.toBe(600);
    expect(calculatePaneTransitionTrackDurationMs(updated)).toBeGreaterThan(80);
  });

  it('captures a seek-delayed child using local consumed play time', () => {
    const updated: PaneTransitionTrack = {
      ...offsetTrack(600, 0, 0),
      seekStartPlayTimeMs: 80,
    };
    const captured = capturePaneTransitionTrack(updated, 120, 0);

    expect(captured.seekStartPlayTimeMs).toBeUndefined();
    expect(captured.playTimeMs).toBe(40);
    expect(samplePaneTransitionTrack(captured).value).toBe(
      samplePaneTransitionTrack(updated, 120).value,
    );
  });

  it('retains the initial-value chain across a second retarget', () => {
    const first = offsetTrack(1000, 0, 100);
    const firstValue = samplePaneTransitionTrack(first).value;
    const second = retargetPaneTransitionTrack({
      fromValue: firstValue,
      toValue: -1000,
      fromTrack: first,
      toTrack: offsetTrack(0, -1000, 0),
      fallbackVisibilityThreshold: 1,
      fallbackQuantizationStep: 1,
    })!;
    const capturedSecond = capturePaneTransitionTrack(second, 50, 50);
    const secondValue = samplePaneTransitionTrack(capturedSecond).value;
    const third = retargetPaneTransitionTrack({
      fromValue: secondValue,
      toValue: 0,
      fromTrack: capturedSecond,
      toTrack: offsetTrack(-1000, 0, 0),
      fallbackVisibilityThreshold: 1,
      fallbackQuantizationStep: 1,
    })!;

    expect(second.spec).toBe('interruption');
    expect(third.spec).toBe('interruption');
    expect(third.initialValueAnimation).toBe(capturedSecond);
    expect(Number.isFinite(samplePaneTransitionTrack(third, 40, 40).value)).toBe(true);
  });

  it('saturates interrupted Int tracks through fastRoundToInt', () => {
    const track: PaneTransitionTrack = {
      initialValue: 2147483000,
      targetValue: 2147483647,
      initialVelocity: 10_000_000_000,
      playTimeMs: 0,
      visibilityThreshold: 1,
      quantizationStep: 1,
      spec: 'interruption',
    };

    expect(samplePaneTransitionTrack(track, 1).value).toBe(2147483647);
  });
});
