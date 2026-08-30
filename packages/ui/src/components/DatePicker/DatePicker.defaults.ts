import * as token from '@m3-ui/tokens';
import type { CSSProperties } from 'react';
import type { ElevationLevel } from '../../internal/elevation';
import { pxNumber } from '../../internal/tokenValues';

export type DatePickerStyle = CSSProperties & Record<`--${string}`, string | number>;

const modal = {
  width: pxNumber(token.ComponentDatePickerModalContainerWidth),
  height: pxNumber(token.ComponentDatePickerModalContainerHeight),
  webHeight: pxNumber(token.ComponentDatePickerModalWebContainerHeight),
  headerHeight: pxNumber(token.ComponentDatePickerModalHeaderContainerHeight),
  rangeHeaderHeight: pxNumber(token.ComponentDatePickerModalRangeSelectionHeaderContainerHeight),
  dateContainerSize: pxNumber(token.ComponentDatePickerModalDateContainerWidth),
  selectedColor: token.ComponentDatePickerModalDateSelectedContainerColor,
  selectedLabelColor: token.ComponentDatePickerModalDateSelectedLabelTextColor,
  todayColor: token.ComponentDatePickerModalDateTodayContainerOutlineColor,
  todayOutline: pxNumber(token.ComponentDatePickerModalDateTodayContainerOutlineWidth),
  rangeColor: token.ComponentDatePickerModalRangeSelectionActiveIndicatorContainerColor,
  rangeLabelColor: token.ComponentDatePickerModalSelectionDateInRangeLabelTextColor,
  containerColor: token.ComponentDatePickerModalContainerColor,
  shape: token.ComponentDatePickerModalContainerShape,
} as const;

const input = {
  width: pxNumber(token.ComponentDateInputModalContainerWidth),
  height: pxNumber(token.ComponentDateInputModalContainerHeight),
  headerHeight: pxNumber(token.ComponentDateInputModalHeaderContainerHeight),
  containerColor: token.ComponentDateInputModalContainerColor,
  webContainerColor: token.ComponentDateInputModalWebContainerColor,
} as const;

const docked = {
  width: pxNumber(token.ComponentDatePickerDockedContainerWidth),
  height: pxNumber(token.ComponentDatePickerDockedContainerHeight),
  headerHeight: pxNumber(token.ComponentDatePickerDockedHeaderHeight),
  dateContainerSize: pxNumber(token.ComponentDatePickerDockedDateContainerWidth),
  stateLayerSize: pxNumber(token.ComponentDatePickerDockedDateStateLayerWidth),
  containerColor: token.ComponentDatePickerDockedContainerColor,
  containerElevation:
    token.ComponentDatePickerDockedContainerElevation as ElevationLevel,
  selectedColor: token.ComponentDatePickerDockedDateSelectedContainerColor,
  selectedLabelColor: token.ComponentDatePickerDockedDateSelectedLabelTextColor,
  todayColor: token.ComponentDatePickerDockedDateTodayContainerOutlineColor,
  todayOutline: pxNumber(token.ComponentDatePickerDockedDateTodayContainerOutlineWidth),
} as const;

const divider = {
  color: token.ComponentDividerColor,
  thickness: pxNumber(token.ComponentDividerThickness),
} as const;

export const datePickerTokens = { modal, input, docked, divider } as const;

// AndroidX DatePicker.kt owns these renderer mechanics; they are not component DTCG values.
// The motion roles are canonical core motion projections of the MotionSchemeKeyTokens used by
// SwitchableDateEntryContent at the pinned Compose source.
export const datePickerRuntime = {
  defaultYearRange: [1900, 2100] as const,
  minimumInteractiveSize: 48,
  horizontalPadding: 12,
  monthYearHeight: 56,
  modeParallaxDistance: 48,
  hoverOpacity: 0.08,
  pressOpacity: 0.1,
  motion: {
    defaultSpatial: {
      duration: token.MotionSpringDefaultSpatialDuration,
      easing: token.MotionSpringDefaultSpatialEasing,
    },
    defaultEffects: {
      duration: token.MotionSpringDefaultEffectsDuration,
      easing: token.MotionSpringDefaultEffectsEasing,
    },
    fastEffects: {
      duration: token.MotionSpringFastEffectsDuration,
      easing: token.MotionSpringFastEffectsEasing,
    },
  },
} as const;

function shapeRadius(shape: string): string {
  if (shape === 'extraLarge') return token.ShapeExtraLarge;
  if (shape === 'large') return token.ShapeLarge;
  return token.ShapeNone;
}

function typefaceRoleVariable(role: string): string {
  return `var(--font-family-${role})`;
}

