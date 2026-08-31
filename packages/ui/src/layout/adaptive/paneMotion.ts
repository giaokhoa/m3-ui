import {
  getPaneAdaptedValue,
  type PaneAdaptedValue,
  type ThreePaneScaffoldHorizontalOrder,
  type ThreePaneScaffoldRole,
  type ThreePaneScaffoldValue,
} from './threePaneScaffold';
import { assertThreePaneScaffoldHorizontalOrder } from './threePaneScaffoldHorizontalOrder';

export type PaneMotion =
  | 'no-motion'
  | 'animate-bounds'
  | 'enter-from-left'
  | 'enter-from-right'
  | 'enter-from-left-delayed'
  | 'enter-from-right-delayed'
  | 'exit-to-left'
  | 'exit-to-right'
  | 'enter-with-expand'
  | 'exit-with-shrink'
  | 'enter-as-modal'
  | 'exit-as-modal';

export const PaneMotion = {
  NoMotion: 'no-motion',
  AnimateBounds: 'animate-bounds',
  EnterFromLeft: 'enter-from-left',
  EnterFromRight: 'enter-from-right',
  EnterFromLeftDelayed: 'enter-from-left-delayed',
  EnterFromRightDelayed: 'enter-from-right-delayed',
  ExitToLeft: 'exit-to-left',
  ExitToRight: 'exit-to-right',
  EnterWithExpand: 'enter-with-expand',
  ExitWithShrink: 'exit-with-shrink',
  EnterAsModal: 'enter-as-modal',
  ExitAsModal: 'exit-as-modal',
} as const satisfies Record<string, PaneMotion>;

export type PaneMotionType =
  | 'hidden'
  | 'exiting'
  | 'entering'
  | 'shown'
  | 'exiting-modal'
  | 'entering-modal';

export interface ThreePaneMotion {
  primary: PaneMotion;
  secondary: PaneMotion;
  tertiary: PaneMotion;
}

export interface PaneMotionPoint {
  x: number;
  y: number;
}

export interface PaneMotionSize {
  width: number;
  height: number;
}

/** Motion-relevant pane geometry, matching AndroidX PaneMotionData. */
export interface PaneMotionData {
  motion: PaneMotion;
  originSize: PaneMotionSize;
  originPosition: PaneMotionPoint;
  targetSize: PaneMotionSize;
  targetPosition: PaneMotionPoint;
}

export const ThreePaneMotion = {
  NoMotion: Object.freeze({
    primary: PaneMotion.NoMotion,
    secondary: PaneMotion.NoMotion,
    tertiary: PaneMotion.NoMotion,
  }) satisfies ThreePaneMotion,
} as const;

/** AndroidX default spring parameters; browser interpolation is a separate renderer concern. */
export const PaneMotionDefaults = {
  dampingRatio: 0.8,
  stiffness: 380,
  delayedRatio: 0.1,
} as const;

export function calculatePaneMotionType(
  previousValue: PaneAdaptedValue,
  currentValue: PaneAdaptedValue,
): PaneMotionType {
  const wasShown = previousValue.type !== 'hidden';
  const isShown = currentValue.type !== 'hidden';
  const levitatedPane =
    previousValue.type === 'levitated' || currentValue.type === 'levitated';

  if (wasShown && isShown) return 'shown';
  if (!wasShown && !isShown) return 'hidden';
  if (wasShown && !isShown) return levitatedPane ? 'exiting-modal' : 'exiting';
  if (!wasShown && isShown) return levitatedPane ? 'entering-modal' : 'entering';
  return 'hidden';
}

/**
 * Exact four-pass port of AndroidX calculatePaneMotion.
 *
 * `paneOrder` must be physical left-to-right order. The React renderer converts
 * logical order to physical order before calling this in RTL, matching
 * AndroidX's `toLtrOrder(layoutDirection)` boundary.
 */
