import { describe, expect, it, vi } from 'vitest';
import { PaneAdaptedValue, type ThreePaneScaffoldValue } from './threePaneScaffold';
import { MutableThreePaneScaffoldState } from './threePaneScaffoldState';

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
    get pending() {
      return callbacks.size;
    },
  };
}

describe('MutableThreePaneScaffoldState moving initial transition parity', () => {
  it('keeps retained initial values on the shared frame clock while seek is parked', async () => {
    const frames = installFrameHarness();

    try {
      const state = new MutableThreePaneScaffoldState(hidden);
      state.setTransitionDurationResolver({}, () => 300);
      state.seekTo(0.5, primary);

      state.seekTo(0, primarySecondary);
      expect(state.currentState).toBe(primary);
      expect(state.targetState).toBe(primarySecondary);
      expect(state.progressFraction).toBe(0);
      expect(state.animationPlayTimeMs).toBe(0);
      expect(frames.pending).toBe(1);

      // First frame establishes the retained clock origin, matching runAnimations().
      frames.flush(0);
      expect(state.animationPlayTimeMs).toBe(0);
      frames.flush(80);
      expect(state.animationPlayTimeMs).toBe(80);

      // Seeking the new transition does not stop the retained initial-value clock.
      state.seekTo(0.5, primarySecondary);
      expect(state.progressFraction).toBe(0.5);
      expect(state.animationPlayTimeMs).toBe(80);
      expect(frames.pending).toBe(1);

      frames.flush(96);
      expect(state.progressFraction).toBe(0.5);
      expect(state.animationPlayTimeMs).toBe(96);

      frames.flush(150);
      await Promise.resolve();
      expect(state.animationPlayTimeMs).toBe(150);
      expect(frames.pending).toBe(0);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('snapTo clears a pending retained initial-value clock', () => {
    const frames = installFrameHarness();

    try {
      const state = new MutableThreePaneScaffoldState(hidden);
      state.setTransitionDurationResolver({}, () => 300);
      state.seekTo(0.5, primary);
      state.seekTo(0, primarySecondary);
      const clearRevision = state.initialValueAnimationsClearRevision;
      expect(frames.pending).toBe(1);

      state.snapTo(primarySecondary);

      expect(state.animationPlayTimeMs).toBe(0);
      expect(state.initialValueAnimationsClearRevision).toBe(clearRevision + 1);
      expect(frames.pending).toBe(0);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
