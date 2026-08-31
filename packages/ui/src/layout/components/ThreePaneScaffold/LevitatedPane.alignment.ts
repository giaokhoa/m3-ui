import type {
  LevitatedPaneAlignment,
  LevitatedPaneAlignmentPreset,
} from '../../adaptive/threePaneScaffold';

export type ResolvableLevitatedPaneAlignment = LevitatedPaneAlignment;

function alignmentParts(alignment: LevitatedPaneAlignmentPreset): {
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

function composeBiasCoordinate(size: number, space: number, bias: -1 | 0 | 1): number {
  // Compose BiasAlignment first converts the remaining Int space to Float,
  // performs the bias arithmetic as Float, and only then fastRoundToInt().
  const center = Math.fround(Math.fround(space - size) / Math.fround(2));
  const coordinate = Math.fround(center * Math.fround(1 + bias));
  return Math.round(coordinate);
}

/**
 * Resolve either a built-in web preset or a custom AndroidX-style alignment.
 * Custom alignments receive raw sizes; this matters for drag-to-resize where
 * Alignment runs before negative measured sizes are clamped to zero.
 */
export function resolveLevitatedPaneAlignment(
  alignment: ResolvableLevitatedPaneAlignment,
  paneWidth: number,
  paneHeight: number,
  scaffoldWidth: number,
  scaffoldHeight: number,
  direction: 'ltr' | 'rtl',
): { left: number; top: number } {
  if (typeof alignment !== 'string') {
    const offset = alignment.align(
      { width: paneWidth, height: paneHeight },
      { width: scaffoldWidth, height: scaffoldHeight },
      direction,
    );
    return { left: offset.x, top: offset.y };
  }

  const { vertical, horizontal } = alignmentParts(alignment);
  const logicalHorizontalBias =
    horizontal === 'start' ? -1 : horizontal === 'end' ? 1 : 0;
  const horizontalBias =
    direction === 'ltr' ? logicalHorizontalBias : (-logicalHorizontalBias as -1 | 0 | 1);
  const verticalBias = vertical === 'top' ? -1 : vertical === 'bottom' ? 1 : 0;

  return {
    left: composeBiasCoordinate(paneWidth, scaffoldWidth, horizontalBias),
    top: composeBiasCoordinate(paneHeight, scaffoldHeight, verticalBias),
  };
}
