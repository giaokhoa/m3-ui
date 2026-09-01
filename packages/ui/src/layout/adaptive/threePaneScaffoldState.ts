import { hasReactNodeContent } from '../reactNode';
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
  /** Latest full transition duration. */
  getDurationMs?: (elapsedMs?: number, frameTimeMs?: number) => number;
  /**
   * Shared SeekableTransitionState play time. The default driver asks for this
   * before sampling so a retarget can preserve lastFrameTimeNanos instead of
   * losing the first frame delta to a fresh RAF start timestamp.
   */
  getPlayTimeMs?: (elapsedMs: number, frameTimeMs: number) => number;
  signal: AbortSignal;
  /** Optional play time lets a custom web driver participate in the shared clock. */
  update: (fraction: number, playTimeMs?: number) => void;
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

/** Null-spec SeekingAnimationState fields needed when the running transition is retained. */
export interface ThreePaneScaffoldRunningTimeline {
  readonly durationMs: number;
  readonly startFraction: number;
  readonly progressMs: number;
}

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

function composeDurationNanos(durationMs: number) {
  return Math.max(0, Math.round(durationMs * MillisToNanos));
}

function composeLinearTransitionDurationMs(
  from: number,
  to: number,
  fullDurationMs: number,
) {
  const totalDurationNanos = composeDurationNanos(fullDurationMs);
  const fractionDelta = Math.abs(composeFloat(to) - composeFloat(from));
  return Math.round(totalDurationNanos * fractionDelta) / MillisToNanos;
}

function composeLinearTransitionFraction(
  from: number,
  to: number,
  elapsedMs: number,
  fullDurationMs: number,
) {
  const floatFrom = composeFloat(from);
  const floatTo = composeFloat(to);
  const totalDurationNanos = composeDurationNanos(fullDurationMs);
  const animationDurationNanos = Math.round(
    totalDurationNanos * Math.abs(floatTo - floatFrom),
  );
  if (animationDurationNanos <= 0) return floatTo;

  const playTimeNanos = composeDurationNanos(elapsedMs);
  if (playTimeNanos >= animationDurationNanos) return floatTo;

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
    const aHasScrim = hasReactNodeContent(a.scrim);
    const bHasScrim = hasReactNodeContent(b.scrim);
    return (
      levitatedPaneAlignmentsEqual(a.alignment, b.alignment) &&
      aHasScrim === bHasScrim &&
      (!aHasScrim || a.scrim === b.scrim) &&
      a.dragToResizeState === b.dragToResizeState
    );
  }
  return false;
}

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
  return setTimeout(() => callback(globalThis.performance?.now() ?? Date.now()), 16) as unknown as number;
}

function cancelFrame(id: number) {
  if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(id);
  else clearTimeout(id);
}

function nowMs() {
  return globalThis.performance?.now() ?? Date.now();
}

