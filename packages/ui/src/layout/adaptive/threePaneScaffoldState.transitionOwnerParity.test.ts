import { describe, expect, it } from 'vitest';
import { PaneAdaptedValue, type ThreePaneScaffoldValue } from './threePaneScaffold';
import { MutableThreePaneScaffoldState } from './threePaneScaffoldState';

const hidden: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Hidden,
  secondary: PaneAdaptedValue.Hidden,
  tertiary: PaneAdaptedValue.Hidden,
};

describe('MutableThreePaneScaffoldState transition ownership', () => {
  it('allows a new Transition owner after the previous one is removed', () => {
    const state = new MutableThreePaneScaffoldState(hidden);
    const firstOwner = {};
    const secondOwner = {};
    const detach = state.setTransitionDurationResolver(firstOwner, () => 300);

    expect(() => state.setTransitionDurationResolver(secondOwner, () => 400)).toThrow();

    detach();

    expect(() => state.setTransitionDurationResolver(secondOwner, () => 400)).not.toThrow();
  });

  it('does not let stale cleanup release a newer resolver from the same owner', () => {
    const state = new MutableThreePaneScaffoldState(hidden);
    const owner = {};
    const otherOwner = {};
    const detachOld = state.setTransitionDurationResolver(owner, () => 300);
    const detachCurrent = state.setTransitionDurationResolver(owner, () => 400);

    detachOld();

    expect(() => state.setTransitionDurationResolver(otherOwner, () => 500)).toThrow();

    detachCurrent();

    expect(() => state.setTransitionDurationResolver(otherOwner, () => 500)).not.toThrow();
  });
});
