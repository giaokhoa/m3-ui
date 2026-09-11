import { describe, expect, it } from 'vitest';
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

describe('MutableThreePaneScaffoldState setup failure parity', () => {
  it('clears predictive back when duration resolution fails before animation starts', async () => {
    const state = new MutableThreePaneScaffoldState(hidden, {
      transitionDurationResolver: () => Number.NaN,
    });
    state.seekTo(0.5, primary, true);
    expect(state.isPredictiveBackInProgress).toBe(true);

    await expect(state.animateTo(primary)).rejects.toThrow(RangeError);

    expect(state.currentState).toBe(hidden);
    expect(state.targetState).toBe(primary);
    expect(state.progressFraction).toBe(0.5);
    expect(state.isPredictiveBackInProgress).toBe(false);
  });
});
