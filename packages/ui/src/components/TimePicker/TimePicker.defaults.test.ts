import { describe, expect, it } from 'vitest';
import { hour12, normalizeTime, periodForHour, withPeriod } from './TimePicker.types';
import { getTimePickerStyle, timePickerRuntime } from './TimePicker.defaults';

describe('TimePicker runtime defaults', () => {
  it('keeps only geometry required by dial interaction and responsive layout', () => {
    expect(timePickerRuntime.dialLabelRadius).toBe(101);
    expect(timePickerRuntime.inner24HourRadius).toBe(69);
    expect(timePickerRuntime.pointerDeadZone).toBe(30);
    expect(timePickerRuntime.autoHorizontalMinWidth).toBe(560);
  });

  it('does not project immutable static defaults inline', () => {
    expect(getTimePickerStyle()).toEqual({});
  });

  it('keeps time-of-day state independent from Date/timezone', () => {
    expect(normalizeTime({ hour: 23, minute: 59 })).toEqual({ hour: 23, minute: 59 });
    expect(() => normalizeTime({ hour: 24, minute: 0 })).toThrow(RangeError);
    expect(() => normalizeTime({ hour: 12, minute: 60 })).toThrow(RangeError);
  });

  it('maps midnight/noon and periods without ambiguity', () => {
    expect(hour12(0)).toBe(12);
    expect(periodForHour(0)).toBe('am');
    expect(hour12(12)).toBe(12);
    expect(periodForHour(12)).toBe('pm');
    expect(withPeriod(12, 'am')).toBe(0);
    expect(withPeriod(12, 'pm')).toBe(12);
    expect(withPeriod(3, 'pm')).toBe(15);
  });
});
