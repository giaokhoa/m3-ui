export type RadioButtonColorRole =
  | 'onSurface'
  | 'onSurfaceVariant'
  | 'primary';

/**
 * Material 3 RadioButton values resolved from AndroidX revision
 * 160825094a81825468a95b115bfb1b541e549856 using RadioButton.kt,
 * RadioButtonTokens.kt and the standard MotionScheme.
 *
 * Runtime RadioButtonDefaults resolves the control color only from
 * enabled × selected. The generated hover/focus/pressed icon colors are not
 * promoted into extra control-color behavior here because the Compose runtime
 * does not use them for RadioButtonColors.
 */
export const radioButtonTokens = {
  iconSize: 20,
  stateLayerSize: 40,
  minimumInteractiveSize: 48,
  padding: 2,
  strokeWidth: 2,
  dotSize: 12,

  colors: {
    selected: 'primary',
    unselected: 'onSurfaceVariant',
    disabledSelected: 'onSurface',
    disabledUnselected: 'onSurface',
    selectedStateLayer: 'primary',
    unselectedStateLayer: 'onSurface',
  } satisfies Record<string, RadioButtonColorRole>,

  disabledOpacity: 0.38,

  motion: {
    // RadioButton.kt uses DefaultEffects for control color and FastSpatial for
    // the selected-dot radius at the pinned revision. The standard springs are
    // sampled to their 1% settle point for CSS transitions, matching the other
    // Material component ports in this repository.
    color: {
      durationMs: 166,
      easing:
        'linear(0, 0.1434 10%, 0.3831 20%, 0.5918 30%, 0.7432 40%, 0.8438 50%, 0.9072 60%, 0.9459 70%, 0.9689 80%, 0.9823 90%, 1)',
    },
    dot: {
      durationMs: 137,
      easing:
        'linear(0, 0.0969 10%, 0.2872 20%, 0.4827 30%, 0.6472 40%, 0.7719 50%, 0.8598 60%, 0.9183 70%, 0.9552 80%, 0.9774 90%, 1)',
    },
  },
} as const;

export type RadioButtonTokens = typeof radioButtonTokens;
