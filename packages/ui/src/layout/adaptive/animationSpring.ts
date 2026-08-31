export interface AnimationSpringSpec {
  readonly dampingRatio: number;
  readonly stiffness: number;
}

export interface AnimationSpringMotion {
  readonly value: number;
  readonly velocity: number;
}

/** AndroidX PaneMotionDefaults.AnimationSpec spring constants. */
export const MaterialPaneSpringSpec: AnimationSpringSpec = Object.freeze({
  dampingRatio: 0.8,
  stiffness: 380,
});

/** AndroidX TransitionAnimationState interruptionSpec defaults. */
export const AnimationCoreInterruptionSpringSpec: AnimationSpringSpec = Object.freeze({
  dampingRatio: 1,
  stiffness: 1500,
});

function finite(value: number, name: string) {
  if (!Number.isFinite(value)) throw new RangeError(`${name} must be finite`);
}

function positive(value: number, name: string) {
  finite(value, name);
  if (value <= 0) throw new RangeError(`${name} must be greater than 0`);
}

function composeFloat(value: number) {
  return Math.fround(value);
}

function validateSpec(spec: AnimationSpringSpec) {
  finite(spec.dampingRatio, 'dampingRatio');
  positive(spec.stiffness, 'stiffness');
  if (spec.dampingRatio < 0) {
    throw new RangeError('dampingRatio must be non-negative');
  }
}

/**
 * Exact scalar port of AndroidX SpringSimulation.updateValues as consumed by
 * FloatSpringSpec. Inputs/spec constants enter as Float, analytical physics run
 * in Double, play time is truncated to whole milliseconds, and value/velocity
 * are packed back to Float.
 */
export function sampleAnimationSpringMotion(
  spec: AnimationSpringSpec,
  initialValue: number,
  targetValue: number,
  playTimeMs: number,
  initialVelocity = 0,
): AnimationSpringMotion {
  validateSpec(spec);
  finite(initialValue, 'initialValue');
  finite(targetValue, 'targetValue');
  finite(playTimeMs, 'playTimeMs');
  finite(initialVelocity, 'initialVelocity');

  const initial = composeFloat(initialValue);
  const target = composeFloat(targetValue);
  const velocity = composeFloat(initialVelocity);
  const dampingRatio = composeFloat(spec.dampingRatio);
  const stiffness = composeFloat(spec.stiffness);
  if (playTimeMs <= 0) return { value: initial, velocity };

  const adjustedDisplacement = composeFloat(initial - target);
  const elapsedSeconds = Math.floor(playTimeMs) / 1000;
  const naturalFrequency = Math.sqrt(stiffness);
  const dampingRatioSquared = dampingRatio * Number(dampingRatio);
  const r = -dampingRatio * naturalFrequency;

  let displacement: number;
  let currentVelocity: number;
  if (dampingRatio > 1) {
    const s = naturalFrequency * Math.sqrt(dampingRatioSquared - 1);
    const gammaPlus = r + s;
    const gammaMinus = r - s;
    const coefficientB =
      (gammaMinus * adjustedDisplacement - velocity) / (gammaMinus - gammaPlus);
    const coefficientA = adjustedDisplacement - coefficientB;
    displacement =
      coefficientA * Math.exp(gammaMinus * elapsedSeconds) +
      coefficientB * Math.exp(gammaPlus * elapsedSeconds);
    currentVelocity =
      coefficientA * gammaMinus * Math.exp(gammaMinus * elapsedSeconds) +
      coefficientB * gammaPlus * Math.exp(gammaPlus * elapsedSeconds);
  } else if (dampingRatio === 1) {
    const coefficientA = adjustedDisplacement;
    const coefficientB = velocity + naturalFrequency * adjustedDisplacement;
    const naturalFrequencyDelta = -naturalFrequency * elapsedSeconds;
    displacement =
      (coefficientA + coefficientB * elapsedSeconds) *
      Math.exp(naturalFrequencyDelta);
    currentVelocity =
      (coefficientA + coefficientB * elapsedSeconds) *
        Math.exp(naturalFrequencyDelta) *
        -naturalFrequency +
      coefficientB * Math.exp(naturalFrequencyDelta);
  } else {
    const dampedFrequency = naturalFrequency * Math.sqrt(1 - dampingRatioSquared);
    const cosCoefficient = adjustedDisplacement;
    const sinCoefficient =
      ((-r * adjustedDisplacement) + velocity) / dampedFrequency;
    const dampedFrequencyDelta = dampedFrequency * elapsedSeconds;
    displacement =
      Math.exp(r * elapsedSeconds) *
      (cosCoefficient * Math.cos(dampedFrequencyDelta) +
        sinCoefficient * Math.sin(dampedFrequencyDelta));
    currentVelocity =
      displacement * r +
      Math.exp(r * elapsedSeconds) *
        (-dampedFrequency * cosCoefficient * Math.sin(dampedFrequencyDelta) +
          dampedFrequency * sinCoefficient * Math.cos(dampedFrequencyDelta));
  }

  return {
    value: composeFloat(displacement + target),
    velocity: composeFloat(currentVelocity),
  };
}

