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
  it('keeps only the renderer-owned year range in TypeScript defaults', () => {
    expect(datePickerRuntime.defaultYearRange).toEqual([1900, 2100]);
  });

  it('keeps modal elevation in Dialog while docked uses level3', () => {
    expect(getDatePickerElevationLevel('modal')).toBe('level0');
    expect(getDatePickerElevationLevel('docked')).toBe('level3');
  });

  it('does not project immutable static defaults inline', () => {
    expect(getDatePickerStyle('modal', 'calendar', false)).toEqual({});
    expect(getDatePickerStyle('docked', 'calendar', false)).toEqual({});
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
