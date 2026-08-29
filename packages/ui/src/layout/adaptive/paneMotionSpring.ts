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

function thresholdAt(
  visibilityThresholds: number | readonly number[],
  index: number,
) {
  return typeof visibilityThresholds === 'number'
    ? visibilityThresholds
    : (visibilityThresholds[index] ?? 1);
}

/**
 * PaneMotionDefaults uses an IntRect visibility threshold of one pixel for
 * bounds, offset, and size animations. Their AndroidX TwoWayConverters round
 * every sampled vector component back to Int with fastRoundToInt(). The only
 * default Float pane-motion vector is visibility, whose threshold is 0.01.
 */
function usesIntPaneMotionConverter(
  visibilityThresholds: number | readonly number[],
  dimensionCount: number,
) {
  for (let index = 0; index < dimensionCount; index += 1) {
    if (thresholdAt(visibilityThresholds, index) !== 1) return false;
  }
  return true;
}

function convertPaneMotionVector(
  values: readonly number[],
  visibilityThresholds: number | readonly number[],
): number[] {
  return usesIntPaneMotionConverter(visibilityThresholds, values.length)
    ? values.map((value) => Math.round(value))
    : [...values];
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
  if (
    playTimeMs <= 0 ||
    (initialValue === targetValue && initialVelocity === 0)
  ) {
    return initialValue;
  }

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
  return initialValues.reduce(
    (duration, initialValue, index) =>
      Math.max(
        duration,
        calculatePaneMotionSpringDurationMs(
          initialValue,
          targetValues[index]!,
          thresholdAt(visibilityThresholds, index),
        ),
      ),
    0,
  );
}

/**
 * Samples a vectorized TargetBasedAnimation at a shared playtime. AndroidX
 * snaps the whole vector to target once the slowest dimension reaches duration.
 * IntRect/IntOffset/IntSize pane-motion converters also round every sampled
 * component to an integer before exposing the animated value.
 */
export function samplePaneMotionVectorSpringAtPlayTime(
  initialValues: readonly number[],
  targetValues: readonly number[],
  playTimeMs: number,
  visibilityThresholds: number | readonly number[] = 1,
): number[] {
  if (initialValues.length !== targetValues.length) {
    throw new RangeError('initialValues and targetValues must have the same length');
  }
  const duration = calculatePaneMotionVectorSpringDurationMs(
    initialValues,
    targetValues,
    visibilityThresholds,
  );
  if (duration === 0 || playTimeMs >= duration) {
    return convertPaneMotionVector(targetValues, visibilityThresholds);
  }
  if (playTimeMs <= 0) {
    return convertPaneMotionVector(initialValues, visibilityThresholds);
  }
  return convertPaneMotionVector(
    initialValues.map((initialValue, index) =>
      samplePaneMotionSpring(initialValue, targetValues[index]!, playTimeMs),
    ),
    visibilityThresholds,
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
  return samplePaneMotionVectorSpringAtPlayTime(
    initialValues,
    targetValues,
    duration * progress,
    visibilityThresholds,
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
export function samplePaneMotionDelayedVectorSpringAtPlayTime(
  initialValues: readonly number[],
  targetValues: readonly number[],
  playTimeMs: number,
  visibilityThresholds: number | readonly number[] = 1,
): number[] {
  if (initialValues.length !== targetValues.length) {
    throw new RangeError('initialValues and targetValues must have the same length');
  }
  const originalDuration = calculatePaneMotionVectorSpringDurationMs(
    initialValues,
    targetValues,
    visibilityThresholds,
  );
  const delayedTimeMs = Math.trunc(originalDuration * PaneMotionDefaults.delayedRatio);
  const totalDuration = originalDuration + delayedTimeMs;
  if (totalDuration === 0 || playTimeMs >= totalDuration) {
    return convertPaneMotionVector(targetValues, visibilityThresholds);
  }
  if (playTimeMs <= delayedTimeMs) {
    return convertPaneMotionVector(initialValues, visibilityThresholds);
  }
  return convertPaneMotionVector(
    initialValues.map((initialValue, index) =>
      samplePaneMotionSpring(
        initialValue,
        targetValues[index]!,
        playTimeMs - delayedTimeMs,
      ),
    ),
    visibilityThresholds,
  );
}

/** Scalar compatibility helper for the common single-axis delayed offset case. */
export function samplePaneMotionDelayedSpringAtPlayTime(
  initialValue: number,
  targetValue: number,
  playTimeMs: number,
  vectorOriginalDurationMs: number,
): number {
  const delayedTimeMs = Math.trunc(
    vectorOriginalDurationMs * PaneMotionDefaults.delayedRatio,
  );
  const totalDuration = vectorOriginalDurationMs + delayedTimeMs;
  if (totalDuration === 0 || playTimeMs >= totalDuration) return targetValue;
  if (playTimeMs <= delayedTimeMs) return initialValue;
  return samplePaneMotionSpring(
    initialValue,
    targetValue,
    playTimeMs - delayedTimeMs,
  );
}
