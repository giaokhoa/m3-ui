export type TextFieldColorRole =
  | 'error'
  | 'onSurface'
  | 'onSurfaceVariant'
  | 'outline'
  | 'primary'
  | 'surfaceContainerHighest';

export type FilledTextFieldColorRole = Exclude<TextFieldColorRole, 'outline'>;
export type OutlinedTextFieldColorRole = Exclude<
  TextFieldColorRole,
  'surfaceContainerHighest'
>;

export interface TextFieldTypographyToken {
  readonly fontFamilyRole: 'plain';
  readonly fontSize: number;
  readonly lineHeight: number;
  readonly fontWeight: 400;
  readonly letterSpacing: number;
}

/** @deprecated Use TextFieldTypographyToken. */
export type FilledTextFieldTypographyToken = TextFieldTypographyToken;

const textFieldTypography = {
  bodyLarge: {
    fontFamilyRole: 'plain',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 400,
    letterSpacing: 0.5,
  },
  bodySmall: {
    fontFamilyRole: 'plain',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 400,
    letterSpacing: 0.4,
  },
} as const satisfies Record<string, TextFieldTypographyToken>;

const textFieldMotion = {
  // AndroidX standard MotionScheme springs at the pinned revision, sampled to
  // their 1% settle point for CSS transition timing.
  fastEffects: {
    durationMs: 108,
    easing:
      'linear(0, 0.1434 10%, 0.383 20%, 0.5917 30%, 0.7432 40%, 0.8438 50%, 0.9072 60%, 0.9459 70%, 0.9688 80%, 0.9823 90%, 1)',
  },
  fastSpatial: {
    durationMs: 137,
    easing:
      'linear(0, 0.0969 10%, 0.2872 20%, 0.4827 30%, 0.6472 40%, 0.7719 50%, 0.8598 60%, 0.9183 70%, 0.9552 80%, 0.9774 90%, 1)',
  },
} as const;

/**
 * Material 3 filled TextField values resolved from AndroidX revision
 * 160825094a81825468a95b115bfb1b541e549856 using FilledTextFieldTokens,
 * TextFieldDefaults, TextFieldImpl and TypeScaleTokens.
 */
export const filledTextFieldTokens = {
  minWidth: 280,
  minHeight: 56,

  contentPadding: {
    inline: 16,
    blockWithLabel: 8,
    blockWithoutLabel: 16,
    supportingTop: 4,
    affix: 2,
    afterIcon: 4,
  },

  lineHeight: {
    inputMin: 24,
    focusedLabelMin: 16,
    supportingMin: 16,
  },

  containerShape: {
    topStartRadius: 4,
    topEndRadius: 4,
    bottomEndRadius: 0,
    bottomStartRadius: 0,
  },

  indicator: {
    unfocusedThickness: 1,
    focusedThickness: 2,
  },

  iconSize: 24,
  iconSlotSize: 48,

  colors: {
    container: 'surfaceContainerHighest',
    text: 'onSurface',
    disabledText: 'onSurface',
    cursor: 'primary',
    errorCursor: 'error',

    indicator: 'onSurfaceVariant',
    focusedIndicator: 'primary',
    disabledIndicator: 'onSurface',
    errorIndicator: 'error',

    label: 'onSurfaceVariant',
    focusedLabel: 'primary',
    disabledLabel: 'onSurface',
    errorLabel: 'error',

    placeholder: 'onSurfaceVariant',
    disabledPlaceholder: 'onSurface',

    supporting: 'onSurfaceVariant',
    disabledSupporting: 'onSurface',
    errorSupporting: 'error',

    leadingIcon: 'onSurfaceVariant',
    trailingIcon: 'onSurfaceVariant',
    disabledLeadingIcon: 'onSurface',
    disabledTrailingIcon: 'onSurface',
    errorLeadingIcon: 'onSurfaceVariant',
    errorTrailingIcon: 'error',

    prefix: 'onSurfaceVariant',
    suffix: 'onSurfaceVariant',
  },

  disabledOpacity: 0.38,
  typography: textFieldTypography,
  motion: textFieldMotion,
} as const;

/**
 * Material 3 outlined TextField values resolved from the same AndroidX revision
 * as the filled field. The default container is transparent; the outline owns
 * the visual container state.
 */
export const outlinedTextFieldTokens = {
  minWidth: 280,
  minHeight: 56,

  contentPadding: {
    inline: 16,
    block: 16,
    supportingTop: 4,
    affix: 2,
    afterIcon: 4,
    cutoutInline: 4,
    topPadding: 8,
  },

  lineHeight: {
    inputMin: 24,
    focusedLabelMin: 16,
    supportingMin: 16,
  },

  containerShape: {
    topStartRadius: 4,
    topEndRadius: 4,
    bottomEndRadius: 4,
    bottomStartRadius: 4,
  },

  outline: {
    unfocusedThickness: 1,
    focusedThickness: 2,
    disabledOpacity: 0.12,
  },

  iconSize: 24,
  iconSlotSize: 48,

  colors: {
    text: 'onSurface',
    disabledText: 'onSurface',
    cursor: 'primary',
    errorCursor: 'error',

    outline: 'outline',
    focusedOutline: 'primary',
    disabledOutline: 'onSurface',
    errorOutline: 'error',

    label: 'onSurfaceVariant',
    focusedLabel: 'primary',
    disabledLabel: 'onSurface',
    errorLabel: 'error',

    placeholder: 'onSurfaceVariant',
    disabledPlaceholder: 'onSurface',

    supporting: 'onSurfaceVariant',
    disabledSupporting: 'onSurface',
    errorSupporting: 'error',

    leadingIcon: 'onSurfaceVariant',
    trailingIcon: 'onSurfaceVariant',
    disabledLeadingIcon: 'onSurface',
    disabledTrailingIcon: 'onSurface',
    errorLeadingIcon: 'onSurfaceVariant',
    errorTrailingIcon: 'error',

    prefix: 'onSurfaceVariant',
    suffix: 'onSurfaceVariant',
  },

  disabledOpacity: 0.38,
  typography: textFieldTypography,
  motion: textFieldMotion,
} as const;

export type FilledTextFieldTokens = typeof filledTextFieldTokens;
export type OutlinedTextFieldTokens = typeof outlinedTextFieldTokens;
