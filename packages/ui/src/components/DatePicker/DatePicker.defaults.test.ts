import { describe, expect, it } from 'vitest';
import {
  datePickerRuntime,
  datePickerTokens,
  getDatePickerElevationLevel,
  getDatePickerStyle,
} from './DatePicker.defaults';
import {
  compareDatePickerDates,
  formatDatePickerDate,
  isDatePickerDate,
  monthStart,
} from './DatePicker';

describe('DatePicker defaults and date-only helpers', () => {
  it('projects canonical modal, input and docked geometry without collapsing source drift', () => {
    expect(datePickerTokens.modal.width).toBe(360);
    expect(datePickerTokens.modal.height).toBe(568);
    expect(datePickerTokens.modal.webHeight).toBe(524);
    expect(datePickerTokens.modal.dateContainerSize).toBe(40);
    expect(datePickerTokens.input.width).toBe(328);
    expect(datePickerTokens.input.height).toBe(512);
    expect(datePickerTokens.docked.width).toBe(360);
    expect(datePickerTokens.docked.height).toBe(456);
    expect(datePickerTokens.docked.dateContainerSize).toBe(48);
    expect(datePickerTokens.docked.stateLayerSize).toBe(40);
  });

  it('keeps Compose layout mechanics beside the renderer', () => {
    expect(datePickerRuntime.minimumInteractiveSize).toBe(48);
    expect(datePickerRuntime.horizontalPadding).toBe(12);
    expect(datePickerRuntime.monthYearHeight).toBe(56);
    const style = getDatePickerStyle('modal', 'calendar', false);
    expect(style['--_date-picker-cell-size']).toBe('48px');
    expect(style['--_date-picker-state-layer-size']).toBe('40px');
    expect(style['--_date-picker-divider-thickness']).toBe('1px');
  });

  it('projects pinned Compose display-mode motion from canonical core motion tokens', () => {
    expect(datePickerRuntime.modeParallaxDistance).toBe(48);
    expect(datePickerRuntime.motion.defaultSpatial.duration).toBe('194ms');
    expect(datePickerRuntime.motion.defaultEffects.duration).toBe('166ms');
    expect(datePickerRuntime.motion.fastEffects.duration).toBe('108ms');
    const style = getDatePickerStyle('modal', 'calendar', false);
    expect(style['--_date-picker-mode-parallax']).toBe('48px');
    expect(style['--_date-picker-spatial-duration']).toBe('194ms');
    expect(style['--_date-picker-effects-in-duration']).toBe('166ms');
    expect(style['--_date-picker-effects-out-duration']).toBe('108ms');
  });

  it('keeps modal elevation in the Dialog owner while docked selects its canonical level3 host elevation', () => {
    expect(getDatePickerElevationLevel('modal')).toBe('level0');
    expect(getDatePickerElevationLevel('docked')).toBe(
      datePickerTokens.docked.containerElevation,
    );
    expect(getDatePickerElevationLevel('docked')).toBe('level3');
    expect(getDatePickerStyle('modal', 'calendar', false)['--_date-picker-box-shadow']).toBeUndefined();
    expect(getDatePickerStyle('docked', 'calendar', false)['--_date-picker-box-shadow']).toBeUndefined();
  });

  it('uses the explicit web input surface override beside the web consumer', () => {
    expect(datePickerTokens.input.containerColor).toBe('var(--surface)');
    expect(datePickerTokens.input.webContainerColor).toBe('var(--surface-container-high)');
    expect(getDatePickerStyle('modal', 'input', false)['--_date-picker-container-color']).toBe(
      'var(--surface-container-high)',
    );
    expect(getDatePickerStyle('modal', 'calendar', false)['--_date-picker-height']).toBe('568px');
  });

  it('keeps current Material 3 year limits as renderer defaults', () => {
    expect(datePickerRuntime.defaultYearRange).toEqual([1900, 2100]);
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
