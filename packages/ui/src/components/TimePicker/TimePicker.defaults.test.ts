import { describe, expect, it } from 'vitest';
import { hour12, normalizeTime, periodForHour, withPeriod } from './TimePicker.types';
import { getTimePickerStyle, timePickerRuntime } from './TimePicker.defaults';

describe('TimePicker runtime defaults', () => {
  it('keeps dial geometry and renderer layout mechanics in TypeScript', () => {
    expect(timePickerRuntime.dialLabelRadius).toBe(101);
    expect(timePickerRuntime.inner24HourRadius).toBe(69);
    expect(timePickerRuntime.pointerDeadZone).toBe(30);
    expect(timePickerRuntime.autoHorizontalMinWidth).toBe(560);
    expect(timePickerRuntime.standardDisplayDialGap).toBe(36);
    expect(timePickerRuntime.vibrantVerticalDisplayDialGap).toBe(36);
    expect(timePickerRuntime.vibrantHorizontalDisplayDialGap).toBe(52);
    expect(timePickerRuntime.verticalClockFaceBottomSpace).toBe(24);
    expect(timePickerRuntime.vibrantVerticalPadding).toBe(12);
    expect(timePickerRuntime.vibrantHorizontalPadding).toBe(24);
  });

  it('projects only renderer layout geometry, not static tokens or motion', () => {
    const style = getTimePickerStyle();
    expect(style).toEqual({
      '--_tp-standard-display-dial-gap': '36px',
      '--_tp-vibrant-vertical-display-dial-gap': '36px',
      '--_tp-vibrant-horizontal-display-dial-gap': '52px',
      '--_tp-vertical-clock-face-bottom-space': '24px',
      '--_tp-vibrant-vertical-padding': '12px',
      '--_tp-vibrant-horizontal-padding': '24px',
    });
    expect(style['--_tp-dial-size']).toBeUndefined();
    expect(style['--_tp-dial-color']).toBeUndefined();
    expect(style['--_tp-spatial-duration']).toBeUndefined();
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
