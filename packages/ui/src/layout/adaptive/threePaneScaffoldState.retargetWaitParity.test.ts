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
  update(1);
};

describe('MutableThreePaneScaffoldState retarget completion parity', () => {
  it('waits for old initial-value animations after the new timeline reaches 1', async () => {
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

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
      expect(state.initialTransition?.progressFraction).toBe(0.5);
      expect(completed).toBe(false);
      expect(state.currentState).toBe(primary);
      expect(state.targetState).toBe(primarySecondary);

      frames.shift()!(0);
      frames.shift()!(150);
      await running;

      expect(completed).toBe(true);
      expect(state.initialTransition).toBeNull();
      expect(state.currentState).toBe(primarySecondary);
      expect(state.targetState).toBe(primarySecondary);
      expect(state.progressFraction).toBe(0);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
