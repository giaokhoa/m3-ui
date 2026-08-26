import { describe, expect, it } from 'vitest';
import { hour12, normalizeTime, periodForHour, withPeriod } from './TimePicker.types';
import { getTimePickerStyle, timePickerRuntime, timePickerTokens } from './TimePicker.defaults';

describe('TimePicker defaults', () => {
  it('projects canonical picker geometry', () => {
    expect(timePickerTokens.dialSize).toBe(256);
    expect(timePickerTokens.selectorSize).toBe(48);
    expect(timePickerTokens.selectorTrackWidth).toBe(2);
    expect(timePickerTokens.selectorCenterSize).toBe(8);
    expect(timePickerTokens.timeSelectorWidth).toBe(96);
    expect(timePickerTokens.timeSelector24Width).toBe(114);
    expect(timePickerTokens.timeSelectorHeight).toBe(80);
    expect(timePickerTokens.periodVWidth).toBe(52);
    expect(timePickerTokens.periodVHeight).toBe(80);
    expect(timePickerTokens.periodHWidth).toBe(216);
    expect(timePickerTokens.periodHHeight).toBe(38);
    expect(timePickerTokens.inputWidth).toBe(96);
    expect(timePickerTokens.inputHeight).toBe(72);
    expect(timePickerTokens.inputPeriodWidth).toBe(52);
    expect(timePickerTokens.inputPeriodHeight).toBe(72);
    expect(timePickerTokens.inputFocusOutlineWidth).toBe(2);
  });

  it('projects canonical typography roles instead of renderer literals', () => {
    expect(timePickerTokens.timeSelectorTypography.fontSize).toBe('57px');
    expect(timePickerTokens.inputTypography.fontSize).toBe('45px');
    expect(timePickerTokens.periodTypography.fontSize).toBe('16px');
    expect(timePickerTokens.dialLabelTypography.fontSize).toBe('16px');
    const style = getTimePickerStyle();
    expect(style['--_tp-time-selector-font-size']).toBe(
      timePickerTokens.timeSelectorTypography.fontSize,
    );
    expect(style['--_tp-input-font-size']).toBe(timePickerTokens.inputTypography.fontSize);
    expect(style['--_tp-period-font-size']).toBe(timePickerTokens.periodTypography.fontSize);
    expect(style['--_tp-dial-label-font-size']).toBe(timePickerTokens.dialLabelTypography.fontSize);
  });

  it('keeps renderer mechanics beside the consumer and uses MotionScheme projections', () => {
    expect(timePickerRuntime.dialLabelRadius).toBe(101);
    expect(timePickerRuntime.inner24HourRadius).toBe(69);
    expect(timePickerRuntime.autoHorizontalMinWidth).toBe(560);
    expect(timePickerRuntime.standardDisplayDialGap).toBe(36);
    expect(timePickerRuntime.vibrantVerticalDisplayDialGap).toBe(36);
    expect(timePickerRuntime.vibrantHorizontalDisplayDialGap).toBe(52);
    expect(timePickerRuntime.verticalClockFaceBottomSpace).toBe(24);
    expect(timePickerRuntime.vibrantVerticalPadding).toBe(12);
    expect(timePickerRuntime.vibrantHorizontalPadding).toBe(24);
    const style = getTimePickerStyle();
    expect(style['--_tp-spatial-duration']).toBe(timePickerRuntime.motion.spatialDuration);
    expect(style['--_tp-spatial-easing']).toBe(timePickerRuntime.motion.spatialEasing);
    expect(style['--_tp-effects-duration']).toBe(timePickerRuntime.motion.effectsDuration);
    expect(style['--_tp-standard-display-dial-gap']).toBe('36px');
    expect(style['--_tp-vibrant-horizontal-display-dial-gap']).toBe('52px');
  });

  it('maps standard and vibrant shapes without changing canonical picker tokens', () => {
    expect(timePickerTokens.standardFieldShape).toBe('8px');
    expect(timePickerTokens.standardPeriodShape).toBe('8px');
    expect(timePickerTokens.vibrantFieldShape).toBe('16px');
    expect(timePickerTokens.vibrantPeriodShape).toBe('9999px');
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
