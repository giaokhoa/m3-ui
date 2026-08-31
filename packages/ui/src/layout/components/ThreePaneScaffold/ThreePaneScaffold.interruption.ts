import {
  AnimationCoreInterruptionSpringSpec,
  MaterialPaneSpringSpec,
  calculateAnimationSpringDurationMs,
  sampleAnimationSpringMotion,
  type AnimationSpringMotion,
  type AnimationSpringSpec,
} from '../../adaptive/animationSpring';
import { PaneMotionDefaults } from '../../adaptive/paneMotion';
import { PaneMotionDefaultDisplacementThreshold } from '../../adaptive/paneMotionSpring';

export type PaneTransitionTrackSpec =
  | 'material'
  | 'delayed-material'
  | 'interruption';

export interface PaneTransitionTrack {
  readonly initialValue: number;
  readonly targetValue: number;
  readonly initialVelocity: number;
  readonly playTimeMs: number;
  readonly seekStartPlayTimeMs?: number;
  readonly retainedCompletionPlayTimeMs?: number;
  /** Full Transition duration owned by the SeekingAnimationState retaining this child. */
  readonly retainedTimelineDurationMs?: number;
  /** Float fraction at which the child became an initial-value animation. */
  readonly retainedTimelineStartFraction?: number;
  readonly visibilityThreshold: number;
  readonly quantizationStep?: number;
  readonly spec: PaneTransitionTrackSpec;
  readonly initialValueAnimation?: PaneTransitionTrack;
  readonly useOnlyInitialValue?: boolean;
}

export interface PaneTransitionTrackSample extends AnimationSpringMotion {
  readonly durationMs: number;
}

const ComposeIntMax = 2147483647;
const ComposeIntMin = -2147483648;
const MillisToNanos = 1_000_000;

function composeFloat(value: number) {
  return Math.fround(value);
}

function composeFloatLerp(start: number, stop: number, fraction: number) {
  const floatStart = composeFloat(start);
  const floatStop = composeFloat(stop);
  const floatFraction = composeFloat(fraction);
  const inverseFraction = composeFloat(composeFloat(1) - floatFraction);
  return composeFloat(
    composeFloat(inverseFraction * floatStart) +
      composeFloat(floatFraction * floatStop),
  );
}

function composeFastRoundToInt(value: number) {
  const floatValue = Math.fround(value);
  if (Number.isNaN(floatValue)) return 0;
  if (floatValue >= ComposeIntMax) return ComposeIntMax;
  if (floatValue <= ComposeIntMin) return ComposeIntMin;
  return Math.round(floatValue);
}

function quantize(value: number, step: number | undefined) {
  if (step === undefined) return Math.fround(value);
  if (step === 1) return composeFastRoundToInt(value);
  return Math.round(Math.fround(value) / step) * step;
}

function springSpec(track: PaneTransitionTrack): AnimationSpringSpec {
  return track.spec === 'interruption'
    ? AnimationCoreInterruptionSpringSpec
    : MaterialPaneSpringSpec;
}

function isDirectMaterialVisibilitySpring(track: PaneTransitionTrack | undefined) {
  return (
    track?.spec === 'material' &&
    track.quantizationStep === undefined &&
    track.visibilityThreshold === PaneMotionDefaultDisplacementThreshold
  );
}

function baseDurationMs(
  track: PaneTransitionTrack,
  initialValue: number,
  initialVelocity: number,
) {
  return calculateAnimationSpringDurationMs(
    springSpec(track),
    initialValue,
    track.targetValue,
    track.visibilityThreshold,
    initialVelocity,
  );
}

function calculateDelayedTimeMs(originalDurationMs: number) {
  const originalDurationNanos = Math.fround(originalDurationMs * MillisToNanos);
  const delayedTimeNanos = Math.trunc(
    Math.fround(originalDurationNanos * Math.fround(PaneMotionDefaults.delayedRatio)),
  );
  return delayedTimeNanos / MillisToNanos;
}

