import * as token from '@m3-ui/tokens';
import { colorRole, msNumber, pxNumber } from '../../internal/tokenValues';

export interface TextFieldTypographyToken {
  readonly fontFamilyRole: 'plain';
  readonly fontSize: number;
  readonly lineHeight: number;
  readonly fontWeight: 400;
  readonly letterSpacing: number;
}

const typography = {
  bodyLarge: {
    fontFamilyRole: token.ComponentTextFieldSharedTypographyBodyLargeFontFamily as 'plain',
    fontSize: pxNumber(token.ComponentTextFieldSharedTypographyBodyLargeFontSize),
    lineHeight: pxNumber(token.ComponentTextFieldSharedTypographyBodyLargeLineHeight),
    fontWeight: token.ComponentTextFieldSharedTypographyBodyLargeFontWeight as 400,
    letterSpacing: pxNumber(token.ComponentTextFieldSharedTypographyBodyLargeLetterSpacing),
  },
  bodySmall: {
    fontFamilyRole: token.ComponentTextFieldSharedTypographyBodySmallFontFamily as 'plain',
    fontSize: pxNumber(token.ComponentTextFieldSharedTypographyBodySmallFontSize),
    lineHeight: pxNumber(token.ComponentTextFieldSharedTypographyBodySmallLineHeight),
    fontWeight: token.ComponentTextFieldSharedTypographyBodySmallFontWeight as 400,
    letterSpacing: pxNumber(token.ComponentTextFieldSharedTypographyBodySmallLetterSpacing),
  },
} as const;

const motion = {
  fastEffects: {
    durationMs: msNumber(token.ComponentTextFieldSharedMotionFastEffectsDuration),
    easing: token.ComponentTextFieldSharedMotionFastEffectsEasing,
  },
  fastSpatial: {
    durationMs: msNumber(token.ComponentTextFieldSharedMotionFastSpatialDuration),
    easing: token.ComponentTextFieldSharedMotionFastSpatialEasing,
  },
} as const;

const colors = {
  text: colorRole(token.ComponentTextFieldSharedColorsText),
  disabledText: colorRole(token.ComponentTextFieldSharedColorsDisabledText),
  cursor: colorRole(token.ComponentTextFieldSharedColorsCursor),
  errorCursor: colorRole(token.ComponentTextFieldSharedColorsErrorCursor),
  label: colorRole(token.ComponentTextFieldSharedColorsLabel),
  focusedLabel: colorRole(token.ComponentTextFieldSharedColorsFocusedLabel),
  disabledLabel: colorRole(token.ComponentTextFieldSharedColorsDisabledLabel),
  errorLabel: colorRole(token.ComponentTextFieldSharedColorsErrorLabel),
  placeholder: colorRole(token.ComponentTextFieldSharedColorsPlaceholder),
  disabledPlaceholder: colorRole(token.ComponentTextFieldSharedColorsDisabledPlaceholder),
  supporting: colorRole(token.ComponentTextFieldSharedColorsSupporting),
  disabledSupporting: colorRole(token.ComponentTextFieldSharedColorsDisabledSupporting),
  errorSupporting: colorRole(token.ComponentTextFieldSharedColorsErrorSupporting),
  leadingIcon: colorRole(token.ComponentTextFieldSharedColorsLeadingIcon),
  trailingIcon: colorRole(token.ComponentTextFieldSharedColorsTrailingIcon),
  disabledLeadingIcon: colorRole(token.ComponentTextFieldSharedColorsDisabledLeadingIcon),
  disabledTrailingIcon: colorRole(token.ComponentTextFieldSharedColorsDisabledTrailingIcon),
  errorLeadingIcon: colorRole(token.ComponentTextFieldSharedColorsErrorLeadingIcon),
  errorTrailingIcon: colorRole(token.ComponentTextFieldSharedColorsErrorTrailingIcon),
  prefix: colorRole(token.ComponentTextFieldSharedColorsPrefix),
  suffix: colorRole(token.ComponentTextFieldSharedColorsSuffix),
} as const;

