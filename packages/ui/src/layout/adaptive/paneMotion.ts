import {
  getPaneAdaptedValue,
  type PaneAdaptedValue,
  type ThreePaneScaffoldHorizontalOrder,
  type ThreePaneScaffoldRole,
  type ThreePaneScaffoldValue,
} from './threePaneScaffold';

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
  const numOfPanes = paneOrder.length;
  const paneMotionTypes: PaneMotionType[] = Array.from({ length: numOfPanes }, () => 'hidden');
  const paneMotions: PaneMotion[] = Array.from(
    { length: numOfPanes },
    () => PaneMotion.NoMotion,
  );
  let firstShownPaneIndex = numOfPanes;
  let firstEnteringPaneIndex = numOfPanes;
  let lastShownPaneIndex = -1;
  let lastEnteringPaneIndex = -1;

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
  let firstPaneExitToRightIndex = numOfPanes;
  let lastPaneExitToLeftIndex = -1;

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
