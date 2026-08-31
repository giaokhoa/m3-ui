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
  let left: number;
  if (horizontal === 'center') {
    left = Math.round((scaffoldWidth - paneWidth) / 2);
  } else {
    const logicalStart = horizontal === 'start';
    const physicalLeft = direction === 'ltr' ? logicalStart : !logicalStart;
    left = physicalLeft ? 0 : scaffoldWidth - paneWidth;
  }

  const top =
    vertical === 'top'
      ? 0
      : vertical === 'bottom'
        ? scaffoldHeight - paneHeight
        : Math.round((scaffoldHeight - paneHeight) / 2);
  return { left, top };
}
