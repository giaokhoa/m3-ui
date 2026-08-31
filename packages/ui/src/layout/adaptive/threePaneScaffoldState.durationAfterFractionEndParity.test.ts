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

describe('MutableThreePaneScaffoldState completed-fraction duration parity', () => {
  it('does not clear retained initial values after currentAnimation has reached one', async () => {
    const frames = installFrameHarness();
    try {
      let activeDurationMs = 80;
      const owner = {};
      const state = new MutableThreePaneScaffoldState(hidden);
      const resolver = (from: ThreePaneScaffoldValue, to: ThreePaneScaffoldValue) => {
        if (
          threePaneScaffoldValuesEqual(from, hidden) &&
          threePaneScaffoldValuesEqual(to, primary)
        ) {
          return 400;
        }
        if (
          threePaneScaffoldValuesEqual(from, primary) &&
          threePaneScaffoldValuesEqual(to, primarySecondary)
        ) {
          return activeDurationMs;
        }
        return 0;
      };
      let detach = state.setTransitionDurationResolver(owner, resolver);

      state.seekTo(0.5, primary);
      const animation = state.animateTo(primarySecondary);
      frames.flush(0);
      frames.flush(80);

      expect(state.progressFraction).toBe(1);
      expect(state.currentState).toBe(primary);
      expect(state.targetState).toBe(primarySecondary);
      expect(state.animationPlayTimeMs).toBe(80);
      const clearRevisionAtFractionEnd = state.initialValueAnimationsClearRevision;

      // recalculateAnimationValue() sets currentAnimation = null as soon as its
      // value reaches 1f. A later total-duration observation must therefore use
      // seekToFraction() only; it must not call endAllAnimations() on the still-
      // running retained initial-value animations.
      activeDurationMs = 40;
      detach();
      detach = state.setTransitionDurationResolver(owner, resolver);

      expect(state.progressFraction).toBe(1);
      expect(state.initialValueAnimationsClearRevision).toBe(clearRevisionAtFractionEnd);

      frames.flush(96);
      expect(state.animationPlayTimeMs).toBe(96);
      expect(state.currentState).toBe(primary);

      state.snapTo(primarySecondary);
      await animation;
      detach();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
