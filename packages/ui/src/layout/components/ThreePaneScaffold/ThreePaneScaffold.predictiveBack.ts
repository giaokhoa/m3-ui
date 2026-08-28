import type { CSSProperties } from 'react';

export const PredictiveBackMinScale = 0.95;

export interface PredictiveBackScaffoldState {
  readonly progressFraction: number;
  readonly isPredictiveBackInProgress: boolean;
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

/** Apply predictive-back graphics-layer scale without replacing caller transforms. */
export function getPredictiveBackScaffoldStyle(
  style: CSSProperties | undefined,
  state: PredictiveBackScaffoldState | undefined,
): CSSProperties | undefined {
  const scale = getPredictiveBackScale(state);
  if (scale === undefined) return style;

  return {
    ...style,
    scale,
    transformOrigin: style?.transformOrigin ?? 'center center',
  };
}