const shared = {
  minWidth: pxNumber(token.ComponentTextFieldSharedMinWidth),
  minHeight: pxNumber(token.ComponentTextFieldSharedMinHeight),
  lineHeight: {
    inputMin: pxNumber(token.ComponentTextFieldSharedLineHeightInputMin),
    focusedLabelMin: pxNumber(token.ComponentTextFieldSharedLineHeightFocusedLabelMin),
    supportingMin: pxNumber(token.ComponentTextFieldSharedLineHeightSupportingMin),
  },
  iconSize: pxNumber(token.ComponentTextFieldSharedIconSize),
  iconSlotSize: pxNumber(token.ComponentTextFieldSharedIconSlotSize),
  disabledOpacity: token.ComponentTextFieldSharedDisabledOpacity,
  colors,
  typography,
  motion,
} as const;

export const filledTextFieldTokens = {
  ...shared,
  contentPadding: {
    inline: pxNumber(token.ComponentTextFieldFilledContentPaddingInline),
    blockWithLabel: pxNumber(token.ComponentTextFieldFilledContentPaddingBlockWithLabel),
    blockWithoutLabel: pxNumber(token.ComponentTextFieldFilledContentPaddingBlockWithoutLabel),
    supportingTop: pxNumber(token.ComponentTextFieldFilledContentPaddingSupportingTop),
    affix: pxNumber(token.ComponentTextFieldFilledContentPaddingAffix),
    afterIcon: pxNumber(token.ComponentTextFieldFilledContentPaddingAfterIcon),
  },
  containerShape: {
    topStartRadius: pxNumber(token.ComponentTextFieldFilledContainerShapeTopStartRadius),
    topEndRadius: pxNumber(token.ComponentTextFieldFilledContainerShapeTopEndRadius),
    bottomEndRadius: pxNumber(token.ComponentTextFieldFilledContainerShapeBottomEndRadius),
    bottomStartRadius: pxNumber(token.ComponentTextFieldFilledContainerShapeBottomStartRadius),
  },
  indicator: {
    unfocusedThickness: pxNumber(token.ComponentTextFieldFilledIndicatorUnfocusedThickness),
    focusedThickness: pxNumber(token.ComponentTextFieldFilledIndicatorFocusedThickness),
  },
  colors: {
    ...colors,
    container: colorRole(token.ComponentTextFieldFilledColorsContainer),
    indicator: colorRole(token.ComponentTextFieldFilledColorsIndicator),
    focusedIndicator: colorRole(token.ComponentTextFieldFilledColorsFocusedIndicator),
    disabledIndicator: colorRole(token.ComponentTextFieldFilledColorsDisabledIndicator),
    errorIndicator: colorRole(token.ComponentTextFieldFilledColorsErrorIndicator),
  },
} as const;

export const outlinedTextFieldTokens = {
  ...shared,
  contentPadding: {
    inline: pxNumber(token.ComponentTextFieldOutlinedContentPaddingInline),
    block: pxNumber(token.ComponentTextFieldOutlinedContentPaddingBlock),
    supportingTop: pxNumber(token.ComponentTextFieldOutlinedContentPaddingSupportingTop),
    affix: pxNumber(token.ComponentTextFieldOutlinedContentPaddingAffix),
    afterIcon: pxNumber(token.ComponentTextFieldOutlinedContentPaddingAfterIcon),
    cutoutInline: pxNumber(token.ComponentTextFieldOutlinedContentPaddingCutoutInline),
    topPadding: pxNumber(token.ComponentTextFieldOutlinedContentPaddingTopPadding),
  },
  containerShape: {
    topStartRadius: pxNumber(token.ComponentTextFieldOutlinedContainerShapeTopStartRadius),
    topEndRadius: pxNumber(token.ComponentTextFieldOutlinedContainerShapeTopEndRadius),
    bottomEndRadius: pxNumber(token.ComponentTextFieldOutlinedContainerShapeBottomEndRadius),
    bottomStartRadius: pxNumber(token.ComponentTextFieldOutlinedContainerShapeBottomStartRadius),
  },
  outline: {
    unfocusedThickness: pxNumber(token.ComponentTextFieldOutlinedOutlineUnfocusedThickness),
    focusedThickness: pxNumber(token.ComponentTextFieldOutlinedOutlineFocusedThickness),
    disabledOpacity: token.ComponentTextFieldOutlinedOutlineDisabledOpacity,
  },
  colors: {
    ...colors,
    outline: colorRole(token.ComponentTextFieldOutlinedColorsOutline),
    focusedOutline: colorRole(token.ComponentTextFieldOutlinedColorsFocusedOutline),
    disabledOutline: colorRole(token.ComponentTextFieldOutlinedColorsDisabledOutline),
    errorOutline: colorRole(token.ComponentTextFieldOutlinedColorsErrorOutline),
  },
} as const;