export function calculateThreePaneMotion(
  previousValue: ThreePaneScaffoldValue,
  currentValue: ThreePaneScaffoldValue,
  paneOrder: ThreePaneScaffoldHorizontalOrder,
): ThreePaneMotion {
  assertThreePaneScaffoldHorizontalOrder(paneOrder);
  const numOfPanes: number = paneOrder.length;
  const paneMotionTypes: PaneMotionType[] = Array.from({ length: numOfPanes }, () => 'hidden');
  const paneMotions: PaneMotion[] = Array.from(
    { length: numOfPanes },
    () => PaneMotion.NoMotion,
  );
  let firstShownPaneIndex: number = numOfPanes;
  let firstEnteringPaneIndex: number = numOfPanes;
  let lastShownPaneIndex: number = -1;
  let lastEnteringPaneIndex: number = -1;

  paneOrder.forEach((role, index) => {
    const type = calculatePaneMotionType(
      getPaneAdaptedValue(previousValue, role),
      getPaneAdaptedValue(currentValue, role),
    );
    paneMotionTypes[index] = type;
    if (type === 'shown') {
      firstShownPaneIndex = Math.min(firstShownPaneIndex, index);
      lastShownPaneIndex = Math.max(lastShownPaneIndex, index);
      paneMotions[index] = PaneMotion.AnimateBounds;
    } else if (type === 'entering') {
      firstEnteringPaneIndex = Math.min(firstEnteringPaneIndex, index);
      lastEnteringPaneIndex = Math.max(lastEnteringPaneIndex, index);
    }
  });

  let hasPanesExitToRight = false;
  let hasPanesExitToLeft = false;
  let firstPaneExitToRightIndex: number = numOfPanes;
  let lastPaneExitToLeftIndex: number = -1;

  paneOrder.forEach((_, index) => {
    const hasShownPanesOnLeft = firstShownPaneIndex < index;
    const hasEnteringPanesOnLeft = firstEnteringPaneIndex < index;
    const hasShownPanesOnRight = lastShownPaneIndex > index;
    const hasEnteringPanesOnRight = lastEnteringPaneIndex > index;
    if (paneMotionTypes[index] !== 'exiting') return;

    if (!hasShownPanesOnRight && !hasEnteringPanesOnRight) {
      hasPanesExitToRight = true;
      firstPaneExitToRightIndex = Math.min(firstPaneExitToRightIndex, index);
      paneMotions[index] = PaneMotion.ExitToRight;
    } else if (!hasShownPanesOnLeft && !hasEnteringPanesOnLeft) {
      hasPanesExitToLeft = true;
      lastPaneExitToLeftIndex = Math.max(lastPaneExitToLeftIndex, index);
      paneMotions[index] = PaneMotion.ExitToLeft;
    } else if (!hasShownPanesOnRight) {
      hasPanesExitToRight = true;
      firstPaneExitToRightIndex = Math.min(firstPaneExitToRightIndex, index);
      paneMotions[index] = PaneMotion.ExitToRight;
    } else if (!hasShownPanesOnLeft) {
      hasPanesExitToLeft = true;
      lastPaneExitToLeftIndex = Math.max(lastPaneExitToLeftIndex, index);
      paneMotions[index] = PaneMotion.ExitToLeft;
    } else {
      paneMotions[index] = PaneMotion.ExitWithShrink;
    }
  });

  paneOrder.forEach((_, index) => {
    const hasShownPanesOnLeft = firstShownPaneIndex < index;
    const hasShownPanesOnRight = lastShownPaneIndex > index;
    const hasLeftPaneExitToRight = firstPaneExitToRightIndex < index;
    const hasRightPaneExitToLeft = lastPaneExitToLeftIndex > index;
    const noBlockingPanesOnRight = !hasShownPanesOnRight && !hasRightPaneExitToLeft;
    const noBlockingPanesOnLeft = !hasShownPanesOnLeft && !hasLeftPaneExitToRight;
    if (paneMotionTypes[index] !== 'entering') return;

    if (noBlockingPanesOnRight && !hasPanesExitToRight) {
      paneMotions[index] = PaneMotion.EnterFromRight;
    } else if (noBlockingPanesOnLeft && !hasPanesExitToLeft) {
      paneMotions[index] = PaneMotion.EnterFromLeft;
    } else if (noBlockingPanesOnRight) {
      paneMotions[index] = PaneMotion.EnterFromRightDelayed;
    } else if (noBlockingPanesOnLeft) {
      paneMotions[index] = PaneMotion.EnterFromLeftDelayed;
    } else {
      paneMotions[index] = PaneMotion.EnterWithExpand;
    }
  });

  paneOrder.forEach((_, index) => {
    if (paneMotionTypes[index] === 'entering-modal') {
      paneMotions[index] = PaneMotion.EnterAsModal;
    } else if (paneMotionTypes[index] === 'exiting-modal') {
      paneMotions[index] = PaneMotion.ExitAsModal;
    }
  });

  const byRole: Partial<Record<ThreePaneScaffoldRole, PaneMotion>> = {};
  paneOrder.forEach((role, index) => {
    byRole[role] = paneMotions[index]!;
  });
  return {
    primary: byRole.primary ?? PaneMotion.NoMotion,
    secondary: byRole.secondary ?? PaneMotion.NoMotion,
    tertiary: byRole.tertiary ?? PaneMotion.NoMotion,
  };
}

function currentLeft(data: PaneMotionData) {
  return data.originPosition.x;
}

function currentRight(data: PaneMotionData) {
  return data.originPosition.x + data.originSize.width;
}

function targetLeft(data: PaneMotionData) {
  return data.targetPosition.x;
}

function targetRight(data: PaneMotionData) {
  return data.targetPosition.x + data.targetSize.width;
}