function typography(prefix: string, role: 'labelLarge' | 'headlineLarge' | 'titleLarge' | 'titleMedium' | 'titleSmall' | 'bodyLarge' | 'bodySmall') {
  const map = {
    labelLarge: [token.TypographyLabelLargeFontFamily, token.TypographyLabelLargeFontSize, token.TypographyLabelLargeLineHeight, token.TypographyLabelLargeFontWeight, token.TypographyLabelLargeLetterSpacing],
    headlineLarge: [token.TypographyHeadlineLargeFontFamily, token.TypographyHeadlineLargeFontSize, token.TypographyHeadlineLargeLineHeight, token.TypographyHeadlineLargeFontWeight, token.TypographyHeadlineLargeLetterSpacing],
    titleLarge: [token.TypographyTitleLargeFontFamily, token.TypographyTitleLargeFontSize, token.TypographyTitleLargeLineHeight, token.TypographyTitleLargeFontWeight, token.TypographyTitleLargeLetterSpacing],
    titleMedium: [token.TypographyTitleMediumFontFamily, token.TypographyTitleMediumFontSize, token.TypographyTitleMediumLineHeight, token.TypographyTitleMediumFontWeight, token.TypographyTitleMediumLetterSpacing],
    titleSmall: [token.TypographyTitleSmallFontFamily, token.TypographyTitleSmallFontSize, token.TypographyTitleSmallLineHeight, token.TypographyTitleSmallFontWeight, token.TypographyTitleSmallLetterSpacing],
    bodyLarge: [token.TypographyBodyLargeFontFamily, token.TypographyBodyLargeFontSize, token.TypographyBodyLargeLineHeight, token.TypographyBodyLargeFontWeight, token.TypographyBodyLargeLetterSpacing],
    bodySmall: [token.TypographyBodySmallFontFamily, token.TypographyBodySmallFontSize, token.TypographyBodySmallLineHeight, token.TypographyBodySmallFontWeight, token.TypographyBodySmallLetterSpacing],
  } as const;
  const [family, fontSize, lineHeight, fontWeight, letterSpacing] = map[role];
  return {
    [`--_${prefix}-font-family`]: typefaceRoleVariable(family),
    [`--_${prefix}-font-size`]: fontSize,
    [`--_${prefix}-line-height`]: lineHeight,
    [`--_${prefix}-font-weight`]: fontWeight,
    [`--_${prefix}-letter-spacing`]: letterSpacing,
  } as Record<`--${string}`, string | number>;
}

export function getDatePickerElevationLevel(
  variant: 'modal' | 'docked',
): ElevationLevel {
  // Compose DatePicker is dialog content and does not add its own modal shadow.
  // The separately tokenized docked web surface carries canonical level3 elevation.
  return variant === 'docked' ? docked.containerElevation : 'level0';
}

export function getDatePickerStyle(
  variant: 'modal' | 'docked',
  mode: 'calendar' | 'input',
  isRange: boolean,
): DatePickerStyle {
  const isDocked = variant === 'docked';
  const width = isDocked ? docked.width : mode === 'input' ? input.width : modal.width;
  const height = isDocked ? docked.height : mode === 'input' ? input.height : modal.height;
  const headerHeight = isDocked
    ? docked.headerHeight
    : mode === 'input'
      ? input.headerHeight
      : isRange
        ? modal.rangeHeaderHeight
        : modal.headerHeight;
  const containerColor = isDocked
    ? docked.containerColor
    : mode === 'input'
      ? input.webContainerColor
      : modal.containerColor;

  return {
    '--_date-picker-width': `${width}px`,
    '--_date-picker-height': `${height}px`,
    '--_date-picker-header-height': `${headerHeight}px`,
    '--_date-picker-cell-size': `${datePickerRuntime.minimumInteractiveSize}px`,
    '--_date-picker-state-layer-size': `${isDocked ? docked.stateLayerSize : modal.dateContainerSize}px`,
    '--_date-picker-horizontal-padding': `${datePickerRuntime.horizontalPadding}px`,
    '--_date-picker-month-year-height': `${datePickerRuntime.monthYearHeight}px`,
    '--_date-picker-container-color': containerColor,
    '--_date-picker-container-radius': shapeRadius(isDocked ? 'large' : modal.shape),
    '--_date-picker-input-radius': token.ShapeExtraSmall,
    '--_date-picker-selected-color': isDocked ? docked.selectedColor : modal.selectedColor,
    '--_date-picker-selected-label-color': isDocked ? docked.selectedLabelColor : modal.selectedLabelColor,
    '--_date-picker-today-color': isDocked ? docked.todayColor : modal.todayColor,
    '--_date-picker-today-outline-width': `${isDocked ? docked.todayOutline : modal.todayOutline}px`,
    '--_date-picker-range-color': modal.rangeColor,
    '--_date-picker-range-label-color': modal.rangeLabelColor,
    '--_date-picker-divider-color': divider.color,
    '--_date-picker-divider-thickness': `${divider.thickness}px`,
    '--_date-picker-mode-parallax': `${datePickerRuntime.modeParallaxDistance}px`,
    '--_date-picker-spatial-duration': datePickerRuntime.motion.defaultSpatial.duration,
    '--_date-picker-spatial-easing': datePickerRuntime.motion.defaultSpatial.easing,
    '--_date-picker-effects-in-duration': datePickerRuntime.motion.defaultEffects.duration,
    '--_date-picker-effects-in-easing': datePickerRuntime.motion.defaultEffects.easing,
    '--_date-picker-effects-out-duration': datePickerRuntime.motion.fastEffects.duration,
    '--_date-picker-effects-out-easing': datePickerRuntime.motion.fastEffects.easing,
    '--_date-picker-hover-percentage': `${datePickerRuntime.hoverOpacity * 100}%`,
    '--_date-picker-press-percentage': `${datePickerRuntime.pressOpacity * 100}%`,
    ...typography('date-picker-label', 'labelLarge'),
    ...typography('date-picker-headline', 'headlineLarge'),
    ...typography('date-picker-range-headline', 'titleLarge'),
    ...typography('date-picker-docked-headline', 'titleMedium'),
    ...typography('date-picker-month', 'titleSmall'),
    ...typography('date-picker-body', 'bodyLarge'),
    ...typography('date-picker-supporting', 'bodySmall'),
  };
}
