export interface TimeOfDay { hour: number; minute: number }
export type TimePickerPeriod = 'am' | 'pm';
export type TimePickerSelection = 'hour' | 'minute';
export type TimePickerLayout = 'auto' | 'horizontal' | 'vertical';
export type TimePickerVariant = 'standard' | 'vibrant';

export function normalizeTime(value: TimeOfDay): TimeOfDay {
  if (!Number.isInteger(value.hour) || value.hour < 0 || value.hour > 23) throw new RangeError('hour must be 0..23');
  if (!Number.isInteger(value.minute) || value.minute < 0 || value.minute > 59) throw new RangeError('minute must be 0..59');
  return value;
}

export function hour12(hour: number): number { const h = hour % 12; return h === 0 ? 12 : h; }
export function periodForHour(hour: number): TimePickerPeriod { return hour < 12 ? 'am' : 'pm'; }
export function withPeriod(hour: number, period: TimePickerPeriod): number {
  const base = hour % 12;
  return period === 'pm' ? base + 12 : base;
}
