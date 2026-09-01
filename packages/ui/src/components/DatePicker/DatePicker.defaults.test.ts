import { describe, expect, it } from 'vitest';
import {
  datePickerRuntime,
  getDatePickerElevationLevel,
  getDatePickerStyle,
} from './DatePicker.defaults';
import {
  compareDatePickerDates,
  formatDatePickerDate,
  isDatePickerDate,
  monthStart,
} from './DatePicker';

describe('DatePicker runtime defaults and date-only helpers', () => {
  it('keeps renderer mechanics in TypeScript without static token projection', () => {
    expect(datePickerRuntime.defaultYearRange).toEqual([1900, 2100]);
    expect(datePickerRuntime.minimumInteractiveSize).toBe(48);
    expect(datePickerRuntime.horizontalPadding).toBe(12);
    expect(datePickerRuntime.monthYearHeight).toBe(56);
    expect(datePickerRuntime.modeParallaxDistance).toBe(48);

    const style = getDatePickerStyle('modal', 'calendar', false);
    expect(style).toEqual({
      '--_date-picker-cell-size': '48px',
      '--_date-picker-horizontal-padding': '12px',
      '--_date-picker-month-year-height': '56px',
      '--_date-picker-mode-parallax': '48px',
    });
    expect(style['--_date-picker-width']).toBeUndefined();
    expect(style['--_date-picker-container-color']).toBeUndefined();
    expect(style['--_date-picker-spatial-duration']).toBeUndefined();
  });

  it('keeps modal elevation in Dialog while docked uses level3', () => {
    expect(getDatePickerElevationLevel('modal')).toBe('level0');
    expect(getDatePickerElevationLevel('docked')).toBe('level3');
  });

  it('accepts only real ISO Gregorian calendar dates', () => {
    expect(isDatePickerDate('2024-02-29')).toBe(true);
    expect(isDatePickerDate('2023-02-29')).toBe(false);
    expect(isDatePickerDate('08/26/2026')).toBe(false);
    expect(monthStart('2026-08-26')).toBe('2026-08-01');
  });

  it('orders ISO date-only values without local timezone conversion', () => {
    expect(compareDatePickerDates('2026-08-31', '2026-09-01')).toBe(-1);
    expect(compareDatePickerDates('2026-09-01', '2026-09-01')).toBe(0);
  });

  it('formats through an explicit UTC transport so calendar dates do not shift', () => {
    const formatted = formatDatePickerDate('2026-01-01', 'en-US');
    expect(formatted).toContain('2026');
    expect(formatted).toContain('Jan');
  });
});
