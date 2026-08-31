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
const ComposeDefaultTweenDurationNanos = 300_000_000;
const CubicDoubleEpsilon = 1e-7;
const CubicFloatEpsilon = Math.fround(1.05e-6);
const OneUlpAt1 = Math.fround(1.1920929e-7);
const Tau = Math.PI * 2;
const floatBitsBuffer = new ArrayBuffer(4);
const floatBitsView = new DataView(floatBitsBuffer);

function finite(value: number, name: string) {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${name} must be finite`);
  }
}

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

function minTouchTargetRoundToPx(value: number) {
  const floatValue = Math.fround(value);
  // AndroidX stores Dp.Unspecified in parent data, then Measurable.minTouchTargetSize
  // resolves an unspecified Dp to 0.dp before DragHandleMeasurable.roundToPx().
  if (Number.isNaN(floatValue)) return 0;
  return composeRoundToPx(floatValue);
}

function clamp(value: number, min: number, max: number) {
  if (min > max) {
    throw new RangeError(`Cannot coerce value to an empty range: [${min}, ${max}]`);
  }
  return Math.min(max, Math.max(min, value));
}

function composeIntAdd(a: number, b: number) {
  return Number.isInteger(a) && Number.isInteger(b) ? (a + b) | 0 : a + b;
}

function composeFloatAdd(a: number, b: number) {
  return Math.fround(Math.fround(a) + Math.fround(b));
}

function composeFloatSubtract(a: number, b: number) {
  return Math.fround(Math.fround(a) - Math.fround(b));
}

function composeFloatMultiply(a: number, b: number) {
  return Math.fround(Math.fround(a) * Math.fround(b));
}

function composeFloatDivide(a: number, b: number) {
  return Math.fround(Math.fround(a) / Math.fround(b));
}

function composeFloatRawBits(value: number) {
  floatBitsView.setFloat32(0, Math.fround(value), false);
  return floatBitsView.getInt32(0, false);
}

function composeFloatFromBits(bits: number) {
  floatBitsView.setInt32(0, bits | 0, false);
  return floatBitsView.getFloat32(0, false);
}

/** Exact Float fastCbrt arithmetic used by the pinned Compose cubic root solver. */
function composeFastCbrt(value: number) {
  const floatValue = Math.fround(value);
  const rawBits = composeFloatRawBits(floatValue);
  // Kotlin sign-extends Float.toRawBits().toLong() before masking with 0x1ffffffffL.
  const maskedBits = rawBits < 0 ? rawBits + 0x200000000 : rawBits;
  const estimateBits = (0x2a510554 + Math.trunc(maskedBits / 3)) | 0;
  let estimate = composeFloatFromBits(estimateBits);
  const oneThird = composeFloatDivide(1, 3);

  for (let iteration = 0; iteration < 2; iteration += 1) {
    const square = composeFloatMultiply(estimate, estimate);
    const quotient = composeFloatDivide(floatValue, square);
    const error = composeFloatSubtract(estimate, quotient);
    estimate = composeFloatSubtract(estimate, composeFloatMultiply(error, oneThird));
  }
  return estimate;
}

function clampValidCubicRoot(root: number) {
  const floatRoot = Math.fround(root);
  if (Number.isNaN(floatRoot)) return Number.NaN;
  if (floatRoot < 0) {
    return floatRoot >= -CubicFloatEpsilon ? 0 : Number.NaN;
  }
  if (floatRoot > 1) {
    return floatRoot <= composeFloatAdd(1, CubicFloatEpsilon) ? 1 : Number.NaN;
  }
  return floatRoot;
}

/** Port of pinned androidx.compose.ui.graphics.findFirstCubicRoot. */
function findFirstCubicRoot(p0: number, p1: number, p2: number, p3: number) {
  const fp0 = Math.fround(p0);
  const fp1 = Math.fround(p1);
  const fp2 = Math.fround(p2);
  const fp3 = Math.fround(p3);

  let a = 3 * (fp0 - 2 * fp1 + fp2);
  let b = 3 * (fp1 - fp0);
  let c = fp0;
  const d = -fp0 + 3 * (fp1 - fp2) + fp3;

  if (Math.abs(d) < CubicDoubleEpsilon) {
    if (Math.abs(a) < CubicDoubleEpsilon) {
      if (Math.abs(b) < CubicDoubleEpsilon) return Number.NaN;
      return clampValidCubicRoot(Math.fround(-c / b));
    }
    const q = Math.sqrt(b * b - 4 * a * c);
    const a2 = 2 * a;
    const firstRoot = clampValidCubicRoot(Math.fround((q - b) / a2));
    if (!Number.isNaN(firstRoot)) return firstRoot;
    return clampValidCubicRoot(Math.fround((-b - q) / a2));
  }

  a /= d;
  b /= d;
  c /= d;
  const o3 = (3 * b - a * a) / 9;
  const q2 = (2 * a * a * a - 9 * a * b + 27 * c) / 54;
  const discriminant = q2 * q2 + o3 * o3 * o3;
  const a3 = a / 3;

  if (discriminant < 0) {
    const r = Math.sqrt(-(o3 * o3 * o3));
    const cosPhi = Math.min(1, Math.max(-1, -q2 / r));
    const phi = Math.acos(cosPhi);
    const t1 = composeFloatMultiply(2, composeFastCbrt(Math.fround(r)));

    for (const phase of [0, Tau, 2 * Tau]) {
      const root = clampValidCubicRoot(
        Math.fround(t1 * Math.cos((phi + phase) / 3) - a3),
      );
      if (!Number.isNaN(root)) return root;
    }
    return Number.NaN;
  }

  if (discriminant === 0) {
    const u1 = Math.fround(-composeFastCbrt(Math.fround(q2)));
    const firstRoot = clampValidCubicRoot(
      composeFloatSubtract(composeFloatMultiply(2, u1), Math.fround(a3)),
    );
    if (!Number.isNaN(firstRoot)) return firstRoot;
    return clampValidCubicRoot(composeFloatSubtract(-u1, Math.fround(a3)));
  }

  const sd = Math.sqrt(discriminant);
  const u1 = composeFastCbrt(Math.fround(-q2 + sd));
  const v1 = composeFastCbrt(Math.fround(q2 + sd));
  return clampValidCubicRoot(
    composeFloatSubtract(composeFloatSubtract(u1, v1), Math.fround(a3)),
  );
}

/** Port of pinned androidx.compose.ui.graphics.evaluateCubic(p1, p2, t). */
function evaluateCubic(firstControl: number, secondControl: number, t: number) {
  const p1 = Math.fround(firstControl);
  const p2 = Math.fround(secondControl);
  const ft = Math.fround(t);
  const a = composeFloatAdd(composeFloatDivide(1, 3), composeFloatSubtract(p1, p2));
  const b = composeFloatSubtract(p2, composeFloatMultiply(2, p1));
  const polynomial = composeFloatAdd(
    composeFloatMultiply(composeFloatAdd(composeFloatMultiply(a, ft), b), ft),
    p1,
  );
  return composeFloatMultiply(composeFloatMultiply(3, polynomial), ft);
}

/** Compose FastOutSlowInEasing = CubicBezierEasing(0.4f, 0f, 0.2f, 1f). */
function fastOutSlowInEasing(fraction: number) {
  const floatFraction = Math.fround(fraction);
  if (!(floatFraction > 0 && floatFraction < 1)) return floatFraction;

  const f = Math.fround(Math.max(floatFraction, OneUlpAt1));
  const t = findFirstCubicRoot(
    composeFloatSubtract(0, f),
    composeFloatSubtract(0.4, f),
    composeFloatSubtract(0.2, f),
    composeFloatSubtract(1, f),
  );
  if (Number.isNaN(t)) {
    throw new RangeError(`FastOutSlowInEasing has no cubic solution at ${floatFraction}`);
  }
  // This specific easing's vertical bounds are exactly [0, 1].
  return Math.fround(Math.min(1, Math.max(0, evaluateCubic(0, 1, t))));
}

/**
 * Mirrors TargetBasedAnimation.getValue(progress) plus FloatTweenSpec sampling.
 * AndroidX multiplies durationNanos by a Float progress, truncates that Float
 * play time to Long, then divides the clamped Long by durationNanos.toFloat().
 */
function composeDefaultTweenFraction(progressFraction: number) {
  const floatProgress = Math.fround(progressFraction);
  const playTimeNanos = Math.trunc(
    composeFloatMultiply(ComposeDefaultTweenDurationNanos, floatProgress),
  );
  return composeFloatDivide(playTimeNanos, ComposeDefaultTweenDurationNanos);
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
    finite(targetOffsetX, 'targetOffsetX');
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
  finite(currentOffsetX, 'currentOffsetX');
  finite(targetOffsetX, 'targetOffsetX');
  if (!Number.isFinite(progressFraction) || progressFraction < 0 || progressFraction > 1) {
    throw new RangeError(
      `progressFraction must be in [0, 1], received ${progressFraction}`,
    );
  }
  if (currentOffsetX === targetOffsetX) {
    return { offsetX: targetOffsetX, opacity: 1 };
  }

  // TargetBasedAnimation<Float> keeps both its time sampling and interpolation on Float.
  const tweenFraction = composeDefaultTweenFraction(progressFraction);
  const animatedValue = composeFloatAdd(
    -1,
    composeFloatMultiply(2, fastOutSlowInEasing(tweenFraction)),
  );
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
    // AndroidX evaluates the Int additions before Int / 2. Preserve overflow
    // in those additions, while retaining fractional browser-native geometry.
    const sum = composeIntAdd(
      composeIntAdd(firstPlacement.left, firstPlacement.width),
      secondPlacement.left,
    );
    return Math.trunc(sum / 2);
  }
  if (firstPlacement !== undefined) {
    return composeIntAdd(firstPlacement.left, firstPlacement.width);
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
  finite(offsetX, 'offsetX');
  finiteNonNegative(contentWidth, 'contentWidth');
  const partitionSpacerPx = cssPxRoundToPx(partitionSpacerSize, 'partitionSpacerSize');
  const minTouchTargetPx = minTouchTargetRoundToPx(minTouchTargetSize);

  // AndroidX accepts any Int offset here and lets Int.coerceIn clamp it into
  // the handle-placement range. Arithmetic overflow in the measured spacer
  // midpoint can therefore legitimately produce a negative input.
  const minHorizontalMargin = Math.trunc(partitionSpacerPx / 2);
  const centerX = clamp(
    offsetX,
    minHorizontalMargin,
    contentWidth - minHorizontalMargin,
  );
  const appliedHorizontalMargin = Math.min(centerX, contentWidth - centerX);
  const halfMinTouchTargetSize = Math.trunc(minTouchTargetPx / 2);
  const minWidth =
    appliedHorizontalMargin < halfMinTouchTargetSize
      ? Math.imul(2, minTouchTargetPx - appliedHorizontalMargin)
      : minTouchTargetPx;

  // AndroidX feeds this Int into Constraints(minWidth = ...), which rejects
  // negative minima. Math.imul preserves Kotlin Int overflow before that check.
  if (minWidth < 0) {
    throw new RangeError(`minWidth must be non-negative, received ${minWidth}`);
  }

  return { centerX, minWidth };
}