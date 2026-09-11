import type { HTMLAttributes, ReactNode } from 'react';

/** A Gregorian calendar date represented without a time zone, e.g. `2026-08-26`. */
export type DatePickerDate = string;
export type DatePickerDisplayMode = 'calendar' | 'input';
export type DatePickerVariant = 'modal' | 'docked';
export type DatePickerFirstDayOfWeek =
  | 'sun'
  | 'mon'
  | 'tue'
  | 'wed'
  | 'thu'
  | 'fri'
  | 'sat';

export interface DatePickerRangeValue {
  start: DatePickerDate;
  end: DatePickerDate;
}

export interface DatePickerCommonProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'defaultValue' | 'onChange' | 'title'
  > {
  /** Locale used for month, weekday and headline formatting. */
  locale?: string;
  /** Logical first day of the week. React Aria otherwise uses the locale default. */
  firstDayOfWeek?: DatePickerFirstDayOfWeek;
  /** Inclusive year limits. Mirrors the current Material 3 default of 1900–2100. */
  yearRange?: readonly [number, number];
  /** Date that anchors the visible month. Use an ISO calendar date, not a JS Date. */
  displayedMonth?: DatePickerDate;
  defaultDisplayedMonth?: DatePickerDate;
  onDisplayedMonthChange?: (month: DatePickerDate) => void;
  displayMode?: DatePickerDisplayMode;
  defaultDisplayMode?: DatePickerDisplayMode;
  onDisplayModeChange?: (mode: DatePickerDisplayMode) => void;
  /** Whether the calendar/input mode toggle is shown. */
  showModeToggle?: boolean;
  /** Modal is the Compose DatePicker surface; docked uses the current docked token family. */
  variant?: DatePickerVariant;
  title?: ReactNode;
  /** Return true to keep a date focusable but prevent it from being selected. */
  isDateUnavailable?: (date: DatePickerDate) => boolean;
  isDisabled?: boolean;
  /** Optional message rendered when manual input is invalid. */
  errorMessage?: ReactNode;
  /** Explicit test hook, kept typed because React's HTML attribute type does not index data attrs. */
  'data-testid'?: string;
}

export interface DatePickerProps extends DatePickerCommonProps {
  value?: DatePickerDate | null;
  defaultValue?: DatePickerDate | null;
  onChange?: (value: DatePickerDate | null) => void;
}

export interface DateRangePickerProps extends DatePickerCommonProps {
  value?: DatePickerRangeValue | null;
  defaultValue?: DatePickerRangeValue | null;
  onChange?: (value: DatePickerRangeValue | null) => void;
}
