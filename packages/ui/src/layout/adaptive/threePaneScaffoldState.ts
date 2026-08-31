import { customLevitatedPaneAlignmentsEqual } from './levitatedPaneAlignment';
import { paneScaffoldRolesEqual } from './paneScaffoldRole';
import type {
  LevitatedPaneAlignment,
  PaneAdaptedValue,
  ThreePaneScaffoldValue,
} from './threePaneScaffold';

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
  /** Full transition duration at animation start. */
  durationMs: number;
  /** Latest full transition duration; the default linear driver observes changes while running. */
  getDurationMs?: () => number;
  signal: AbortSignal;
  update: (fraction: number) => void;
}

export type ThreePaneScaffoldProgressAnimation = (
  context: ThreePaneScaffoldProgressAnimationContext,
) => Promise<void>;

export interface ThreePaneScaffoldAnimateOptions {
  /** Web animation driver corresponding to AndroidX animateTo(animationSpec = ...). */
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
const MillisToNanos = 1_000_000;

function composeFloat(value: number) {
  return Math.fround(value);
}

function clampFraction(fraction: number) {
  const floatFraction = composeFloat(fraction);
  if (!Number.isFinite(floatFraction) || floatFraction < 0 || floatFraction > 1) {
    throw new RangeError(`Expecting fraction between 0 and 1. Got ${fraction}`);
  }
  return floatFraction;
}

function coerceAnimationFraction(fraction: number) {
  // SeekableTransitionState.fraction is mutableFloatStateOf. Convert to Float
  // before Float.coerceIn semantics; NaN remains NaN while finite overshoot clamps.
  const floatFraction = composeFloat(fraction);
  if (floatFraction < 0) return 0;
  if (floatFraction > 1) return 1;
  return floatFraction;
}

function composeFloatLerp(start: number, stop: number, fraction: number) {
  const floatStart = composeFloat(start);
  const floatStop = composeFloat(stop);
  const floatFraction = composeFloat(fraction);
  const inverseFraction = composeFloat(composeFloat(1) - floatFraction);
  return composeFloat(
    composeFloat(inverseFraction * floatStart) +
      composeFloat(floatFraction * floatStop),
  );
}

function composeLinearTransitionFraction(
  from: number,
  to: number,
  elapsedMs: number,
  fullDurationMs: number,
) {
  const floatFrom = composeFloat(from);
  const floatTo = composeFloat(to);
  const totalDurationNanos = Math.round(fullDurationMs * MillisToNanos);
  const animationDurationNanos = Math.round(
    totalDurationNanos * Math.abs(floatTo - floatFrom),
  );
  if (animationDurationNanos <= 0) return floatTo;

  const playTimeNanos = Math.max(0, Math.round(elapsedMs * MillisToNanos));
  if (playTimeNanos >= animationDurationNanos) return floatTo;

  // SeekableTransitionState's null-spec path converts both Long nanos values
  // to Float for division, then lerps Float start/target values.
  const timelineFraction = composeFloat(
    composeFloat(playTimeNanos) / composeFloat(animationDurationNanos),
  );
  return composeFloatLerp(floatFrom, floatTo, timelineFraction);
}

function levitatedPaneAlignmentsEqual(
  a: LevitatedPaneAlignment,
  b: LevitatedPaneAlignment,
): boolean {
  if (a === b) return true;
  if (typeof a === 'string' || typeof b === 'string') return false;
  return customLevitatedPaneAlignmentsEqual(a, b);
}

function paneAdaptedValuesEqual(a: PaneAdaptedValue, b: PaneAdaptedValue): boolean {
  if (a === b) return true;
  if (a.type !== b.type) return false;
  if (a.type === 'expanded' || a.type === 'hidden') return true;
  if (a.type === 'reflowed' && b.type === 'reflowed') {
    return paneScaffoldRolesEqual(a.reflowUnder, b.reflowUnder);
  }
  if (a.type === 'levitated' && b.type === 'levitated') {
    return (
      levitatedPaneAlignmentsEqual(a.alignment, b.alignment) &&
      a.scrim === b.scrim &&
      a.dragToResizeState === b.dragToResizeState
    );
  }
  return false;
}

/**
 * Structural equality equivalent to AndroidX ThreePaneScaffoldValue equality.
 * currentDestination is internal metadata upstream and is deliberately excluded.
 */
export function threePaneScaffoldValuesEqual(
  a: ThreePaneScaffoldValue,
  b: ThreePaneScaffoldValue,
): boolean {
  return (
    a === b ||
    (paneAdaptedValuesEqual(a.primary, b.primary) &&
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
 * child animation specs, not to this normalized state fraction. If the
 * Transition total duration changes while running, AndroidX recomputes the
 * remaining linear duration from the same start fraction; the live duration
 * getter mirrors that behavior here.
 */
export const defaultThreePaneScaffoldProgressAnimation: ThreePaneScaffoldProgressAnimation =
  ({ from, to, durationMs, getDurationMs, signal, update }) =>
    new Promise<void>((resolve) => {
      const floatFrom = composeFloat(from);
      const floatTo = composeFloat(to);
      const initialRemainingDurationMs = Math.max(
        0,
        durationMs * Math.abs(floatTo - floatFrom),
      );
      if (
        signal.aborted ||
        floatFrom === floatTo ||
        initialRemainingDurationMs === 0
      ) {
        update(floatTo);
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
        const fullDurationMs = getDurationMs?.() ?? durationMs;
        const fraction = composeLinearTransitionFraction(
          floatFrom,
          floatTo,
          elapsed,
          fullDurationMs,
        );
        update(fraction);
        if (fraction === floatTo) {
          update(floatTo);
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
  private activeAnimation:
    | {
        driver: ThreePaneScaffoldProgressAnimation;
        targetState: ThreePaneScaffoldValue;
        controller: AbortController;
        completion: Promise<void>;
      }
    | null = null;
  private readonly defaultAnimation: ThreePaneScaffoldProgressAnimation;
  private transitionOwner: object | null;
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
    this.transitionOwner = transitionDurationResolver === undefined ? null : this;
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

  private resolveTransitionDurationMs(
    currentState: ThreePaneScaffoldValue,
    targetState: ThreePaneScaffoldValue,
  ) {
    const durationMs =
      this.transitionDurationResolver?.(currentState, targetState) ??
      DefaultUnboundTransitionDurationMs;
    if (!Number.isFinite(durationMs) || durationMs < 0) {
      throw new RangeError(`Transition duration must be finite and non-negative. Got ${durationMs}`);
    }
    return durationMs;
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
   * Attach the duration resolver for one rendering Transition owner. Resolver
   * updates from that same owner are allowed, but the owner itself is retained
   * for the state's lifetime even after cleanup, matching transitionRemoved().
   */
  setTransitionDurationResolver(
    owner: object,
    resolver: ThreePaneScaffoldTransitionDurationResolver,
  ) {
    if (this.transitionOwner === null) {
      this.transitionOwner = owner;
    } else if (this.transitionOwner !== owner) {
      throw new Error('MutableThreePaneScaffoldState can only be attached to one transition');
    }
    this.transitionDurationResolver = resolver;
    return () => {
      if (this.transitionOwner === owner && this.transitionDurationResolver === resolver) {
        this.transitionDurationResolver = null;
      }
    };
  }

  /** Snap current and target to the same value and cancel any active transition. */
  snapTo(targetState: ThreePaneScaffoldValue) {
    this.cancelAnimation();
    const predictiveBackChanged = this.predictiveBack;
    this.predictiveBack = false;
    if (
      threePaneScaffoldValuesEqual(this.currentStateValue, targetState) &&
      threePaneScaffoldValuesEqual(this.targetStateValue, targetState)
    ) {
      if (predictiveBackChanged) this.notify();
      return;
    }
    this.currentStateValue = targetState;
    this.targetStateValue = targetState;
    this.progressFractionValue = 0;
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
    const resolvedFraction = clampFraction(fraction);
    const oldTarget = this.targetStateValue;
    const targetChanged = !threePaneScaffoldValuesEqual(targetState, oldTarget);
    this.cancelAnimation();
    const predictiveBackChanged = this.predictiveBack !== isPredictiveBackInProgress;
    this.predictiveBack = isPredictiveBackInProgress;

    if (!targetChanged && threePaneScaffoldValuesEqual(this.currentStateValue, targetState)) {
      if (predictiveBackChanged) this.notify();
      return;
    }

    if (targetChanged) {
      this.targetStateValue = targetState;
    }
    this.progressFractionValue = threePaneScaffoldValuesEqual(
      this.currentStateValue,
      this.targetStateValue,
    )
      ? 0
      : resolvedFraction;
    this.notify();
  }

  /**
   * Animate the raw transition timeline fraction to 1 and commit targetState.
   * Snap/seek/retarget or a changed driver aborts the prior animation. Repeating
   * the same target with the same driver continues the in-flight timeline,
   * matching SeekableTransitionState's retained currentAnimation behavior.
   */
  async animateTo(
    targetState: ThreePaneScaffoldValue = this.targetStateValue,
    {
      animation = this.defaultAnimation,
      isPredictiveBackInProgress = false,
    }: ThreePaneScaffoldAnimateOptions = {},
  ) {
    const oldTarget = this.targetStateValue;
    const targetChanged = !threePaneScaffoldValuesEqual(targetState, oldTarget);

    if (!targetChanged && threePaneScaffoldValuesEqual(this.currentStateValue, oldTarget)) {
      this.cancelAnimation();
      const predictiveBackChanged = this.predictiveBack;
      this.predictiveBack = false;
      if (predictiveBackChanged) this.notify();
      return;
    }

    const runningAnimation = this.activeAnimation;
    if (
      !targetChanged &&
      runningAnimation !== null &&
      !runningAnimation.controller.signal.aborted &&
      runningAnimation.driver === animation &&
      threePaneScaffoldValuesEqual(runningAnimation.targetState, targetState)
    ) {
      const predictiveBackChanged = this.predictiveBack !== isPredictiveBackInProgress;
      this.predictiveBack = isPredictiveBackInProgress;
      if (predictiveBackChanged) this.notify();
      await runningAnimation.completion;
      return;
    }

    this.cancelAnimation();

    if (targetChanged) {
      // SeekableTransitionState.animateTo retargets from the previous target,
      // even when the requested target equals the pre-retarget current state.
      // The React renderer separately captures the current visual frame so this
      // discrete state change does not imply a visual jump.
      this.currentStateValue = oldTarget;
      this.targetStateValue = targetState;
      this.progressFractionValue = 0;
    }

    const resolvedCurrent = this.currentStateValue;
    const resolvedTarget = this.targetStateValue;
    const startingFraction = this.progressFraction;
    if (!targetChanged && startingFraction === 1) {
      // SeekableTransitionState only creates a new fraction animation when
      // fraction < 1f. At the target fraction there is no animationSpec to run;
      // the transition simply commits its target state.
      this.currentStateValue = resolvedTarget;
      this.targetStateValue = resolvedTarget;
      this.progressFractionValue = 0;
      this.predictiveBack = false;
      this.notify();
      return;
    }
    const durationMs = this.resolveTransitionDurationMs(resolvedCurrent, resolvedTarget);

    this.predictiveBack = isPredictiveBackInProgress;
    const controller = new AbortController();
    this.animationController = controller;
    this.notify();

    let resolveCompletion!: () => void;
    const completion = new Promise<void>((resolve) => {
      resolveCompletion = resolve;
    });
    this.activeAnimation = {
      driver: animation,
      targetState: resolvedTarget,
      controller,
      completion,
    };

    try {
      await animation({
        from: startingFraction,
        to: 1,
        durationMs,
        getDurationMs: () => this.resolveTransitionDurationMs(resolvedCurrent, resolvedTarget),
        signal: controller.signal,
        update: (fraction) => {
          if (controller.signal.aborted) return;
          this.progressFractionValue = coerceAnimationFraction(fraction);
          this.notify();
        },
      });
      if (controller.signal.aborted) return;
      this.currentStateValue = resolvedTarget;
      this.targetStateValue = resolvedTarget;
      this.progressFractionValue = 0;
    } finally {
      if (this.animationController === controller) {
        this.animationController = null;
        this.predictiveBack = false;
        this.notify();
      }
      if (this.activeAnimation?.controller === controller) {
        this.activeAnimation = null;
      }
      resolveCompletion();
    }
  }
}
