import {
  cssValue,
  defineCssAdapter,
  tokenReader,
} from '../adapter-helpers.mjs';

export function createTextFieldCss(context) {
  const get = tokenReader(context, 'TextField CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  const shared = 'component.textField.shared';
  const typography = (role) => [
    line(`--_text-field-${role === 'bodyLarge' ? 'body-large' : 'body-small'}-font-family`, `var(--font-family-${get(`${shared}.typography.${role}.fontFamily`)})`),
    line(`--_text-field-${role === 'bodyLarge' ? 'body-large' : 'body-small'}-font-size`, get(`${shared}.typography.${role}.fontSize`)),
    line(`--_text-field-${role === 'bodyLarge' ? 'body-large' : 'body-small'}-line-height`, get(`${shared}.typography.${role}.lineHeight`)),
    line(`--_text-field-${role === 'bodyLarge' ? 'body-large' : 'body-small'}-font-weight`, get(`${shared}.typography.${role}.fontWeight`)),
    line(`--_text-field-${role === 'bodyLarge' ? 'body-large' : 'body-small'}-letter-spacing`, get(`${shared}.typography.${role}.letterSpacing`)),
  ];

  const base = [
    '.text-field {',
    line('--_text-field-min-width', get(`${shared}.minWidth`)),
    line('--_text-field-min-height', get(`${shared}.minHeight`)),
    line('--_text-field-input-min-line-height', get(`${shared}.lineHeight.inputMin`)),
    line('--_text-field-focused-label-min-line-height', get(`${shared}.lineHeight.focusedLabelMin`)),
    line('--_text-field-supporting-min-line-height', get(`${shared}.lineHeight.supportingMin`)),
    line('--_text-field-icon-size', get(`${shared}.iconSize`)),
    line('--_text-field-icon-slot-size', get(`${shared}.iconSlotSize`)),
    line('--_text-field-text-color', get(`${shared}.colors.text`)),
    line('--_text-field-disabled-text-color', get(`${shared}.colors.disabledText`)),
    line('--_text-field-cursor-color', get(`${shared}.colors.cursor`)),
    line('--_text-field-error-cursor-color', get(`${shared}.colors.errorCursor`)),
    line('--_text-field-label-color', get(`${shared}.colors.label`)),
    line('--_text-field-focused-label-color', get(`${shared}.colors.focusedLabel`)),
    line('--_text-field-disabled-label-color', get(`${shared}.colors.disabledLabel`)),
    line('--_text-field-error-label-color', get(`${shared}.colors.errorLabel`)),
    line('--_text-field-placeholder-color', get(`${shared}.colors.placeholder`)),
    line('--_text-field-disabled-placeholder-color', get(`${shared}.colors.disabledPlaceholder`)),
    line('--_text-field-supporting-color', get(`${shared}.colors.supporting`)),
    line('--_text-field-disabled-supporting-color', get(`${shared}.colors.disabledSupporting`)),
    line('--_text-field-error-supporting-color', get(`${shared}.colors.errorSupporting`)),
    line('--_text-field-leading-icon-color', get(`${shared}.colors.leadingIcon`)),
    line('--_text-field-trailing-icon-color', get(`${shared}.colors.trailingIcon`)),
    line('--_text-field-disabled-leading-icon-color', get(`${shared}.colors.disabledLeadingIcon`)),
    line('--_text-field-disabled-trailing-icon-color', get(`${shared}.colors.disabledTrailingIcon`)),
    line('--_text-field-error-leading-icon-color', get(`${shared}.colors.errorLeadingIcon`)),
    line('--_text-field-error-trailing-icon-color', get(`${shared}.colors.errorTrailingIcon`)),
    line('--_text-field-prefix-color', get(`${shared}.colors.prefix`)),
    line('--_text-field-suffix-color', get(`${shared}.colors.suffix`)),
    line('--_text-field-disabled-opacity', get(`${shared}.disabledOpacity`)),
    ...typography('bodyLarge'),
    ...typography('bodySmall'),
    line('--_text-field-fast-effects-duration', get(`${shared}.motion.fastEffects.duration`)),
    line('--_text-field-fast-effects-easing', get(`${shared}.motion.fastEffects.easing`)),
    line('--_text-field-fast-spatial-duration', get(`${shared}.motion.fastSpatial.duration`)),
    line('--_text-field-fast-spatial-easing', get(`${shared}.motion.fastSpatial.easing`)),
    '}',
  ];

  const filled = 'component.textField.filled';
  const filledRule = [
    '', '.text-field--filled {',
    line('--_text-field-padding-inline', get(`${filled}.contentPadding.inline`)),
    line('--_text-field-padding-with-label', get(`${filled}.contentPadding.blockWithLabel`)),
    line('--_text-field-padding-without-label', get(`${filled}.contentPadding.blockWithoutLabel`)),
    line('--_text-field-supporting-top', get(`${filled}.contentPadding.supportingTop`)),
    line('--_text-field-affix-padding', get(`${filled}.contentPadding.affix`)),
    line('--_text-field-after-icon-padding', get(`${filled}.contentPadding.afterIcon`)),
    line('--_text-field-radius-top-start', get(`${filled}.containerShape.topStartRadius`)),
    line('--_text-field-radius-top-end', get(`${filled}.containerShape.topEndRadius`)),
    line('--_text-field-radius-bottom-end', get(`${filled}.containerShape.bottomEndRadius`)),
    line('--_text-field-radius-bottom-start', get(`${filled}.containerShape.bottomStartRadius`)),
    line('--_text-field-indicator-width', get(`${filled}.indicator.unfocusedThickness`)),
    line('--_text-field-indicator-focused-width', get(`${filled}.indicator.focusedThickness`)),
    line('--_text-field-container-color', get(`${filled}.colors.container`)),
    line('--_text-field-indicator-color', get(`${filled}.colors.indicator`)),
    line('--_text-field-focused-indicator-color', get(`${filled}.colors.focusedIndicator`)),
    line('--_text-field-disabled-indicator-color', get(`${filled}.colors.disabledIndicator`)),
    line('--_text-field-error-indicator-color', get(`${filled}.colors.errorIndicator`)),
    '}',
  ];

  const outlined = 'component.textField.outlined';
  const outlinedRule = [
    '', '.text-field--outlined {',
    line('--_text-field-padding-inline', get(`${outlined}.contentPadding.inline`)),
    line('--_text-field-padding-with-label', get(`${outlined}.contentPadding.block`)),
    line('--_text-field-padding-without-label', get(`${outlined}.contentPadding.block`)),
    line('--_text-field-supporting-top', get(`${outlined}.contentPadding.supportingTop`)),
    line('--_text-field-affix-padding', get(`${outlined}.contentPadding.affix`)),
    line('--_text-field-after-icon-padding', get(`${outlined}.contentPadding.afterIcon`)),
    line('--_text-field-cutout-padding-inline', get(`${outlined}.contentPadding.cutoutInline`)),
    line('--_text-field-outlined-top-padding', get(`${outlined}.contentPadding.topPadding`)),
    line('--_text-field-radius-top-start', get(`${outlined}.containerShape.topStartRadius`)),
    line('--_text-field-radius-top-end', get(`${outlined}.containerShape.topEndRadius`)),
    line('--_text-field-radius-bottom-end', get(`${outlined}.containerShape.bottomEndRadius`)),
    line('--_text-field-radius-bottom-start', get(`${outlined}.containerShape.bottomStartRadius`)),
    line('--_text-field-container-color', get(`${outlined}.colors.container`)),
    line('--_text-field-outline-width', get(`${outlined}.outline.unfocusedThickness`)),
    line('--_text-field-outline-focused-width', get(`${outlined}.outline.focusedThickness`)),
    line('--_text-field-disabled-outline-opacity', get(`${outlined}.outline.disabledOpacity`)),
    line('--_text-field-outline-color', get(`${outlined}.colors.outline`)),
    line('--_text-field-focused-outline-color', get(`${outlined}.colors.focusedOutline`)),
    line('--_text-field-disabled-outline-color', get(`${outlined}.colors.disabledOutline`)),
    line('--_text-field-error-outline-color', get(`${outlined}.colors.errorOutline`)),
    '}',
  ];

  return [...base, ...filledRule, ...outlinedRule, ''].join('\n');
}

export default defineCssAdapter('text-field', createTextFieldCss);
