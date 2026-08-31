import { PaneMotion } from '../../adaptive/paneMotion';
import {
  captureThreePaneScaffoldTransitionOrigin,
  type PaneTransitionFrame,
  type ThreePaneScaffoldTransitionFrame,
} from './ThreePaneScaffold.transition';

const roles = ['primary', 'secondary', 'tertiary'] as const;

function keepFrozenAnimateBoundsPlacement(
  moving: PaneTransitionFrame | undefined,
  frozen: PaneTransitionFrame | undefined,
  target: PaneTransitionFrame | undefined,
) {
  if (
    moving === undefined ||
    frozen === undefined ||
    target?.motion !== PaneMotion.AnimateBounds
  ) {
    return moving;
  }
  return { ...moving, placement: frozen.placement };
}

/**
 * Builds the moving initial frame used after a SeekableTransitionState retarget.
 *
 * Transition children keep sampling their previous animation toward its old
 * target, so slide/visibility values come from `movingPreviousFrame`. The
 * private Material AnimateBounds modifier is not a Transition child; it captures
 * its current bounds once when the target changes, so its placement stays from
 * `frozenRetargetFrame` instead.
 */
export function composeThreePaneScaffoldMovingRetargetOrigin(
  frozenRetargetFrame: ThreePaneScaffoldTransitionFrame,
  movingPreviousFrame: ThreePaneScaffoldTransitionFrame,
  nextInitialFrame: ThreePaneScaffoldTransitionFrame,
  nextEndFrame: ThreePaneScaffoldTransitionFrame,
): ThreePaneScaffoldTransitionFrame {
  const movingOrigin = captureThreePaneScaffoldTransitionOrigin(
    movingPreviousFrame,
    nextInitialFrame,
  );

  for (const role of roles) {
    movingOrigin[role] = keepFrozenAnimateBoundsPlacement(
      movingOrigin[role],
      frozenRetargetFrame[role],
      nextEndFrame[role],
    );
  }
  return movingOrigin;
}
