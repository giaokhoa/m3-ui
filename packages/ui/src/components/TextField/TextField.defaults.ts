import { filledTextFieldTokens } from '@m3/tokens/text-field';
import type { CSSProperties } from 'react';

type TextFieldStyle = CSSProperties & Record<`--${string}`, string | number>;

function roleVariable(role: string): string {
  return `var(--${role.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)})`;
}

const { colors, contentPadding, containerShape, indicator, motion, typography } =
  filledTextFieldTokens;

export const filledTextFieldBaseStyle: TextFieldStyle = {
  '--_text-field-min-width': `${filledTextFieldTokens.minWidth}px`,
  '--_text-field-min-height': `${filledTextFieldTokens.minHeight}px`,
  '--_text-field-padding-inline': `${contentPadding.inline}px`,
  '--_text-field-padding-with-label': `${contentPadding.blockWithLabel}px`,
  '--_text-field-padding-without-label': `${contentPadding.blockWithoutLabel}px`,
  '--_text-field-supporting-top': `${contentPadding.supportingTop}px`,

  '--_text-field-radius-top-start': `${containerShape.topStartRadius}px`,
  '--_text-field-radius-top-end': `${containerShape.topEndRadius}px`,
  '--_text-field-radius-bottom-end': `${containerShape.bottomEndRadius}px`,
  '--_text-field-radius-bottom-start': `${containerShape.bottomStartRadius}px`,

  '--_text-field-indicator-width': `${indicator.unfocusedThickness}px`,
  '--_text-field-indicator-focused-width': `${indicator.focusedThickness}px`,
  '--_text-field-icon-size': `${filledTextFieldTokens.iconSize}px`,

  '--_text-field-container-color': roleVariable(colors.container),
  '--_text-field-text-color': roleVariable(colors.text),
  '--_text-field-disabled-text-color': roleVariable(colors.disabledText),
  '--_text-field-cursor-color': roleVariable(colors.cursor),
  '--_text-field-error-cursor-color': roleVariable(colors.errorCursor),

  '--_text-field-indicator-color': roleVariable(colors.indicator),
  '--_text-field-focused-indicator-color': roleVariable(colors.focusedIndicator),
  '--_text-field-disabled-indicator-color': roleVariable(colors.disabledIndicator),
  '--_text-field-error-indicator-color': roleVariable(colors.errorIndicator),

  '--_text-field-label-color': roleVariable(colors.label),
  '--_text-field-focused-label-color': roleVariable(colors.focusedLabel),
  '--_text-field-disabled-label-color': roleVariable(colors.disabledLabel),
  '--_text-field-error-label-color': roleVariable(colors.errorLabel),

  '--_text-field-placeholder-color': roleVariable(colors.placeholder),
  '--_text-field-disabled-placeholder-color': roleVariable(colors.disabledPlaceholder),

  '--_text-field-supporting-color': roleVariable(colors.supporting),
  '--_text-field-disabled-supporting-color': roleVariable(colors.disabledSupporting),
  '--_text-field-error-supporting-color': roleVariable(colors.errorSupporting),

  '--_text-field-leading-icon-color': roleVariable(colors.leadingIcon),
  '--_text-field-trailing-icon-color': roleVariable(colors.trailingIcon),
  '--_text-field-disabled-leading-icon-color': roleVariable(colors.disabledLeadingIcon),
  '--_text-field-disabled-trailing-icon-color': roleVariable(colors.disabledTrailingIcon),
  '--_text-field-error-leading-icon-color': roleVariable(colors.errorLeadingIcon),
  '--_text-field-error-trailing-icon-color': roleVariable(colors.errorTrailingIcon),
  '--_text-field-prefix-color': roleVariable(colors.prefix),
  '--_text-field-suffix-color': roleVariable(colors.suffix),
  '--_text-field-disabled-opacity': filledTextFieldTokens.disabledOpacity,

  '--_text-field-body-large-font-family': 'var(--font-family-plain)',
  '--_text-field-body-large-font-size': `${typography.bodyLarge.fontSize}px`,
  '--_text-field-body-large-line-height': `${typography.bodyLarge.lineHeight}px`,
  '--_text-field-body-large-font-weight': typography.bodyLarge.fontWeight,
  '--_text-field-body-large-letter-spacing': `${typography.bodyLarge.letterSpacing}px`,
  '--_text-field-body-small-font-family': 'var(--font-family-plain)',
  '--_text-field-body-small-font-size': `${typography.bodySmall.fontSize}px`,
  '--_text-field-body-small-line-height': `${typography.bodySmall.lineHeight}px`,
  '--_text-field-body-small-font-weight': typography.bodySmall.fontWeight,
  '--_text-field-body-small-letter-spacing': `${typography.bodySmall.letterSpacing}px`,

  '--_text-field-fast-effects-duration': `${motion.fastEffects.durationMs}ms`,
  '--_text-field-fast-effects-easing': motion.fastEffects.easing,
  '--_text-field-fast-spatial-duration': `${motion.fastSpatial.durationMs}ms`,
  '--_text-field-fast-spatial-easing': motion.fastSpatial.easing,
};
