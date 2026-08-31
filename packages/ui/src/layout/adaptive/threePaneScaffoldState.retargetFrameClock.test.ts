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

describe('MutableThreePaneScaffoldState retarget frame-clock parity', () => {
  it('preserves the previous frame timestamp across a running retarget', async () => {
    const frames = installFrameHarness();

    try {
      const state = new MutableThreePaneScaffoldState(hidden);
      state.setTransitionDurationResolver({}, () => 300);

      const first = state.animateTo(primary);
      frames.flush(0);
      frames.flush(80);
      expect(state.animationPlayTimeMs).toBe(80);
      expect(state.progressFraction).toBeGreaterThan(0);

      const second = state.animateTo(primarySecondary);
      expect(state.currentState).toBe(primary);
      expect(state.targetState).toBe(primarySecondary);
      expect(state.animationPlayTimeMs).toBe(0);
      expect(state.progressFraction).toBe(0);

      // SeekableTransitionState.runAnimations retains lastFrameTimeNanos when
      // moving the old current animation into initialValueAnimations. The first
      // frame of the new segment therefore consumes 96 - 80 = 16ms immediately.
      frames.flush(96);
      const expectedFraction = Math.fround(
        Math.fround(16_000_000) / Math.fround(300_000_000),
      );
      expect(state.animationPlayTimeMs).toBe(16);
      expect(state.progressFraction).toBe(expectedFraction);

      state.snapTo(primarySecondary);
      await Promise.all([first, second]);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