function retainedTimelinePlayTimeNanos(
  durationMs: number,
  startFraction: number,
  elapsedMs: number,
) {
  const durationNanos = Math.max(0, Math.round(durationMs * MillisToNanos));
  const fraction = composeFloat(startFraction);
  const animationSpecDurationNanos = Math.round(
    durationNanos * (1.0 - fraction),
  );
  const progressNanos = Math.max(0, Math.round(elapsedMs * MillisToNanos));
  if (progressNanos >= animationSpecDurationNanos) return durationNanos;
  if (animationSpecDurationNanos <= 0) return durationNanos;

  const timelineFraction = composeFloat(
    composeFloat(progressNanos) / composeFloat(animationSpecDurationNanos),
  );
  const value = composeFloatLerp(fraction, 1, timelineFraction);
  return Math.round(durationNanos * Number(value));
}

function retainedTimelineAdvanceMs(track: PaneTransitionTrack, elapsedMs: number) {
  const durationMs = track.retainedTimelineDurationMs;
  const startFraction = track.retainedTimelineStartFraction;
  const safeElapsedMs = Math.max(0, elapsedMs);
  if (durationMs === undefined || startFraction === undefined) return safeElapsedMs;

  const durationNanos = Math.max(0, Math.round(durationMs * MillisToNanos));
  const initialPlayTimeNanos = Math.round(
    durationNanos * Number(composeFloat(startFraction)),
  );
  const currentPlayTimeNanos = retainedTimelinePlayTimeNanos(
    durationMs,
    startFraction,
    safeElapsedMs,
  );
  return Math.max(0, currentPlayTimeNanos - initialPlayTimeNanos) / MillisToNanos;
}

function sampleOwnAnimation(
  track: PaneTransitionTrack,
  playTimeMs: number,
  initialValue: number,
  initialVelocity: number,
): PaneTransitionTrackSample {
  const springDurationMs = baseDurationMs(track, initialValue, initialVelocity);
  const delayMs =
    track.spec === 'delayed-material'
      ? calculateDelayedTimeMs(springDurationMs)
      : 0;
  const durationMs = springDurationMs + delayMs;

  if (durationMs === 0 || playTimeMs >= durationMs) {
    return {
      value: quantize(track.targetValue, track.quantizationStep),
      velocity: 0,
      durationMs,
    };
  }
  if (playTimeMs <= delayMs) {
    return {
      value: quantize(initialValue, track.quantizationStep),
      velocity: 0,
      durationMs,
    };
  }

  const motion = sampleAnimationSpringMotion(
    springSpec(track),
    initialValue,
    track.targetValue,
    playTimeMs - delayMs,
    initialVelocity,
  );
  return {
    value: quantize(motion.value, track.quantizationStep),
    velocity: motion.velocity,
    durationMs,
  };
}

function sampleInitialValueAnimation(
  track: PaneTransitionTrack,
  elapsedMs: number,
): PaneTransitionTrackSample {
  const movingInitial =
    track.initialValueAnimation === undefined
      ? undefined
      : sampleInitialValueAnimation(track.initialValueAnimation, elapsedMs);
  if (track.useOnlyInitialValue && movingInitial !== undefined) {
    return movingInitial;
  }
  return sampleOwnAnimation(
    track,
    track.playTimeMs + retainedTimelineAdvanceMs(track, elapsedMs),
    movingInitial?.value ?? track.initialValue,
    track.initialVelocity,
  );
}

function retainedInitialValueAnimationIsComplete(
  track: PaneTransitionTrack,
  elapsedMs: number,
) {
  const durationMs = track.retainedTimelineDurationMs;
  const startFraction = track.retainedTimelineStartFraction;
  if (durationMs !== undefined && startFraction !== undefined) {
    const durationNanos = Math.max(0, Math.round(durationMs * MillisToNanos));
    return (
      retainedTimelinePlayTimeNanos(durationMs, startFraction, Math.max(0, elapsedMs)) >=
      durationNanos
    );
  }

  const completionPlayTimeMs = track.retainedCompletionPlayTimeMs;
  return (
    completionPlayTimeMs !== undefined &&
    track.playTimeMs + Math.max(0, elapsedMs) >= completionPlayTimeMs
  );
}

export function hasLivePaneTransitionInitialValueAnimation(
  track: PaneTransitionTrack,
  elapsedMs = 0,
) {
  return (
    track.initialValueAnimation !== undefined &&
    !retainedInitialValueAnimationIsComplete(track.initialValueAnimation, elapsedMs)
  );
}

