import { describe, expect, it, vi } from 'vitest';
import {
  PaneAdaptedValue,
  type ThreePaneScaffoldValue,
} from './threePaneScaffold';
import {
  MutableThreePaneScaffoldState,
  type ThreePaneScaffoldProgressAnimation,
} from './threePaneScaffoldState';

const first: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Expanded,
  secondary: PaneAdaptedValue.Hidden,
  tertiary: PaneAdaptedValue.Hidden,
};

const second: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Hidden,
  secondary: PaneAdaptedValue.Expanded,
  tertiary: PaneAdaptedValue.Hidden,
};

describe('MutableThreePaneScaffoldState Float fraction boundary', () => {
  it('converts seek fractions to Float before the AndroidX range check', () => {
    const state = new MutableThreePaneScaffoldState(first);
    state.setTransitionDurationResolver({}, () => 0);

    state.seekTo(1 + Number.EPSILON, second);
    expect(state.progressFraction).toBe(1);

    expect(() => state.seekTo(1.0001, second)).toThrow(RangeError);
  });

  it('stores animation fractions as Float like SeekableTransitionState', async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const animation: ThreePaneScaffoldProgressAnimation = async ({ update }) => {
      update(0.123456789);
      await gate;
    };
    const state = new MutableThreePaneScaffoldState(first, { animation });
    state.setTransitionDurationResolver({}, () => 0);

    const running = state.animateTo(second);
    await Promise.resolve();

    expect(state.progressFraction).toBe(Math.fround(0.123456789));

    release();
    await running;
    expect(state.progressFraction).toBe(0);
  });

  it('samples the null-spec linear animation through Compose Float nanos', async () => {
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

    const state = new MutableThreePaneScaffoldState(first);
    const owner = {};
    const detach = state.setTransitionDurationResolver(owner, () => 328);
    const startingFraction = Math.fround(0.123456789);
    state.seekTo(startingFraction, second);

    try {
      const running = state.animateTo(second);
      frames.shift()!(0);
      frames.shift()!(1.2);

      // SeekableTransitionState first computes the remaining duration in nanos,
      // then evaluates playTimeNanos.toFloat() / durationNanos and Float lerp.
      // Keeping browser doubles until the state setter instead produces the
      // adjacent lower Float, 0.12711532413959503f.
      expect(state.progressFraction).toBe(0.12711533904075623);
      expect(state.progressFraction).not.toBe(0.12711532413959503);

      state.snapTo(second);
      await running;
    } finally {
      detach();
      vi.unstubAllGlobals();
    }
  });
});
