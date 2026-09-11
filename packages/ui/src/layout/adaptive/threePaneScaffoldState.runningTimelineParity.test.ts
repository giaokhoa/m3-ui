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

describe('MutableThreePaneScaffoldState running timeline parity', () => {
  it('exposes the original null-spec start and accumulated progress until cancellation', async () => {
    const frames = installFrameHarness();

    try {
      const state = new MutableThreePaneScaffoldState(hidden);
      const detach = state.setTransitionDurationResolver({}, () => 344);
      const startFraction = Math.fround(0.4611676335334778);

      state.seekTo(startFraction, primary);
      const running = state.animateTo(primary);

      frames.flush(0);
      frames.flush(43.281411);

      expect(state.progressFraction).not.toBe(startFraction);
      expect(state.defaultAnimationTimeline).toEqual({
        durationMs: 344,
        startFraction,
        progressMs: 43.281411,
      });

      state.snapTo(primary);
      await running;
      expect(state.defaultAnimationTimeline).toBeUndefined();

      detach();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});