export function calculatePaneTransitionTrackDurationMs(
  track: PaneTransitionTrack,
  initialElapsedMs = 0,
) {
  if (track.useOnlyInitialValue) return 0;
  const movingInitial =
    track.initialValueAnimation === undefined
      ? undefined
      : sampleInitialValueAnimation(track.initialValueAnimation, initialElapsedMs);
  const ownDurationMs = sampleOwnAnimation(
    track,
    0,
    movingInitial?.value ?? track.initialValue,
    track.initialVelocity,
  ).durationMs;
  return Math.max(0, track.seekStartPlayTimeMs ?? 0) + ownDurationMs;
}

export function samplePaneTransitionTrack(
  track: PaneTransitionTrack,
  playTimeMs = track.playTimeMs,
  initialElapsedMs = 0,
): PaneTransitionTrackSample {
  const movingInitial =
    track.initialValueAnimation === undefined
      ? undefined
      : sampleInitialValueAnimation(track.initialValueAnimation, initialElapsedMs);
  if (track.useOnlyInitialValue && movingInitial !== undefined) {
    return {
      value: movingInitial.value,
      velocity: 0,
      durationMs: 0,
    };
  }
  const localPlayTimeMs = Math.max(
    0,
    playTimeMs - Math.max(0, track.seekStartPlayTimeMs ?? 0),
  );
  return sampleOwnAnimation(
    track,
    localPlayTimeMs,
    movingInitial?.value ?? track.initialValue,
    track.initialVelocity,
  );
}

function activeTrackIsComplete(track: PaneTransitionTrack) {
  if (track.useOnlyInitialValue || track.initialValueAnimation !== undefined) return false;
  const localPlayTimeMs = Math.max(
    0,
    track.playTimeMs - Math.max(0, track.seekStartPlayTimeMs ?? 0),
  );
  return localPlayTimeMs >= samplePaneTransitionTrack(track).durationMs;
}

export function capturePaneTransitionTrack(
  track: PaneTransitionTrack,
  playTimeMs: number,
  initialElapsedMs: number,
): PaneTransitionTrack {
  const safeElapsedMs = Math.max(0, initialElapsedMs);
  const retained = track.initialValueAnimation;
  const movingInitial =
    retained === undefined
      ? undefined
      : sampleInitialValueAnimation(retained, safeElapsedMs);
  const localPlayTimeMs = Math.max(
    0,
    playTimeMs - Math.max(0, track.seekStartPlayTimeMs ?? 0),
  );

  if (track.useOnlyInitialValue && retained !== undefined) {
    if (retainedInitialValueAnimationIsComplete(retained, safeElapsedMs)) {
      return {
        ...track,
        initialValue: movingInitial!.value,
        targetValue: movingInitial!.value,
        initialVelocity: 0,
        playTimeMs: 0,
        seekStartPlayTimeMs: undefined,
        retainedCompletionPlayTimeMs: undefined,
        retainedTimelineDurationMs: undefined,
        retainedTimelineStartFraction: undefined,
        initialValueAnimation: undefined,
        useOnlyInitialValue: undefined,
      };
    }
    const capturedRetained = capturePaneTransitionTrack(
      retained,
      retained.playTimeMs + retainedTimelineAdvanceMs(retained, safeElapsedMs),
      safeElapsedMs,
    );
    return {
      ...track,
      initialValue: movingInitial!.value,
      initialVelocity: 0,
      playTimeMs: 0,
      seekStartPlayTimeMs: undefined,
      retainedCompletionPlayTimeMs: undefined,
      retainedTimelineDurationMs: undefined,
      retainedTimelineStartFraction: undefined,
      initialValueAnimation: {
        ...capturedRetained,
        retainedTimelineDurationMs: undefined,
        retainedTimelineStartFraction: undefined,
      },
      useOnlyInitialValue: true,
    };
  }

  return {
    ...track,
    initialValue: movingInitial?.value ?? track.initialValue,
    playTimeMs: localPlayTimeMs,
    seekStartPlayTimeMs: undefined,
    retainedCompletionPlayTimeMs: track.retainedCompletionPlayTimeMs,
    retainedTimelineDurationMs: undefined,
    retainedTimelineStartFraction: undefined,
    initialValueAnimation: undefined,
  };
}

export interface RetargetPaneTransitionTrackOptions {
  readonly fromValue: number;
  readonly toValue: number;
  readonly fromTrack?: PaneTransitionTrack;
  readonly toTrack?: PaneTransitionTrack;
  readonly sourceTransitionDurationMs?: number;
  readonly sourceTransitionProgressFraction?: number;
  readonly fallbackVisibilityThreshold: number;
  readonly fallbackQuantizationStep?: number;
}

