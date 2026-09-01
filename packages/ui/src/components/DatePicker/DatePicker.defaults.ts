import '@m3-ui/tokens/date-picker.css';
import type { CSSProperties } from 'react';
import type { ElevationLevel } from '../../internal/elevation';

export type DatePickerStyle = CSSProperties & Record<`--${string}`, string | number>;

/** Renderer-owned state that cannot be expressed as immutable component CSS. */
export const datePickerRuntime = {
  defaultYearRange: [1900, 2100] as const,
} as const;

export function getDatePickerElevationLevel(
  variant: 'modal' | 'docked',
): ElevationLevel {
  // Modal DatePicker is Dialog content, so Dialog owns its elevation paint.
  // Docked DatePicker is a standalone level3 surface.
  return variant === 'docked' ? 'level3' : 'level0';
}

/**
 * @deprecated Static DatePicker defaults are generated into @m3-ui/tokens/date-picker.css.
 * Kept temporarily as a no-op compatibility bridge for existing imports.
 */
export function getDatePickerStyle(
  _variant: 'modal' | 'docked',
  _mode: 'calendar' | 'input',
  _isRange: boolean,
): DatePickerStyle {
  return {};
}
