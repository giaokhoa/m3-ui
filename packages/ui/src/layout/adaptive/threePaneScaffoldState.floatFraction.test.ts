import { describe, expect, it } from 'vitest';
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

    const running = state.animateTo(second);
    await Promise.resolve();

    expect(state.progressFraction).toBe(Math.fround(0.123456789));

    release();
    await running;
    expect(state.progressFraction).toBe(0);
  });
});
