import { PaneMotion } from '../../adaptive/paneMotion';
import type { ThreePaneScaffoldRole } from '../../adaptive/threePaneScaffold';
import type { PaneTransitionTrack } from './ThreePaneScaffold.interruption';
import {
  calculateThreePaneScaffoldTransitionDuration,
  calculateThreePaneScaffoldTransitionFrame,
} from './ThreePaneScaffold.transition';
import type {
  ThreePaneScaffoldTransitionSnapshot,
  ThreePaneScaffoldVisibilityInterruption,
} from './ThreePaneScaffold.visibilityInterruption';

const roles: readonly ThreePaneScaffoldRole[] = ['primary', 'secondary', 'tertiary'];
const FloatVisibilityThreshold = 0.01;
const MillisToNanos = 1_000_000;

function clampUnit(value: number) {
  return Math.max(0, Math.min(1, value));
}

function calculateSeekPlayTimeMs(durationMs: number, progressFraction: number) {
  const durationNanos = Math.round(durationMs * MillisToNanos);
  const fraction = Math.fround(clampUnit(progressFraction));
  return Math.round(fraction * durationNanos) / MillisToNanos;
}

function createTrack(
  initialValue: number,
  targetValue: number,
  playTimeMs: number,
  visibilityThreshold: number,
  quantizationStep: number | undefined,
  delayed = false,
): PaneTransitionTrack {
  return {
    initialValue,
    targetValue,
    initialVelocity: 0,
    playTimeMs,
    visibilityThreshold,
    quantizationStep,
    spec: delayed ? 'delayed-material' : 'material',
  };
}

function isOffsetMotion(motion: PaneMotion) {
  return (
    motion === PaneMotion.EnterFromLeft ||
    motion === PaneMotion.EnterFromLeftDelayed ||
    motion === PaneMotion.EnterFromRight ||
    motion === PaneMotion.EnterFromRightDelayed ||
    motion === PaneMotion.ExitToLeft ||
    motion === PaneMotion.ExitToRight ||
    motion === PaneMotion.EnterWithExpand ||
    motion === PaneMotion.ExitWithShrink
  );
}

function isDelayedOffsetMotion(motion: PaneMotion) {
  return (
    motion === PaneMotion.EnterFromLeftDelayed ||
    motion === PaneMotion.EnterFromRightDelayed
  );
}

function isModalMotion(motion: PaneMotion) {
  return motion === PaneMotion.EnterAsModal || motion === PaneMotion.ExitAsModal;
}

function isSizeMotion(motion: PaneMotion) {
  return motion === PaneMotion.EnterWithExpand || motion === PaneMotion.ExitWithShrink;
}

/**
 * Captures the currently declared Transition children of a raw seekable segment
 * so a same-target measurement update can replace only the children whose
 * measured initial/target value actually changed.
 */
export function createThreePaneScaffoldSeekingRemeasureSource(
  snapshot: ThreePaneScaffoldTransitionSnapshot,
): ThreePaneScaffoldVisibilityInterruption {
  const { layout } = snapshot;
  const durationMs = calculateThreePaneScaffoldTransitionDuration(layout);
  const start = calculateThreePaneScaffoldTransitionFrame({
    ...layout,
    progressFraction: 0,
  });
  const end = calculateThreePaneScaffoldTransitionFrame({
    ...layout,
    progressFraction: 1,
  });
  const playTimeMs = calculateSeekPlayTimeMs(durationMs, snapshot.progressFraction);
  const panes: ThreePaneScaffoldVisibilityInterruption['panes'] = {};

  for (const role of roles) {
    const startPane = start[role];
    const endPane = end[role];
    if (startPane === undefined || endPane === undefined) continue;

    const motion = endPane.motion;
    const tracks: NonNullable<
      ThreePaneScaffoldVisibilityInterruption['panes'][ThreePaneScaffoldRole]
    > = {};

    if (isOffsetMotion(motion)) {
      tracks.translateX = createTrack(
        startPane.translateX,
        endPane.translateX,
        playTimeMs,
        1,
        1,
        isDelayedOffsetMotion(motion),
      );
    }
    if (isModalMotion(motion)) {
      tracks.opacity = createTrack(
        startPane.opacity,
        endPane.opacity,
        playTimeMs,
        FloatVisibilityThreshold,
        undefined,
      );
    }
    if (isSizeMotion(motion)) {
      const referenceWidth = Math.max(
        1,
        motion === PaneMotion.EnterWithExpand
          ? endPane.placement.width
          : startPane.placement.width,
      );
      tracks.inlineSizeReferenceWidth = referenceWidth;
      tracks.inlineSize = createTrack(
        startPane.inlineClipFraction * referenceWidth,
        endPane.inlineClipFraction * referenceWidth,
        playTimeMs,
        1,
        1,
      );
    }

    if (
      tracks.translateX !== undefined ||
      tracks.opacity !== undefined ||
      tracks.inlineSize !== undefined
    ) {
      panes[role] = tracks;
    }
  }

  const hasModal = roles.some((role) => {
    const motion = end[role]?.motion;
    return motion !== undefined && isModalMotion(motion);
  });
  const scrimOpacity =
    hasModal && start.scrimOpacity !== end.scrimOpacity
      ? createTrack(
          start.scrimOpacity,
          end.scrimOpacity,
          playTimeMs,
          FloatVisibilityThreshold,
          undefined,
        )
      : undefined;

  return {
    originFrame: start,
    destinationStartFrame: start,
    targetFrame: end,
    durationMs,
    panes,
    scrimOpacity,
  };
}
