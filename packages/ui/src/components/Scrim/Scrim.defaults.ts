import '@m3-ui/tokens/scrim.css';
import type { CSSProperties } from 'react';

export type ScrimStyle = CSSProperties & Record<`--${string}`, string | number>;

export interface ScrimStyleOptions {
  containerColor?: CSSProperties['backgroundColor'];
  containerOpacity?: number;
  /** Additional renderer alpha multiplied by the generated Material container opacity. */
  alpha?: number;
}

function clampUnit(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

/** Runtime-only overrides; canonical color/opacity are generated in scrim.css. */
export function getScrimStyle(options: ScrimStyleOptions = {}): ScrimStyle {
  return {
    ...(options.containerColor === undefined
      ? {}
      : { '--_scrim-container-color': options.containerColor }),
    ...(options.containerOpacity === undefined
      ? {}
      : { '--_scrim-container-opacity': clampUnit(options.containerOpacity) }),
    ...(options.alpha === undefined
      ? {}
      : { '--_scrim-alpha': clampUnit(options.alpha) }),
  };
}
