export type CheckboxColorRole =
  | 'onPrimary'
  | 'onSurface'
  | 'onSurfaceVariant'
  | 'primary'
  | 'surface';

/**
 * Material 3 Checkbox values from current AndroidX CheckboxTokens plus the
 * corrected M3 styling path behind ComposeMaterial3Flags.isCheckboxStylingFixEnabled.
 *
 * We intentionally model the corrected Material 3 path rather than the temporary
 * legacy M2 fallback that AndroidX still keeps behind a migration flag.
 */
export const checkboxTokens = {
  containerSize: 18,
  containerRadius: 2,
  stateLayerSize: 40,
  minimumInteractiveSize: 48,
  strokeWidth: 2,

  selectedContainerColor: 'primary',
  selectedIconColor: 'onPrimary',
  unselectedOutlineColor: 'onSurfaceVariant',

  selectedDisabledContainerColor: 'onSurface',
  selectedDisabledContainerOpacity: 0.38,
  selectedDisabledIconColor: 'surface',
  unselectedDisabledOutlineColor: 'onSurface',
  unselectedDisabledOutlineOpacity: 0.38,

  checkPath: {
    leftX: 0.25,
    leftY: 0.5,
    crossX: 0.4,
    crossY: 0.65,
    rightX: 0.75,
    rightY: 0.3,
  },

  motion: {
    // Current AndroidX standard MotionScheme springs sampled to their 1% settle point.
    defaultEffects: {
      durationMs: 166,
      easing:
        'linear(0, 0.1434 10%, 0.3831 20%, 0.5918 30%, 0.7432 40%, 0.8438 50%, 0.9072 60%, 0.9459 70%, 0.9689 80%, 0.9823 90%, 1)',
    },
    fastEffects: {
      durationMs: 108,
      easing:
        'linear(0, 0.1434 10%, 0.383 20%, 0.5917 30%, 0.7432 40%, 0.8438 50%, 0.9072 60%, 0.9459 70%, 0.9688 80%, 0.9823 90%, 1)',
    },
    defaultSpatial: {
      durationMs: 194,
      easing:
        'linear(0, 0.0968 10%, 0.2871 20%, 0.4824 30%, 0.647 40%, 0.7717 50%, 0.8596 60%, 0.9181 70%, 0.9551 80%, 0.9774 90%, 1)',
    },
    snapDelayMs: 100,
  },
} as const;

export type CheckboxTokens = typeof checkboxTokens;
