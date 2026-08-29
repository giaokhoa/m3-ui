import { pxNumber } from '../../../internal/tokenValues';

export interface PaneExpansionDragHandlePlacementInput {
  offsetX: number;
  contentWidth: number;
  partitionSpacerSize: string;
  minTouchTargetSize: number;
}

export interface PaneExpansionDragHandlePlacement {
  centerX: number;
  minWidth: number;
}

function finiteNonNegative(value: number, name: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be a finite, non-negative CSS pixel value`);
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Browser port of AndroidX ThreePaneScaffold.measureAndPlaceDragHandleIfNeeded.
 *
 * The scaffold clips overflow. When the split reaches an outer edge, simply
 * centering a minimum-size handle on that split would clip half its hit target.
 * AndroidX clamps the handle center by half the partition spacer and expands
 * the measured handle width so the portion remaining inside the scaffold is
 * still at least minTouchTargetSize. Keep that geometry explicit here instead
 * of encoding it as a DragHandle component concern.
 */
export function calculatePaneExpansionDragHandlePlacement({
  offsetX,
  contentWidth,
  partitionSpacerSize,
  minTouchTargetSize,
}: PaneExpansionDragHandlePlacementInput): PaneExpansionDragHandlePlacement {
  finiteNonNegative(offsetX, 'offsetX');
  finiteNonNegative(contentWidth, 'contentWidth');
  finiteNonNegative(minTouchTargetSize, 'minTouchTargetSize');
  const partitionSpacerPx = pxNumber(partitionSpacerSize);
  finiteNonNegative(partitionSpacerPx, 'partitionSpacerSize');

  // AndroidX uses horizontalPartitionSpacerSize / 2 as the minimum center
  // margin. Bound it for pathological browser containers narrower than the
  // spacer so the equivalent clamp remains well-defined.
  const minHorizontalMargin = Math.min(partitionSpacerPx / 2, contentWidth / 2);
  const centerX = clamp(
    offsetX,
    minHorizontalMargin,
    contentWidth - minHorizontalMargin,
  );
  const appliedHorizontalMargin = Math.min(centerX, contentWidth - centerX);
  const minWidth =
    appliedHorizontalMargin < minTouchTargetSize / 2
      ? 2 * (minTouchTargetSize - appliedHorizontalMargin)
      : minTouchTargetSize;

  return { centerX, minWidth };
}
