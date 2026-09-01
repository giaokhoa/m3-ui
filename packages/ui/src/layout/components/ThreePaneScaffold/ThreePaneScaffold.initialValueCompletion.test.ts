import { describe, expect, it } from 'vitest';
import {
  capturePaneTransitionTrack,
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

describe('ThreePaneScaffold retained initial-value lifecycle', () => {
  it('freezes an older retained state into a running active child on retarget', () => {
    const nested: PaneTransitionTrack = {
      ...track(0, 100, 0),
      retainedCompletionPlayTimeMs: 200,
    };
    const source = track(0, -100, 50, nested);
    const before = samplePaneTransitionTrack(source, source.playTimeMs, 50);

    const captured = capturePaneTransitionTrack(source, source.playTimeMs, 50);
    const after = samplePaneTransitionTrack(captured);

    expect(captured.initialValueAnimation).toBeUndefined();
    expect(captured.initialValue).toBe(samplePaneTransitionTrack(nested, 50).value);
    expect(after.value).toBe(before.value);

    const retargeted = retargetPaneTransitionTrack({
      fromValue: after.value,
      toValue: 200,
      fromTrack: captured,
      toTrack: track(-100, 200, 0),
      sourceTransitionDurationMs: 300,
      fallbackVisibilityThreshold: 1,
      fallbackQuantizationStep: 1,
    });

    // Retargeting retains the captured child state but adds the owning
    // Transition completion clock, so it is intentionally a metadata copy
    // rather than the exact captured object.
    expect(retargeted?.initialValueAnimation).not.toBe(captured);
    expect(retargeted?.initialValueAnimation).toMatchObject(captured);
    expect(retargeted?.initialValueAnimation?.initialValueAnimation).toBeUndefined();
    expect(retargeted?.initialValueAnimation?.retainedCompletionPlayTimeMs).toBe(300);
  });

  it('keeps the older retained state when the active child is use-only', () => {
    const retained: PaneTransitionTrack = {
      ...track(0, 100, 50),
      retainedCompletionPlayTimeMs: 200,
    };
    const source: PaneTransitionTrack = {
      ...track(20, 100, 0, retained),
      useOnlyInitialValue: true,
    };
    const before = samplePaneTransitionTrack(source, 0, 50);

    const captured = capturePaneTransitionTrack(source, 0, 50);

    expect(captured.useOnlyInitialValue).toBe(true);
    expect(captured.initialValueAnimation).toBeDefined();
    expect(captured.initialValueAnimation?.playTimeMs).toBe(100);
    expect(captured.initialValueAnimation?.retainedCompletionPlayTimeMs).toBe(200);
    expect(samplePaneTransitionTrack(captured).value).toBe(before.value);

    const next = retargetPaneTransitionTrack({
      fromValue: before.value,
      toValue: -100,
      fromTrack: captured,
      toTrack: track(100, -100, 0),
      sourceTransitionDurationMs: 300,
      fallbackVisibilityThreshold: 1,
      fallbackQuantizationStep: 1,
    });

    expect(next?.initialValueAnimation).toBe(captured.initialValueAnimation);
    expect(next?.initialValueAnimation).not.toBe(captured);
    expect(next?.initialValueAnimation?.retainedCompletionPlayTimeMs).toBe(200);
    expect(next?.initialVelocity).toBe(0);
  });

  it('collapses a use-only retained state once its retained timeline completes', () => {
    const retained: PaneTransitionTrack = {
      ...track(0, 100, 150),
      retainedCompletionPlayTimeMs: 200,
    };
    const source: PaneTransitionTrack = {
      ...track(20, 100, 0, retained),
      useOnlyInitialValue: true,
    };
    const retainedAtCompletion = samplePaneTransitionTrack(retained, 200).value;
    const before = samplePaneTransitionTrack(source, 0, 50);

    const captured = capturePaneTransitionTrack(source, 0, 50);
    const after = samplePaneTransitionTrack(captured);

    // The retained Transition clock reaching completion means the moving
    // initial-value wrapper is discarded. It does not retroactively force a
    // synthetic child spring to its target; freeze the child sample at that
    // exact play time (99 here after Int quantization).
    expect(before.value).toBe(retainedAtCompletion);
    expect(captured.initialValueAnimation).toBeUndefined();
    expect(captured.useOnlyInitialValue).toBeUndefined();
    expect(captured.initialValue).toBe(retainedAtCompletion);
    expect(captured.targetValue).toBe(retainedAtCompletion);
    expect(after.value).toBe(before.value);
  });
});