function estimateUnderDampedDurationSeconds(
  firstRootReal: number,
  firstRootImaginary: number,
  initialPosition: number,
  initialVelocity: number,
) {
  const coefficient1 = initialPosition;
  const coefficient2 =
    (initialVelocity - firstRootReal * coefficient1) / firstRootImaginary;
  const envelope = Math.sqrt(
    coefficient1 * coefficient1 + coefficient2 * coefficient2,
  );
  return Math.log(1 / envelope) / firstRootReal;
}

function estimateCriticallyDampedDurationSeconds(
  firstRootReal: number,
  initialPosition: number,
  initialVelocity: number,
) {
  const coefficient1 = initialPosition;
  const coefficient2 = initialVelocity - firstRootReal * coefficient1;
  const duration1 = Math.log(Math.abs(1 / coefficient1)) / firstRootReal;

  const guess = Math.log(Math.abs(1 / coefficient2));
  let duration2 = guess;
  for (let iteration = 0; iteration <= 5; iteration += 1) {
    duration2 = guess - Math.log(Math.abs(duration2 / firstRootReal));
  }
  duration2 /= firstRootReal;

  let currentDuration =
    !Number.isFinite(duration1)
      ? duration2
      : !Number.isFinite(duration2)
        ? duration1
        : Math.max(duration1, duration2);

  const inflectionTime =
    -(firstRootReal * coefficient1 + coefficient2) /
    (firstRootReal * coefficient2);
  const inflectionValue =
    (coefficient1 + coefficient2 * inflectionTime) *
    Math.exp(firstRootReal * inflectionTime);

  let signedDelta: number;
  if (Number.isNaN(inflectionTime) || inflectionTime <= 0) {
    signedDelta = -1;
  } else if (inflectionTime > 0 && -inflectionValue < 1) {
    if (coefficient2 < 0 && coefficient1 > 0) currentDuration = 0;
    signedDelta = -1;
  } else {
    currentDuration = -(2 / firstRootReal) - coefficient1 / coefficient2;
    signedDelta = 1;
  }

  let durationDelta = Number.POSITIVE_INFINITY;
  let iterations = 0;
  while (durationDelta > 0.001 && iterations < 100) {
    iterations += 1;
    const previousDuration = currentDuration;
    const exponential = Math.exp(firstRootReal * currentDuration);
    const value =
      (coefficient1 + coefficient2 * currentDuration) * exponential + signedDelta;
    const derivative =
      (coefficient2 * (firstRootReal * currentDuration + 1) +
        coefficient1 * firstRootReal) *
      exponential;
    currentDuration -= value / derivative;
    durationDelta = Math.abs(previousDuration - currentDuration);
  }
  return currentDuration;
}

function estimateOverDampedDurationSeconds(
  firstRootReal: number,
  secondRootReal: number,
  initialPosition: number,
  initialVelocity: number,
) {
  const coefficient2 =
    (firstRootReal * initialPosition - initialVelocity) /
    (firstRootReal - secondRootReal);
  const coefficient1 = initialPosition - coefficient2;
  const duration1 = Math.log(Math.abs(1 / coefficient1)) / firstRootReal;
  const duration2 = Math.log(Math.abs(1 / coefficient2)) / secondRootReal;
  let currentDuration =
    !Number.isFinite(duration1)
      ? duration2
      : !Number.isFinite(duration2)
        ? duration1
        : Math.max(duration1, duration2);

  const inflectionTime =
    Math.log(
      (coefficient1 * firstRootReal) / (-coefficient2 * secondRootReal),
    ) /
    (secondRootReal - firstRootReal);
  const inflectionValue =
    coefficient1 * Math.exp(firstRootReal * inflectionTime) +
    coefficient2 * Math.exp(secondRootReal * inflectionTime);

  let signedDelta: number;
  if (Number.isNaN(inflectionTime) || inflectionTime <= 0) {
    signedDelta = -1;
  } else if (inflectionTime > 0 && -inflectionValue < 1) {
    if (coefficient2 > 0 && coefficient1 < 0) currentDuration = 0;
    signedDelta = -1;
  } else {
    currentDuration =
      Math.log(
        -(coefficient2 * secondRootReal * secondRootReal) /
          (coefficient1 * firstRootReal * firstRootReal),
      ) /
      (firstRootReal - secondRootReal);
    signedDelta = 1;
  }

  const initialDerivative =
    coefficient1 * firstRootReal * Math.exp(firstRootReal * currentDuration) +
    coefficient2 * secondRootReal * Math.exp(secondRootReal * currentDuration);
  if (Math.abs(initialDerivative) < 0.0001) return currentDuration;

  let durationDelta = Number.POSITIVE_INFINITY;
  let iterations = 0;
  while (durationDelta > 0.001 && iterations < 100) {
    iterations += 1;
    const previousDuration = currentDuration;
    const firstExp = Math.exp(firstRootReal * currentDuration);
    const secondExp = Math.exp(secondRootReal * currentDuration);
    const value =
      coefficient1 * firstExp + coefficient2 * secondExp + signedDelta;
    const derivative =
      coefficient1 * firstRootReal * firstExp +
      coefficient2 * secondRootReal * secondExp;
    currentDuration -= value / derivative;
    durationDelta = Math.abs(previousDuration - currentDuration);
  }
  return currentDuration;
}

