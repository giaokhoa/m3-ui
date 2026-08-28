import { PaneMotionDefaults } from './paneMotion';

/** AndroidX Spring.DefaultDisplacementThreshold. */
export const PaneMotionDefaultDisplacementThreshold = 0.01;

function assertFinite(value: number, name: string) {
  if (!Number.isFinite(value)) throw new RangeError(`${name} must be finite`);
}

function assertThreshold(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError('visibilityThreshold must be a finite value greater than 0');
  }
}

function clampProgress(value: number) {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new RangeError(`progressFraction must be in [0, 1], received ${value}`);
  }
  return value;
}

/**
 * Port of the under-damped branch of AndroidX SpringSimulation.updateValues.
 * PaneMotionDefaults uses dampingRatio=0.8, so this is the exact branch used by
 * the pinned Material 3 adaptive pane motion specs.
 */
export function samplePaneMotionSpring(
  initialValue: number,
  targetValue: number,
  playTimeMs: number,
  initialVelocity = 0,
): number {
  assertFinite(initialValue, 'initialValue');
  assertFinite(targetValue, 'targetValue');
  assertFinite(playTimeMs, 'playTimeMs');
  assertFinite(initialVelocity, 'initialVelocity');
  if (playTimeMs <= 0 || initialValue === targetValue) return initialValue;

  const dampingRatio = PaneMotionDefaults.dampingRatio;
  const naturalFrequency = Math.sqrt(PaneMotionDefaults.stiffness);
  const dampingRatioSquared = dampingRatio * dampingRatio;
  if (dampingRatioSquared >= 1) {
    throw new Error('Pane motion spring sampler expects the pinned under-damped spring');
  }

  // FloatSpringSpec truncates nanos to whole milliseconds before querying the
  // SpringSimulation, so mirror that precision boundary here.
  const elapsedSeconds = Math.floor(playTimeMs) / 1000;
  const adjustedDisplacement = initialValue - targetValue;
  const r = -dampingRatio * naturalFrequency;
  const dampedFrequency = naturalFrequency * Math.sqrt(1 - dampingRatioSquared);
  const cosCoefficient = adjustedDisplacement;
  const sinCoefficient =
    ((-r * adjustedDisplacement) + initialVelocity) / dampedFrequency;
  const dampedTime = dampedFrequency * elapsedSeconds;
  const displacement =
    Math.exp(r * elapsedSeconds) *
    (cosCoefficient * Math.cos(dampedTime) + sinCoefficient * Math.sin(dampedTime));
  return displacement + targetValue;
}

/**
 * Port of the under-damped duration estimate used by FloatSpringSpec.
 * AndroidX normalizes displacement/velocity by visibilityThreshold and asks
 * when the spring envelope is last within delta=1.
 */
export function calculatePaneMotionSpringDurationMs(
  initialValue: number,
  targetValue: number,
  visibilityThreshold = 1,
  initialVelocity = 0,
): number {
  assertFinite(initialValue, 'initialValue');
  assertFinite(targetValue, 'targetValue');
  assertFinite(initialVelocity, 'initialVelocity');
  assertThreshold(visibilityThreshold);

  const normalizedDisplacement = (initialValue - targetValue) / visibilityThreshold;
  const normalizedVelocity = initialVelocity / visibilityThreshold;
  if (normalizedDisplacement === 0 && normalizedVelocity === 0) return 0;

  const dampingRatio = PaneMotionDefaults.dampingRatio;
  const naturalFrequency = Math.sqrt(PaneMotionDefaults.stiffness);
  const r = -dampingRatio * naturalFrequency;
  const imaginaryRoot = naturalFrequency * Math.sqrt(1 - dampingRatio * dampingRatio);
  const velocity = normalizedDisplacement < 0 ? -normalizedVelocity : normalizedVelocity;
  const position = Math.abs(normalizedDisplacement);
  const c1 = position;
  const c2 = (velocity - r * c1) / imaginaryRoot;
  const envelope = Math.sqrt(c1 * c1 + c2 * c2);
  if (envelope <= 1) return 0;

  const durationSeconds = Math.log(1 / envelope) / r;
  return Math.max(0, Math.trunc(durationSeconds * 1000));
}

export function calculatePaneMotionVectorSpringDurationMs(
  initialValues: readonly number[],
  targetValues: readonly number[],
  visibilityThresholds: number | readonly number[] = 1,
): number {
  if (initialValues.length !== targetValues.length) {
    throw new RangeError('initialValues and targetValues must have the same length');
  }
  const thresholdAt = (index: number) =>
    typeof visibilityThresholds === 'number'
      ? visibilityThresholds
      : (visibilityThresholds[index] ?? 1);
  return initialValues.reduce(
    (duration, initialValue, index) =>
      Math.max(
        duration,
        calculatePaneMotionSpringDurationMs(
          initialValue,
          targetValues[index]!,
          thresholdAt(index),
        ),
      ),
    0,
  );
}

/** Samples a vectorized spring at its own TargetBasedAnimation progress. */
export function samplePaneMotionVectorSpringAtProgress(
  initialValues: readonly number[],
  targetValues: readonly number[],
  progressFraction: number,
  visibilityThresholds: number | readonly number[] = 1,
): number[] {
  const progress = clampProgress(progressFraction);
  const duration = calculatePaneMotionVectorSpringDurationMs(
    initialValues,
    targetValues,
    visibilityThresholds,
  );
  const playTimeMs = duration * progress;
  return initialValues.map((initialValue, index) =>
    samplePaneMotionSpring(initialValue, targetValues[index]!, playTimeMs),
  );
}

export function calculatePaneMotionDelayedSpringDurationMs(
  initialValues: readonly number[],
  targetValues: readonly number[],
  visibilityThresholds: number | readonly number[] = 1,
): number {
  const originalDuration = calculatePaneMotionVectorSpringDurationMs(
    initialValues,
    targetValues,
    visibilityThresholds,
  );
  return originalDuration + Math.trunc(originalDuration * PaneMotionDefaults.delayedRatio);
}

/**
 * Samples AndroidX DelayedSpringSpec at an external/global transition playtime.
 * The delay is based on the original spring duration, not on the global one.
 */
export function samplePaneMotionDelayedSpringAtPlayTime(
  initialValue: number,
  targetValue: number,
  playTimeMs: number,
  vectorOriginalDurationMs: number,
): number {
  const delayedTimeMs = Math.trunc(
    vectorOriginalDurationMs * PaneMotionDefaults.delayedRatio,
  );
  if (playTimeMs <= delayedTimeMs) return initialValue;
  return samplePaneMotionSpring(
    initialValue,
    targetValue,
    playTimeMs - delayedTimeMs,
  );
}
