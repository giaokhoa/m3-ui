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

describe('MutableThreePaneScaffoldState fraction-end parity', () => {
  it('commits a seeked target at fraction 1 without starting another animation', async () => {
    const state = new MutableThreePaneScaffoldState(hidden);
    state.setTransitionDurationResolver({}, () => 0);
    state.seekTo(1, primary, true);

    const animation = vi.fn<ThreePaneScaffoldProgressAnimation>(async () => {});
    await state.animateTo(primary, { animation });

    expect(animation).not.toHaveBeenCalled();
    expect(state.currentState).toBe(primary);
    expect(state.targetState).toBe(primary);
    expect(state.progressFraction).toBe(0);
    expect(state.isPredictiveBackInProgress).toBe(false);
  });
});
