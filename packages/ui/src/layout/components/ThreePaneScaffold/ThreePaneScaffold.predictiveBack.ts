import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';

export const PredictiveBackMinScale = 0.95;
const PredictiveBackReturnSpringStiffness = 1500;
const PredictiveBackReturnSpringVisibilityThreshold = 0.01;

export interface PredictiveBackScaffoldState {
  readonly progressFraction: number;
  readonly isPredictiveBackInProgress: boolean;
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
 * Mirrors AndroidX PredictiveBackScaleState's decay curve.
 *
 * fraction=0 starts at 1; as fraction approaches 1 the scale approaches
 * PredictiveBackMinScale without reaching it during the seek.
 */
export function calculatePredictiveBackScale(fraction: number): number {
  const delta = 1 - PredictiveBackMinScale;
  const shift = delta / 2;
  const curveScale = (delta * delta) / 2;
  return curveScale / (fraction + shift) + PredictiveBackMinScale;
}

export function getPredictiveBackScale(
  state: PredictiveBackScaffoldState | undefined,
): number | undefined {
  return state?.isPredictiveBackInProgress
    ? calculatePredictiveBackScale(state.progressFraction)
    : undefined;
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

  const displacement = Math.abs(initialScale - 1);
  if (displacement <= PredictiveBackReturnSpringVisibilityThreshold) return 0;

  // FloatSpringSpec normalizes displacement by visibilityThreshold before
  // estimateAnimationDurationMillis. With DampingRatioNoBouncy=1 and
  // StiffnessMedium=1500, the normalized critical solution is
  // (c1 + c2*t) * exp(r*t), where c2 = -r*c1 for zero initial velocity.
  const normalizedDisplacement =
    displacement / PredictiveBackReturnSpringVisibilityThreshold;
  const r = -Math.sqrt(PredictiveBackReturnSpringStiffness);
  const c1 = normalizedDisplacement;
  const c2 = -r * c1;
  const valueAt = (seconds: number) =>
    (c1 + c2 * seconds) * Math.exp(r * seconds);

  let low = 0;
  let high = 1;
  while (valueAt(high) > 1) high *= 2;
  for (let iteration = 0; iteration < 60; iteration += 1) {
    const middle = (low + high) / 2;
    if (valueAt(middle) > 1) low = middle;
    else high = middle;
  }

  // AndroidX converts the solved seconds to milliseconds with toLong(), which
  // truncates toward zero for this positive duration.
  return Math.trunc(((low + high) / 2) * 1000);
}

/** Samples the same critically-damped default Float spring as Animatable. */
export function samplePredictiveBackReturnSpring(
  initialScale: number,
  playTimeMs: number,
): number {
  if (!Number.isFinite(playTimeMs)) {
    throw new RangeError(`playTimeMs must be finite, received ${playTimeMs}`);
  }
  if (playTimeMs <= 0) return initialScale;

  const durationMs = calculatePredictiveBackReturnSpringDurationMs(initialScale);
  if (durationMs === 0 || playTimeMs >= durationMs) return 1;

  // FloatSpringSpec truncates nanos to whole milliseconds before querying
  // SpringSimulation, so preserve that precision boundary here.
  const seconds = Math.floor(playTimeMs) / 1000;
  const naturalFrequency = Math.sqrt(PredictiveBackReturnSpringStiffness);
  const adjustedDisplacement = initialScale - 1;
  const coefficientA = adjustedDisplacement;
  const coefficientB = naturalFrequency * adjustedDisplacement;
  const displacement =
    (coefficientA + coefficientB * seconds) *
    Math.exp(-naturalFrequency * seconds);
  return displacement + 1;
}

/**
 * Renderer-owned equivalent of AndroidX PredictiveBackScaleState.
 *
 * Active predictive-back progress snaps directly to the decay curve. When the
 * gesture ends, the last snapped value returns to 1 with Animatable's default
 * Float spring. A new gesture cancels that return immediately and snaps to its
 * new predictive value.
 */
export function usePredictiveBackScale(
  state: PredictiveBackScaffoldState | undefined,
): number {
  const predictiveScale = getPredictiveBackScale(state);
  const scaleRef = useRef(predictiveScale ?? 1);
  const wasPredictiveRef = useRef(predictiveScale !== undefined);
  const frameRef = useRef<number | null>(null);
  const [animatedScale, setAnimatedScale] = useState(scaleRef.current);

  let renderedScale = animatedScale;
  if (predictiveScale !== undefined) {
    // Render the seeked scale immediately rather than waiting for an effect;
    // AndroidX snapTo likewise exposes the new scale in the same frame.
    scaleRef.current = predictiveScale;
    wasPredictiveRef.current = true;
    renderedScale = predictiveScale;
  } else if (wasPredictiveRef.current) {
    // Preserve the last predictive frame until the layout effect starts the
    // return spring, avoiding a one-frame snap to 1.
    renderedScale = scaleRef.current;
  }

  useLayoutEffect(() => {
    if (frameRef.current !== null) {
      cancelFrame(frameRef.current);
      frameRef.current = null;
    }

    if (predictiveScale !== undefined) {
      scaleRef.current = predictiveScale;
      wasPredictiveRef.current = true;
      setAnimatedScale(predictiveScale);
      return;
    }

    if (!wasPredictiveRef.current) return;
    wasPredictiveRef.current = false;
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
  }, [predictiveScale]);

  return renderedScale;
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
