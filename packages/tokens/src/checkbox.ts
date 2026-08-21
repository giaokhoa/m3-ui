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

  snapAnimationDelayMs: 100,
} as const;

export type CheckboxTokens = typeof checkboxTokens;
