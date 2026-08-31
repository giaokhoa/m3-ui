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

describe('MutableThreePaneScaffoldState moving initial transition parity', () => {
  it('keeps the previous seek moving to its old target with the old duration', async () => {
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

      state.seekTo(0, primarySecondary);
      expect(state.currentState).toBe(primary);
      expect(state.targetState).toBe(primarySecondary);
      expect(state.progressFraction).toBe(0);
      expect(state.initialTransition?.currentState).toBe(hidden);
      expect(state.initialTransition?.targetState).toBe(primary);
      expect(state.initialTransition?.progressFraction).toBe(0.5);

      // First frame only captures the start time, exactly like runAnimations().
      frames.shift()!(0);
      frames.shift()!(80);
      expect(state.initialTransition?.progressFraction).toBeCloseTo(
        0.5 + (0.5 * 80) / 150,
        6,
      );

      // Seeking the new transition does not stop the old initial-value motion.
      state.seekTo(0.5, primarySecondary);
      frames.shift()!(96);
      expect(state.progressFraction).toBe(0.5);
      expect(state.initialTransition?.progressFraction).toBeCloseTo(
        0.5 + (0.5 * 96) / 150,
        6,
      );

      frames.shift()!(150);
      await Promise.resolve();
      expect(state.initialTransition).toBeNull();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('snapTo clears a pending initial-value animation', () => {
    const frames: FrameRequestCallback[] = [];
    const cancelAnimationFrame = vi.fn();
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.push(callback);
      return 17;
    });
    vi.stubGlobal('cancelAnimationFrame', cancelAnimationFrame);

    try {
      const state = new MutableThreePaneScaffoldState(hidden);
      state.setTransitionDurationResolver({}, () => 300);
      state.seekTo(0.5, primary);
      state.seekTo(0, primarySecondary);
      expect(state.initialTransition).not.toBeNull();

      state.snapTo(primarySecondary);
      expect(state.initialTransition).toBeNull();
      expect(cancelAnimationFrame).toHaveBeenCalledWith(17);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
