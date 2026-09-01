import '@m3-ui/tokens/date-picker.css';
import type { CSSProperties } from 'react';
import type { ElevationLevel } from '../../internal/elevation';

export type DatePickerStyle = CSSProperties & Record<`--${string}`, string | number>;

/** Renderer mechanics from pinned Compose DatePicker.kt, not canonical component tokens. */
export const datePickerRuntime = {
  defaultYearRange: [1900, 2100] as const,
  minimumInteractiveSize: 48,
  horizontalPadding: 12,
  monthYearHeight: 56,
  modeParallaxDistance: 48,
} as const;

export function getDatePickerElevationLevel(
  variant: 'modal' | 'docked',
): ElevationLevel {
  // Modal DatePicker is Dialog content, so Dialog owns its elevation paint.
  // Docked DatePicker is a standalone level3 surface.
  return variant === 'docked' ? 'level3' : 'level0';
}

/** Narrow renderer-geometry bridge. Static token defaults are generated CSS. */
export function getDatePickerStyle(
  _variant: 'modal' | 'docked',
  _mode: 'calendar' | 'input',
  _isRange: boolean,
): DatePickerStyle {
  return {
    '--_date-picker-cell-size': `${datePickerRuntime.minimumInteractiveSize}px`,
    '--_date-picker-horizontal-padding': `${datePickerRuntime.horizontalPadding}px`,
    '--_date-picker-month-year-height': `${datePickerRuntime.monthYearHeight}px`,
    '--_date-picker-mode-parallax': `${datePickerRuntime.modeParallaxDistance}px`,
  };
}
