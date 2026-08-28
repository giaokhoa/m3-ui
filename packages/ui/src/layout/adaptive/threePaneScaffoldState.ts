import { PaneMotionDefaults } from './paneMotion';
import type { PaneAdaptedValue, ThreePaneScaffoldValue } from './threePaneScaffold';

export interface ThreePaneScaffoldState {
  readonly currentState: ThreePaneScaffoldValue;
  readonly targetState: ThreePaneScaffoldValue;
  readonly progressFraction: number;
  readonly isPredictiveBackInProgress: boolean;
  readonly subscribe: (listener: () => void) => () => void;
  readonly getSnapshot: () => number;
}

export interface ThreePaneScaffoldProgressAnimationContext {
  from: number;
  to: number;
  signal: AbortSignal;
  update: (fraction: number) => void;
}

export type ThreePaneScaffoldProgressAnimation = (
  context: ThreePaneScaffoldProgressAnimationContext,
) => Promise<void>;

export interface ThreePaneScaffoldAnimateOptions {
  animation?: ThreePaneScaffoldProgressAnimation;
  isPredictiveBackInProgress?: boolean;
}

export interface MutableThreePaneScaffoldStateOptions {
  animation?: ThreePaneScaffoldProgressAnimation;
}

function clampFraction(fraction: number) {
  if (!Number.isFinite(fraction) || fraction < 0 || fraction > 1) {
    throw new RangeError(`Expecting fraction between 0 and 1. Got ${fraction}`);
  }
  return fraction;
}

function paneAdaptedValuesEqual(a: PaneAdaptedValue, b: PaneAdaptedValue): boolean {
  if (a === b) return true;
  if (a.type !== b.type) return false;
  if (a.type === 'expanded' || a.type === 'hidden') return true;
  if (a.type === 'reflowed' && b.type === 'reflowed') {
    return a.reflowUnder === b.reflowUnder;
  }
  if (a.type === 'levitated' && b.type === 'levitated') {
    return (
      a.alignment === b.alignment &&
      a.scrim === b.scrim &&
      a.dragToResizeState === b.dragToResizeState
    );
  }
  return false;
}

/** Structural equality equivalent to AndroidX ThreePaneScaffoldValue equality. */
export function threePaneScaffoldValuesEqual(
  a: ThreePaneScaffoldValue,
  b: ThreePaneScaffoldValue,
): boolean {
  return (
    a === b ||
    (a.currentDestination === b.currentDestination &&
      paneAdaptedValuesEqual(a.primary, b.primary) &&
      paneAdaptedValuesEqual(a.secondary, b.secondary) &&
      paneAdaptedValuesEqual(a.tertiary, b.tertiary))
  );
}

function requestFrame(callback: FrameRequestCallback): number {
  if (typeof requestAnimationFrame === 'function') return requestAnimationFrame(callback);
  return setTimeout(() => callback(performance.now()), 16) as unknown as number;
}

function cancelFrame(id: number) {
  if (typeof cancelAnimationFrame === 'function') {
    cancelAnimationFrame(id);
  } else {
    clearTimeout(id);
  }
}

/**
 * Normalized underdamped spring response using the pinned AndroidX pane-motion
 * damping ratio and stiffness. The returned value may overshoot 1, matching a
 * physical spring; callers clamp only the exposed transition fraction.
 */
export function calculatePaneMotionSpringProgress(elapsedSeconds: number): number {
  if (!Number.isFinite(elapsedSeconds) || elapsedSeconds <= 0) return 0;
  const dampingRatio = PaneMotionDefaults.dampingRatio;
  const stiffness = PaneMotionDefaults.stiffness;
  const omega0 = Math.sqrt(stiffness);
  const damping = Math.sqrt(Math.max(0, 1 - dampingRatio * dampingRatio));
  if (damping === 0) {
    return 1 - Math.exp(-omega0 * elapsedSeconds) * (1 + omega0 * elapsedSeconds);
  }
  const omegaD = omega0 * damping;
  const envelope = Math.exp(-dampingRatio * omega0 * elapsedSeconds);
  return (
    1 -
    envelope *
      (Math.cos(omegaD * elapsedSeconds) +
        (dampingRatio / damping) * Math.sin(omegaD * elapsedSeconds))
  );
}

/** Default browser progress driver for Material pane transitions. */
export const defaultThreePaneScaffoldProgressAnimation: ThreePaneScaffoldProgressAnimation =
  ({ from, to, signal, update }) =>
    new Promise<void>((resolve) => {
      if (signal.aborted || from === to) {
        update(to);
        resolve();
        return;
      }

      let frame = 0;
      let startTime: number | undefined;
      const delta = to - from;
      const tick = (time: number) => {
        if (signal.aborted) {
          resolve();
          return;
        }
        startTime ??= time;
        const elapsedSeconds = Math.max(0, time - startTime) / 1000;
        const spring = calculatePaneMotionSpringProgress(elapsedSeconds);
        const value = from + delta * spring;
        update(Math.min(1, Math.max(0, value)));

        if (elapsedSeconds >= 1.2 || Math.abs(to - value) <= 0.001) {
          update(to);
          resolve();
          return;
        }
        frame = requestFrame(tick);
      };

      const abort = () => {
        cancelFrame(frame);
        resolve();
      };
      signal.addEventListener('abort', abort, { once: true });
      frame = requestFrame(tick);
    });

