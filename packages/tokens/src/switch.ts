import { switchTokensGenerated as generated } from './generated/androidx/switch.js';

export type SwitchColorRole =
  | 'onPrimary'
  | 'onPrimaryContainer'
  | 'onSurface'
  | 'outline'
  | 'primary'
  | 'surface'
  | 'surfaceContainerHighest';

/**
 * Runtime-facing Switch defaults projected from the generated AndroidX token
 * source. Values that come from Switch.kt itself (minimum target and motion
 * translation) remain explicit handwritten web/runtime adaptations.
 *
 * SwitchColors resolves visual colors from enabled × selected only. Generated
 * hover/focus/pressed handle/track/icon colors are intentionally not promoted
 * into runtime behavior because the pinned Switch implementation does not use
 * them for SwitchColors.
 */
export const switchTokens = {
  trackWidth: generated.trackWidth,
  trackHeight: generated.trackHeight,
  trackOutlineWidth: generated.trackOutlineWidth,
  minimumInteractiveSize: 48,
  stateLayerSize: generated.stateLayerSize,

  uncheckedThumbSize: generated.unselectedHandleWidth,
  checkedThumbSize: generated.selectedHandleWidth,
  iconThumbSize: generated.iconHandleWidth,
  pressedThumbSize: generated.pressedHandleWidth,
  iconSize: generated.selectedIconSize,

  colors: {
    checkedThumb: generated.selectedHandleColor.value,
    checkedTrack: generated.selectedTrackColor.value,
    checkedBorder: 'transparent',
    checkedIcon: generated.selectedIconColor.value,
    uncheckedThumb: generated.unselectedHandleColor.value,
    uncheckedTrack: generated.unselectedTrackColor.value,
    uncheckedBorder: generated.unselectedTrackOutlineColor.value,
    uncheckedIcon: generated.unselectedIconColor.value,
    disabledCheckedThumb: generated.disabledSelectedHandleColor.value,
    disabledCheckedTrack: generated.disabledSelectedTrackColor.value,
    disabledCheckedBorder: 'transparent',
    disabledCheckedIcon: generated.disabledSelectedIconColor.value,
    disabledUncheckedThumb: generated.disabledUnselectedHandleColor.value,
    disabledUncheckedTrack: generated.disabledUnselectedTrackColor.value,
    disabledUncheckedBorder: generated.disabledUnselectedTrackOutlineColor.value,
    disabledUncheckedIcon: generated.disabledUnselectedIconColor.value,
  } as const,

  disabledOpacity: {
    checkedThumb: generated.disabledSelectedHandleOpacity,
    track: generated.disabledTrackOpacity,
    checkedIcon: generated.disabledSelectedIconOpacity,
    uncheckedThumb: generated.disabledUnselectedHandleOpacity,
    uncheckedIcon: generated.disabledUnselectedIconOpacity,
  },

  motion: {
    geometry: {
      // Switch.kt uses MotionSchemeKeyTokens.FastSpatial for non-pressed thumb
      // size/offset changes. Pressed targets use SnapSpec. This sampled CSS
      // curve is therefore a web adaptation rather than generated token data.
      durationMs: 137,
      easing:
        'linear(0, 0.0969 10%, 0.2872 20%, 0.4827 30%, 0.6472 40%, 0.7719 50%, 0.8598 60%, 0.9183 70%, 0.9552 80%, 0.9774 90%, 1)',
    },
  },
} as const;

export type SwitchTokens = typeof switchTokens;
