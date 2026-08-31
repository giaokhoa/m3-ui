import { describe, expect, it } from 'vitest';
import {
  PaneAdaptedValue,
  ThreePaneScaffoldRole,
  type ThreePaneScaffoldValue,
} from './threePaneScaffold';
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
  currentDestination: ThreePaneScaffoldRole.Primary,
};

describe('MutableThreePaneScaffoldState destination-only seek parity', () => {
  it('keeps the existing target object while changing the active seek fraction', () => {
    const state = new MutableThreePaneScaffoldState(hidden);
    state.setTransitionDurationResolver({}, () => 0);
    state.seekTo(0.25, primary);

    const destinationOnlyTarget: ThreePaneScaffoldValue = {
      ...primary,
      currentDestination: ThreePaneScaffoldRole.Secondary,
    };
    state.seekTo(0.6, destinationOnlyTarget, true);

    expect(state.currentState).toBe(hidden);
    expect(state.targetState).toBe(primary);
    expect(state.progressFraction).toBe(Math.fround(0.6));
    expect(state.isPredictiveBackInProgress).toBe(true);
  });
});
