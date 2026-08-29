import type { ReactNode } from 'react';
import type { PaneExpansionState } from '../../adaptive/paneExpansionState';
import {
  PaneMotion,
  calculateHiddenPaneCurrentLeft,
  calculateHidingPaneTargetLeft,
  calculateSlideInFromLeftOffset,
  calculateSlideInFromRightOffset,
  calculateSlideOutToLeftOffset,
  calculateSlideOutToRightOffset,
  calculateThreePaneMotion,
  type PaneMotionData,
} from '../../adaptive/paneMotion';
import {
  PaneMotionDefaultDisplacementThreshold,
  calculatePaneMotionDelayedSpringDurationMs,
  calculatePaneMotionVectorSpringDurationMs,
  samplePaneMotionDelayedVectorSpringAtPlayTime,
  samplePaneMotionVectorSpringAtPlayTime,
  samplePaneMotionVectorSpringAtProgress,
} from '../../adaptive/paneMotionSpring';
import type { LayoutBounds, PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import {
  getPaneAdaptedValue,
  type ThreePaneScaffoldHorizontalOrder,
  type ThreePaneScaffoldRole,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';
import { calculateLevitatedPanePlacement } from './LevitatedPane.layout';
import {
  calculateThreePaneScaffoldLayout,
  type PanePlacement,
} from './ThreePaneScaffold.layout';
import { applyPaneMargins, type PaneMargins } from './paneMargins';
import type { PanePreferredSize } from './preferredPaneSize';

export interface PaneTransitionFrame {
  placement: PanePlacement;
  translateX: number;
  opacity: number;
  /** 0 hides the inline content entirely; 1 shows it without clipping. */
  inlineClipFraction: number;
  motion: PaneMotion;
  levitated: boolean;
}

export interface ThreePaneScaffoldTransitionFrame {
  primary?: PaneTransitionFrame;
  secondary?: PaneTransitionFrame;
  tertiary?: PaneTransitionFrame;
  scrim?: ReactNode;
  scrimOpacity: number;
}

export interface ThreePaneScaffoldTransitionOptions {
  width: number;
  height: number;
  directive: PaneScaffoldDirective;
  currentValue: ThreePaneScaffoldValue;
  targetValue: ThreePaneScaffoldValue;
  progressFraction: number;
  paneOrder: ThreePaneScaffoldHorizontalOrder;
  direction?: 'ltr' | 'rtl';
  excludedBounds?: readonly LayoutBounds[];
  preferredWidths?: Partial<Record<ThreePaneScaffoldRole, PanePreferredSize>>;
  preferredHeights?: Partial<Record<ThreePaneScaffoldRole, PanePreferredSize>>;
  paneMargins?: Partial<Record<ThreePaneScaffoldRole, PaneMargins>>;
  paneExpansionState?: PaneExpansionState | null;
}

export type ThreePaneScaffoldTransitionLayoutOptions = Omit<
  ThreePaneScaffoldTransitionOptions,
  'progressFraction'
>;

export interface ThreePaneScaffoldTransitionTiming {
  /** Transition.totalDuration analogue from AnimatedVisibility child animations. */
  visibilityDurationMs: number;
  /** Longest private AnimateBounds TargetBasedAnimation duration. */
  boundsDurationMs: number;
  /** Default SeekableTransitionState timeline duration. */
  durationMs: number;
}

const roles: readonly ThreePaneScaffoldRole[] = ['primary', 'secondary', 'tertiary'];
const zeroPlacement: PanePlacement = { left: 0, top: 0, width: 0, height: 0 };
const intVectorThreshold = 1;

function clampFraction(value: number) {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new RangeError(`progressFraction must be in [0, 1], received ${value}`);
  }
  return value;
}

function clampUnit(value: number) {
  return Math.max(0, Math.min(1, value));
}

function interpolate(from: number, to: number, fraction: number) {
  return from + (to - from) * fraction;
}

function interpolatePlacement(
  from: PanePlacement,
  to: PanePlacement,
  fraction: number,
): PanePlacement {
  return {
    left: interpolate(from.left, to.left, fraction),
    top: interpolate(from.top, to.top, fraction),
    width: interpolate(from.width, to.width, fraction),
    height: interpolate(from.height, to.height, fraction),
  };
}

function placementToRect(placement: PanePlacement): [number, number, number, number] {
  return [
    placement.left,
    placement.top,
    placement.left + placement.width,
    placement.top + placement.height,
  ];
}

function rectToPlacement(rect: readonly number[]): PanePlacement {
  return {
    left: rect[0]!,
    top: rect[1]!,
    width: rect[2]! - rect[0]!,
    height: rect[3]! - rect[1]!,
  };
}

function calculateValuePlacements({
  width,
  height,
  directive,
  value,
  paneOrder,
  direction,
  excludedBounds,
  preferredWidths,
  preferredHeights,
  paneMargins,
  paneExpansionState,
}: Omit<ThreePaneScaffoldTransitionOptions, 'currentValue' | 'targetValue' | 'progressFraction'> & {
  value: ThreePaneScaffoldValue;
}): Partial<Record<ThreePaneScaffoldRole, PanePlacement>> {
  const staticLayout = calculateThreePaneScaffoldLayout({
    width,
    height,
    directive,
    value,
    paneOrder,
    direction,
    excludedBounds,
    preferredWidths,
    preferredHeights,
    paneMargins,
    paneExpansionState,
  });
  const placements: Partial<Record<ThreePaneScaffoldRole, PanePlacement>> = {
    ...staticLayout,
  };

  for (const role of roles) {
    const adaptedValue = getPaneAdaptedValue(value, role);
    if (adaptedValue.type !== 'levitated') continue;
    const base = calculateLevitatedPanePlacement({
      width,
      height,
      directive,
      alignment: adaptedValue.alignment,
      direction,
      preferredWidth: preferredWidths?.[role],
      preferredHeight: preferredHeights?.[role],
    });
    const resized = adaptedValue.dragToResizeState?.measure({
      measuringWidth: base.width,
      measuringHeight: base.height,
      scaffoldWidth: width,
      scaffoldHeight: height,
      direction,
    });
    const unmarginedPlacement =
      resized === undefined
        ? base
        : calculateLevitatedPanePlacement({
            width,
            height,
            directive,
            alignment: adaptedValue.alignment,
            direction,
            preferredWidth: resized.width,
            preferredHeight: resized.height,
          });
    placements[role] = applyPaneMargins(
      unmarginedPlacement,
      paneMargins?.[role],
      width,
      height,
      direction,
    );
  }
  return placements;
}

function toMotionData(
  physicalOrder: readonly ThreePaneScaffoldRole[],
  motionByRole: ReturnType<typeof calculateThreePaneMotion>,
  currentPlacements: Partial<Record<ThreePaneScaffoldRole, PanePlacement>>,
  targetPlacements: Partial<Record<ThreePaneScaffoldRole, PanePlacement>>,
): PaneMotionData[] {
  return physicalOrder.map((role) => {
    const origin = currentPlacements[role] ?? zeroPlacement;
    const target = targetPlacements[role] ?? zeroPlacement;
    return {
      motion: motionByRole[role],
      originSize: { width: origin.width, height: origin.height },
      originPosition: { x: origin.left, y: origin.top },
      targetSize: { width: target.width, height: target.height },
      targetPosition: { x: target.left, y: target.top },
    };
  });
}

function levitatedScrim(value: ThreePaneScaffoldValue): ReactNode | undefined {
  for (const role of roles) {
    const adaptedValue = getPaneAdaptedValue(value, role);
    if (adaptedValue.type === 'levitated' && adaptedValue.scrim != null) {
      return adaptedValue.scrim;
    }
  }
  return undefined;
}

interface PreparedTransition {
  physicalOrder: ThreePaneScaffoldHorizontalOrder;
  motion: ReturnType<typeof calculateThreePaneMotion>;
  currentPlacements: Partial<Record<ThreePaneScaffoldRole, PanePlacement>>;
  targetPlacements: Partial<Record<ThreePaneScaffoldRole, PanePlacement>>;
  motionData: PaneMotionData[];
  slideInLeft: number;
  slideInRight: number;
  slideOutLeft: number;
  slideOutRight: number;
  visibilityDurationMs: number;
  boundsDurationMs: number;
  durationMs: number;
}

function calculateRegularOffsetDuration(initialX: number, targetX: number) {
  return calculatePaneMotionVectorSpringDurationMs(
    [initialX, 0],
    [targetX, 0],
    intVectorThreshold,
  );
}

function calculateDelayedOffsetDuration(initialX: number, targetX: number) {
  return calculatePaneMotionDelayedSpringDurationMs(
    [initialX, 0],
    [targetX, 0],
    intVectorThreshold,
  );
}

function sampleRegularOffset(initialX: number, targetX: number, playTimeMs: number) {
  return samplePaneMotionVectorSpringAtPlayTime(
    [initialX, 0],
    [targetX, 0],
    playTimeMs,
    intVectorThreshold,
  )[0]!;
}

function sampleDelayedOffset(initialX: number, targetX: number, playTimeMs: number) {
  return samplePaneMotionDelayedVectorSpringAtPlayTime(
    [initialX, 0],
    [targetX, 0],
    playTimeMs,
    intVectorThreshold,
  )[0]!;
}

function calculateHorizontalSizeDuration(initial: PanePlacement, targetWidth: number) {
  return calculatePaneMotionVectorSpringDurationMs(
    [initial.width, initial.height],
    [targetWidth, initial.height],
    intVectorThreshold,
  );
}

function sampleHorizontalSize(
  initial: PanePlacement,
  targetWidth: number,
  playTimeMs: number,
) {
  return samplePaneMotionVectorSpringAtPlayTime(
    [initial.width, initial.height],
    [targetWidth, initial.height],
    playTimeMs,
    intVectorThreshold,
  )[0]!;
}

function calculateBoundsDuration(
  currentPlacement: PanePlacement | undefined,
  targetPlacement: PanePlacement | undefined,
) {
  if (currentPlacement === undefined || targetPlacement === undefined) return 0;
  return calculatePaneMotionVectorSpringDurationMs(
    placementToRect(currentPlacement),
    placementToRect(targetPlacement),
    intVectorThreshold,
  );
}

function sampleBoundsAtProgress(
  currentPlacement: PanePlacement,
  targetPlacement: PanePlacement,
  progressFraction: number,
) {
  return rectToPlacement(
    samplePaneMotionVectorSpringAtProgress(
      placementToRect(currentPlacement),
      placementToRect(targetPlacement),
      progressFraction,
      intVectorThreshold,
    ),
  );
}

function calculateVisibilityDuration() {
  return calculatePaneMotionVectorSpringDurationMs(
    [0],
    [1],
    PaneMotionDefaultDisplacementThreshold,
  );
}

function sampleVisibility(initial: number, target: number, playTimeMs: number) {
  return clampUnit(
    samplePaneMotionVectorSpringAtPlayTime(
      [initial],
      [target],
      playTimeMs,
      PaneMotionDefaultDisplacementThreshold,
    )[0]!,
  );
}

function prepareTransition({
  width,
  height,
  directive,
  currentValue,
  targetValue,
  paneOrder,
  direction = 'ltr',
  excludedBounds = directive.excludedBounds,
  preferredWidths,
  preferredHeights,
  paneMargins,
  paneExpansionState = null,
}: ThreePaneScaffoldTransitionLayoutOptions): PreparedTransition {
  const physicalOrder: ThreePaneScaffoldHorizontalOrder =
    direction === 'rtl' ? [paneOrder[2], paneOrder[1], paneOrder[0]] : paneOrder;
  const motion = calculateThreePaneMotion(currentValue, targetValue, physicalOrder);
  const common = {
    width,
    height,
    directive,
    paneOrder,
    direction,
    excludedBounds,
    preferredWidths,
    preferredHeights,
    paneMargins,
    paneExpansionState,
  };
  const currentPlacements = calculateValuePlacements({ ...common, value: currentValue });
  const targetPlacements = calculateValuePlacements({ ...common, value: targetValue });
  const motionData = toMotionData(
    physicalOrder,
    motion,
    currentPlacements,
    targetPlacements,
  );
  const slideInLeft = calculateSlideInFromLeftOffset(motionData);
  const slideInRight = calculateSlideInFromRightOffset(motionData, width);
  const slideOutLeft = calculateSlideOutToLeftOffset(motionData);
  const slideOutRight = calculateSlideOutToRightOffset(motionData, width);

  let visibilityDurationMs = 0;
  let boundsDurationMs = 0;
  for (const role of roles) {
    const paneMotion = motion[role];
    const currentPlacement = currentPlacements[role];
    const targetPlacement = targetPlacements[role];
    const paneIndex = physicalOrder.indexOf(role);
    switch (paneMotion) {
      case PaneMotion.AnimateBounds:
        boundsDurationMs = Math.max(
          boundsDurationMs,
          calculateBoundsDuration(currentPlacement, targetPlacement),
        );
        break;
      case PaneMotion.EnterFromLeft:
        visibilityDurationMs = Math.max(
          visibilityDurationMs,
          calculateRegularOffsetDuration(slideInLeft, 0),
        );
        break;
      case PaneMotion.EnterFromLeftDelayed:
        visibilityDurationMs = Math.max(
          visibilityDurationMs,
          calculateDelayedOffsetDuration(slideInLeft, 0),
        );
        break;
      case PaneMotion.EnterFromRight:
        visibilityDurationMs = Math.max(
          visibilityDurationMs,
          calculateRegularOffsetDuration(slideInRight, 0),
        );
        break;
      case PaneMotion.EnterFromRightDelayed:
        visibilityDurationMs = Math.max(
          visibilityDurationMs,
          calculateDelayedOffsetDuration(slideInRight, 0),
        );
        break;
      case PaneMotion.ExitToLeft:
        visibilityDurationMs = Math.max(
          visibilityDurationMs,
          calculateRegularOffsetDuration(0, slideOutLeft),
        );
        break;
      case PaneMotion.ExitToRight:
        visibilityDurationMs = Math.max(
          visibilityDurationMs,
          calculateRegularOffsetDuration(0, slideOutRight),
        );
        break;
      case PaneMotion.EnterWithExpand:
        if (targetPlacement !== undefined) {
          const hiddenLeft = calculateHiddenPaneCurrentLeft(motionData, paneIndex);
          const initialOffset = hiddenLeft - targetPlacement.left;
          const collapsedPlacement = { ...targetPlacement, width: 0 };
          visibilityDurationMs = Math.max(
            visibilityDurationMs,
            calculateRegularOffsetDuration(initialOffset, 0),
            calculateHorizontalSizeDuration(collapsedPlacement, targetPlacement.width),
          );
        }
        break;
      case PaneMotion.ExitWithShrink:
        if (currentPlacement !== undefined) {
          const hidingLeft = calculateHidingPaneTargetLeft(motionData, paneIndex);
          const targetOffset = hidingLeft - currentPlacement.left;
          visibilityDurationMs = Math.max(
            visibilityDurationMs,
            calculateRegularOffsetDuration(0, targetOffset),
            calculateHorizontalSizeDuration(currentPlacement, 0),
          );
        }
        break;
      case PaneMotion.EnterAsModal:
      case PaneMotion.ExitAsModal:
        visibilityDurationMs = Math.max(visibilityDurationMs, calculateVisibilityDuration());
        break;
      case PaneMotion.NoMotion:
        break;
    }
  }

  // AndroidX SeekableTransitionState.animateTo(null) traverses Transition.totalDuration.
  // AnimatedPane's private AnimateBounds TargetBasedAnimation only consumes motionProgress;
  // it does not register its duration as a Transition child. Therefore a bounds-only
  // state change has a zero default timeline duration even though seekTo(fraction) can
  // still sample the private bounds spring at that fraction.
  const durationMs = visibilityDurationMs;
  return {
    physicalOrder,
    motion,
    currentPlacements,
    targetPlacements,
    motionData,
    slideInLeft,
    slideInRight,
    slideOutLeft,
    slideOutRight,
    visibilityDurationMs,
    boundsDurationMs,
    durationMs,
  };
}

export function calculateThreePaneScaffoldTransitionTiming(
  options: ThreePaneScaffoldTransitionLayoutOptions,
): ThreePaneScaffoldTransitionTiming {
  const prepared = prepareTransition(options);
  return {
    visibilityDurationMs: prepared.visibilityDurationMs,
    boundsDurationMs: prepared.boundsDurationMs,
    durationMs: prepared.durationMs,
  };
}

export function calculateThreePaneScaffoldTransitionDuration(
  options: ThreePaneScaffoldTransitionLayoutOptions,
): number {
  return prepareTransition(options).durationMs;
}

/**
 * Combines the last rendered frame with the next transition's logical start.
 * Existing rendered panes win so a retarget begins at the exact visual frame
 * already on screen; newly entering panes come from the next motion's start.
 */
export function captureThreePaneScaffoldTransitionOrigin(
  renderedFrame: ThreePaneScaffoldTransitionFrame,
  nextInitialFrame: ThreePaneScaffoldTransitionFrame,
): ThreePaneScaffoldTransitionFrame {
  const result: ThreePaneScaffoldTransitionFrame = {
    scrim: renderedFrame.scrim ?? nextInitialFrame.scrim,
    scrimOpacity:
      renderedFrame.scrim === undefined
        ? nextInitialFrame.scrimOpacity
        : renderedFrame.scrimOpacity,
  };
  for (const role of roles) {
    result[role] = renderedFrame[role] ?? nextInitialFrame[role];
  }
  return result;
}

function interpolatePaneTransitionFrame(
  from: PaneTransitionFrame | undefined,
  to: PaneTransitionFrame | undefined,
  fraction: number,
): PaneTransitionFrame | undefined {
  if (from === undefined && to === undefined) return undefined;
  if (from === undefined) {
    return {
      ...to!,
      opacity: to!.opacity * fraction,
      inlineClipFraction: to!.inlineClipFraction * fraction,
    };
  }
  if (to === undefined) {
    return {
      ...from,
      opacity: from.opacity * (1 - fraction),
      inlineClipFraction: from.inlineClipFraction * (1 - fraction),
    };
  }
  return {
    placement: interpolatePlacement(from.placement, to.placement, fraction),
    translateX: interpolate(from.translateX, to.translateX, fraction),
    opacity: interpolate(from.opacity, to.opacity, fraction),
    inlineClipFraction: interpolate(
      from.inlineClipFraction,
      to.inlineClipFraction,
      fraction,
    ),
    motion: to.motion,
    levitated: from.levitated || to.levitated,
  };
}

/**
 * Interpolates from a captured browser frame to a new transition endpoint.
 * This preserves visual continuity on target replacement. AndroidX likewise
 * captures current animated values before retargeting its Transition children.
 */
export function interpolateThreePaneScaffoldTransitionFrames(
  from: ThreePaneScaffoldTransitionFrame,
  to: ThreePaneScaffoldTransitionFrame,
  progressFraction: number,
): ThreePaneScaffoldTransitionFrame {
  const progress = clampFraction(progressFraction);
  const result: ThreePaneScaffoldTransitionFrame = {
    scrim: to.scrim ?? from.scrim,
    scrimOpacity: interpolate(from.scrimOpacity, to.scrimOpacity, progress),
  };
  for (const role of roles) {
    result[role] = interpolatePaneTransitionFrame(from[role], to[role], progress);
  }
  return result;
}

/**
 * Produces a browser-renderable frame from AndroidX pane-motion decisions.
 * The scaffold state's fraction is a raw transition timeline fraction. Bounds
 * use their own TargetBasedAnimation duration, while AnimatedVisibility
 * properties sample the global transition playtime, matching Compose.
 */
export function calculateThreePaneScaffoldTransitionFrame({
  progressFraction,
  ...layoutOptions
}: ThreePaneScaffoldTransitionOptions): ThreePaneScaffoldTransitionFrame {
  const progress = clampFraction(progressFraction);
  const prepared = prepareTransition(layoutOptions);
  const {
    physicalOrder,
    motion,
    currentPlacements,
    targetPlacements,
    motionData,
    slideInLeft,
    slideInRight,
    slideOutLeft,
    slideOutRight,
    visibilityDurationMs,
  } = prepared;
  const visibilityPlayTimeMs = visibilityDurationMs * progress;
  const result: ThreePaneScaffoldTransitionFrame = { scrimOpacity: 0 };

  roles.forEach((role) => {
    const currentPlacement = currentPlacements[role];
    const targetPlacement = targetPlacements[role];
    const paneMotion = motion[role];
    if (currentPlacement === undefined && targetPlacement === undefined) return;

    let placement = targetPlacement ?? currentPlacement!;
    let translateX = 0;
    let opacity = 1;
    let inlineClipFraction = 1;

    switch (paneMotion) {
      case PaneMotion.AnimateBounds:
        if (currentPlacement !== undefined && targetPlacement !== undefined) {
          placement = sampleBoundsAtProgress(currentPlacement, targetPlacement, progress);
        }
        break;
      case PaneMotion.EnterFromLeft:
        translateX = sampleRegularOffset(slideInLeft, 0, visibilityPlayTimeMs);
        break;
      case PaneMotion.EnterFromLeftDelayed:
        translateX = sampleDelayedOffset(slideInLeft, 0, visibilityPlayTimeMs);
        break;
      case PaneMotion.EnterFromRight:
        translateX = sampleRegularOffset(slideInRight, 0, visibilityPlayTimeMs);
        break;
      case PaneMotion.EnterFromRightDelayed:
        translateX = sampleDelayedOffset(slideInRight, 0, visibilityPlayTimeMs);
        break;
      case PaneMotion.ExitToLeft:
        placement = currentPlacement!;
        translateX = sampleRegularOffset(0, slideOutLeft, visibilityPlayTimeMs);
        break;
      case PaneMotion.ExitToRight:
        placement = currentPlacement!;
        translateX = sampleRegularOffset(0, slideOutRight, visibilityPlayTimeMs);
        break;
      case PaneMotion.EnterWithExpand: {
        const paneIndex = physicalOrder.indexOf(role);
        const hiddenLeft = calculateHiddenPaneCurrentLeft(motionData, paneIndex);
        const initialOffset = hiddenLeft - placement.left;
        translateX = sampleRegularOffset(initialOffset, 0, visibilityPlayTimeMs);
        const collapsedPlacement = { ...placement, width: 0 };
        const animatedWidth = sampleHorizontalSize(
          collapsedPlacement,
          placement.width,
          visibilityPlayTimeMs,
        );
        inlineClipFraction =
          placement.width <= 0 ? 1 : clampUnit(animatedWidth / placement.width);
        break;
      }
      case PaneMotion.ExitWithShrink: {
        placement = currentPlacement!;
        const paneIndex = physicalOrder.indexOf(role);
        const hidingLeft = calculateHidingPaneTargetLeft(motionData, paneIndex);
        const targetOffset = hidingLeft - placement.left;
        translateX = sampleRegularOffset(0, targetOffset, visibilityPlayTimeMs);
        const animatedWidth = sampleHorizontalSize(placement, 0, visibilityPlayTimeMs);
        inlineClipFraction =
          placement.width <= 0 ? 0 : clampUnit(animatedWidth / placement.width);
        break;
      }
      case PaneMotion.EnterAsModal:
        opacity = sampleVisibility(0, 1, visibilityPlayTimeMs);
        break;
      case PaneMotion.ExitAsModal:
        placement = currentPlacement!;
        opacity = sampleVisibility(1, 0, visibilityPlayTimeMs);
        break;
      case PaneMotion.NoMotion:
        opacity = targetPlacement === undefined ? 1 - progress : 1;
        break;
    }

    result[role] = {
      placement,
      translateX,
      opacity,
      inlineClipFraction,
      motion: paneMotion,
      levitated:
        getPaneAdaptedValue(layoutOptions.targetValue, role).type === 'levitated' ||
        (targetPlacement === undefined &&
          getPaneAdaptedValue(layoutOptions.currentValue, role).type === 'levitated'),
    };
  });

  const currentScrim = levitatedScrim(layoutOptions.currentValue);
  const targetScrim = levitatedScrim(layoutOptions.targetValue);
  if (targetScrim !== undefined) {
    result.scrim = targetScrim;
    const enteringModal = roles.some((role) => motion[role] === PaneMotion.EnterAsModal);
    result.scrimOpacity = enteringModal
      ? sampleVisibility(0, 1, visibilityPlayTimeMs)
      : 1;
  } else if (currentScrim !== undefined) {
    result.scrim = currentScrim;
    const exitingModal = roles.some((role) => motion[role] === PaneMotion.ExitAsModal);
    result.scrimOpacity = exitingModal
      ? sampleVisibility(1, 0, visibilityPlayTimeMs)
      : 0;
  }

  return result;
}