export const defaultThreePaneScaffoldProgressAnimation: ThreePaneScaffoldProgressAnimation =
  ({ from, to, durationMs, getDurationMs, getPlayTimeMs, signal, update }) =>
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
        update(floatTo, 0);
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
        const localElapsed = Math.max(0, time - startTime);
        const playTimeMs = getPlayTimeMs?.(localElapsed, time) ?? localElapsed;
        const fullDurationMs = getDurationMs?.(playTimeMs, time) ?? durationMs;
        const fraction = composeLinearTransitionFraction(
          floatFrom,
          floatTo,
          playTimeMs,
          fullDurationMs,
        );
        update(fraction, playTimeMs);
        if (fraction === floatTo) {
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

  private animationPlayTimeMsValue = 0;
  private initialValueCompletionPlayTimeMs = 0;
  private clockOriginFrameTimeMs: number | null = null;
  private lastAnimationFrameTimeMs: number | null = null;
  private initialValueAnimationsClearRevisionValue = 0;
  private clearedInitialValueAnimationController: AbortController | null = null;

  private activeAnimationStartedAtMs: number | null = null;
  private activeAnimationCompletionDurationMs = 0;
  private activeDefaultAnimationStartFraction: number | null = null;
  private activeDefaultAnimationProgressMs = 0;
  private activeDefaultAnimationDurationMs: number | null = null;

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
    const controller = this.animationController;
    controller?.abort();
    if (this.clearedInitialValueAnimationController === controller) {
      this.clearedInitialValueAnimationController = null;
    }
    this.animationController = null;
  }

  private resetCurrentAnimationTiming() {
    this.activeAnimationStartedAtMs = null;
    this.activeAnimationCompletionDurationMs = 0;
    this.activeDefaultAnimationStartFraction = null;
    this.activeDefaultAnimationProgressMs = 0;
    this.activeDefaultAnimationDurationMs = null;
    this.clearedInitialValueAnimationController = null;
  }

  private clearInitialValueAnimations(resetPlayTime: boolean) {
    this.initialValueCompletionPlayTimeMs = 0;
    this.clockOriginFrameTimeMs = null;
    this.lastAnimationFrameTimeMs = null;
    if (resetPlayTime) this.animationPlayTimeMsValue = 0;
    this.initialValueAnimationsClearRevisionValue += 1;
  }

  private endAllAnimationsForDurationChange(
    controller: AbortController | null = this.animationController,
  ) {
    this.progressFractionValue = 1;
    this.initialValueCompletionPlayTimeMs = this.animationPlayTimeMsValue;
    this.activeAnimationStartedAtMs = null;
    this.activeAnimationCompletionDurationMs = 0;
    this.activeDefaultAnimationStartFraction = null;
    this.activeDefaultAnimationProgressMs = 0;
    this.activeDefaultAnimationDurationMs = null;
    this.clearedInitialValueAnimationController = controller;
    this.initialValueAnimationsClearRevisionValue += 1;
    this.notify();
  }

  private advanceAnimationClock(frameTimeMs: number) {
    if (this.clockOriginFrameTimeMs === null) {
      this.clockOriginFrameTimeMs = frameTimeMs - this.animationPlayTimeMsValue;
    }
    this.lastAnimationFrameTimeMs = frameTimeMs;
    this.animationPlayTimeMsValue = Math.max(
      0,
      frameTimeMs - this.clockOriginFrameTimeMs,
    );
  }

  private activeInitialValueRemainingMs() {
    return Math.max(
      0,
      this.initialValueCompletionPlayTimeMs - this.animationPlayTimeMsValue,
    );
  }

  private activeDefaultAnimationRemainingMs() {
    const startFraction = this.activeDefaultAnimationStartFraction;
    const durationMs = this.activeDefaultAnimationDurationMs;
    if (startFraction === null || durationMs === null) return null;
    return Math.max(
      0,
      composeLinearTransitionDurationMs(startFraction, 1, durationMs) -
        this.activeDefaultAnimationProgressMs,
    );
  }

  private activeAnimationRemainingMs() {
    if (this.activeAnimationStartedAtMs === null) return 0;
    return Math.max(
      0,
      this.activeAnimationCompletionDurationMs -
        (nowMs() - this.activeAnimationStartedAtMs),
    );
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

  private calculateRetainedInitialDurationMs(
    oldCurrent: ThreePaneScaffoldValue,
    oldTarget: ThreePaneScaffoldValue,
    oldFraction: number,
    includeCurrentAnimation: boolean,
  ) {
    const retainedRemaining = this.activeInitialValueRemainingMs();
    if (!includeCurrentAnimation) return retainedRemaining;

    const runningRemaining =
      this.activeDefaultAnimationRemainingMs() ?? this.activeAnimationRemainingMs();
    if (runningRemaining > 0) return Math.max(retainedRemaining, runningRemaining);
    if (
      oldFraction >= 1 ||
      threePaneScaffoldValuesEqual(oldCurrent, oldTarget)
    ) {
      return retainedRemaining;
    }
    const oldDurationMs = this.resolveTransitionDurationMs(oldCurrent, oldTarget);
    return Math.max(
      retainedRemaining,
      composeLinearTransitionDurationMs(oldFraction, 1, oldDurationMs),
    );
  }

  private installRetainedInitialClock(basePlayTimeMs: number, remainingMs: number) {
    this.animationPlayTimeMsValue = Math.max(0, basePlayTimeMs);
    this.initialValueCompletionPlayTimeMs =
      this.animationPlayTimeMsValue + Math.max(0, remainingMs);
    this.clockOriginFrameTimeMs =
      this.lastAnimationFrameTimeMs === null
        ? null
        : this.lastAnimationFrameTimeMs - this.animationPlayTimeMsValue;
  }

  private async waitForInitialValueCompletion(controller: AbortController) {
    if (this.animationPlayTimeMsValue >= this.initialValueCompletionPlayTimeMs) return;
    await new Promise<void>((resolve) => {
      let frame = 0;
      const finish = () => {
        controller.signal.removeEventListener('abort', abort);
        resolve();
      };
      const tick = (time: number) => {
        if (controller.signal.aborted) {
          finish();
          return;
        }
        this.advanceAnimationClock(time);
        this.notify();
        if (this.animationPlayTimeMsValue >= this.initialValueCompletionPlayTimeMs) {
          finish();
          return;
        }
        frame = requestFrame(tick);
      };
      const abort = () => {
        cancelFrame(frame);
        finish();
      };
      controller.signal.addEventListener('abort', abort, { once: true });
      frame = requestFrame(tick);
    });
  }

  private startSeekInitialValueClock(basePlayTimeMs: number, remainingMs: number) {
    this.installRetainedInitialClock(basePlayTimeMs, remainingMs);
    if (remainingMs <= 0) return;

    const controller = new AbortController();
    this.animationController = controller;
    void this.waitForInitialValueCompletion(controller).finally(() => {
      if (this.animationController === controller) {
        this.animationController = null;
        this.notify();
      }
    });
  }

  private updateSettledPredictiveBack(
    targetState: ThreePaneScaffoldValue,
    predictiveBack: boolean,
  ) {
    if (
      !threePaneScaffoldValuesEqual(this.currentStateValue, targetState) ||
      !threePaneScaffoldValuesEqual(this.targetStateValue, targetState)
    ) {
      return false;
    }
    if (this.predictiveBack !== predictiveBack) {
      this.predictiveBack = predictiveBack;
      this.notify();
    }
    return true;
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

  get animationPlayTimeMs() {
    return this.animationPlayTimeMsValue;
  }

  get defaultAnimationTimeline(): ThreePaneScaffoldRunningTimeline | undefined {
    const startFraction = this.activeDefaultAnimationStartFraction;
    const durationMs = this.activeDefaultAnimationDurationMs;
    if (startFraction === null || durationMs === null || this.progressFractionValue >= 1) {
      return undefined;
    }
    return {
      durationMs,
      startFraction,
      progressMs: this.activeDefaultAnimationProgressMs,
    };
  }

  get initialValueAnimationsClearRevision() {
    return this.initialValueAnimationsClearRevisionValue;
  }

  get isPredictiveBackInProgress() {
    return this.predictiveBack;
  }

  get isTransitionActive() {
    return !threePaneScaffoldValuesEqual(this.currentStateValue, this.targetStateValue);
  }

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

    if (
      this.progressFractionValue < 1 &&
      this.activeDefaultAnimationStartFraction !== null &&
      this.activeDefaultAnimationDurationMs !== null &&
      !threePaneScaffoldValuesEqual(this.currentStateValue, this.targetStateValue)
    ) {
      const previousDurationMs = this.activeDefaultAnimationDurationMs;
      const currentDurationMs = this.resolveTransitionDurationMs(
        this.currentStateValue,
        this.targetStateValue,
      );
      if (
        composeDurationNanos(currentDurationMs) !==
        composeDurationNanos(previousDurationMs)
      ) {
        const progressNanos = composeDurationNanos(this.activeDefaultAnimationProgressMs);
        const totalDurationNanos = composeDurationNanos(currentDurationMs);
        if (progressNanos > totalDurationNanos) {
          this.endAllAnimationsForDurationChange();
        } else {
          // AndroidX keeps the current fraction parked until runAnimations
          // advances again; only the null-spec duration cache changes here.
          this.activeDefaultAnimationDurationMs = currentDurationMs;
        }
      }
    }

    return () => {
      if (this.transitionOwner === owner && this.transitionDurationResolver === resolver) {
        this.transitionDurationResolver = null;
        this.transitionOwner = null;
      }
    };
  }

  snapTo(targetState: ThreePaneScaffoldValue) {
    this.cancelAnimation();
    this.resetCurrentAnimationTiming();
    if (this.transitionOwner === null) {
      const predictiveBackChanged = this.predictiveBack;
      this.predictiveBack = false;
      if (predictiveBackChanged) this.notify();
      return;
    }
    if (this.updateSettledPredictiveBack(targetState, false)) return;
    this.clearInitialValueAnimations(true);
    this.predictiveBack = false;
    this.currentStateValue = targetState;
    this.targetStateValue = targetState;
    this.progressFractionValue = 0;
    this.notify();
  }

  seekTo(
    fraction: number,
    targetState: ThreePaneScaffoldValue = this.targetStateValue,
    isPredictiveBackInProgress = false,
  ) {
    const resolvedFraction = clampFraction(fraction);
    if (this.transitionOwner === null) {
      this.cancelAnimation();
      this.resetCurrentAnimationTiming();
      this.clearInitialValueAnimations(true);
      const predictiveBackChanged = this.predictiveBack !== isPredictiveBackInProgress;
      this.predictiveBack = isPredictiveBackInProgress;
      if (predictiveBackChanged) this.notify();
      return;
    }
    if (this.updateSettledPredictiveBack(targetState, isPredictiveBackInProgress)) return;

    const oldCurrent = this.currentStateValue;
    const oldTarget = this.targetStateValue;
    const oldFraction = this.progressFraction;
    const oldPlayTimeMs = this.animationPlayTimeMsValue;
    const oldLastFrameTimeMs = this.lastAnimationFrameTimeMs;
    const targetChanged = !threePaneScaffoldValuesEqual(targetState, oldTarget);
    const retainedRemainingMs = this.calculateRetainedInitialDurationMs(
      oldCurrent,
      oldTarget,
      oldFraction,
      targetChanged,
    );

    this.cancelAnimation();
    this.resetCurrentAnimationTiming();
    this.lastAnimationFrameTimeMs = oldLastFrameTimeMs;
    this.predictiveBack = isPredictiveBackInProgress;

    if (targetChanged) {
      this.currentStateValue = oldTarget;
      this.targetStateValue = targetState;
      this.animationPlayTimeMsValue = 0;
      this.clockOriginFrameTimeMs = null;
    }
    this.progressFractionValue = threePaneScaffoldValuesEqual(
      this.currentStateValue,
      this.targetStateValue,
    )
      ? 0
      : resolvedFraction;
    this.notify();

    this.startSeekInitialValueClock(
      targetChanged ? 0 : oldPlayTimeMs,
      retainedRemainingMs,
    );
  }

  async animateTo(
    targetState: ThreePaneScaffoldValue = this.targetStateValue,
    {
      animation = this.defaultAnimation,
      isPredictiveBackInProgress = false,
    }: ThreePaneScaffoldAnimateOptions = {},
  ) {
    if (this.transitionOwner === null) {
      this.cancelAnimation();
      this.resetCurrentAnimationTiming();
      this.clearInitialValueAnimations(true);
      const predictiveBackChanged = this.predictiveBack;
      this.predictiveBack = false;
      if (predictiveBackChanged) this.notify();
      return;
    }
    if (this.updateSettledPredictiveBack(targetState, false)) return;

    const oldCurrent = this.currentStateValue;
    const oldTarget = this.targetStateValue;
    const oldFraction = this.progressFraction;
    const oldPlayTimeMs = this.animationPlayTimeMsValue;
    const oldLastFrameTimeMs = this.lastAnimationFrameTimeMs;
    const targetChanged = !threePaneScaffoldValuesEqual(targetState, oldTarget);

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

    const retainedRemainingMs = this.calculateRetainedInitialDurationMs(
      oldCurrent,
      oldTarget,
      oldFraction,
      targetChanged,
    );
    this.cancelAnimation();
    this.resetCurrentAnimationTiming();
    this.lastAnimationFrameTimeMs = oldLastFrameTimeMs;

    if (targetChanged) {
      this.currentStateValue = oldTarget;
      this.targetStateValue = targetState;
      this.progressFractionValue = 0;
      this.installRetainedInitialClock(0, retainedRemainingMs);
    } else {
      this.installRetainedInitialClock(oldPlayTimeMs, retainedRemainingMs);
    }

    const resolvedCurrent = this.currentStateValue;
    const resolvedTarget = this.targetStateValue;
    const startingFraction = this.progressFraction;

    let durationMs: number;
    try {
      durationMs = this.resolveTransitionDurationMs(resolvedCurrent, resolvedTarget);
    } catch (error) {
      const predictiveBackChanged = this.predictiveBack;
      this.predictiveBack = false;
      if (predictiveBackChanged) this.notify();
      throw error;
    }

    this.predictiveBack = isPredictiveBackInProgress;
    const controller = new AbortController();
    this.animationController = controller;
    this.activeAnimationStartedAtMs = nowMs();
    this.activeAnimationCompletionDurationMs =
      durationMs * Math.abs(1 - startingFraction);
    if (animation === defaultThreePaneScaffoldProgressAnimation) {
      this.activeDefaultAnimationStartFraction = startingFraction;
      this.activeDefaultAnimationDurationMs = durationMs;
    }
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

    const clockBasePlayTimeMs = this.animationPlayTimeMsValue;

    try {
      if (startingFraction < 1) {
        await animation({
          from: startingFraction,
          to: 1,
          durationMs,
          getPlayTimeMs: (elapsedMs, frameTimeMs) => {
            if (this.clearedInitialValueAnimationController === controller) {
              // endAllAnimations() emptied both animation collections between
              // frames. AndroidX still receives the already-scheduled frame,
              // but it must not advance the retained initial-value clock.
              this.clearedInitialValueAnimationController = null;
              this.lastAnimationFrameTimeMs = frameTimeMs;
            } else {
              this.advanceAnimationClock(frameTimeMs);
            }
            const operationPlayTimeMs = Math.max(
              0,
              this.animationPlayTimeMsValue - clockBasePlayTimeMs,
            );
            this.activeDefaultAnimationProgressMs = operationPlayTimeMs;
            return operationPlayTimeMs;
          },
          getDurationMs: () => {
            const currentDurationMs = this.resolveTransitionDurationMs(
              resolvedCurrent,
              this.targetStateValue,
            );
            if (
              animation === defaultThreePaneScaffoldProgressAnimation &&
              this.activeDefaultAnimationStartFraction !== null
            ) {
              const previousDurationMs = this.activeDefaultAnimationDurationMs;
              if (
                previousDurationMs !== null &&
                composeDurationNanos(currentDurationMs) !==
                  composeDurationNanos(previousDurationMs) &&
                composeDurationNanos(this.activeDefaultAnimationProgressMs) >
                  composeDurationNanos(currentDurationMs)
              ) {
                // Child duration can also change while runAnimations is already
                // processing this frame. Mirror onTotalDurationChanged() after
                // the shared progressNanos has consumed this frame's delta.
                this.endAllAnimationsForDurationChange(controller);
              } else {
                this.activeDefaultAnimationDurationMs = currentDurationMs;
              }
            }
            return currentDurationMs;
          },
          signal: controller.signal,
          update: (fraction, playTimeMs) => {
            if (controller.signal.aborted) return;
            this.progressFractionValue = coerceAnimationFraction(fraction);
            if (playTimeMs !== undefined) {
              this.animationPlayTimeMsValue = Math.max(
                this.animationPlayTimeMsValue,
                clockBasePlayTimeMs + Math.max(0, playTimeMs),
              );
            } else if (this.activeAnimationStartedAtMs !== null) {
              this.animationPlayTimeMsValue = Math.max(
                this.animationPlayTimeMsValue,
                clockBasePlayTimeMs + nowMs() - this.activeAnimationStartedAtMs,
              );
            }
            this.notify();
          },
        });
      }
      if (controller.signal.aborted) return;

      await this.waitForInitialValueCompletion(controller);
      if (controller.signal.aborted) return;

      const committedTarget = this.targetStateValue;
      this.currentStateValue = committedTarget;
      this.targetStateValue = committedTarget;
      this.progressFractionValue = 0;
    } finally {
      if (this.animationController === controller) {
        this.animationController = null;
        this.resetCurrentAnimationTiming();
        this.animationPlayTimeMsValue = 0;
        this.initialValueCompletionPlayTimeMs = 0;
        this.clockOriginFrameTimeMs = null;
        this.lastAnimationFrameTimeMs = null;
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
