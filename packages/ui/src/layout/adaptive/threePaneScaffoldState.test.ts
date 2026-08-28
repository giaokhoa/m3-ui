import { describe, expect, it, vi } from 'vitest';
import {
  PaneAdaptedValue,
  ThreePaneScaffoldRole,
  type ThreePaneScaffoldValue,
} from './threePaneScaffold';
import {
  MutableThreePaneScaffoldState,
  threePaneScaffoldValuesEqual,
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
  currentDestination: ThreePaneScaffoldRole.Primary,
};

const primarySecondary: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Expanded,
  secondary: PaneAdaptedValue.Expanded,
  tertiary: PaneAdaptedValue.Hidden,
  currentDestination: ThreePaneScaffoldRole.Secondary,
};

const instantAnimation: ThreePaneScaffoldProgressAnimation = async ({ update, to }) => {
  update(0.25);
  update(0.75);
  update(to);
};

describe('MutableThreePaneScaffoldState', () => {
  it('starts idle at the initial scaffold value', () => {
    const state = new MutableThreePaneScaffoldState(hidden);
    expect(state.currentState).toBe(hidden);
    expect(state.targetState).toBe(hidden);
    expect(state.progressFraction).toBe(0);
    expect(state.isTransitionActive).toBe(false);
    expect(state.isPredictiveBackInProgress).toBe(false);
  });

  it('seeks raw timeline progress without replacing currentState when target changes', () => {
    const state = new MutableThreePaneScaffoldState(hidden);
    state.seekTo(0.4, primary, true);

    expect(state.currentState).toBe(hidden);
    expect(state.targetState).toBe(primary);
    expect(state.progressFraction).toBe(0.4);
    expect(state.isTransitionActive).toBe(true);
    expect(state.isPredictiveBackInProgress).toBe(true);
  });

  it('snaps current and target together and clears predictive back', () => {
    const state = new MutableThreePaneScaffoldState(hidden);
    state.seekTo(0.5, primary, true);
    state.snapTo(primarySecondary);

    expect(state.currentState).toBe(primarySecondary);
    expect(state.targetState).toBe(primarySecondary);
    expect(state.progressFraction).toBe(0);
    expect(state.isTransitionActive).toBe(false);
    expect(state.isPredictiveBackInProgress).toBe(false);
  });

  it('animates the fraction and commits the target', async () => {
    const state = new MutableThreePaneScaffoldState(hidden, {
      animation: instantAnimation,
    });
    const listener = vi.fn();
    state.subscribe(listener);

    await state.animateTo(primary);

    expect(state.currentState).toBe(primary);
    expect(state.targetState).toBe(primary);
    expect(state.progressFraction).toBe(0);
    expect(state.isTransitionActive).toBe(false);
    expect(listener).toHaveBeenCalled();
  });

  it('uses zero duration while no renderer transition is attached', async () => {
    let observedDuration = -1;
    const animation: ThreePaneScaffoldProgressAnimation = async ({ durationMs, update }) => {
      observedDuration = durationMs;
      update(1);
    };
    const state = new MutableThreePaneScaffoldState(hidden, { animation });

    await state.animateTo(primary);

    expect(observedDuration).toBe(0);
    expect(state.currentState).toBe(primary);
  });

  it('passes the renderer-resolved full transition duration to animationSpec', async () => {
    let observedDuration = -1;
    const animation: ThreePaneScaffoldProgressAnimation = async ({ durationMs, update }) => {
      observedDuration = durationMs;
      update(1);
    };
    const state = new MutableThreePaneScaffoldState(hidden, { animation });
    const detach = state.setTransitionDurationResolver(() => 475);

    await state.animateTo(primary);
    expect(observedDuration).toBe(475);

    detach();
  });

  it('continues an existing seek when animating to the same target', async () => {
    const seen: number[] = [];
    const animation: ThreePaneScaffoldProgressAnimation = async ({ from, update }) => {
      seen.push(from);
      update(1);
    };
    const state = new MutableThreePaneScaffoldState(hidden, { animation });
    state.seekTo(0.35, primary);

    await state.animateTo(primary);

    expect(seen).toEqual([0.35]);
    expect(state.currentState).toBe(primary);
  });

  it('retargets from the previous target like SeekableTransitionState.animateTo', async () => {
    const state = new MutableThreePaneScaffoldState(hidden, {
      animation: instantAnimation,
    });
    state.seekTo(0.5, primary);

    let observedCurrent: ThreePaneScaffoldValue | undefined;
    const animation: ThreePaneScaffoldProgressAnimation = async ({ update }) => {
      observedCurrent = state.currentState;
      update(1);
    };
    await state.animateTo(primarySecondary, { animation });

    expect(observedCurrent).toBe(primary);
    expect(state.currentState).toBe(primarySecondary);
  });

  it('allows only one attached transition duration resolver', () => {
    const state = new MutableThreePaneScaffoldState(hidden);
    const first = () => 300;
    const detach = state.setTransitionDurationResolver(first);
    expect(() => state.setTransitionDurationResolver(() => 400)).toThrow();
    detach();
    expect(() => state.setTransitionDurationResolver(() => 400)).not.toThrow();
  });

  it('validates seek fractions', () => {
    const state = new MutableThreePaneScaffoldState(hidden);
    expect(() => state.seekTo(-0.01, primary)).toThrow(RangeError);
    expect(() => state.seekTo(1.01, primary)).toThrow(RangeError);
    expect(() => state.seekTo(Number.NaN, primary)).toThrow(RangeError);
  });
});

describe('threePaneScaffoldValuesEqual', () => {
  it('compares adapted values structurally rather than by object identity', () => {
    const clone: ThreePaneScaffoldValue = {
      primary: { type: 'expanded' },
      secondary: { type: 'hidden' },
      tertiary: { type: 'hidden' },
      currentDestination: ThreePaneScaffoldRole.Primary,
    };
    expect(threePaneScaffoldValuesEqual(primary, clone)).toBe(true);
    expect(threePaneScaffoldValuesEqual(primary, primarySecondary)).toBe(false);
  });

  it('compares reflow anchors', () => {
    const first: ThreePaneScaffoldValue = {
      ...hidden,
      secondary: PaneAdaptedValue.Reflowed(ThreePaneScaffoldRole.Primary),
    };
    const second: ThreePaneScaffoldValue = {
      ...hidden,
      secondary: PaneAdaptedValue.Reflowed(ThreePaneScaffoldRole.Tertiary),
    };
    expect(threePaneScaffoldValuesEqual(first, second)).toBe(false);
  });
});
