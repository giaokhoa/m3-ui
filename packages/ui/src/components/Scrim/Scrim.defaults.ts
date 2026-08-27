import * as token from '@m3-ui/tokens';
import type { CSSProperties } from 'react';

export type ScrimStyle = CSSProperties &
  Record<`--${string}`, string | number>;

export interface ScrimStyleOptions {
  containerColor?: CSSProperties['backgroundColor'];
  containerOpacity?: number;
  /** Additional renderer alpha multiplied by the Material container opacity. */
  alpha?: number;
}

export const scrimTokens = {
  containerColor: token.ScrimContainerColor,
  containerOpacity: token.ScrimContainerOpacity,
} as const;

function clampUnit(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function getScrimStyle(
  options: ScrimStyleOptions = {},
): ScrimStyle {
  const containerOpacity = clampUnit(
    options.containerOpacity ?? scrimTokens.containerOpacity,
  );
  const alpha = clampUnit(options.alpha ?? 1);

  return {
    '--_scrim-container-color':
      options.containerColor ?? scrimTokens.containerColor,
    '--_scrim-container-opacity': containerOpacity * alpha,
  };
}
