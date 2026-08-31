import type { LevitatedPaneAlignment } from '../../adaptive/threePaneScaffold';
import type { PanePlacement } from './ThreePaneScaffold.layout';

export interface LevitatedPaneResizeLayoutOptions {
  rawWidth: number;
  rawHeight: number;
  scaffoldWidth: number;
  scaffoldHeight: number;
  alignment: LevitatedPaneAlignment;
  direction?: 'ltr' | 'rtl';
}

function alignmentParts(alignment: LevitatedPaneAlignment): {
  vertical: 'top' | 'center' | 'bottom';
  horizontal: 'start' | 'center' | 'end';
} {
  if (alignment === 'center') return { vertical: 'center', horizontal: 'center' };
  const [vertical, horizontal] = alignment.split('-') as [
    'top' | 'center' | 'bottom',
    'start' | 'center' | 'end',
  ];
  return { vertical, horizontal };
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
  const { vertical, horizontal } = alignmentParts(alignment);

  let left: number;
  if (horizontal === 'center') {
    left = Math.round((scaffoldWidth - rawWidth) / 2);
  } else {
    const logicalStart = horizontal === 'start';
    const physicalLeft = direction === 'ltr' ? logicalStart : !logicalStart;
    left = physicalLeft ? 0 : scaffoldWidth - rawWidth;
  }

  const top =
    vertical === 'top'
      ? 0
      : vertical === 'bottom'
        ? scaffoldHeight - rawHeight
        : Math.round((scaffoldHeight - rawHeight) / 2);

  return {
    left,
    top,
    width: Math.max(rawWidth, 0),
    height: Math.max(rawHeight, 0),
  };
}
