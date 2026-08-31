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

function durationResolver(activeDuration: () => number) {
  return (from: ThreePaneScaffoldValue, to: ThreePaneScaffoldValue) => {
    if (threePaneScaffoldValuesEqual(from, hidden) && threePaneScaffoldValuesEqual(to, primary)) {
      return 400;
    }
    if (
      threePaneScaffoldValuesEqual(from, primary) &&
      threePaneScaffoldValuesEqual(to, primarySecondary)
    ) {
      return activeDuration();
    }
    return 0;
  };
}

describe('MutableThreePaneScaffoldState duration-change parity', () => {
  it('ends all animations immediately when an observed duration shrinks behind progress', async () => {
    const frames = installFrameHarness();
    try {
      let activeDurationMs = 300;
      const state = new MutableThreePaneScaffoldState(hidden);
      const owner = {};
      const resolver = durationResolver(() => activeDurationMs);
      let detach = state.setTransitionDurationResolver(owner, resolver);

      state.seekTo(0.5, primary);
      const animation = state.animateTo(primarySecondary);
      frames.flush(0);
      frames.flush(112);

      const playTimeBeforeShrink = state.animationPlayTimeMs;
      const clearRevisionBeforeShrink = state.initialValueAnimationsClearRevision;
      expect(playTimeBeforeShrink).toBe(112);
      expect(state.progressFraction).toBeGreaterThan(0);
      expect(state.progressFraction).toBeLessThan(1);

      const observedEndPlayTimes: number[] = [];
      const unsubscribe = state.subscribe(() => {
        if (
          state.currentState === primary &&
          state.targetState === primarySecondary &&
          state.progressFraction === 1
        ) {
          observedEndPlayTimes.push(state.animationPlayTimeMs);
        }
      });

      activeDurationMs = 80;
      detach();
      detach = state.setTransitionDurationResolver(owner, resolver);

      expect(state.progressFraction).toBe(1);
      expect(state.animationPlayTimeMs).toBe(playTimeBeforeShrink);
      expect(state.initialValueAnimationsClearRevision).toBe(
        clearRevisionBeforeShrink + 1,
      );
      expect(observedEndPlayTimes).toEqual([playTimeBeforeShrink]);

      // AndroidX runAnimations still receives its already-scheduled frame after
      // endAllAnimations(), but both animation collections are empty. The web
      // shared clock must therefore not consume 128 - 112 on this callback.
      frames.flush(128);
      expect(observedEndPlayTimes.every((time) => time === playTimeBeforeShrink)).toBe(true);

      await animation;
      expect(state.currentState).toBe(primarySecondary);
      expect(state.targetState).toBe(primarySecondary);
      expect(state.progressFraction).toBe(0);
      expect(state.animationPlayTimeMs).toBe(0);

      unsubscribe();
      detach();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('keeps the current fraction parked until the next frame when duration grows', async () => {
    const frames = installFrameHarness();
    try {
      let durationMs = 160;
      const state = new MutableThreePaneScaffoldState(hidden);
      const owner = {};
      const resolver = () => durationMs;
      let detach = state.setTransitionDurationResolver(owner, resolver);

      const animation = state.animateTo(primary);
      frames.flush(0);
      frames.flush(32);
      const fractionBeforeGrowth = state.progressFraction;
      expect(fractionBeforeGrowth).toBeGreaterThan(0);
      expect(fractionBeforeGrowth).toBeLessThan(1);

      durationMs = 320;
      detach();
      detach = state.setTransitionDurationResolver(owner, resolver);
      expect(state.progressFraction).toBe(fractionBeforeGrowth);

      frames.flush(48);
      expect(state.progressFraction).toBeLessThan(fractionBeforeGrowth);

      state.snapTo(primary);
      await animation;
      detach();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('retains grown null-spec duration from preserved progress before the next frame', async () => {
    const frames = installFrameHarness();
    try {
      let durationMs = 160;
      const state = new MutableThreePaneScaffoldState(hidden);
      const owner = {};
      const resolver = (from: ThreePaneScaffoldValue, to: ThreePaneScaffoldValue) =>
        threePaneScaffoldValuesEqual(from, hidden) && threePaneScaffoldValuesEqual(to, primary)
          ? durationMs
          : 0;
      let detach = state.setTransitionDurationResolver(owner, resolver);

      const animation = state.animateTo(primary);
      frames.flush(0);
      frames.flush(32);
      const fractionBeforeGrowth = state.progressFraction;
      expect(fractionBeforeGrowth).toBeCloseTo(0.2, 5);

      durationMs = 320;
      detach();
      detach = state.setTransitionDurationResolver(owner, resolver);
      expect(state.progressFraction).toBe(fractionBeforeGrowth);

      const fractionBasedRemainingMs = 320 * (1 - fractionBeforeGrowth);
      const progressBasedRemainingMs = 320 - 32;
      expect(progressBasedRemainingMs).toBeGreaterThan(fractionBasedRemainingMs);

      state.seekTo(0, primarySecondary);
      await animation;

      frames.flush(304);
      expect(state.animationPlayTimeMs).toBe(272);
      expect(state.animationPlayTimeMs).toBeGreaterThan(fractionBasedRemainingMs);
      expect(state.animationPlayTimeMs).toBeLessThan(progressBasedRemainingMs);

      frames.flush(320);
      expect(state.animationPlayTimeMs).toBe(progressBasedRemainingMs);

      state.snapTo(primarySecondary);
      detach();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('does not over-retain a shrunk null-spec duration before the next frame', async () => {
    const frames = installFrameHarness();
    try {
      let durationMs = 320;
      const state = new MutableThreePaneScaffoldState(hidden);
      const owner = {};
      const resolver = (from: ThreePaneScaffoldValue, to: ThreePaneScaffoldValue) =>
        threePaneScaffoldValuesEqual(from, hidden) && threePaneScaffoldValuesEqual(to, primary)
          ? durationMs
          : 0;
      let detach = state.setTransitionDurationResolver(owner, resolver);

      const animation = state.animateTo(primary);
      frames.flush(0);
      frames.flush(32);
      const fractionBeforeShrink = state.progressFraction;
      expect(fractionBeforeShrink).toBeCloseTo(0.1, 5);

      durationMs = 160;
      detach();
      detach = state.setTransitionDurationResolver(owner, resolver);
      expect(state.progressFraction).toBe(fractionBeforeShrink);

      const progressBasedRemainingMs = 160 - 32;
      const staleFractionRemainingMs = 160 * (1 - fractionBeforeShrink);
      expect(progressBasedRemainingMs).toBeLessThan(staleFractionRemainingMs);

      state.seekTo(0, primarySecondary);
      await animation;

      frames.flush(152);
      expect(state.animationPlayTimeMs).toBe(120);
      frames.flush(160);
      expect(state.animationPlayTimeMs).toBe(progressBasedRemainingMs);
      frames.flush(176);
      expect(state.animationPlayTimeMs).toBe(progressBasedRemainingMs);
      expect(state.animationPlayTimeMs).toBeLessThan(staleFractionRemainingMs);

      state.snapTo(primarySecondary);
      detach();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
