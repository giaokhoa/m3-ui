import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';

export const PredictiveBackMinScale = 0.95;
const PredictiveBackReturnSpringDampingRatio = 1;
const PredictiveBackReturnSpringStiffness = 1500;
const PredictiveBackReturnSpringVisibilityThreshold = 0.01;

export interface PredictiveBackScaffoldState {
  readonly progressFraction: number;
  readonly isPredictiveBackInProgress: boolean;
}

export type PredictiveBackScaleCollection =
  | { readonly type: 'none'; readonly progressFraction: number }
  | { readonly type: 'snap'; readonly progressFraction: number; readonly scale: number }
  | { readonly type: 'return'; readonly progressFraction: number };

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

function composeFloat(value: number): number {
  return Math.fround(value);
}

/**
 * Mirrors AndroidX PredictiveBackScaleState's Float decay curve.
 *
 * fraction=0 starts at 1; as fraction approaches 1 the scale approaches
 * PredictiveBackMinScale without reaching it during the seek. Math.fround is
 * applied at the same Float expression boundaries as the Compose source.
 */
export function calculatePredictiveBackScale(fraction: number): number {
  const one = composeFloat(1);
  const minimumScale = composeFloat(PredictiveBackMinScale);
  const fractionFloat = composeFloat(fraction);
  const delta = composeFloat(one - minimumScale);
  const shift = composeFloat(delta / composeFloat(2));
  const curveScale = composeFloat(composeFloat(delta * delta) / composeFloat(2));
  const denominator = composeFloat(fractionFloat + shift);
  return composeFloat(composeFloat(curveScale / denominator) + minimumScale);
}

export function getPredictiveBackScale(
  state: PredictiveBackScaffoldState | undefined,
): number | undefined {
  return state?.isPredictiveBackInProgress
    ? calculatePredictiveBackScale(state.progressFraction)
    : undefined;
}

/**
 * Mirrors CollectPredictiveBackScale's snapshotFlow collector. The flow only
 * observes progressFraction; changing isPredictiveBackInProgress without a new
 * fraction emission does not snap or return the Animatable. previousValue also
 * starts at 0f upstream, so an initial zero fraction is ignored.
 */
export function collectPredictiveBackScaleEmission(
  previousProgressFraction: number,
  state: PredictiveBackScaffoldState | undefined,
): PredictiveBackScaleCollection {
  const previous = composeFloat(previousProgressFraction);
  const progressFraction = composeFloat(state?.progressFraction ?? 0);
  if (progressFraction === previous) {
    return { type: 'none', progressFraction: previous };
  }
  if (state?.isPredictiveBackInProgress === true) {
    return {
      type: 'snap',
      progressFraction,
      scale: calculatePredictiveBackScale(progressFraction),
    };
  }
  return { type: 'return', progressFraction };
}

/**
 * Port of the critically-damped branch in AndroidX SpringEstimation.kt.
 *
 * FloatSpringSpec first normalizes its Float displacement by the Float
 * visibility threshold, then estimateAnimationDurationMillis converts those
 * Float arguments to Double and uses this Newton-Raphson estimator.
 */
function estimateComposeCriticalSpringDurationMs(initialDisplacement: number): number {
  const initialVelocity = composeFloat(0);
  if (initialDisplacement === 0 && initialVelocity === 0) return 0;

  const stiffness = Number(composeFloat(PredictiveBackReturnSpringStiffness));
  const dampingRatio = Number(composeFloat(PredictiveBackReturnSpringDampingRatio));
  const delta = Number(composeFloat(1));

  const dampingCoefficient = 2 * dampingRatio * Math.sqrt(stiffness);
  const partialRoot = dampingCoefficient * dampingCoefficient - 4 * stiffness;
  const partialRootReal = partialRoot < 0 ? 0 : Math.sqrt(partialRoot);
  const firstRootReal = (-dampingCoefficient + partialRootReal) * 0.5;

  const v0 = initialDisplacement < 0 ? -initialVelocity : initialVelocity;
  const p0 = Math.abs(initialDisplacement);
  const r = firstRootReal;
  const c1 = p0;
  const c2 = v0 - r * c1;

  const t1 = Math.log(Math.abs(delta / c1)) / r;
  const guess = Math.log(Math.abs(delta / c2));
  let t = guess;
  for (let iteration = 0; iteration <= 5; iteration += 1) {
    t = guess - Math.log(Math.abs(t / r));
  }
  const t2 = t / r;

  let tCurrent =
    !Number.isFinite(t1) ? t2 : !Number.isFinite(t2) ? t1 : Math.max(t1, t2);

  const tInflection = -(r * c1 + c2) / (r * c2);
  const xInflection =
    c1 * Math.exp(r * tInflection) +
    c2 * tInflection * Math.exp(r * tInflection);

  let signedDelta: number;
  if (Number.isNaN(tInflection) || tInflection <= 0) {
    signedDelta = -delta;
  } else if (tInflection > 0 && -xInflection < delta) {
    if (c2 < 0 && c1 > 0) tCurrent = 0;
    signedDelta = -delta;
  } else {
    tCurrent = -(2 / r) - c1 / c2;
    signedDelta = delta;
  }

  let tDelta = Number.POSITIVE_INFINITY;
  let iterations = 0;
  while (tDelta > 0.001 && iterations < 100) {
    iterations += 1;
    const previous = tCurrent;
    const exponential = Math.exp(r * tCurrent);
    const value = (c1 + c2 * tCurrent) * exponential + signedDelta;
    const derivative =
      (c2 * (r * tCurrent + 1) + c1 * r) * exponential;
    tCurrent -= value / derivative;
    tDelta = Math.abs(previous - tCurrent);
  }

  // Kotlin Double.toLong() truncates toward zero. The predictive scale range
  // keeps this finite; NaN is retained as Compose's zero conversion fallback.
  const milliseconds = tCurrent * 1000;
  return Number.isNaN(milliseconds) ? 0 : Math.trunc(milliseconds);
}

