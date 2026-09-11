import { describe, expect, it, vi } from 'vitest';
import { PaneAdaptedValue, type ThreePaneScaffoldValue } from './threePaneScaffold';
import {
  MutableThreePaneScaffoldState,
  type ThreePaneScaffoldProgressAnimation,
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

const instantAnimation: ThreePaneScaffoldProgressAnimation = async ({ update }) => {
  update(1, 0);
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

describe('MutableThreePaneScaffoldState retarget completion parity', () => {
  it('waits for retained initial values after the new timeline reaches 1', async () => {
    const frames = installFrameHarness();

    try {
      const state = new MutableThreePaneScaffoldState(hidden);
      state.setTransitionDurationResolver({}, () => 300);
      state.seekTo(0.5, primary);

      let completed = false;
      const running = state
        .animateTo(primarySecondary, { animation: instantAnimation })
        .then(() => {
          completed = true;
        });
      await Promise.resolve();

      expect(state.progressFraction).toBe(1);
      expect(state.animationPlayTimeMs).toBe(0);
      expect(completed).toBe(false);
      expect(state.currentState).toBe(primary);
      expect(state.targetState).toBe(primarySecondary);
      expect(frames.pending).toBe(1);

      frames.flush(0);
      expect(state.animationPlayTimeMs).toBe(0);
      frames.flush(150);
      await running;

      expect(completed).toBe(true);
      expect(state.currentState).toBe(primarySecondary);
      expect(state.targetState).toBe(primarySecondary);
      expect(state.progressFraction).toBe(0);
      expect(state.animationPlayTimeMs).toBe(0);
      expect(frames.pending).toBe(0);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
