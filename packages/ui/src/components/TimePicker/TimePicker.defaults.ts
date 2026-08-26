import * as token from '@m3/tokens';
import type { CSSProperties } from 'react';
import { pxNumber } from '../../internal/tokenValues';

function typography(
  fontFamily: string,
  fontSize: string,
  lineHeight: string,
  fontWeight: number,
  letterSpacing: string,
) {
  return { fontFamily, fontSize, lineHeight, fontWeight, letterSpacing } as const;
}

export const timePickerTokens = {
  dialSize: pxNumber(token.ComponentTimePickerClockDialContainerSize),
  dialColor: token.ComponentTimePickerClockDialColor,
  dialLabelColor: token.ComponentTimePickerClockDialUnselectedLabelTextColor,
  dialSelectedLabelColor: token.ComponentTimePickerClockDialSelectedLabelTextColor,
  dialLabelTypography: typography(
    token.TypographyBodyLargeFontFamily,
    token.TypographyBodyLargeFontSize,
    token.TypographyBodyLargeLineHeight,
    token.TypographyBodyLargeFontWeight,
    token.TypographyBodyLargeLetterSpacing,
  ),
  selectorColor: token.ComponentTimePickerClockDialSelectorHandleContainerColor,
  selectorSize: pxNumber(token.ComponentTimePickerClockDialSelectorHandleContainerSize),
  selectorTrackWidth: pxNumber(token.ComponentTimePickerClockDialSelectorTrackContainerWidth),
  selectorCenterSize: pxNumber(token.ComponentTimePickerClockDialSelectorCenterContainerSize),
  timeSelectorWidth: pxNumber(token.ComponentTimePickerTimeSelectorContainerWidth),
  timeSelector24Width: pxNumber(token.ComponentTimePickerTimeSelector24HVerticalContainerWidth),
  timeSelectorHeight: pxNumber(token.ComponentTimePickerTimeSelectorContainerHeight),
  timeSelectorSelectedColor: token.ComponentTimePickerTimeSelectorSelectedContainerColor,
  timeSelectorSelectedText: token.ComponentTimePickerTimeSelectorSelectedLabelTextColor,
  timeSelectorColor: token.ComponentTimePickerTimeSelectorUnselectedContainerColor,
  timeSelectorText: token.ComponentTimePickerTimeSelectorUnselectedLabelTextColor,
  timeSelectorTypography: typography(
    token.TypographyDisplayLargeFontFamily,
    token.TypographyDisplayLargeFontSize,
    token.TypographyDisplayLargeLineHeight,
    token.TypographyDisplayLargeFontWeight,
    token.TypographyDisplayLargeLetterSpacing,
  ),
  periodVWidth: pxNumber(token.ComponentTimePickerPeriodSelectorVerticalContainerWidth),
  periodVHeight: pxNumber(token.ComponentTimePickerPeriodSelectorVerticalContainerHeight),
  periodHWidth: pxNumber(token.ComponentTimePickerPeriodSelectorHorizontalContainerWidth),
  periodHHeight: pxNumber(token.ComponentTimePickerPeriodSelectorHorizontalContainerHeight),
  periodOutline: token.ComponentTimePickerPeriodSelectorOutlineColor,
  periodSelectedColor: token.ComponentTimePickerPeriodSelectorSelectedContainerColor,
  periodSelectedText: token.ComponentTimePickerPeriodSelectorSelectedLabelTextColor,
  periodText: token.ComponentTimePickerPeriodSelectorUnselectedLabelTextColor,
  periodTypography: typography(
    token.TypographyTitleMediumFontFamily,
    token.TypographyTitleMediumFontSize,
    token.TypographyTitleMediumLineHeight,
    token.TypographyTitleMediumFontWeight,
    token.TypographyTitleMediumLetterSpacing,
  ),
  inputWidth: pxNumber(token.ComponentTimeInputTimeFieldContainerWidth),
  inputHeight: pxNumber(token.ComponentTimeInputTimeFieldContainerHeight),
  inputPeriodWidth: pxNumber(token.ComponentTimeInputPeriodSelectorContainerWidth),
  inputPeriodHeight: pxNumber(token.ComponentTimeInputPeriodSelectorContainerHeight),
  inputColor: token.ComponentTimeInputTimeFieldContainerColor,
  inputFocusColor: token.ComponentTimeInputTimeFieldFocusContainerColor,
  inputText: token.ComponentTimeInputTimeFieldLabelTextColor,
  inputFocusText: token.ComponentTimeInputTimeFieldFocusLabelTextColor,
  inputFocusOutline: token.ComponentTimeInputTimeFieldFocusOutlineColor,
  inputFocusOutlineWidth: pxNumber(token.ComponentTimeInputTimeFieldFocusOutlineWidth),
  inputTypography: typography(
    token.TypographyDisplayMediumFontFamily,
    token.TypographyDisplayMediumFontSize,
    token.TypographyDisplayMediumLineHeight,
    token.TypographyDisplayMediumFontWeight,
    token.TypographyDisplayMediumLetterSpacing,
  ),
  separator: token.ComponentTimeInputTimeFieldSeparatorColor,
  standardFieldShape: token.ShapeSmall,
  standardPeriodShape: token.ShapeSmall,
  vibrantFieldShape: token.ShapeLarge,
  vibrantPeriodShape: token.ShapeFull,
} as const;