/**
 * Duration of AndroidX Animatable.animateTo(1f)'s default Float spring after
 * predictive back ends. PredictiveBackScaleState snaps while the gesture is
 * active, so the return spring always starts with zero velocity.
 */
export function calculatePredictiveBackReturnSpringDurationMs(
  initialScale: number,
): number {
  if (!Number.isFinite(initialScale) || initialScale <= 0) {
    throw new RangeError(`initialScale must be finite and positive, received ${initialScale}`);
  }

  const initialValue = composeFloat(initialScale);
  if (!Number.isFinite(initialValue) || initialValue <= 0) {
    throw new RangeError(`initialScale must fit in a positive Float, received ${initialScale}`);
  }

  const targetValue = composeFloat(1);
  const visibilityThreshold = composeFloat(
    PredictiveBackReturnSpringVisibilityThreshold,
  );
  const initialDisplacement = composeFloat(
    composeFloat(initialValue - targetValue) / visibilityThreshold,
  );

  return estimateComposeCriticalSpringDurationMs(initialDisplacement);
}

/** Samples the same critically-damped default Float spring as Animatable. */
export function samplePredictiveBackReturnSpring(
  initialScale: number,
  playTimeMs: number,
): number {
  if (!Number.isFinite(playTimeMs)) {
    throw new RangeError(`playTimeMs must be finite, received ${playTimeMs}`);
  }

  const initialValue = composeFloat(initialScale);
  const durationMs = calculatePredictiveBackReturnSpringDurationMs(initialValue);
  if (playTimeMs >= durationMs) return 1;
  if (playTimeMs <= 0) return initialValue;

  // FloatSpringSpec truncates nanos to whole milliseconds before querying
  // SpringSimulation. SpringSimulation does its analytical math in Double and
  // converts the resulting value back to Float.
  const seconds = Math.floor(playTimeMs) / 1000;
  const naturalFrequency = Math.sqrt(
    Number(composeFloat(PredictiveBackReturnSpringStiffness)),
  );
  const adjustedDisplacement = composeFloat(initialValue - composeFloat(1));
  const coefficientA = adjustedDisplacement;
  const coefficientB = naturalFrequency * adjustedDisplacement;
  const displacement =
    (coefficientA + coefficientB * seconds) *
    Math.exp(-naturalFrequency * seconds);
  return composeFloat(displacement + composeFloat(1));
}

/**
 * Renderer-owned equivalent of AndroidX PredictiveBackScaleState.
 *
 * CollectPredictiveBackScale observes progressFraction through snapshotFlow.
 * A new fraction snaps to the predictive decay curve while predictive back is
 * active, or starts the Animatable return spring otherwise. Flag-only changes
 * with an unchanged fraction intentionally do not produce a collector event.
 */
export function usePredictiveBackScale(
  state: PredictiveBackScaffoldState | undefined,
): number {
  const progressFraction = composeFloat(state?.progressFraction ?? 0);
  const isPredictiveBackInProgress = state?.isPredictiveBackInProgress ?? false;
  const previousProgressRef = useRef(0);
  const scaleRef = useRef(1);
  const frameRef = useRef<number | null>(null);
  const [animatedScale, setAnimatedScale] = useState(1);

  useLayoutEffect(() => {
    const emission = collectPredictiveBackScaleEmission(previousProgressRef.current, {
      progressFraction,
      isPredictiveBackInProgress,
    });
    if (emission.type === 'none') return;
    previousProgressRef.current = emission.progressFraction;

    if (frameRef.current !== null) {
      cancelFrame(frameRef.current);
      frameRef.current = null;
    }

    if (emission.type === 'snap') {
      scaleRef.current = emission.scale;
      setAnimatedScale(emission.scale);
      return;
    }

    const initialScale = scaleRef.current;
    const durationMs = calculatePredictiveBackReturnSpringDurationMs(initialScale);
    if (durationMs === 0) {
      scaleRef.current = 1;
      setAnimatedScale(1);
      return;
    }

    setAnimatedScale(initialScale);
    let startTime: number | undefined;
    const tick = (time: number) => {
      startTime ??= time;
      const elapsed = Math.max(0, time - startTime);
      const nextScale = samplePredictiveBackReturnSpring(initialScale, elapsed);
      scaleRef.current = nextScale;
      setAnimatedScale(nextScale);
      if (elapsed >= durationMs) {
        scaleRef.current = 1;
        setAnimatedScale(1);
        frameRef.current = null;
        return;
      }
      frameRef.current = requestFrame(tick);
    };
    frameRef.current = requestFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        cancelFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [progressFraction, isPredictiveBackInProgress]);

  return animatedScale;
}

/**
 * AndroidX applies predictive-back scaling in its own graphics layer with a
 * fixed center TransformOrigin, independently from caller modifier transforms.
 * Identity scale intentionally emits no inline transform so static scaffolds
 * keep their normal rasterization path.
 */
export function getPredictiveBackLayerStyle(
  scale: number,
): CSSProperties | undefined {
  if (scale === 1) return undefined;
  return {
    scale,
    transformOrigin: 'center center',
  };
}
