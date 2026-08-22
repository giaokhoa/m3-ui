import type { CSSProperties } from 'react';
import {
  filledTextFieldTokens,
  outlinedTextFieldTokens,
} from './TextField.tokens';

type TextFieldStyle = CSSProperties & Record<`--${string}`, string | number>;
type TextFieldTokenSet = typeof filledTextFieldTokens | typeof outlinedTextFieldTokens;

function commonTextFieldStyle(tokens: TextFieldTokenSet): TextFieldStyle {
  const { colors, lineHeight, motion, typography } = tokens;

  return {
    '--_text-field-min-width': `${tokens.minWidth}px`,
    '--_text-field-min-height': `${tokens.minHeight}px`,
    '--_text-field-input-min-line-height': `${lineHeight.inputMin}px`,
    '--_text-field-focused-label-min-line-height': `${lineHeight.focusedLabelMin}px`,
    '--_text-field-supporting-min-line-height': `${lineHeight.supportingMin}px`,
    '--_text-field-icon-size': `${tokens.iconSize}px`,
    '--_text-field-icon-slot-size': `${tokens.iconSlotSize}px`,
    '--_text-field-text-color': colors.text,
    '--_text-field-disabled-text-color': colors.disabledText,
    '--_text-field-cursor-color': colors.cursor,
    '--_text-field-error-cursor-color': colors.errorCursor,
    '--_text-field-label-color': colors.label,
    '--_text-field-focused-label-color': colors.focusedLabel,
    '--_text-field-disabled-label-color': colors.disabledLabel,
    '--_text-field-error-label-color': colors.errorLabel,
    '--_text-field-placeholder-color': colors.placeholder,
    '--_text-field-disabled-placeholder-color': colors.disabledPlaceholder,
    '--_text-field-supporting-color': colors.supporting,
    '--_text-field-disabled-supporting-color': colors.disabledSupporting,
    '--_text-field-error-supporting-color': colors.errorSupporting,
    '--_text-field-leading-icon-color': colors.leadingIcon,
    '--_text-field-trailing-icon-color': colors.trailingIcon,
    '--_text-field-disabled-leading-icon-color': colors.disabledLeadingIcon,
    '--_text-field-disabled-trailing-icon-color': colors.disabledTrailingIcon,
    '--_text-field-error-leading-icon-color': colors.errorLeadingIcon,
    '--_text-field-error-trailing-icon-color': colors.errorTrailingIcon,
    '--_text-field-prefix-color': colors.prefix,
    '--_text-field-suffix-color': colors.suffix,
    '--_text-field-disabled-opacity': tokens.disabledOpacity,
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
}

const filled = filledTextFieldTokens;

export const filledTextFieldBaseStyle: TextFieldStyle = {
  ...commonTextFieldStyle(filled),
  '--_text-field-padding-inline': `${filled.contentPadding.inline}px`,
  '--_text-field-padding-with-label': `${filled.contentPadding.blockWithLabel}px`,
  '--_text-field-padding-without-label': `${filled.contentPadding.blockWithoutLabel}px`,
  '--_text-field-supporting-top': `${filled.contentPadding.supportingTop}px`,
  '--_text-field-affix-padding': `${filled.contentPadding.affix}px`,
  '--_text-field-after-icon-padding': `${filled.contentPadding.afterIcon}px`,
  '--_text-field-radius-top-start': `${filled.containerShape.topStartRadius}px`,
  '--_text-field-radius-top-end': `${filled.containerShape.topEndRadius}px`,
  '--_text-field-radius-bottom-end': `${filled.containerShape.bottomEndRadius}px`,
  '--_text-field-radius-bottom-start': `${filled.containerShape.bottomStartRadius}px`,
  '--_text-field-indicator-width': `${filled.indicator.unfocusedThickness}px`,
  '--_text-field-indicator-focused-width': `${filled.indicator.focusedThickness}px`,
  '--_text-field-container-color': filled.colors.container,
  '--_text-field-indicator-color': filled.colors.indicator,
  '--_text-field-focused-indicator-color': filled.colors.focusedIndicator,
  '--_text-field-disabled-indicator-color': filled.colors.disabledIndicator,
  '--_text-field-error-indicator-color': filled.colors.errorIndicator,
};

const outlined = outlinedTextFieldTokens;

export const outlinedTextFieldBaseStyle: TextFieldStyle = {
  ...commonTextFieldStyle(outlined),
  '--_text-field-padding-inline': `${outlined.contentPadding.inline}px`,
  '--_text-field-padding-with-label': `${outlined.contentPadding.block}px`,
  '--_text-field-padding-without-label': `${outlined.contentPadding.block}px`,
  '--_text-field-supporting-top': `${outlined.contentPadding.supportingTop}px`,
  '--_text-field-affix-padding': `${outlined.contentPadding.affix}px`,
  '--_text-field-after-icon-padding': `${outlined.contentPadding.afterIcon}px`,
  '--_text-field-cutout-padding-inline': `${outlined.contentPadding.cutoutInline}px`,
  '--_text-field-outlined-top-padding': `${outlined.contentPadding.topPadding}px`,
  '--_text-field-radius-top-start': `${outlined.containerShape.topStartRadius}px`,
  '--_text-field-radius-top-end': `${outlined.containerShape.topEndRadius}px`,
  '--_text-field-radius-bottom-end': `${outlined.containerShape.bottomEndRadius}px`,
  '--_text-field-radius-bottom-start': `${outlined.containerShape.bottomStartRadius}px`,
  '--_text-field-container-color': 'transparent',
  '--_text-field-outline-width': `${outlined.outline.unfocusedThickness}px`,
  '--_text-field-outline-focused-width': `${outlined.outline.focusedThickness}px`,
  '--_text-field-disabled-outline-opacity': outlined.outline.disabledOpacity,
  '--_text-field-outline-color': outlined.colors.outline,
  '--_text-field-focused-outline-color': outlined.colors.focusedOutline,
  '--_text-field-disabled-outline-color': outlined.colors.disabledOutline,
  '--_text-field-error-outline-color': outlined.colors.errorOutline,
};
