import type { PanePlacement } from './ThreePaneScaffold.layout';
import {
  resolveLevitatedPaneAlignment,
  type ResolvableLevitatedPaneAlignment,
} from './LevitatedPane.alignment';

export interface LevitatedPaneResizeLayoutOptions {
  rawWidth: number;
  rawHeight: number;
  scaffoldWidth: number;
  scaffoldHeight: number;
  alignment: ResolvableLevitatedPaneAlignment;
  direction?: 'ltr' | 'rtl';
}

/**
 * Internal levitated resize placement matching AndroidX's two-phase path:
 * Alignment sees the raw resized IntSize, then PaneMeasurable clamps the
 * actual measured width/height to non-negative values.
 */
export function calculateLevitatedPaneResizePlacement({
  rawWidth,
  rawHeight,
  scaffoldWidth,
  scaffoldHeight,
  alignment,
  direction = 'ltr',
}: LevitatedPaneResizeLayoutOptions): PanePlacement {
  const { left, top } = resolveLevitatedPaneAlignment(
    alignment,
    rawWidth,
    rawHeight,
    scaffoldWidth,
    scaffoldHeight,
    direction,
  );

  return {
    left,
    top,
    width: Math.max(rawWidth, 0),
    height: Math.max(rawHeight, 0),
  };
}