/**
 * Seekable transition state equivalent of AndroidX MutableThreePaneScaffoldState.
 *
 * The state itself only owns discrete scaffold values and a normalized progress
 * fraction. Geometry interpolation stays in the React renderer so layout
 * measurement and animation remain separate concerns.
 */
export class MutableThreePaneScaffoldState implements ThreePaneScaffoldState {
  private currentStateValue: ThreePaneScaffoldValue;
  private targetStateValue: ThreePaneScaffoldValue;
  private progressFractionValue = 0;
  private predictiveBack = false;
  private revision = 0;
  private readonly listeners = new Set<() => void>();
  private animationController: AbortController | null = null;
  private readonly defaultAnimation: ThreePaneScaffoldProgressAnimation;

  constructor(
    initialScaffoldValue: ThreePaneScaffoldValue,
    { animation = defaultThreePaneScaffoldProgressAnimation }: MutableThreePaneScaffoldStateOptions = {},
  ) {
    this.currentStateValue = initialScaffoldValue;
    this.targetStateValue = initialScaffoldValue;
    this.defaultAnimation = animation;
  }

  readonly subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  readonly getSnapshot = () => this.revision;

  private notify() {
    this.revision += 1;
    this.listeners.forEach((listener) => listener());
  }

  private cancelAnimation() {
    this.animationController?.abort();
    this.animationController = null;
  }

  get currentState() {
    return this.currentStateValue;
  }

  get targetState() {
    return this.targetStateValue;
  }

  get progressFraction() {
    return threePaneScaffoldValuesEqual(this.currentStateValue, this.targetStateValue)
      ? 0
      : this.progressFractionValue;
  }

  get isPredictiveBackInProgress() {
    return this.predictiveBack;
  }

  get isTransitionActive() {
    return !threePaneScaffoldValuesEqual(this.currentStateValue, this.targetStateValue);
  }

  /** Snap current and target to the same value and cancel any active transition. */
  snapTo(targetState: ThreePaneScaffoldValue) {
    this.cancelAnimation();
    this.currentStateValue = targetState;
    this.targetStateValue = targetState;
    this.progressFractionValue = 0;
    this.predictiveBack = false;
    this.notify();
  }

  /**
   * Seek directly to a fraction between currentState and targetState. Changing
   * target preserves currentState, matching SeekableTransitionState.seekTo.
   */
  seekTo(
    fraction: number,
    targetState: ThreePaneScaffoldValue = this.targetStateValue,
    isPredictiveBackInProgress = false,
  ) {
    clampFraction(fraction);
    this.cancelAnimation();
    this.targetStateValue = targetState;
    this.progressFractionValue = threePaneScaffoldValuesEqual(
      this.currentStateValue,
      targetState,
    )
      ? 0
      : fraction;
    this.predictiveBack = isPredictiveBackInProgress;
    this.notify();
  }

  /**
   * Animate the normalized transition fraction to 1 and commit targetState.
   * A new snap/seek/animate call aborts the prior animation, mirroring
   * AndroidX's MutatorMutex single-mutator behavior.
   */
  async animateTo(
    targetState: ThreePaneScaffoldValue = this.targetStateValue,
    {
      animation = this.defaultAnimation,
      isPredictiveBackInProgress = false,
    }: ThreePaneScaffoldAnimateOptions = {},
  ) {
    this.cancelAnimation();

    if (threePaneScaffoldValuesEqual(this.currentStateValue, targetState)) {
      this.currentStateValue = targetState;
      this.targetStateValue = targetState;
      this.progressFractionValue = 0;
      this.predictiveBack = false;
      this.notify();
      return;
    }

    const oldTarget = this.targetStateValue;
    if (!threePaneScaffoldValuesEqual(targetState, oldTarget)) {
      // AndroidX retargets from the previous target state. The React renderer
      // separately captures the current visual frame so this discrete state
      // change does not imply a visual jump.
      this.currentStateValue = oldTarget;
      this.targetStateValue = targetState;
      this.progressFractionValue = 0;
    }

    this.predictiveBack = isPredictiveBackInProgress;
    const controller = new AbortController();
    this.animationController = controller;
    const startingFraction = this.progressFraction;
    this.notify();

    try {
      await animation({
        from: startingFraction,
        to: 1,
        signal: controller.signal,
        update: (fraction) => {
          if (controller.signal.aborted) return;
          this.progressFractionValue = clampFraction(fraction);
          this.notify();
        },
      });
      if (controller.signal.aborted) return;
      this.currentStateValue = targetState;
      this.targetStateValue = targetState;
      this.progressFractionValue = 0;
    } finally {
      if (this.animationController === controller) {
        this.animationController = null;
        this.predictiveBack = false;
        this.notify();
      }
    }
  }
}
