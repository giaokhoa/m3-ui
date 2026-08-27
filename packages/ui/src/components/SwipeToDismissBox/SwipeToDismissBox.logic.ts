export const SWIPE_TO_DISMISS_POSITIONAL_THRESHOLD = 56;
export const SWIPE_TO_DISMISS_VELOCITY_THRESHOLD = 125;
export const SWIPE_TO_DISMISS_INTENT_SLOP = 6;

export type SwipeToDismissBoxValue = 'settled' | 'start-to-end' | 'end-to-start';

export interface ResolveSwipeToDismissTargetOptions {
  logicalOffset: number;
  logicalVelocity: number;
  enableDismissFromStartToEnd: boolean;
  enableDismissFromEndToStart: boolean;
  positionalThreshold?: number;
  velocityThreshold?: number;
}

export function dismissValueForLogicalOffset(logicalOffset: number): SwipeToDismissBoxValue {
  if (logicalOffset > 0) return 'start-to-end';
  if (logicalOffset < 0) return 'end-to-start';
  return 'settled';
}

export function resolveSwipeToDismissTarget({
  logicalOffset,
  logicalVelocity,
  enableDismissFromStartToEnd,
  enableDismissFromEndToStart,
  positionalThreshold = SWIPE_TO_DISMISS_POSITIONAL_THRESHOLD,
  velocityThreshold = SWIPE_TO_DISMISS_VELOCITY_THRESHOLD,
}: ResolveSwipeToDismissTargetOptions): SwipeToDismissBoxValue {
  if (
    enableDismissFromStartToEnd &&
    (logicalOffset >= positionalThreshold || logicalVelocity >= velocityThreshold)
  ) {
    return 'start-to-end';
  }

  if (
    enableDismissFromEndToStart &&
    (logicalOffset <= -positionalThreshold || logicalVelocity <= -velocityThreshold)
  ) {
    return 'end-to-start';
  }

  return 'settled';
}