function retainSourceTrack(
  track: PaneTransitionTrack,
  sourceTransitionDurationMs: number | undefined,
  sourceTransitionProgressFraction: number | undefined,
) {
  return sourceTransitionDurationMs === undefined
    ? track
    : {
        ...track,
        retainedCompletionPlayTimeMs: Math.max(0, sourceTransitionDurationMs),
        retainedTimelineDurationMs:
          sourceTransitionProgressFraction === undefined
            ? undefined
            : Math.max(0, sourceTransitionDurationMs),
        retainedTimelineStartFraction:
          sourceTransitionProgressFraction === undefined
            ? undefined
            : composeFloat(sourceTransitionProgressFraction),
      };
}

export function retargetPaneTransitionTrack({
  fromValue,
  toValue,
  fromTrack,
  toTrack,
  sourceTransitionDurationMs,
  sourceTransitionProgressFraction,
  fallbackVisibilityThreshold,
  fallbackQuantizationStep,
}: RetargetPaneTransitionTrackOptions): PaneTransitionTrack | undefined {
  if (fromTrack === undefined && toTrack === undefined) return undefined;

  if (
    toTrack !== undefined &&
    (fromTrack === undefined || activeTrackIsComplete(fromTrack))
  ) {
    return {
      ...toTrack,
      initialValue: fromValue,
      targetValue: toValue,
      initialVelocity: 0,
      playTimeMs: 0,
      seekStartPlayTimeMs: undefined,
      retainedCompletionPlayTimeMs: undefined,
      retainedTimelineDurationMs: undefined,
      retainedTimelineStartFraction: undefined,
      initialValueAnimation: undefined,
      useOnlyInitialValue: undefined,
    };
  }

  const sourceTrack = fromTrack!;
  const declaredTrack = toTrack ?? sourceTrack;
  const visibilityThreshold =
    declaredTrack.visibilityThreshold ?? fallbackVisibilityThreshold;
  const quantizationStep =
    declaredTrack.quantizationStep ?? fallbackQuantizationStep;
  const retainedOnly =
    sourceTrack.useOnlyInitialValue && sourceTrack.initialValueAnimation !== undefined
      ? sourceTrack.initialValueAnimation
      : undefined;

  if (retainedOnly !== undefined) {
    if (retainedOnly.targetValue === toValue) {
      return {
        initialValue: fromValue,
        targetValue: toValue,
        initialVelocity: 0,
        playTimeMs: 0,
        seekStartPlayTimeMs: undefined,
        visibilityThreshold,
        quantizationStep,
        spec: sourceTrack.spec,
        initialValueAnimation: retainedOnly,
        useOnlyInitialValue: true,
      };
    }

    const spec: PaneTransitionTrackSpec = isDirectMaterialVisibilitySpring(declaredTrack)
      ? 'material'
      : 'interruption';
    return {
      initialValue: fromValue,
      targetValue: toValue,
      initialVelocity: 0,
      playTimeMs: 0,
      seekStartPlayTimeMs: undefined,
      visibilityThreshold,
      quantizationStep,
      spec,
      initialValueAnimation: retainedOnly,
    };
  }

  const incomingVelocity = samplePaneTransitionTrack(sourceTrack).velocity;
  const retainedSource = retainSourceTrack(
    sourceTrack,
    sourceTransitionDurationMs,
    sourceTransitionProgressFraction,
  );

  if (sourceTrack.targetValue === toValue) {
    return {
      initialValue: fromValue,
      targetValue: toValue,
      initialVelocity: 0,
      playTimeMs: 0,
      seekStartPlayTimeMs: undefined,
      visibilityThreshold,
      quantizationStep,
      spec: sourceTrack.spec,
      initialValueAnimation: retainedSource,
      useOnlyInitialValue: true,
    };
  }

  const spec: PaneTransitionTrackSpec = isDirectMaterialVisibilitySpring(declaredTrack)
    ? 'material'
    : 'interruption';

  return {
    initialValue: fromValue,
    targetValue: toValue,
    initialVelocity: incomingVelocity,
    playTimeMs: 0,
    seekStartPlayTimeMs: undefined,
    visibilityThreshold,
    quantizationStep,
    spec,
    initialValueAnimation: retainedSource,
  };
}