/** Renderer mechanics from the pinned Compose TimePicker.kt, not canonical build inputs. */
export const timePickerRuntime = {
  dialLabelRadius: 101,
  inner24HourRadius: 69,
  minuteStep: 5,
  pointerDeadZone: 30,
  autoHorizontalMinWidth: 560,
  standardDisplayDialGap: 36,
  vibrantVerticalDisplayDialGap: 36,
  vibrantHorizontalDisplayDialGap: 52,
  verticalClockFaceBottomSpace: 24,
  vibrantVerticalPadding: 12,
  vibrantHorizontalPadding: 24,
  motion: {
    spatialDuration: token.MotionSpringDefaultSpatialDuration,
    spatialEasing: token.MotionSpringDefaultSpatialEasing,
    effectsDuration: token.MotionSpringDefaultEffectsDuration,
    effectsEasing: token.MotionSpringDefaultEffectsEasing,
  },
} as const;

export type TimePickerStyle = CSSProperties & Record<`--${string}`, string | number>;

function fontFamilyVariable(role: string) {
  return `var(--font-family-${role})`;
}

function typographyStyle(prefix: string, value: ReturnType<typeof typography>): TimePickerStyle {
  return {
    [`--_tp-${prefix}-font-family`]: fontFamilyVariable(value.fontFamily),
    [`--_tp-${prefix}-font-size`]: value.fontSize,
    [`--_tp-${prefix}-line-height`]: value.lineHeight,
    [`--_tp-${prefix}-font-weight`]: value.fontWeight,
    [`--_tp-${prefix}-letter-spacing`]: value.letterSpacing,
  };
}

export function getTimePickerStyle(): TimePickerStyle {
  const t = timePickerTokens;
  return {
    '--_tp-dial-size': `${t.dialSize}px`,
    '--_tp-dial-color': t.dialColor,
    '--_tp-dial-label-color': t.dialLabelColor,
    '--_tp-dial-selected-label-color': t.dialSelectedLabelColor,
    ...typographyStyle('dial-label', t.dialLabelTypography),
    '--_tp-selector-color': t.selectorColor,
    '--_tp-selector-size': `${t.selectorSize}px`,
    '--_tp-selector-track-width': `${t.selectorTrackWidth}px`,
    '--_tp-selector-center-size': `${t.selectorCenterSize}px`,
    '--_tp-time-selector-width': `${t.timeSelectorWidth}px`,
    '--_tp-time-selector-24-width': `${t.timeSelector24Width}px`,
    '--_tp-time-selector-height': `${t.timeSelectorHeight}px`,
    '--_tp-time-selector-selected': t.timeSelectorSelectedColor,
    '--_tp-time-selector-selected-text': t.timeSelectorSelectedText,
    '--_tp-time-selector': t.timeSelectorColor,
    '--_tp-time-selector-text': t.timeSelectorText,
    ...typographyStyle('time-selector', t.timeSelectorTypography),
    '--_tp-period-v-width': `${t.periodVWidth}px`,
    '--_tp-period-v-height': `${t.periodVHeight}px`,
    '--_tp-period-h-width': `${t.periodHWidth}px`,
    '--_tp-period-h-height': `${t.periodHHeight}px`,
    '--_tp-period-outline': t.periodOutline,
    '--_tp-period-selected': t.periodSelectedColor,
    '--_tp-period-selected-text': t.periodSelectedText,
    '--_tp-period-text': t.periodText,
    ...typographyStyle('period', t.periodTypography),
    '--_tp-input-width': `${t.inputWidth}px`,
    '--_tp-input-height': `${t.inputHeight}px`,
    '--_tp-input-period-width': `${t.inputPeriodWidth}px`,
    '--_tp-input-period-height': `${t.inputPeriodHeight}px`,
    '--_tp-input-color': t.inputColor,
    '--_tp-input-focus-color': t.inputFocusColor,
    '--_tp-input-text': t.inputText,
    '--_tp-input-focus-text': t.inputFocusText,
    '--_tp-input-focus-outline': t.inputFocusOutline,
    '--_tp-input-focus-outline-width': `${t.inputFocusOutlineWidth}px`,
    ...typographyStyle('input', t.inputTypography),
    '--_tp-separator': t.separator,
    '--_tp-standard-field-shape': t.standardFieldShape,
    '--_tp-standard-period-shape': t.standardPeriodShape,
    '--_tp-vibrant-field-shape': t.vibrantFieldShape,
    '--_tp-vibrant-period-shape': t.vibrantPeriodShape,
    '--_tp-standard-display-dial-gap': `${timePickerRuntime.standardDisplayDialGap}px`,
    '--_tp-vibrant-vertical-display-dial-gap': `${timePickerRuntime.vibrantVerticalDisplayDialGap}px`,
    '--_tp-vibrant-horizontal-display-dial-gap': `${timePickerRuntime.vibrantHorizontalDisplayDialGap}px`,
    '--_tp-vertical-clock-face-bottom-space': `${timePickerRuntime.verticalClockFaceBottomSpace}px`,
    '--_tp-vibrant-vertical-padding': `${timePickerRuntime.vibrantVerticalPadding}px`,
    '--_tp-vibrant-horizontal-padding': `${timePickerRuntime.vibrantHorizontalPadding}px`,
    '--_tp-spatial-duration': timePickerRuntime.motion.spatialDuration,
    '--_tp-spatial-easing': timePickerRuntime.motion.spatialEasing,
    '--_tp-effects-duration': timePickerRuntime.motion.effectsDuration,
    '--_tp-effects-easing': timePickerRuntime.motion.effectsEasing,
  };
}
