import { describe, expect, it, vi } from 'vitest';
import {
  PaneAdaptedValue,
  ThreePaneScaffoldRole,
  type ThreePaneScaffoldValue,
} from './threePaneScaffold';
import {
  MutableThreePaneScaffoldState,
  defaultThreePaneScaffoldProgressAnimation,
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

  it('updates destination-only metadata without starting motion', async () => {
    const secondaryDestination: ThreePaneScaffoldValue = {
      ...primary,
      currentDestination: ThreePaneScaffoldRole.Secondary,
    };

    const snapState = new MutableThreePaneScaffoldState(primary);
    snapState.snapTo(secondaryDestination);
    expect(snapState.currentState).toBe(secondaryDestination);
    expect(snapState.targetState).toBe(secondaryDestination);
    expect(snapState.isTransitionActive).toBe(false);

    const seekState = new MutableThreePaneScaffoldState(primary);
    seekState.seekTo(0.5, secondaryDestination, true);
    expect(seekState.currentState).toBe(secondaryDestination);
    expect(seekState.targetState).toBe(secondaryDestination);
    expect(seekState.progressFraction).toBe(0);
    expect(seekState.isTransitionActive).toBe(false);
    expect(seekState.isPredictiveBackInProgress).toBe(true);

    let animationCalled = false;
    const animateState = new MutableThreePaneScaffoldState(primary);
    await animateState.animateTo(secondaryDestination, {
      animation: async () => {
        animationCalled = true;
      },
    });
    expect(animationCalled).toBe(false);
    expect(animateState.currentState).toBe(secondaryDestination);
    expect(animateState.targetState).toBe(secondaryDestination);
    expect(animateState.isTransitionActive).toBe(false);
    expect(animateState.isPredictiveBackInProgress).toBe(false);
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

  it('coerces custom animation overshoot like SeekableTransitionState.animateTo', async () => {
    const seen: number[] = [];
    const state = new MutableThreePaneScaffoldState(hidden);

    await state.animateTo(primary, {
      animation: async ({ update }) => {
        update(-0.2);
        seen.push(state.progressFraction);
        update(1.2);
        seen.push(state.progressFraction);
        update(1);
      },
    });

    expect(seen).toEqual([0, 1]);
    expect(state.currentState).toBe(primary);
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
    const owner = {};
    const detach = state.setTransitionDurationResolver(owner, () => 475);

    await state.animateTo(primary);
    expect(observedDuration).toBe(475);

    detach();
  });

  it('exposes the latest renderer duration while an animation is running', async () => {
    let durationMs = 475;
    const state = new MutableThreePaneScaffoldState(hidden);
    const owner = {};
    const detach = state.setTransitionDurationResolver(owner, () => durationMs);

    await state.animateTo(primary, {
      animation: async ({ durationMs: initialDurationMs, getDurationMs, update }) => {
        expect(initialDurationMs).toBe(475);
        expect(getDurationMs?.()).toBe(475);
        durationMs = 950;
        expect(getDurationMs?.()).toBe(950);
        update(1);
      },
    });

    detach();
  });

  it('recomputes the remaining default linear duration when total duration changes', async () => {
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

    let durationMs = 1000;
    const seen: number[] = [];
    const controller = new AbortController();

    try {
      const running = defaultThreePaneScaffoldProgressAnimation({
        from: 0.25,
        to: 1,
        durationMs,
        getDurationMs: () => durationMs,
        signal: controller.signal,
        update: (fraction) => seen.push(fraction),
      });

      frames.shift()!(0);
      frames.shift()!(300);
      expect(seen.at(-1)).toBeCloseTo(0.55);

      durationMs = 2000;
      frames.shift()!(600);
      // AndroidX keeps the same accumulated playtime but recomputes the
      // remaining null-spec duration from the original 0.25 start fraction.
      expect(seen.at(-1)).toBeCloseTo(0.55);

      durationMs = 500;
      frames.shift()!(600);
      await running;
      expect(seen.at(-1)).toBe(1);
    } finally {
      vi.unstubAllGlobals();
    }
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

  it('keeps an in-flight timeline when animateTo repeats the same target and driver', async () => {
    let animationCalls = 0;
    let updateRunning!: (fraction: number) => void;
    let finishRunning!: () => void;
    const animation: ThreePaneScaffoldProgressAnimation = ({ update }) => {
      animationCalls += 1;
      updateRunning = update;
      return new Promise<void>((resolve) => {
        finishRunning = () => {
          update(1);
          resolve();
        };
      });
    };
    const state = new MutableThreePaneScaffoldState(hidden, { animation });
    const structurallyEqualPrimary: ThreePaneScaffoldValue = {
      primary: PaneAdaptedValue.Expanded,
      secondary: PaneAdaptedValue.Hidden,
      tertiary: PaneAdaptedValue.Hidden,
      currentDestination: ThreePaneScaffoldRole.Secondary,
    };

    const first = state.animateTo(primary);
    updateRunning(0.4);
    const repeated = state.animateTo(structurallyEqualPrimary);

    expect(animationCalls).toBe(1);
    expect(state.targetState).toBe(structurallyEqualPrimary);
    expect(state.progressFraction).toBe(0.4);

    finishRunning();
    await Promise.all([first, repeated]);

    expect(animationCalls).toBe(1);
    expect(state.currentState).toBe(structurallyEqualPrimary);
    expect(state.targetState).toBe(structurallyEqualPrimary);
    expect(state.progressFraction).toBe(0);
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

  it('retargets from the previous target even when the new target equals currentState', async () => {
    const state = new MutableThreePaneScaffoldState(hidden);
    state.seekTo(0.5, primary);

    let observedCurrent: ThreePaneScaffoldValue | undefined;
    const animation: ThreePaneScaffoldProgressAnimation = async ({ update }) => {
      observedCurrent = state.currentState;
      update(1);
    };
    await state.animateTo(hidden, { animation });

    expect(observedCurrent).toBe(primary);
    expect(state.currentState).toBe(hidden);
    expect(state.targetState).toBe(hidden);
  });

  it('retains one transition owner across resolver updates and detach', () => {
    const state = new MutableThreePaneScaffoldState(hidden);
    const owner = {};
    const otherOwner = {};
    const first = () => 300;
    const detach = state.setTransitionDurationResolver(owner, first);

    expect(() => state.setTransitionDurationResolver(owner, () => 400)).not.toThrow();
    expect(() => state.setTransitionDurationResolver(otherOwner, () => 500)).toThrow();

    detach();
    expect(() => state.setTransitionDurationResolver(owner, () => 600)).not.toThrow();
    expect(() => state.setTransitionDurationResolver(otherOwner, () => 700)).toThrow();
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

  it('ignores currentDestination like AndroidX ThreePaneScaffoldValue.equals', () => {
    const secondaryDestination: ThreePaneScaffoldValue = {
      ...primary,
      currentDestination: ThreePaneScaffoldRole.Secondary,
    };

    expect(threePaneScaffoldValuesEqual(primary, secondaryDestination)).toBe(true);
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
