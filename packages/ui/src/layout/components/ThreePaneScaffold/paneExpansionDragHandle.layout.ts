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

export interface PaneExpansionDragHandleFadeInput {
  currentOffsetX: number;
  targetOffsetX: number;
  progressFraction: number;
}

export interface PaneExpansionDragHandleFadeFrame {
  offsetX: number;
  opacity: number;
}

export interface PaneExpansionDragHandleFadeOffsets {
  originalOffsetX: number;
  targetOffsetX: number;
}

const ComposeIntMax = 2147483647;
const ComposeIntMin = -2147483648;

function finiteNonNegative(value: number, name: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be a finite, non-negative CSS pixel value`);
  }
}

function composeRoundToPx(value: number) {
  const floatValue = Math.fround(value);
  if (Number.isNaN(floatValue)) throw new RangeError('Cannot round NaN value');
  if (floatValue >= ComposeIntMax) return ComposeIntMax;
  if (floatValue <= ComposeIntMin) return ComposeIntMin;
  return Math.round(floatValue);
}

function cssPxRoundToPx(value: string, name: string) {
  if (!value.endsWith('px')) throw new Error(`${name} must resolve to CSS pixels, received ${value}`);
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) throw new Error(`Invalid ${name}: ${value}`);
  return composeRoundToPx(parsed);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function cubicBezierCoordinate(t: number, firstControl: number, secondControl: number) {
  const oneMinusT = 1 - t;
  return (
    3 * oneMinusT * oneMinusT * t * firstControl +
    3 * oneMinusT * t * t * secondControl +
    t * t * t
  );
}

/** Compose FastOutSlowInEasing = CubicBezierEasing(0.4, 0, 0.2, 1). */
function fastOutSlowInEasing(fraction: number) {
  if (fraction <= 0) return 0;
  if (fraction >= 1) return 1;

  // The x component is monotonic, so fixed bisection closely mirrors
  // CubicBezierEasing's "solve x, return y" contract without DOM/CSS timing.
  let low = 0;
  let high = 1;
  for (let index = 0; index < 30; index += 1) {
    const t = (low + high) / 2;
    const x = cubicBezierCoordinate(t, 0.4, 0.2);
    if (x < fraction) low = t;
    else high = t;
  }
  return cubicBezierCoordinate((low + high) / 2, 0, 1);
}

/**
 * Mirrors AnimateWithFadingNode.updateTargetOffset: a newly observed lookahead
 * offset becomes the target, while the previous target becomes the fade origin.
 * The first target therefore has an unspecified origin and does not fade.
 */
export function updatePaneExpansionDragHandleFadeOffsets(
  current: PaneExpansionDragHandleFadeOffsets,
  targetOffsetX: number,
): PaneExpansionDragHandleFadeOffsets {
  if (targetOffsetX !== PaneExpansionUnspecified) {
    finiteNonNegative(targetOffsetX, 'targetOffsetX');
  }
  if (current.targetOffsetX === targetOffsetX) return current;
  return {
    originalOffsetX: current.targetOffsetX,
    targetOffsetX,
  };
}

/**
 * Browser port of AndroidX AnimateWithFadingModifier for pane-expansion handles.
 *
 * AndroidX samples a TargetBasedAnimation from -1f to 1f with the default
 * tween() spec (FastOutSlowInEasing). While the sampled value is <= 0 the
 * handle remains at its original offset and fades toward zero alpha. Once the
 * value becomes positive it jumps to the lookahead target offset and fades
 * back in. If the offset did not move, ApproachLayout does not run and the
 * handle stays fully opaque.
 */
export function calculatePaneExpansionDragHandleFadeFrame({
  currentOffsetX,
  targetOffsetX,
  progressFraction,
}: PaneExpansionDragHandleFadeInput): PaneExpansionDragHandleFadeFrame {
  finiteNonNegative(currentOffsetX, 'currentOffsetX');
  finiteNonNegative(targetOffsetX, 'targetOffsetX');
  if (!Number.isFinite(progressFraction) || progressFraction < 0 || progressFraction > 1) {
    throw new RangeError(
      `progressFraction must be in [0, 1], received ${progressFraction}`,
    );
  }
  if (currentOffsetX === targetOffsetX) {
    return { offsetX: targetOffsetX, opacity: 1 };
  }

  const rawValue = -1 + 2 * fastOutSlowInEasing(progressFraction);
  const animatedValue = Math.abs(rawValue) < 1e-7 ? 0 : rawValue;
  return {
    offsetX: animatedValue > 0 ? targetOffsetX : currentOffsetX,
    opacity: Math.abs(animatedValue),
  };
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
    // AndroidX performs this on Int pane positions and uses Int / 2, so an
    // odd-width spacer midpoint truncates instead of landing on a half pixel.
    return Math.trunc(
      (firstPlacement.left + firstPlacement.width + secondPlacement.left) / 2,
    );
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
  const partitionSpacerPx = cssPxRoundToPx(partitionSpacerSize, 'partitionSpacerSize');
  const minTouchTargetPx = composeRoundToPx(minTouchTargetSize);

  // AndroidX values are Ints after roundToPx()/measurement. Its `/ 2`
  // operations therefore truncate for odd spacer and touch-target sizes.
  const minHorizontalMargin = Math.min(
    Math.trunc(partitionSpacerPx / 2),
    contentWidth / 2,
  );
  const centerX = clamp(
    offsetX,
    minHorizontalMargin,
    contentWidth - minHorizontalMargin,
  );
  const appliedHorizontalMargin = Math.min(centerX, contentWidth - centerX);
  const halfMinTouchTargetSize = Math.trunc(minTouchTargetPx / 2);
  const minWidth =
    appliedHorizontalMargin < halfMinTouchTargetSize
      ? 2 * (minTouchTargetPx - appliedHorizontalMargin)
      : minTouchTargetPx;

  return { centerX, minWidth };
}
