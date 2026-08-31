import { PaneMotion } from '../../adaptive/paneMotion';
import type { ThreePaneScaffoldRole } from '../../adaptive/threePaneScaffold';
import {
  calculatePaneTransitionTrackDurationMs,
  capturePaneTransitionTrack,
  hasLivePaneTransitionInitialValueAnimation,
  retargetPaneTransitionTrack,
  samplePaneTransitionTrack,
  type PaneTransitionTrack,
} from './ThreePaneScaffold.interruption';
import {
  calculateThreePaneScaffoldTransitionDuration,
  calculateThreePaneScaffoldTransitionFrame,
  captureThreePaneScaffoldTransitionOrigin,
  interpolateThreePaneScaffoldTransitionFrames,
  type PaneTransitionFrame,
  type ThreePaneScaffoldTransitionFrame,
  type ThreePaneScaffoldTransitionLayoutOptions,
} from './ThreePaneScaffold.transition';

const roles: readonly ThreePaneScaffoldRole[] = ['primary', 'secondary', 'tertiary'];
const FloatVisibilityThreshold = 0.01;
const MillisToNanos = 1_000_000;

export interface ThreePaneScaffoldTransitionSnapshot {
  readonly layout: ThreePaneScaffoldTransitionLayoutOptions;
  readonly progressFraction: number;
}

interface PaneTracks {
  translateX?: PaneTransitionTrack;
  opacity?: PaneTransitionTrack;
  inlineSize?: PaneTransitionTrack;
  inlineSizeReferenceWidth?: number;
  retainOriginPane?: boolean;
}

interface DeclaredTransitionTracks {
  panes: Partial<Record<ThreePaneScaffoldRole, PaneTracks>>;
  scrimOpacity?: PaneTransitionTrack;
}

export interface ThreePaneScaffoldVisibilityInterruption {
  readonly originFrame: ThreePaneScaffoldTransitionFrame;
  readonly destinationStartFrame?: ThreePaneScaffoldTransitionFrame;
  readonly targetFrame: ThreePaneScaffoldTransitionFrame;
  readonly durationMs: number;
  readonly panes: Partial<Record<ThreePaneScaffoldRole, PaneTracks>>;
  readonly scrimOpacity?: PaneTransitionTrack;
}

export interface PreviousVisibilityInterruption {
  readonly interruption: ThreePaneScaffoldVisibilityInterruption;
  readonly elapsedMs: number;
}

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

function hasPaneTracks(tracks: PaneTracks | undefined) {
  return (
    tracks?.translateX !== undefined ||
    tracks?.opacity !== undefined ||
    tracks?.inlineSize !== undefined
  );
}