/** Port of AndroidX PaneScaffoldMotionDataProvider.slideInFromLeftOffset. */
export function calculateSlideInFromLeftOffset(
  paneData: readonly PaneMotionData[],
): number {
  let previousPane: PaneMotionData | undefined;
  for (let index = paneData.length - 1; index >= 0; index -= 1) {
    const data = paneData[index]!;
    if (
      data.motion === PaneMotion.EnterFromLeft ||
      data.motion === PaneMotion.EnterFromLeftDelayed
    ) {
      return -(previousPane === undefined ? targetRight(data) : targetLeft(previousPane));
    }
    if (
      data.motion === PaneMotion.AnimateBounds ||
      data.motion === PaneMotion.EnterFromRight ||
      data.motion === PaneMotion.EnterFromRightDelayed ||
      data.motion === PaneMotion.EnterWithExpand
    ) {
      previousPane = data;
    }
  }
  return 0;
}

/** Port of AndroidX PaneScaffoldMotionDataProvider.slideInFromRightOffset. */
export function calculateSlideInFromRightOffset(
  paneData: readonly PaneMotionData[],
  scaffoldWidth: number,
): number {
  let previousPane: PaneMotionData | undefined;
  for (const data of paneData) {
    if (
      data.motion === PaneMotion.EnterFromRight ||
      data.motion === PaneMotion.EnterFromRightDelayed
    ) {
      return scaffoldWidth -
        (previousPane === undefined ? targetLeft(data) : targetRight(previousPane));
    }
    if (
      data.motion === PaneMotion.AnimateBounds ||
      data.motion === PaneMotion.EnterFromLeft ||
      data.motion === PaneMotion.EnterFromLeftDelayed ||
      data.motion === PaneMotion.EnterWithExpand
    ) {
      previousPane = data;
    }
  }
  return 0;
}

/** Port of AndroidX PaneScaffoldMotionDataProvider.slideOutToLeftOffset. */
export function calculateSlideOutToLeftOffset(
  paneData: readonly PaneMotionData[],
): number {
  let previousPane: PaneMotionData | undefined;
  for (let index = paneData.length - 1; index >= 0; index -= 1) {
    const data = paneData[index]!;
    if (data.motion === PaneMotion.ExitToLeft) {
      return -(previousPane === undefined ? currentRight(data) : currentLeft(previousPane));
    }
    if (
      data.motion === PaneMotion.AnimateBounds ||
      data.motion === PaneMotion.ExitToRight ||
      data.motion === PaneMotion.ExitWithShrink
    ) {
      previousPane = data;
    }
  }
  return 0;
}

/** Port of AndroidX PaneScaffoldMotionDataProvider.slideOutToRightOffset. */
export function calculateSlideOutToRightOffset(
  paneData: readonly PaneMotionData[],
  scaffoldWidth: number,
): number {
  let previousPane: PaneMotionData | undefined;
  for (const data of paneData) {
    if (data.motion === PaneMotion.ExitToRight) {
      return scaffoldWidth -
        (previousPane === undefined ? currentLeft(data) : currentRight(previousPane));
    }
    if (
      data.motion === PaneMotion.AnimateBounds ||
      data.motion === PaneMotion.ExitToLeft ||
      data.motion === PaneMotion.ExitWithShrink
    ) {
      previousPane = data;
    }
  }
  return 0;
}

/** Finds the current left edge for a hidden/entering pane from the nearest shown pane on its left. */
export function calculateHiddenPaneCurrentLeft(
  paneData: readonly PaneMotionData[],
  paneIndex: number,
): number {
  let left = 0;
  for (let index = 0; index < paneData.length; index += 1) {
    if (index === paneIndex) return left;
    const data = paneData[index]!;
    if (
      data.motion === PaneMotion.AnimateBounds ||
      data.motion === PaneMotion.ExitToLeft ||
      data.motion === PaneMotion.ExitToRight ||
      data.motion === PaneMotion.ExitWithShrink
    ) {
      left = currentRight(data);
    }
  }
  return left;
}

/** Finds the target left edge for a hiding pane from the nearest pane remaining shown on its left. */
export function calculateHidingPaneTargetLeft(
  paneData: readonly PaneMotionData[],
  paneIndex: number,
): number {
  let left = 0;
  for (let index = 0; index < paneData.length; index += 1) {
    if (index === paneIndex) return left;
    const data = paneData[index]!;
    if (
      data.motion === PaneMotion.AnimateBounds ||
      data.motion === PaneMotion.EnterFromLeft ||
      data.motion === PaneMotion.EnterFromRight ||
      data.motion === PaneMotion.EnterFromLeftDelayed ||
      data.motion === PaneMotion.EnterFromRightDelayed ||
      data.motion === PaneMotion.EnterWithExpand
    ) {
      left = targetRight(data);
    }
  }
  return left;
}
