import { pxNumber } from '../../../internal/tokenValues';
import { PaneExpansionUnspecified } from '../../adaptive/paneExpansionState';
import { getPaneAdaptedValue } from '../../adaptive/threePaneScaffold';
import {
  calculateThreePaneScaffoldLayout,
  type ThreePaneScaffoldLayout,
  type ThreePaneScaffoldLayoutOptions,
} from './ThreePaneScaffold.layout';

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

export interface PaneExpansionSpacerMiddleOffsetInput {
  /** Already-calculated visible pane layout, including pane margins. */
  layout: ThreePaneScaffoldLayout;
  /** Options used for the visible pane layout. */
  layoutOptions: ThreePaneScaffoldLayoutOptions;
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
 * Returns the measured partition-spacer midpoint used by AndroidX before
 * PaneMargins are applied to the actual pane bounds.
 *
 * Most calls can reuse the already-calculated visible layout. When pane
 * margins are present we intentionally recalculate the tiny three-pane layout
 * without margins, because AndroidX calls getSpacerMiddleOffsetX before
 * PaneMeasurable.doMeasureAndPlace applies PaneMargins. This matters for
 * ruler/inset margins that can clip an internal pane edge.
 */
export function calculatePaneExpansionSpacerMiddleOffset({
  layout,
  layoutOptions,
}: PaneExpansionSpacerMiddleOffsetInput): number {
  const { paneMargins, direction = 'ltr', paneOrder, value } = layoutOptions;
  const hasPaneMargins = paneMargins !== undefined && Object.keys(paneMargins).length > 0;
  const measuredLayout = hasPaneMargins
    ? calculateThreePaneScaffoldLayout({ ...layoutOptions, paneMargins: {} })
    : layout;
  const physicalOrder = direction === 'rtl' ? [...paneOrder].reverse() : [...paneOrder];
  const expandedRoles = physicalOrder.filter(
    (role) => getPaneAdaptedValue(value, role).type === 'expanded',
  );
  if (expandedRoles.length !== 2) return PaneExpansionUnspecified;

  const firstPlacement = measuredLayout[expandedRoles[0]!];
  const secondPlacement = measuredLayout[expandedRoles[1]!];
  if (firstPlacement !== undefined && secondPlacement !== undefined) {
    return (
      firstPlacement.left +
      firstPlacement.width +
      secondPlacement.left
    ) / 2;
  }
  if (firstPlacement !== undefined) {
    return firstPlacement.left + firstPlacement.width;
  }
  if (secondPlacement !== undefined) return 0;
  return PaneExpansionUnspecified;
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
