import { describe, expect, it, vi } from 'vitest';
import { PaneAdaptedValue, type ThreePaneScaffoldValue } from './threePaneScaffold';
import {
  MutableThreePaneScaffoldState,
  threePaneScaffoldValuesEqual,
} from './threePaneScaffoldState';

const hidden: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Hidden,
  secondary: PaneAdaptedValue.Hidden,
  tertiary: PaneAdaptedValue.Hidden,
};

const primary: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Expanded,
  secondary: PaneAdaptedValue.Hidden,
  tertiary: PaneAdaptedValue.Hidden,
};

const primarySecondary: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Expanded,
  secondary: PaneAdaptedValue.Expanded,
  tertiary: PaneAdaptedValue.Hidden,
};

function installFrameHarness() {
  let nextId = 1;
  const callbacks = new Map<number, FrameRequestCallback>();
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    const id = nextId++;
    callbacks.set(id, callback);
    return id;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    callbacks.delete(id);
  });
  return {
    flush(time: number) {
      const current = [...callbacks.values()];
      callbacks.clear();
      current.forEach((callback) => callback(time));
    },
  };
}

function durationResolver(activeDuration: () => number) {
  return (from: ThreePaneScaffoldValue, to: ThreePaneScaffoldValue) => {
    if (threePaneScaffoldValuesEqual(from, hidden) && threePaneScaffoldValuesEqual(to, primary)) {
      return 400;
    }
    if (
      threePaneScaffoldValuesEqual(from, primary) &&
      threePaneScaffoldValuesEqual(to, primarySecondary)
    ) {
      return activeDuration();
    }
    return 0;
  };
}

describe('MutableThreePaneScaffoldState in-frame duration parity', () => {
  it('clears retained initial values when the new duration falls behind consumed progress', async () => {
    const frames = installFrameHarness();
    try {
      let activeDurationMs = 300;
      const state = new MutableThreePaneScaffoldState(hidden);
      const detach = state.setTransitionDurationResolver({}, durationResolver(() => activeDurationMs));

      state.seekTo(0.5, primary);
      const animation = state.animateTo(primarySecondary);
      frames.flush(0);
      frames.flush(96);

      expect(state.animationPlayTimeMs).toBe(96);
      expect(state.progressFraction).toBeGreaterThan(0);
      expect(state.progressFraction).toBeLessThan(1);
      const clearRevisionBeforeShrink = state.initialValueAnimationsClearRevision;

      // This models a child duration changing from updateInitialValues() while
      // runAnimations is already consuming the next frame. The observer sees
      // progressNanos=112ms against a new totalDurationNanos=80ms.
      activeDurationMs = 80;
      frames.flush(112);

      expect(state.initialValueAnimationsClearRevision).toBe(
        clearRevisionBeforeShrink + 1,
      );
      expect(state.progressFraction).toBe(1);
      expect(state.animationPlayTimeMs).toBe(112);

      await animation;
      expect(state.currentState).toBe(primarySecondary);
      expect(state.targetState).toBe(primarySecondary);
      expect(state.progressFraction).toBe(0);
      expect(state.animationPlayTimeMs).toBe(0);
      detach();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('uses a strict greater-than boundary when progress equals the new duration', async () => {
    const frames = installFrameHarness();
    try {
      let activeDurationMs = 300;
      const state = new MutableThreePaneScaffoldState(hidden);
      const detach = state.setTransitionDurationResolver({}, durationResolver(() => activeDurationMs));

      state.seekTo(0.5, primary);
      const animation = state.animateTo(primarySecondary);
      frames.flush(0);
      frames.flush(96);

      const clearRevisionBeforeShrink = state.initialValueAnimationsClearRevision;
      activeDurationMs = 112;
      frames.flush(112);

      expect(state.initialValueAnimationsClearRevision).toBe(clearRevisionBeforeShrink);
      expect(state.currentState).toBe(primary);
      expect(state.targetState).toBe(primarySecondary);
      expect(state.progressFraction).toBe(1);
      expect(state.animationPlayTimeMs).toBe(112);

      // Let animateTo leave the completed current animation and begin waiting
      // for the retained half of the former 400ms transition (200ms total).
      await Promise.resolve();
      await Promise.resolve();
      frames.flush(200);
      await animation;

      expect(state.initialValueAnimationsClearRevision).toBe(clearRevisionBeforeShrink);
      expect(state.currentState).toBe(primarySecondary);
      expect(state.targetState).toBe(primarySecondary);
      expect(state.progressFraction).toBe(0);
      expect(state.animationPlayTimeMs).toBe(0);
      detach();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
