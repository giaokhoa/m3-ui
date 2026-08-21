export type RadioButtonColorRole =
  | 'onSurface'
  | 'onSurfaceVariant'
  | 'primary';

/**
 * Material 3 RadioButton values resolved from AndroidX revision
 * 160825094a81825468a95b115bfb1b541e549856 using RadioButton.kt and
 * RadioButtonTokens.kt.
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
    durationMs: 100,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

export type RadioButtonTokens = typeof radioButtonTokens;
