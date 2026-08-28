import type { ReactNode } from 'react';
import type { PaneExpansionState } from '../../adaptive/paneExpansionState';
import type { LayoutBounds, PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import {
  PaneMotion,
  PaneMotionDefaults,
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
  preferredWidths?: Partial<Record<ThreePaneScaffoldRole, number>>;
  preferredHeights?: Partial<Record<ThreePaneScaffoldRole, number>>;
  paneExpansionState?: PaneExpansionState | null;
}

const roles: readonly ThreePaneScaffoldRole[] = ['primary', 'secondary', 'tertiary'];
const zeroPlacement: PanePlacement = { left: 0, top: 0, width: 0, height: 0 };

function clampFraction(value: number) {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new RangeError(`progressFraction must be in [0, 1], received ${value}`);
  }
  return value;
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

function delayedProgress(fraction: number) {
  const delayedRatio = PaneMotionDefaults.delayedRatio;
  if (fraction <= delayedRatio) return 0;
  return Math.min(1, (fraction - delayedRatio) / (1 - delayedRatio));
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
    placements[role] =
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
 * This is the web counterpart of Compose SeekableTransitionState preserving
 * in-flight animated values when a target is replaced mid-transition.
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
 * Layout measurement is performed for the discrete current/target states, then
 * the frame applies translation, bounds interpolation, clipping and opacity.
 */
export function calculateThreePaneScaffoldTransitionFrame({
  width,
  height,
  directive,
  currentValue,
  targetValue,
  progressFraction,
  paneOrder,
  direction = 'ltr',
  excludedBounds = directive.excludedBounds,
  preferredWidths,
  preferredHeights,
  paneExpansionState = null,
}: ThreePaneScaffoldTransitionOptions): ThreePaneScaffoldTransitionFrame {
  const progress = clampFraction(progressFraction);
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
          placement = interpolatePlacement(currentPlacement, targetPlacement, progress);
        }
        break;
      case PaneMotion.EnterFromLeft:
        translateX = slideInLeft * (1 - progress);
        break;
      case PaneMotion.EnterFromLeftDelayed: {
        const delayed = delayedProgress(progress);
        translateX = slideInLeft * (1 - delayed);
        break;
      }
      case PaneMotion.EnterFromRight:
        translateX = slideInRight * (1 - progress);
        break;
      case PaneMotion.EnterFromRightDelayed: {
        const delayed = delayedProgress(progress);
        translateX = slideInRight * (1 - delayed);
        break;
      }
      case PaneMotion.ExitToLeft:
        placement = currentPlacement!;
        translateX = slideOutLeft * progress;
        break;
      case PaneMotion.ExitToRight:
        placement = currentPlacement!;
        translateX = slideOutRight * progress;
        break;
      case PaneMotion.EnterWithExpand: {
        const paneIndex = physicalOrder.indexOf(role);
        const hiddenLeft = calculateHiddenPaneCurrentLeft(motionData, paneIndex);
        translateX = (hiddenLeft - placement.left) * (1 - progress);
        inlineClipFraction = progress;
        break;
      }
      case PaneMotion.ExitWithShrink: {
        placement = currentPlacement!;
        const paneIndex = physicalOrder.indexOf(role);
        const hidingLeft = calculateHidingPaneTargetLeft(motionData, paneIndex);
        translateX = (hidingLeft - placement.left) * progress;
        inlineClipFraction = 1 - progress;
        break;
      }
      case PaneMotion.EnterAsModal:
        opacity = progress;
        break;
      case PaneMotion.ExitAsModal:
        placement = currentPlacement!;
        opacity = 1 - progress;
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
        getPaneAdaptedValue(targetValue, role).type === 'levitated' ||
        (targetPlacement === undefined && getPaneAdaptedValue(currentValue, role).type === 'levitated'),
    };
  });

  const currentScrim = levitatedScrim(currentValue);
  const targetScrim = levitatedScrim(targetValue);
  if (targetScrim !== undefined) {
    result.scrim = targetScrim;
    const enteringModal = roles.some((role) => motion[role] === PaneMotion.EnterAsModal);
    result.scrimOpacity = enteringModal ? progress : 1;
  } else if (currentScrim !== undefined) {
    result.scrim = currentScrim;
    const exitingModal = roles.some((role) => motion[role] === PaneMotion.ExitAsModal);
    result.scrimOpacity = exitingModal ? 1 - progress : 0;
  }

  return result;
}
