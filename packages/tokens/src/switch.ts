export type SwitchColorRole =
  | 'onPrimary'
  | 'onPrimaryContainer'
  | 'onSurface'
  | 'outline'
  | 'primary'
  | 'surface'
  | 'surfaceContainerHighest';

/**
 * Material 3 Switch values resolved from AndroidX revision
 * 160825094a81825468a95b115bfb1b541e549856 using Switch.kt,
 * SwitchTokens.kt and the standard MotionScheme.
 *
 * SwitchColors resolves visual colors from enabled × selected only. Generated
 * hover/focus/pressed handle/track/icon colors are intentionally not promoted
 * into runtime behavior because the pinned Switch implementation does not use
 * them for SwitchColors.
 */
export const switchTokens = {
  trackWidth: 52,
  trackHeight: 32,
  trackOutlineWidth: 2,
  minimumInteractiveSize: 48,
  stateLayerSize: 40,

  uncheckedThumbSize: 16,
  checkedThumbSize: 24,
  iconThumbSize: 24,
  pressedThumbSize: 28,
  iconSize: 16,

  colors: {
    checkedThumb: 'onPrimary',
    checkedTrack: 'primary',
    checkedBorder: 'transparent',
    checkedIcon: 'onPrimaryContainer',
    uncheckedThumb: 'outline',
    uncheckedTrack: 'surfaceContainerHighest',
    uncheckedBorder: 'outline',
    uncheckedIcon: 'surfaceContainerHighest',
    disabledCheckedThumb: 'surface',
    disabledCheckedTrack: 'onSurface',
    disabledCheckedBorder: 'transparent',
    disabledCheckedIcon: 'onSurface',
    disabledUncheckedThumb: 'onSurface',
    disabledUncheckedTrack: 'surfaceContainerHighest',
    disabledUncheckedBorder: 'onSurface',
    disabledUncheckedIcon: 'surfaceContainerHighest',
  } as const,

  disabledOpacity: {
    checkedThumb: 1,
    track: 0.12,
    checkedIcon: 0.38,
    uncheckedThumb: 0.38,
    uncheckedIcon: 0.38,
  },

  motion: {
    geometry: {
      // Switch.kt uses MotionSchemeKeyTokens.FastSpatial for non-pressed thumb
      // size/offset changes. Pressed targets use SnapSpec.
      durationMs: 137,
      easing:
        'linear(0, 0.0969 10%, 0.2872 20%, 0.4827 30%, 0.6472 40%, 0.7719 50%, 0.8598 60%, 0.9183 70%, 0.9552 80%, 0.9774 90%, 1)',
    },
  },
} as const;

export type SwitchTokens = typeof switchTokens;
