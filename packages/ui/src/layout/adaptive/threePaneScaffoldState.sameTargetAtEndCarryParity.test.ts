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
  };
}

describe('MutableThreePaneScaffoldState same-target fraction-end carry', () => {
  it('waits for retained initial values when animateTo starts from fraction one', async () => {
    const frames = installFrameHarness();
    try {
      const state = new MutableThreePaneScaffoldState(hidden);
      const detach = state.setTransitionDurationResolver({}, () => 160);

      state.seekTo(0, primary);
      state.seekTo(1, primarySecondary);
      expect(state.currentState).toBe(primary);
      expect(state.targetState).toBe(primarySecondary);
      expect(state.progressFraction).toBe(1);

      // The retained animation from hidden -> primary owns its own frame clock.
      frames.flush(0);
      expect(state.animationPlayTimeMs).toBe(0);

      let completed = false;
      const animation = state.animateTo(primarySecondary).then(() => {
        completed = true;
      });
      await Promise.resolve();

      expect(state.progressFraction).toBe(1);
      expect(state.currentState).toBe(primary);
      expect(completed).toBe(false);

      frames.flush(16);
      expect(state.animationPlayTimeMs).toBe(16);
      expect(state.currentState).toBe(primary);
      expect(completed).toBe(false);

      frames.flush(160);
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
});
