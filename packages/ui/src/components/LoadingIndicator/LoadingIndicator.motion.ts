import { loadingIndicatorRuntime } from './LoadingIndicator.defaults';

export function estimateSpringDurationMs(
  dampingRatio = loadingIndicatorRuntime.springDampingRatio,
  stiffness = loadingIndicatorRuntime.springStiffness,
  visibilityThreshold = loadingIndicatorRuntime.springVisibilityThreshold,
): number {
  if (dampingRatio <= 0 || dampingRatio >= 1 || stiffness <= 0) {
    return loadingIndicatorRuntime.morphIntervalMs;
  }

  // Mirrors the under-damped branch in AndroidX SpringEstimation.kt. FloatSpringSpec
  // normalizes the 0 -> 1 displacement by visibilityThreshold before estimating.
  const initialDisplacement = 1 / visibilityThreshold;
  const rootReal = -dampingRatio * Math.sqrt(stiffness);
  const rootImaginary = Math.sqrt(stiffness) * Math.sqrt(1 - dampingRatio ** 2);
  const c1 = initialDisplacement;
  const c2 = (-rootReal * c1) / rootImaginary;
  const envelope = Math.hypot(c1, c2);
  return Math.floor((Math.log(1 / envelope) / rootReal) * 1000);
}

export const loadingIndicatorSpringDurationMs = estimateSpringDurationMs();

export function springMorphProgress(elapsedMs: number): number {
  if (elapsedMs >= loadingIndicatorSpringDurationMs) return 1;

  const seconds = Math.max(0, elapsedMs) / 1000;
  const dampingRatio = loadingIndicatorRuntime.springDampingRatio;
  const naturalFrequency = Math.sqrt(loadingIndicatorRuntime.springStiffness);
  const dampedFrequency =
    naturalFrequency * Math.sqrt(1 - dampingRatio ** 2);
  const envelope = Math.exp(-dampingRatio * naturalFrequency * seconds);

  return (
    1 -
    envelope *
      (Math.cos(dampedFrequency * seconds) +
        ((dampingRatio * naturalFrequency) / dampedFrequency) *
          Math.sin(dampedFrequency * seconds))
  );
}

export interface IndeterminateLoadingFrame {
  morphIndex: number;
  morphProgress: number;
  rotation: number;
}

export function indeterminateLoadingFrame(
  elapsedMs: number,
  morphCount: number,
): IndeterminateLoadingFrame {
  const elapsed = Math.max(0, elapsedMs);
  const intervalCount = Math.floor(
    elapsed / loadingIndicatorRuntime.morphIntervalMs,
  );
  const intervalElapsed = elapsed % loadingIndicatorRuntime.morphIntervalMs;
  const morphProgress = springMorphProgress(intervalElapsed);
  const morphIndex = morphCount > 0 ? intervalCount % morphCount : 0;
  const targetRotation =
    ((intervalCount + 1) * loadingIndicatorRuntime.quarterRotation) % 360;
  const globalRotation =
    ((elapsed % loadingIndicatorRuntime.globalRotationDurationMs) /
      loadingIndicatorRuntime.globalRotationDurationMs) *
    360;

  return {
    morphIndex,
    morphProgress,
    rotation:
      morphProgress * loadingIndicatorRuntime.quarterRotation +
      targetRotation +
      globalRotation,
  };
}