/** Port of FloatSpringSpec.getDurationNanos, returned as whole milliseconds. */
export function calculateAnimationSpringDurationMs(
  spec: AnimationSpringSpec,
  initialValue: number,
  targetValue: number,
  visibilityThreshold: number,
  initialVelocity = 0,
): number {
  validateSpec(spec);
  finite(initialValue, 'initialValue');
  finite(targetValue, 'targetValue');
  finite(initialVelocity, 'initialVelocity');
  positive(visibilityThreshold, 'visibilityThreshold');

  const initial = composeFloat(initialValue);
  const target = composeFloat(targetValue);
  const velocity = composeFloat(initialVelocity);
  const threshold = composeFloat(visibilityThreshold);
  const dampingRatio = composeFloat(spec.dampingRatio);
  const stiffness = composeFloat(spec.stiffness);
  const normalizedDisplacement = composeFloat(
    composeFloat(initial - target) / threshold,
  );
  const normalizedVelocity = composeFloat(velocity / threshold);
  if (normalizedDisplacement === 0 && normalizedVelocity === 0) return 0;
  if (dampingRatio === 0) return Number.MAX_SAFE_INTEGER;

  const velocityForPositivePosition =
    normalizedDisplacement < 0 ? -normalizedVelocity : normalizedVelocity;
  const initialPosition = Math.abs(normalizedDisplacement);
  const dampingCoefficient = 2 * dampingRatio * Math.sqrt(stiffness);
  const partialRoot = dampingCoefficient * dampingCoefficient - 4 * stiffness;
  const partialRootReal = partialRoot < 0 ? 0 : Math.sqrt(partialRoot);
  const partialRootImaginary = partialRoot < 0 ? Math.sqrt(Math.abs(partialRoot)) : 0;
  const firstRootReal = (-dampingCoefficient + partialRootReal) * 0.5;
  const firstRootImaginary = partialRootImaginary * 0.5;
  const secondRootReal = (-dampingCoefficient - partialRootReal) * 0.5;

  const durationSeconds =
    dampingRatio > 1
      ? estimateOverDampedDurationSeconds(
          firstRootReal,
          secondRootReal,
          initialPosition,
          velocityForPositivePosition,
        )
      : dampingRatio < 1
        ? estimateUnderDampedDurationSeconds(
            firstRootReal,
            firstRootImaginary,
            initialPosition,
            velocityForPositivePosition,
          )
        : estimateCriticallyDampedDurationSeconds(
            firstRootReal,
            initialPosition,
            velocityForPositivePosition,
          );
  if (Number.isNaN(durationSeconds)) return 0;
  if (durationSeconds === Number.POSITIVE_INFINITY) return Number.MAX_SAFE_INTEGER;
  return Math.max(0, Math.trunc(durationSeconds * 1000));
}

function valueAt(values: number | readonly number[], index: number) {
  return typeof values === 'number' ? values : (values[index] ?? 0);
}

export function calculateAnimationVectorSpringDurationMs(
  spec: AnimationSpringSpec,
  initialValues: readonly number[],
  targetValues: readonly number[],
  visibilityThresholds: number | readonly number[],
  initialVelocities: number | readonly number[] = 0,
): number {
  if (initialValues.length !== targetValues.length) {
    throw new RangeError('initialValues and targetValues must have the same length');
  }
  return initialValues.reduce(
    (duration, initialValue, index) =>
      Math.max(
        duration,
        calculateAnimationSpringDurationMs(
          spec,
          initialValue,
          targetValues[index]!,
          valueAt(visibilityThresholds, index),
          valueAt(initialVelocities, index),
        ),
      ),
    0,
  );
}

export function sampleAnimationVectorSpringAtPlayTime(
  spec: AnimationSpringSpec,
  initialValues: readonly number[],
  targetValues: readonly number[],
  playTimeMs: number,
  visibilityThresholds: number | readonly number[],
  initialVelocities: number | readonly number[] = 0,
): AnimationSpringMotion[] {
  const duration = calculateAnimationVectorSpringDurationMs(
    spec,
    initialValues,
    targetValues,
    visibilityThresholds,
    initialVelocities,
  );
  if (duration === 0 || playTimeMs >= duration) {
    return targetValues.map((value) => ({ value: composeFloat(value), velocity: 0 }));
  }
  return initialValues.map((initialValue, index) =>
    sampleAnimationSpringMotion(
      spec,
      initialValue,
      targetValues[index]!,
      playTimeMs,
      valueAt(initialVelocities, index),
    ),
  );
}
