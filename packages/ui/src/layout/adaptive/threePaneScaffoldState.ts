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
  /** Full transition duration before accounting for an already-seeked fraction. */
  durationMs: number;
  signal: AbortSignal;
  update: (fraction: number) => void;
}

export type ThreePaneScaffoldProgressAnimation = (
  context: ThreePaneScaffoldProgressAnimationContext,
) => Promise<void>;

export interface ThreePaneScaffoldAnimateOptions {
  /** Equivalent of AndroidX animateTo(animationSpec = ...). */
  animation?: ThreePaneScaffoldProgressAnimation;
  isPredictiveBackInProgress?: boolean;
}

export type ThreePaneScaffoldTransitionDurationResolver = (
  currentState: ThreePaneScaffoldValue,
  targetState: ThreePaneScaffoldValue,
) => number;

export interface MutableThreePaneScaffoldStateOptions {
  animation?: ThreePaneScaffoldProgressAnimation;
  transitionDurationResolver?: ThreePaneScaffoldTransitionDurationResolver;
}

// AndroidX SeekableTransitionState has no timeline until it is attached to a Transition.
// The web state snaps by default while unbound; the mounted scaffold supplies the real duration.
const DefaultUnboundTransitionDurationMs = 0;

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
 * AndroidX SeekableTransitionState.animateTo(animationSpec = null) linearly
 * traverses the transition playtime. Spring/easing belongs to the Transition's
 * child animation specs, not to this normalized state fraction.
 */
export const defaultThreePaneScaffoldProgressAnimation: ThreePaneScaffoldProgressAnimation =
  ({ from, to, durationMs, signal, update }) =>
    new Promise<void>((resolve) => {
      const delta = to - from;
      const remainingDurationMs = Math.max(0, durationMs * Math.abs(delta));
      if (signal.aborted || delta === 0 || remainingDurationMs === 0) {
        update(to);
        resolve();
        return;
      }

      let frame = 0;
      let startTime: number | undefined;
      const finish = () => {
        signal.removeEventListener('abort', abort);
        resolve();
      };
      const tick = (time: number) => {
        if (signal.aborted) {
          finish();
          return;
        }
        startTime ??= time;
        const elapsed = Math.max(0, time - startTime);
        const timelineFraction = Math.min(1, elapsed / remainingDurationMs);
        update(from + delta * timelineFraction);
        if (timelineFraction >= 1) {
          update(to);
          finish();
          return;
        }
        frame = requestFrame(tick);
      };
      const abort = () => {
        cancelFrame(frame);
        finish();
      };
      signal.addEventListener('abort', abort, { once: true });
      frame = requestFrame(tick);
    });

/**
 * Seekable transition state equivalent of AndroidX MutableThreePaneScaffoldState.
 *
 * The state owns discrete scaffold values and a normalized transition timeline
 * fraction. The attached renderer resolves the actual transition duration from
 * pane geometry/motion; pane spring sampling remains outside this state.
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
  private transitionDurationResolver: ThreePaneScaffoldTransitionDurationResolver | null;

  constructor(
    initialScaffoldValue: ThreePaneScaffoldValue,
    {
      animation = defaultThreePaneScaffoldProgressAnimation,
      transitionDurationResolver,
    }: MutableThreePaneScaffoldStateOptions = {},
  ) {
    this.currentStateValue = initialScaffoldValue;
    this.targetStateValue = initialScaffoldValue;
    this.defaultAnimation = animation;
    this.transitionDurationResolver = transitionDurationResolver ?? null;
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

  /**
   * Attach the Transition duration resolver owned by the rendering scaffold.
   * AndroidX SeekableTransitionState similarly binds to exactly one Transition.
   */
  setTransitionDurationResolver(resolver: ThreePaneScaffoldTransitionDurationResolver) {
    if (this.transitionDurationResolver !== null && this.transitionDurationResolver !== resolver) {
      throw new Error('MutableThreePaneScaffoldState can only be attached to one transition');
    }
    this.transitionDurationResolver = resolver;
    return () => {
      if (this.transitionDurationResolver === resolver) {
        this.transitionDurationResolver = null;
      }
    };
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
   * Seek directly to a raw timeline fraction between currentState and targetState.
   * Changing target preserves currentState, matching SeekableTransitionState.seekTo.
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
   * Animate the raw transition timeline fraction to 1 and commit targetState.
   * A new snap/seek/animate call aborts the prior animation, mirroring AndroidX
   * MutatorMutex behavior. The default driver is linear; a custom animation is
   * the web equivalent of providing animateTo(animationSpec = ...).
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

    const durationMs =
      this.transitionDurationResolver?.(this.currentStateValue, targetState) ??
      DefaultUnboundTransitionDurationMs;
    if (!Number.isFinite(durationMs) || durationMs < 0) {
      throw new RangeError(`Transition duration must be finite and non-negative. Got ${durationMs}`);
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
        durationMs,
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
