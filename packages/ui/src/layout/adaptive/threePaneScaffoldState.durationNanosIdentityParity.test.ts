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

describe('MutableThreePaneScaffoldState duration nanos identity', () => {
  it('does not observe a raw-ms change that rounds to the same totalDurationNanos', async () => {
    const frames = installFrameHarness();
    try {
      let activeDurationMs = 300.0000001;
      const state = new MutableThreePaneScaffoldState(hidden);
      const detach = state.setTransitionDurationResolver({}, (from, to) => {
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
      });

      state.seekTo(0.5, primary);
      const animation = state.animateTo(primarySecondary);
      frames.flush(0);
      frames.flush(288);

      expect(state.progressFraction).toBeGreaterThan(0.9);
      expect(state.progressFraction).toBeLessThan(1);
      const clearRevision = state.initialValueAnimationsClearRevision;

      // Both values round to exactly 300_000_000ns. SnapshotStateObserver sees
      // no totalDurationNanos change even though the browser numbers differ.
      activeDurationMs = 300.0000004;
      frames.flush(312);

      expect(state.progressFraction).toBe(1);
      expect(state.initialValueAnimationsClearRevision).toBe(clearRevision);

      // The current fraction is done, but the retained half of the old 400ms
      // segment must still be allowed to finish normally.
      await Promise.resolve();
      await Promise.resolve();
      frames.flush(400);
      await animation;

      expect(state.currentState).toBe(primarySecondary);
      expect(state.initialValueAnimationsClearRevision).toBe(clearRevision);
      detach();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
