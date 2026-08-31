export const DragToResizeSpringDefaults = {
  dampingRatio: 1,
  stiffness: 1500,
  visibilityThreshold: 0.01,
} as const;

function assertFinite(value: number, name: string) {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${name} must be finite`);
  }
}

function composeFloat(value: number) {
  return Math.fround(value);
}

/**
 * Port of the critically-damped branch of AndroidX SpringSimulation.updateValues.
 * DragToResizeState uses Compose animation-core's default spring():
 * dampingRatio=1, stiffness=1500, visibilityThreshold=0.01.
 */
export function sampleDragToResizeSpring(
  initialValue: number,
  targetValue: number,
  playTimeMs: number,
): number {
  assertFinite(initialValue, 'initialValue');
  assertFinite(targetValue, 'targetValue');
  assertFinite(playTimeMs, 'playTimeMs');
  if (playTimeMs <= 0 || initialValue === targetValue) return initialValue;

  // FloatSpringSpec and SpringSimulation both receive Float state. Preserve
  // those Float boundaries before the simulation promotes its math to Double.
  const initial = composeFloat(initialValue);
  const target = composeFloat(targetValue);
  const stiffness = composeFloat(DragToResizeSpringDefaults.stiffness);
  const elapsedSeconds = Math.floor(playTimeMs) / 1000;
  const naturalFrequency = Math.sqrt(stiffness);
  const adjustedDisplacement = composeFloat(initial - target);
  const coefficientA = adjustedDisplacement;
  const coefficientB = naturalFrequency * adjustedDisplacement;
  const exponential = Math.exp(-naturalFrequency * elapsedSeconds);
  const displacement =
    (coefficientA + coefficientB * elapsedSeconds) * exponential;
  // SpringSimulation packs the returned value as Float.
  return composeFloat(displacement + target);
}

/**
 * Port of animation-core's critically-damped duration estimate for the exact
 * zero-initial-velocity spring used by DragToResizeState.animateTo.
 */
export function calculateDragToResizeSpringDurationMs(
  initialValue: number,
  targetValue: number,
): number {
  assertFinite(initialValue, 'initialValue');
  assertFinite(targetValue, 'targetValue');

  const initial = composeFloat(initialValue);
  const target = composeFloat(targetValue);
  const threshold = composeFloat(DragToResizeSpringDefaults.visibilityThreshold);
  const normalizedDisplacement = Math.abs(
    composeFloat(composeFloat(initial - target) / threshold),
  );
  if (normalizedDisplacement <= 1) return 0;

  // FloatSpringSpec passes Float stiffness to SpringEstimation, which then
  // promotes it to Double for root solving.
  const root = -Math.sqrt(composeFloat(DragToResizeSpringDefaults.stiffness));
  const coefficient1 = normalizedDisplacement;
  const coefficient2 = -root * coefficient1;
  const delta = 1;

  const t1 = Math.log(Math.abs(delta / coefficient1)) / root;
  const guess = Math.log(Math.abs(delta / coefficient2));
  let lambertApproximation = guess;
  for (let iteration = 0; iteration <= 5; iteration += 1) {
    lambertApproximation =
      guess - Math.log(Math.abs(lambertApproximation / root));
  }
  const t2 = lambertApproximation / root;
  let time = Math.max(t1, t2);

  // For zero initial velocity the inflection is exactly t=0, so AndroidX
  // solves the monotonically-decaying branch x(t) = +delta.
  let difference = Number.POSITIVE_INFINITY;
  let iterations = 0;
  while (difference > 0.001 && iterations < 100) {
    iterations += 1;
    const previous = time;
    const exponential = Math.exp(root * time);
    const value =
      (coefficient1 + coefficient2 * time) * exponential - delta;
    const derivative =
      (coefficient2 * (root * time + 1) + coefficient1 * root) * exponential;
    if (derivative === 0) break;
    time -= value / derivative;
    difference = Math.abs(previous - time);
  }

  return Math.max(0, Math.trunc(time * 1000));
}