function declaredTracks(
  layout: ThreePaneScaffoldTransitionLayoutOptions,
  progressFraction: number,
): {
  start: ThreePaneScaffoldTransitionFrame;
  end: ThreePaneScaffoldTransitionFrame;
  durationMs: number;
  tracks: DeclaredTransitionTracks;
} {
  const durationMs = calculateThreePaneScaffoldTransitionDuration(layout);
  const start = calculateThreePaneScaffoldTransitionFrame({ ...layout, progressFraction: 0 });
  const end = calculateThreePaneScaffoldTransitionFrame({ ...layout, progressFraction: 1 });
  const playTimeMs = calculateSeekPlayTimeMs(durationMs, progressFraction);
  const panes: Partial<Record<ThreePaneScaffoldRole, PaneTracks>> = {};

  for (const role of roles) {
    const startPane = start[role];
    const endPane = end[role];
    if (startPane === undefined || endPane === undefined) continue;
    const motion = endPane.motion;
    const paneTracks: PaneTracks = {};

    if (isOffsetMotion(motion)) {
      paneTracks.translateX = createTrack(
        startPane.translateX,
        endPane.translateX,
        playTimeMs,
        1,
        1,
        isDelayedOffsetMotion(motion),
      );
    }
    if (isModalMotion(motion)) {
      paneTracks.opacity = createTrack(
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
      paneTracks.inlineSizeReferenceWidth = referenceWidth;
      paneTracks.inlineSize = createTrack(
        startPane.inlineClipFraction * referenceWidth,
        endPane.inlineClipFraction * referenceWidth,
        playTimeMs,
        1,
        1,
      );
    }

    if (hasPaneTracks(paneTracks)) panes[role] = paneTracks;
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

  return { start, end, durationMs, tracks: { panes, scrimOpacity } };
}

function capturePaneTracks(
  tracks: PaneTracks | undefined,
  playTimeMs: number,
  initialElapsedMs: number,
) {
  if (tracks === undefined) return undefined;
  return {
    translateX:
      tracks.translateX === undefined
        ? undefined
        : capturePaneTransitionTrack(
            tracks.translateX,
            playTimeMs,
            initialElapsedMs,
          ),
    opacity:
      tracks.opacity === undefined
        ? undefined
        : capturePaneTransitionTrack(tracks.opacity, playTimeMs, initialElapsedMs),
    inlineSize:
      tracks.inlineSize === undefined
        ? undefined
        : capturePaneTransitionTrack(
            tracks.inlineSize,
            playTimeMs,
            initialElapsedMs,
          ),
    inlineSizeReferenceWidth: tracks.inlineSizeReferenceWidth,
    retainOriginPane: tracks.retainOriginPane,
  } satisfies PaneTracks;
}

function transitionTracksDurationMs(
  panes: Partial<Record<ThreePaneScaffoldRole, PaneTracks>>,
  scrimOpacity: PaneTransitionTrack | undefined,
  initialElapsedMs: number,
) {
  let durationMs =
    scrimOpacity === undefined
      ? 0
      : calculatePaneTransitionTrackDurationMs(scrimOpacity, initialElapsedMs);
  for (const role of roles) {
    const tracks = panes[role];
    if (tracks === undefined) continue;
    if (tracks.translateX !== undefined) {
      durationMs = Math.max(
        durationMs,
        calculatePaneTransitionTrackDurationMs(tracks.translateX, initialElapsedMs),
      );
    }
    if (tracks.opacity !== undefined) {
      durationMs = Math.max(
        durationMs,
        calculatePaneTransitionTrackDurationMs(tracks.opacity, initialElapsedMs),
      );
    }
    if (tracks.inlineSize !== undefined) {
      durationMs = Math.max(
        durationMs,
        calculatePaneTransitionTrackDurationMs(tracks.inlineSize, initialElapsedMs),
      );
    }
  }
  return durationMs;
}

export function calculateThreePaneScaffoldVisibilityInterruptionDurationMs(
  interruption: ThreePaneScaffoldVisibilityInterruption,
  initialElapsedMs = 0,
) {
  return transitionTracksDurationMs(
    interruption.panes,
    interruption.scrimOpacity,
    Math.max(0, initialElapsedMs),
  );
}

function sourceTracks(
  previousSnapshot: ThreePaneScaffoldTransitionSnapshot,
  previousInterruption: PreviousVisibilityInterruption | undefined,
): { durationMs: number; tracks: DeclaredTransitionTracks } {
  if (previousInterruption === undefined) {
    const source = declaredTracks(
      previousSnapshot.layout,
      previousSnapshot.progressFraction,
    );
    return { durationMs: source.durationMs, tracks: source.tracks };
  }

  const previousDurationMs =
    calculateThreePaneScaffoldVisibilityInterruptionDurationMs(
      previousInterruption.interruption,
      previousInterruption.elapsedMs,
    );
  const previousSeekPlayTimeMs = calculateSeekPlayTimeMs(
    previousDurationMs,
    previousSnapshot.progressFraction,
  );
  const panes: Partial<Record<ThreePaneScaffoldRole, PaneTracks>> = {};
  for (const role of roles) {
    const captured = capturePaneTracks(
      previousInterruption.interruption.panes[role],
      previousSeekPlayTimeMs,
      previousInterruption.elapsedMs,
    );
    if (captured !== undefined) panes[role] = captured;
  }
  return {
    durationMs: previousDurationMs,
    tracks: {
      panes,
      scrimOpacity:
        previousInterruption.interruption.scrimOpacity === undefined
          ? undefined
          : capturePaneTransitionTrack(
              previousInterruption.interruption.scrimOpacity,
              previousSeekPlayTimeMs,
              previousInterruption.elapsedMs,
            ),
    },
  };
}

function paneSizeValue(frame: PaneTransitionFrame) {
  const referenceWidth = Math.max(1, frame.placement.width);
  return {
    referenceWidth,
    value: frame.inlineClipFraction * referenceWidth,
  };
}

function placementsEqual(
  first: PaneTransitionFrame['placement'],
  second: PaneTransitionFrame['placement'],
) {
  return (
    first.left === second.left &&
    first.top === second.top &&
    first.width === second.width &&
    first.height === second.height
  );
}

export function updateAnimateBoundsRemeasureOriginPlacement({
  origin,
  rendered,
  previousTarget,
  nextTarget,
}: {
  origin: PaneTransitionFrame['placement'];
  rendered: PaneTransitionFrame['placement'];
  previousTarget: PaneTransitionFrame['placement'] | undefined;
  nextTarget: PaneTransitionFrame['placement'];
}): PaneTransitionFrame['placement'] {
  if (previousTarget === undefined) return rendered;

  const sizeChanged =
    previousTarget.width !== nextTarget.width ||
    previousTarget.height !== nextTarget.height;
  const offsetChanged =
    previousTarget.left !== nextTarget.left ||
    previousTarget.top !== nextTarget.top;

  return {
    left: offsetChanged ? rendered.left : origin.left,
    top: offsetChanged ? rendered.top : origin.top,
    width: sizeChanged ? rendered.width : origin.width,
    height: sizeChanged ? rendered.height : origin.height,
  };
}

function paneFramesEqual(
  first: PaneTransitionFrame | undefined,
  second: PaneTransitionFrame | undefined,
) {
  if (first === second) return true;
  if (first === undefined || second === undefined) return false;
  return (
    placementsEqual(first.placement, second.placement) &&
    first.translateX === second.translateX &&
    first.opacity === second.opacity &&
    first.inlineClipFraction === second.inlineClipFraction &&
    first.motion === second.motion &&
    first.levitated === second.levitated
  );
}

function transitionFramesEqual(
  first: ThreePaneScaffoldTransitionFrame | undefined,
  second: ThreePaneScaffoldTransitionFrame,
) {
  if (first === undefined) return false;
  return (
    first.scrim === second.scrim &&
    first.scrimOpacity === second.scrimOpacity &&
    roles.every((role) => paneFramesEqual(first[role], second[role]))
  );
}

function syntheticSeekingTrack(
  current: PaneTransitionTrack,
  initialValue: number,
  targetValue: number,
): PaneTransitionTrack {
  return {
    initialValue,
    targetValue,
    initialVelocity: 0,
    playTimeMs: 0,
    visibilityThreshold: current.visibilityThreshold,
    quantizationStep: current.quantizationStep,
    spec: current.spec,
  };
}

function updateSeekingTrack(
  current: PaneTransitionTrack | undefined,
  declared: PaneTransitionTrack | undefined,
  valuesChanged: boolean,
  seekPlayTimeMs: number,
  initialElapsedMs: number,
) {
  if (current === undefined || declared === undefined || !valuesChanged) return current;

  const currentSample = samplePaneTransitionTrack(
    current,
    seekPlayTimeMs,
    initialElapsedMs,
  );
  const initialValueAnimation = hasLivePaneTransitionInitialValueAnimation(
    current,
    initialElapsedMs,
  )
    ? current.initialValueAnimation
    : undefined;
  if (
    initialValueAnimation !== undefined &&
    initialValueAnimation.targetValue === declared.targetValue
  ) {
    return {
      ...declared,
      initialVelocity: 0,
      playTimeMs: 0,
      seekStartPlayTimeMs: seekPlayTimeMs,
      initialValueAnimation,
      useOnlyInitialValue: true,
    } satisfies PaneTransitionTrack;
  }

  return {
    ...declared,
    initialVelocity: currentSample.velocity,
    playTimeMs: 0,
    seekStartPlayTimeMs: seekPlayTimeMs,
    initialValueAnimation,
    useOnlyInitialValue: undefined,
  } satisfies PaneTransitionTrack;
}

function frameScalarChanged(
  previousStart: PaneTransitionFrame | undefined,
  previousEnd: PaneTransitionFrame | undefined,
  nextStart: PaneTransitionFrame | undefined,
  nextEnd: PaneTransitionFrame | undefined,
  selector: (pane: PaneTransitionFrame) => number,
) {
  return (
    (previousStart === undefined ? undefined : selector(previousStart)) !==
      (nextStart === undefined ? undefined : selector(nextStart)) ||
    (previousEnd === undefined ? undefined : selector(previousEnd)) !==
      (nextEnd === undefined ? undefined : selector(nextEnd))
  );
}

function frameInlineSizeValues(
  start: PaneTransitionFrame | undefined,
  end: PaneTransitionFrame | undefined,
  fallbackReferenceWidth: number,
) {
  const motion = end?.motion ?? start?.motion;
  const referenceWidth = Math.max(
    1,
    motion === PaneMotion.EnterWithExpand
      ? end?.placement.width ?? fallbackReferenceWidth
      : motion === PaneMotion.ExitWithShrink
        ? start?.placement.width ?? fallbackReferenceWidth
        : end?.placement.width ?? start?.placement.width ?? fallbackReferenceWidth,
  );
  return {
    referenceWidth,
    initialValue: (start?.inlineClipFraction ?? 1) * referenceWidth,
    targetValue: (end?.inlineClipFraction ?? 1) * referenceWidth,
  };
}

export function updateThreePaneScaffoldVisibilityInterruptionLayout({
  interruption,
  renderedFrame,
  destinationLayout,
  elapsedMs,
  progressFraction,
}: {
  interruption: ThreePaneScaffoldVisibilityInterruption;
  renderedFrame: ThreePaneScaffoldTransitionFrame;
  destinationLayout: ThreePaneScaffoldTransitionLayoutOptions;
  elapsedMs: number;
  progressFraction: number;
}): ThreePaneScaffoldVisibilityInterruption {
  const destination = declaredTracks(destinationLayout, 0);
  const previousStart = interruption.destinationStartFrame;
  if (
    transitionFramesEqual(previousStart, destination.start) &&
    transitionFramesEqual(interruption.targetFrame, destination.end)
  ) {
    return interruption;
  }

  const safeElapsedMs = Math.max(0, elapsedMs);
  const currentDurationMs = calculateThreePaneScaffoldVisibilityInterruptionDurationMs(
    interruption,
    safeElapsedMs,
  );
  const seekPlayTimeMs = calculateSeekPlayTimeMs(currentDurationMs, progressFraction);
  const originFrame: ThreePaneScaffoldTransitionFrame = {
    ...interruption.originFrame,
  };
  const panes: Partial<Record<ThreePaneScaffoldRole, PaneTracks>> = {};

  for (const role of roles) {
    const currentTracks = interruption.panes[role];
    const previousStartPane = previousStart?.[role];
    const previousEndPane = interruption.targetFrame[role];
    const nextStartPane = destination.start[role];
    const nextEndPane = destination.end[role];
    const renderedPane = renderedFrame[role];
    const originPane = interruption.originFrame[role];

    if (originPane !== undefined) {
      const nextPlacement =
        nextEndPane?.motion === PaneMotion.AnimateBounds && renderedPane !== undefined
          ? updateAnimateBoundsRemeasureOriginPlacement({
              origin: originPane.placement,
              rendered: renderedPane.placement,
              previousTarget: previousEndPane?.placement,
              nextTarget: nextEndPane.placement,
            })
          : nextStartPane?.placement ?? nextEndPane?.placement ?? originPane.placement;
      originFrame[role] = {
        ...originPane,
        placement: nextPlacement,
      };
    } else if (nextStartPane !== undefined) {
      originFrame[role] = nextStartPane;
    }

    if (currentTracks === undefined) continue;
    const declaredPane = destination.tracks.panes[role];
    const refreshed: PaneTracks = {
      retainOriginPane: currentTracks.retainOriginPane,
    };

    const translateChanged = frameScalarChanged(
      previousStartPane,
      previousEndPane,
      nextStartPane,
      nextEndPane,
      (pane) => pane.translateX,
    );
    const translateDeclared =
      declaredPane?.translateX ??
      (currentTracks.translateX === undefined
        ? undefined
        : syntheticSeekingTrack(
            currentTracks.translateX,
            nextStartPane?.translateX ?? currentTracks.translateX.initialValue,
            nextEndPane?.translateX ?? currentTracks.translateX.targetValue,
          ));
    refreshed.translateX = updateSeekingTrack(
      currentTracks.translateX,
      translateDeclared,
      translateChanged,
      seekPlayTimeMs,
      safeElapsedMs,
    );

    const opacityChanged = frameScalarChanged(
      previousStartPane,
      previousEndPane,
      nextStartPane,
      nextEndPane,
      (pane) => pane.opacity,
    );
    const opacityDeclared =
      declaredPane?.opacity ??
      (currentTracks.opacity === undefined
        ? undefined
        : syntheticSeekingTrack(
            currentTracks.opacity,
            nextStartPane?.opacity ?? currentTracks.opacity.initialValue,
            nextEndPane?.opacity ?? currentTracks.opacity.targetValue,
          ));
    refreshed.opacity = updateSeekingTrack(
      currentTracks.opacity,
      opacityDeclared,
      opacityChanged,
      seekPlayTimeMs,
      safeElapsedMs,
    );

    if (currentTracks.inlineSize !== undefined) {
      const previousSize = frameInlineSizeValues(
        previousStartPane,
        previousEndPane,
        currentTracks.inlineSizeReferenceWidth ?? 1,
      );
      const nextSize = frameInlineSizeValues(
        nextStartPane,
        nextEndPane,
        declaredPane?.inlineSizeReferenceWidth ??
          currentTracks.inlineSizeReferenceWidth ??
          1,
      );
      const inlineSizeChanged =
        previousSize.initialValue !== nextSize.initialValue ||
        previousSize.targetValue !== nextSize.targetValue ||
        previousSize.referenceWidth !== nextSize.referenceWidth;
      const inlineSizeDeclared =
        declaredPane?.inlineSize ??
        syntheticSeekingTrack(
          currentTracks.inlineSize,
          nextSize.initialValue,
          nextSize.targetValue,
        );
      refreshed.inlineSize = updateSeekingTrack(
        currentTracks.inlineSize,
        inlineSizeDeclared,
        inlineSizeChanged,
        seekPlayTimeMs,
        safeElapsedMs,
      );
      refreshed.inlineSizeReferenceWidth = nextSize.referenceWidth;
    } else {
      refreshed.inlineSizeReferenceWidth =
        declaredPane?.inlineSizeReferenceWidth ?? currentTracks.inlineSizeReferenceWidth;
    }

    if (hasPaneTracks(refreshed)) panes[role] = refreshed;
  }

  const scrimChanged =
    previousStart?.scrimOpacity !== destination.start.scrimOpacity ||
    interruption.targetFrame.scrimOpacity !== destination.end.scrimOpacity;
  const scrimDeclared =
    destination.tracks.scrimOpacity ??
    (interruption.scrimOpacity === undefined
      ? undefined
      : syntheticSeekingTrack(
          interruption.scrimOpacity,
          destination.start.scrimOpacity,
          destination.end.scrimOpacity,
        ));
  const scrimOpacity = updateSeekingTrack(
    interruption.scrimOpacity,
    scrimDeclared,
    scrimChanged,
    seekPlayTimeMs,
    safeElapsedMs,
  );
  const durationMs = transitionTracksDurationMs(panes, scrimOpacity, safeElapsedMs);

  return {
    originFrame,
    destinationStartFrame: destination.start,
    targetFrame: destination.end,
    durationMs,
    panes,
    scrimOpacity,
  };
}

export function createThreePaneScaffoldVisibilityInterruption({
  renderedFrame,
  previousSnapshot,
  destinationLayout,
  previousInterruption,
}: {
  renderedFrame: ThreePaneScaffoldTransitionFrame;
  previousSnapshot: ThreePaneScaffoldTransitionSnapshot;
  destinationLayout: ThreePaneScaffoldTransitionLayoutOptions;
  previousInterruption?: PreviousVisibilityInterruption;
}): ThreePaneScaffoldVisibilityInterruption {
  const source = sourceTracks(previousSnapshot, previousInterruption);
  const destination = declaredTracks(destinationLayout, 0);
  const originFrame = captureThreePaneScaffoldTransitionOrigin(
    renderedFrame,
    destination.start,
  );
  const panes: Partial<Record<ThreePaneScaffoldRole, PaneTracks>> = {};

  for (const role of roles) {
    const from = originFrame[role];
    if (from === undefined) continue;
    const to = destination.end[role];
    const sourcePane = source.tracks.panes[role];
    const targetPane = destination.tracks.panes[role];
    if (to === undefined && !hasPaneTracks(sourcePane)) continue;
    const tracks: PaneTracks = {
      retainOriginPane: to === undefined && hasPaneTracks(sourcePane),
    };

    const targetTranslateX =
      to?.translateX ??
      targetPane?.translateX?.targetValue ??
      sourcePane?.translateX?.targetValue ??
      from.translateX;
    tracks.translateX = retargetPaneTransitionTrack({
      fromValue: from.translateX,
      toValue: targetTranslateX,
      fromTrack: sourcePane?.translateX,
      toTrack: targetPane?.translateX,
      sourceTransitionDurationMs: source.durationMs,
      fallbackVisibilityThreshold: 1,
      fallbackQuantizationStep: 1,
    });

    const targetOpacity =
      to?.opacity ??
      targetPane?.opacity?.targetValue ??
      sourcePane?.opacity?.targetValue ??
      from.opacity;
    tracks.opacity = retargetPaneTransitionTrack({
      fromValue: from.opacity,
      toValue: targetOpacity,
      fromTrack: sourcePane?.opacity,
      toTrack: targetPane?.opacity,
      sourceTransitionDurationMs: source.durationMs,
      fallbackVisibilityThreshold: FloatVisibilityThreshold,
    });

    const sourceSize = paneSizeValue(from);
    const targetReferenceWidth = Math.max(
      1,
      targetPane?.inlineSizeReferenceWidth ??
        to?.placement.width ??
        sourcePane?.inlineSizeReferenceWidth ??
        from.placement.width,
    );
    const targetSize =
      targetPane?.inlineSize?.targetValue ??
      (to === undefined
        ? sourcePane?.inlineSize?.targetValue ?? sourceSize.value
        : to.inlineClipFraction * targetReferenceWidth);
    tracks.inlineSizeReferenceWidth = targetReferenceWidth;
    tracks.inlineSize = retargetPaneTransitionTrack({
      fromValue: sourceSize.value,
      toValue: targetSize,
      fromTrack: sourcePane?.inlineSize,
      toTrack: targetPane?.inlineSize,
      sourceTransitionDurationMs: source.durationMs,
      fallbackVisibilityThreshold: 1,
      fallbackQuantizationStep: 1,
    });

    if (hasPaneTracks(tracks)) panes[role] = tracks;
  }

  const scrimOpacity = retargetPaneTransitionTrack({
    fromValue: originFrame.scrimOpacity,
    toValue: destination.end.scrimOpacity,
    fromTrack: source.tracks.scrimOpacity,
    toTrack: destination.tracks.scrimOpacity,
    sourceTransitionDurationMs: source.durationMs,
    fallbackVisibilityThreshold: FloatVisibilityThreshold,
  });
  const durationMs = transitionTracksDurationMs(panes, scrimOpacity, 0);

  return {
    originFrame,
    destinationStartFrame: destination.start,
    targetFrame: destination.end,
    durationMs,
    panes,
    scrimOpacity,
  };
}

export function sampleThreePaneScaffoldVisibilityInterruption(
  interruption: ThreePaneScaffoldVisibilityInterruption,
  elapsedMs: number,
  progressFraction?: number,
): ThreePaneScaffoldTransitionFrame {
  const safeElapsedMs = Math.max(0, elapsedMs);
  const durationMs = calculateThreePaneScaffoldVisibilityInterruptionDurationMs(
    interruption,
    safeElapsedMs,
  );
  const progress =
    progressFraction === undefined
      ? durationMs <= 0
        ? 1
        : clampUnit(safeElapsedMs / durationMs)
      : clampUnit(progressFraction);
  const seekPlayTimeMs =
    progressFraction === undefined
      ? Math.min(safeElapsedMs, durationMs)
      : calculateSeekPlayTimeMs(durationMs, progress);
  const result = interpolateThreePaneScaffoldTransitionFrames(
    interruption.originFrame,
    interruption.targetFrame,
    progress,
  );

  for (const role of roles) {
    const tracks = interruption.panes[role];
    if (tracks === undefined) continue;
    let pane = result[role];
    if (tracks.retainOriginPane) {
      const originPane = interruption.originFrame[role];
      if (originPane !== undefined) {
        pane = { ...originPane };
        result[role] = pane;
      }
    }
    if (pane === undefined) continue;

    if (tracks.translateX !== undefined) {
      pane.translateX = samplePaneTransitionTrack(
        tracks.translateX,
        seekPlayTimeMs,
        safeElapsedMs,
      ).value;
    }
    if (tracks.opacity !== undefined) {
      pane.opacity = clampUnit(
        samplePaneTransitionTrack(
          tracks.opacity,
          seekPlayTimeMs,
          safeElapsedMs,
        ).value,
      );
    }
    if (tracks.inlineSize !== undefined) {
      const renderedWidth = Math.max(1, pane.placement.width);
      pane.inlineClipFraction = clampUnit(
        samplePaneTransitionTrack(
          tracks.inlineSize,
          seekPlayTimeMs,
          safeElapsedMs,
        ).value / renderedWidth,
      );
    }
  }

  if (interruption.scrimOpacity !== undefined) {
    result.scrimOpacity = clampUnit(
      samplePaneTransitionTrack(
        interruption.scrimOpacity,
        seekPlayTimeMs,
        safeElapsedMs,
      ).value,
    );
  }

  return result;
}
