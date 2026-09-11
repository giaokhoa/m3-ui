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

describe('MutableThreePaneScaffoldState retained duration nanos parity', () => {
  it('rounds a seek-retarget initial animation duration like SeekingAnimationState', async () => {
    const frames = installFrameHarness();

    try {
      const state = new MutableThreePaneScaffoldState(hidden);
      const detach = state.setTransitionDurationResolver({}, () => 328);
      const requestedFraction = 0.123456789;
      const fraction = Math.fround(requestedFraction);
      const exactDurationMs =
        Math.round(328_000_000 * (1 - fraction)) / 1_000_000;
      const oldDoubleDurationMs = 328 * (1 - fraction);

      state.seekTo(requestedFraction, primary);
      state.seekTo(0, primarySecondary);
      expect(frames.pending).toBe(1);
      expect(exactDurationMs).toBe(287.506173);
      expect(oldDoubleDurationMs).toBeLessThan(exactDurationMs);

      frames.flush(0);
      frames.flush(oldDoubleDurationMs);
      expect(state.animationPlayTimeMs).toBe(oldDoubleDurationMs);
      expect(frames.pending).toBe(1);

      frames.flush(exactDurationMs);
      await Promise.resolve();
      expect(state.animationPlayTimeMs).toBe(exactDurationMs);
      expect(frames.pending).toBe(0);

      detach();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
