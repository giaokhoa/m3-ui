import '@m3-ui/tokens/elevation.css';
import clsx from 'clsx';
import {
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { parseDate, type CalendarDate } from '@internationalized/date';
import {
  Calendar as AriaCalendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarStateContext,
  CalendarYearPicker as AriaCalendarYearPicker,
  DateField as AriaDateField,
  DateInput as AriaDateInput,
  DateSegment,
  I18nProvider,
  Label,
  RangeCalendar as AriaRangeCalendar,
  RangeCalendarStateContext,
} from 'react-aria-components';
import '../../internal/elevation/elevation.css';
import { IconButton } from '../IconButton';
import {
  datePickerRuntime,
  getDatePickerElevationLevel,
  getDatePickerStyle,
} from './DatePicker.defaults';
import type {
  DatePickerDate,
  DatePickerDisplayMode,
  DatePickerFirstDayOfWeek,
  DatePickerProps,
  DatePickerRangeValue,
  DateRangePickerProps,
} from './DatePicker.types';
import './date-picker.css';

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

type DateParts = { year: number; month: number; day: number };
type RacCalendarDate = DateParts & {
  set(fields: Partial<DateParts>): RacCalendarDate;
  toString(): string;
};
type RacCalendarState = {
  value: RacCalendarDate | null;
  setValue(value: RacCalendarDate | null): void;
  focusedDate: RacCalendarDate;
  setFocusedDate(value: RacCalendarDate): void;
  visibleRange: { start: RacCalendarDate; end: RacCalendarDate };
  focusPreviousPage(): void;
  focusNextPage(): void;
};
type RacRangeState = Omit<RacCalendarState, 'value' | 'setValue'> & {
  value: { start: RacCalendarDate; end: RacCalendarDate } | null;
  setValue(value: { start: RacCalendarDate; end: RacCalendarDate } | null): void;
};

function parts(value: DatePickerDate): DateParts | null {
  const match = ISO_DATE.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day > daysInMonth) return null;
  return { year, month, day };
}

function fromParts({ year, month, day }: DateParts): DatePickerDate {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function isDatePickerDate(value: string): value is DatePickerDate {
  return parts(value) !== null;
}

export function compareDatePickerDates(a: DatePickerDate, b: DatePickerDate): number {
  if (!isDatePickerDate(a) || !isDatePickerDate(b)) {
    throw new TypeError('DatePicker values must be ISO calendar dates (YYYY-MM-DD)');
  }
  return a < b ? -1 : a > b ? 1 : 0;
}

export function monthStart(value: DatePickerDate): DatePickerDate {
  const parsed = parts(value);
  if (!parsed) throw new TypeError(`Invalid ISO calendar date: ${value}`);
  return fromParts({ ...parsed, day: 1 });
}

export function formatDatePickerDate(value: DatePickerDate, locale: string): string {
  const parsed = parts(value);
  if (!parsed) throw new TypeError(`Invalid ISO calendar date: ${value}`);
  // UTC is only an Intl formatting transport. Selection state never becomes a JS Date.
  const instant = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day));
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(instant);
}

function formatMonthYear(value: DatePickerDate, locale: string): string {
  const parsed = parts(value);
  if (!parsed) throw new TypeError(`Invalid ISO calendar date: ${value}`);
  // UTC is only an Intl formatting transport. Calendar state stays date-only.
  const instant = new Date(Date.UTC(parsed.year, parsed.month - 1, 1));
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(instant);
}

function currentMonth(): DatePickerDate {
  const now = new Date();
  return fromParts({ year: now.getFullYear(), month: now.getMonth() + 1, day: 1 });
}

function useControllable<T>(
  controlled: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
): [T, (value: T) => void] {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const isControlled = controlled !== undefined;
  const value = isControlled ? controlled : uncontrolled;
  const setValue = (next: T) => {
    if (!isControlled) setUncontrolled(next);
    onChange?.(next);
  };
  return [value, setValue];
}

function clampYearRange(range: readonly [number, number] | undefined): readonly [number, number] {
  const [start, end] = range ?? datePickerRuntime.defaultYearRange;
  if (!Number.isInteger(start) || !Number.isInteger(end) || start > end) {
    throw new RangeError('yearRange must contain two ascending integer years');
  }
  return [start, end];
}

function isWithinYearRange(value: DatePickerDate, range: readonly [number, number]) {
  const parsed = parts(value);
  return Boolean(parsed && parsed.year >= range[0] && parsed.year <= range[1]);
}

function racDateFromIso(base: RacCalendarDate, value: DatePickerDate): RacCalendarDate {
  const parsed = parts(value);
  if (!parsed) throw new TypeError(`Invalid ISO calendar date: ${value}`);
  return base.set(parsed);
}

function dateFieldValue(value: DatePickerDate | null): CalendarDate | null {
  if (value === null) return null;
  if (!isDatePickerDate(value)) throw new TypeError(`Invalid ISO calendar date: ${value}`);
  return parseDate(value);
}

function dateFieldBounds(range: readonly [number, number]) {
  return {
    minValue: parseDate(`${String(range[0]).padStart(4, '0')}-01-01`),
    maxValue: parseDate(`${String(range[1]).padStart(4, '0')}-12-31`),
  };
}

function useDisplayedMonth(
  controlled: DatePickerDate | undefined,
  fallback: DatePickerDate | undefined,
  selected: DatePickerDate | null | undefined,
  onChange: ((value: DatePickerDate) => void) | undefined,
) {
  const initial = monthStart(controlled ?? fallback ?? selected ?? currentMonth());
  const [month, setMonth] = useControllable(controlled, initial, onChange);
  return [monthStart(month), (value: DatePickerDate) => setMonth(monthStart(value))] as const;
}

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={direction === 'left' ? 'm15.4 18-6-6 6-6-1.4-1.4L6.6 12l7.4 7.4 1.4-1.4Z' : 'm8.6 18 6-6-6-6L10 4.6l7.4 7.4-7.4 7.4L8.6 18Z'} />
    </svg>
  );
}

function EditCalendarIcon({ mode }: { mode: DatePickerDisplayMode }) {
  return mode === 'calendar' ? (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17.25V21h3.75L17.8 9.95l-3.75-3.75L3 17.25Zm17.7-10.2a1 1 0 0 0 0-1.4l-2.35-2.35a1 1 0 0 0-1.4 0l-1.85 1.85 3.75 3.75 1.85-1.85Z" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 4h-1V2h-2v2H8V2H6v2H5a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Zm1 15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8h16v8Zm0-10H4V7a1 1 0 0 1 1-1h1v2h2V6h8v2h2V6h1a1 1 0 0 1 1 1v2Z" /></svg>
  );
}

function defaultTitle(isRange: boolean, mode: DatePickerDisplayMode) {
  if (isRange) return mode === 'calendar' ? 'Select dates' : 'Enter dates';
  return mode === 'calendar' ? 'Select date' : 'Enter date';
}

function Headline({ value, locale }: { value: DatePickerDate | DatePickerRangeValue | null; locale: string }) {
  let content: ReactNode = 'No date selected';
  if (typeof value === 'string') content = formatDatePickerDate(value, locale);
  else if (value) content = `${formatDatePickerDate(value.start, locale)} – ${formatDatePickerDate(value.end, locale)}`;
  return <div className="date-picker__headline" data-testid="date-picker-headline">{content}</div>;
}

function PickerHeader({
  title, value, locale, mode, showModeToggle, onModeChange, disabled,
}: {
  title: ReactNode;
  value: DatePickerDate | DatePickerRangeValue | null;
  locale: string;
  mode: DatePickerDisplayMode;
  showModeToggle: boolean;
  onModeChange: (mode: DatePickerDisplayMode) => void;
  disabled: boolean;
}) {
  return (
    <header className="date-picker__header">
      <div className="date-picker__title">{title}</div>
      <Headline value={value} locale={locale} />
      {showModeToggle && (
        <IconButton
          aria-label={mode === 'calendar' ? 'Switch to text input mode' : 'Switch to calendar mode'}
          className="date-picker__mode-toggle"
          isDisabled={disabled}
          onPress={() => onModeChange(mode === 'calendar' ? 'input' : 'calendar')}
        >
          <EditCalendarIcon mode={mode} />
        </IconButton>
      )}
    </header>
  );
}

function useCalendarState(): RacCalendarState | RacRangeState {
  const single = useContext(CalendarStateContext) as unknown as RacCalendarState | null;
  const range = useContext(RangeCalendarStateContext) as unknown as RacRangeState | null;
  const state = single ?? range;
  if (!state) throw new Error('DatePicker calendar state is unavailable');
  return state;
}

function CalendarSync({
  value,
  displayedMonth,
  isRange,
}: {
  value: DatePickerDate | DatePickerRangeValue | null;
  displayedMonth: DatePickerDate;
  isRange: boolean;
}) {
  const state = useCalendarState();
  useEffect(() => {
    const base = state.focusedDate;
    const targetMonth = racDateFromIso(base, displayedMonth);
    if (state.focusedDate.year !== targetMonth.year || state.focusedDate.month !== targetMonth.month) {
      state.setFocusedDate(targetMonth);
    }
    if (isRange) {
      const rangeState = state as RacRangeState;
      const next = value && typeof value !== 'string'
        ? { start: racDateFromIso(base, value.start), end: racDateFromIso(base, value.end) }
        : null;
      const current = rangeState.value;
      const same = (!current && !next) || Boolean(current && next && current.start.toString() === next.start.toString() && current.end.toString() === next.end.toString());
      if (!same) rangeState.setValue(next);
    } else {
      const singleState = state as RacCalendarState;
      const next = typeof value === 'string' ? racDateFromIso(base, value) : null;
      if ((singleState.value?.toString() ?? null) !== (next?.toString() ?? null)) singleState.setValue(next);
    }
  }, [displayedMonth, isRange, state, value]);
  return null;
}

function CalendarNavigation({
  yearRange,
  displayedMonth,
  locale,
  onToggleYears,
}: {
  yearRange: readonly [number, number];
  displayedMonth: DatePickerDate;
  locale: string;
  onToggleYears: () => void;
}) {
  const state = useCalendarState();
  const start = state.visibleRange.start;
  const previousDisabled = start.year <= yearRange[0] && start.month <= 1;
  const nextDisabled = start.year >= yearRange[1] && start.month >= 12;
  return (
    <div className="date-picker__calendar-nav">
      <button type="button" className="date-picker__month-button" onClick={onToggleYears} aria-label="Choose year">
        <span className="date-picker__month-heading">{formatMonthYear(displayedMonth, locale)}</span>
        <span aria-hidden="true">▾</span>
      </button>
      <div className="date-picker__month-actions">
        <IconButton slot="previous" aria-label="Previous month" isDisabled={previousDisabled}><Chevron direction="left" /></IconButton>
        <IconButton slot="next" aria-label="Next month" isDisabled={nextDisabled}><Chevron direction="right" /></IconButton>
      </div>
    </div>
  );
}

function YearPicker({ yearRange, onChoose, onClose }: {
  yearRange: readonly [number, number];
  onChoose: (value: DatePickerDate) => void;
  onClose: () => void;
}) {
  const selectedRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: 'center' });
  }, []);
  const visibleYears = Math.max(20, (yearRange[1] - yearRange[0] + 1) * 2 + 1);
  return (
    <AriaCalendarYearPicker visibleYears={visibleYears}>
      {(picker) => (
        <div className="date-picker__year-picker" role="listbox" aria-label="Choose year" data-testid="date-picker-year-picker">
          {picker.items
            .filter((item) => item.date.year >= yearRange[0] && item.date.year <= yearRange[1])
            .map((item) => {
              const selected = picker.value === item.id;
              return (
                <button
                  key={item.id}
                  ref={selected ? selectedRef : undefined}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className="date-picker__year"
                  data-selected={selected || undefined}
                  onClick={() => {
                    onChoose(item.date.toString());
                    onClose();
                  }}
                >
                  {item.formatted}
                </button>
              );
            })}
        </div>
      )}
    </AriaCalendarYearPicker>
  );
}

function DateGrid() {
  return (
    <CalendarGrid className="date-picker__grid" weekdayStyle="narrow">
      <CalendarGridHeader>
        {(day) => <CalendarHeaderCell className="date-picker__weekday">{day}</CalendarHeaderCell>}
      </CalendarGridHeader>
      <CalendarGridBody>
        {(date) => (
          <CalendarCell date={date} className="date-picker__cell">
            {({ formattedDate }) => <span className="date-picker__day-surface">{formattedDate}</span>}
          </CalendarCell>
        )}
      </CalendarGridBody>
    </CalendarGrid>
  );
}

interface CalendarBodyBase {
  displayedMonth: DatePickerDate;
  onDisplayedMonthChange: (value: DatePickerDate) => void;
  yearRange: readonly [number, number];
  locale: string;
  firstDayOfWeek?: DatePickerFirstDayOfWeek;
  isDateUnavailable?: (date: DatePickerDate) => boolean;
  disabled: boolean;
}

function SingleCalendarBody(props: CalendarBodyBase & { value: DatePickerDate | null; onChange: (value: DatePickerDate) => void }) {
  const [showYears, setShowYears] = useState(false);
  return (
    <AriaCalendar
      aria-label="Date picker calendar"
      onChange={(date) => props.onChange(date.toString())}
      onFocusChange={(date) => props.onDisplayedMonthChange(date.toString())}
      firstDayOfWeek={props.firstDayOfWeek}
      isDateUnavailable={(date) => !isWithinYearRange(date.toString(), props.yearRange) || Boolean(props.isDateUnavailable?.(date.toString()))}
      isDisabled={props.disabled}
      className="date-picker__calendar"
    >
      <CalendarSync value={props.value} displayedMonth={props.displayedMonth} isRange={false} />
      <CalendarNavigation yearRange={props.yearRange} displayedMonth={props.displayedMonth} locale={props.locale} onToggleYears={() => setShowYears((v) => !v)} />
      <div hidden={showYears}><DateGrid /></div>
      {showYears && <YearPicker yearRange={props.yearRange} onChoose={props.onDisplayedMonthChange} onClose={() => setShowYears(false)} />}
    </AriaCalendar>
  );
}

function RangeCalendarBody(props: CalendarBodyBase & { value: DatePickerRangeValue | null; onChange: (value: DatePickerRangeValue) => void }) {
  const [showYears, setShowYears] = useState(false);
  return (
    <AriaRangeCalendar
      aria-label="Date range picker calendar"
      onChange={(range) => props.onChange({ start: range.start.toString(), end: range.end.toString() })}
      onFocusChange={(date) => props.onDisplayedMonthChange(date.toString())}
      firstDayOfWeek={props.firstDayOfWeek}
      isDateUnavailable={(date) => !isWithinYearRange(date.toString(), props.yearRange) || Boolean(props.isDateUnavailable?.(date.toString()))}
      isDisabled={props.disabled}
      className="date-picker__calendar"
    >
      <CalendarSync value={props.value} displayedMonth={props.displayedMonth} isRange />
      <CalendarNavigation yearRange={props.yearRange} displayedMonth={props.displayedMonth} locale={props.locale} onToggleYears={() => setShowYears((v) => !v)} />
      <div hidden={showYears}><DateGrid /></div>
      {showYears && <YearPicker yearRange={props.yearRange} onChoose={props.onDisplayedMonthChange} onClose={() => setShowYears(false)} />}
    </AriaRangeCalendar>
  );
}

function DateInput({ value, onChange, onCommit, yearRange, unavailable, disabled, focusOnMount, label = 'Date' }: {
  value: DatePickerDate | null;
  onChange: (value: DatePickerDate | null, valid: boolean) => void;
  onCommit?: (value: DatePickerDate | null, valid: boolean) => void;
  yearRange: readonly [number, number];
  unavailable?: (value: DatePickerDate) => boolean;
  disabled: boolean;
  focusOnMount?: boolean;
  label?: string;
}) {
  const [draft, setDraft] = useState<CalendarDate | null>(() => dateFieldValue(value));
  const bounds = dateFieldBounds(yearRange);
  const invalid = draft !== null
    && (!isWithinYearRange(draft.toString(), yearRange) || Boolean(unavailable?.(draft.toString())));

  useEffect(() => {
    const next = dateFieldValue(value);
    if ((draft?.toString() ?? null) !== (next?.toString() ?? null)) setDraft(next);
    // Sync only when the public/draft ISO value changes. RAC retains incomplete segment edits internally.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <AriaDateField
      aria-label={label}
      className="date-picker__input-field"
      value={draft}
      minValue={bounds.minValue}
      maxValue={bounds.maxValue}
      isDateUnavailable={(date) => Boolean(unavailable?.(date.toString()))}
      isInvalid={invalid}
      isDisabled={disabled}
      autoFocus={focusOnMount}
      onBlur={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
        const iso = draft?.toString() ?? null;
        const valid = iso === null || (isWithinYearRange(iso, yearRange) && !unavailable?.(iso));
        onCommit?.(iso, valid);
      }}
      onChange={(next) => {
        setDraft(next);
        const iso = next?.toString() ?? null;
        const valid = iso === null || (isWithinYearRange(iso, yearRange) && !unavailable?.(iso));
        onChange(iso, valid);
      }}
    >
      <Label className="date-picker__input-label">{label}</Label>
      <AriaDateInput className="date-picker__date-input">
        {(segment) => <DateSegment segment={segment} className="date-picker__date-segment" />}
      </AriaDateInput>
    </AriaDateField>
  );
}

function classes(className: string | undefined, range: boolean) {
  return clsx('date-picker', 'elevation-host', range && 'date-picker--range', className);
}

export function DatePicker({
  value: controlledValue, defaultValue = null, onChange, locale = 'en-US', firstDayOfWeek,
  yearRange: yearRangeProp, displayedMonth: controlledMonth, defaultDisplayedMonth,
  onDisplayedMonthChange, displayMode: controlledMode, defaultDisplayMode = 'calendar',
  onDisplayModeChange, showModeToggle = true, variant = 'modal', title, isDateUnavailable,
  isDisabled = false, errorMessage, className, style, ...domProps
}: DatePickerProps) {
  const yearRange = clampYearRange(yearRangeProp);
  const [value, setValue] = useControllable<DatePickerDate | null>(controlledValue, defaultValue, onChange);
  const [mode, setMode] = useControllable(controlledMode, defaultDisplayMode, onDisplayModeChange);
  const effectiveMode = variant === 'docked' ? 'calendar' : mode;
  const [displayedMonth, setDisplayedMonth] = useDisplayedMonth(controlledMonth, defaultDisplayedMonth, value, onDisplayedMonthChange);
  return (
    <I18nProvider locale={locale}>
      <div
        {...domProps}
        className={classes(className, false)}
        data-display-mode={effectiveMode}
        data-elevation={getDatePickerElevationLevel(variant)}
        data-variant={variant}
        data-disabled={isDisabled || undefined}
        data-testid={domProps['data-testid'] ?? 'date-picker'}
        style={{ ...getDatePickerStyle(variant, effectiveMode, false), ...style }}
      >
        <PickerHeader title={title ?? defaultTitle(false, effectiveMode)} value={value} locale={locale} mode={effectiveMode} showModeToggle={variant !== 'docked' && showModeToggle} onModeChange={setMode} disabled={isDisabled} />
        <div className="date-picker__content" key={effectiveMode}>
          {effectiveMode === 'calendar' ? (
            <SingleCalendarBody value={value} onChange={setValue} displayedMonth={displayedMonth} onDisplayedMonthChange={setDisplayedMonth} yearRange={yearRange} locale={locale} firstDayOfWeek={firstDayOfWeek} isDateUnavailable={isDateUnavailable} disabled={isDisabled} />
          ) : (
            <div className="date-picker__input-content">
              <DateInput value={value} onChange={(next, valid) => { if (valid) setValue(next); }} yearRange={yearRange} unavailable={isDateUnavailable} disabled={isDisabled} focusOnMount />
              {errorMessage && <div className="date-picker__error" role="alert">{errorMessage}</div>}
            </div>
          )}
        </div>
      </div>
    </I18nProvider>
  );
}

export function DateRangePicker({
  value: controlledValue, defaultValue = null, onChange, locale = 'en-US', firstDayOfWeek,
  yearRange: yearRangeProp, displayedMonth: controlledMonth, defaultDisplayedMonth,
  onDisplayedMonthChange, displayMode: controlledMode, defaultDisplayMode = 'calendar',
  onDisplayModeChange, showModeToggle = true, variant = 'modal', title, isDateUnavailable,
  isDisabled = false, errorMessage, className, style, ...domProps
}: DateRangePickerProps) {
  const yearRange = clampYearRange(yearRangeProp);
  const [value, setValue] = useControllable<DatePickerRangeValue | null>(controlledValue, defaultValue, onChange);
  const [mode, setMode] = useControllable(controlledMode, defaultDisplayMode, onDisplayModeChange);
  const effectiveMode = variant === 'docked' ? 'calendar' : mode;
  const [displayedMonth, setDisplayedMonth] = useDisplayedMonth(controlledMonth, defaultDisplayedMonth, value?.start, onDisplayedMonthChange);
  const [startDraft, setStartDraft] = useState<DatePickerDate | null>(value?.start ?? null);
  const [endDraft, setEndDraft] = useState<DatePickerDate | null>(value?.end ?? null);
  const [rangeError, setRangeError] = useState(false);
  useEffect(() => { setStartDraft(value?.start ?? null); setEndDraft(value?.end ?? null); }, [value?.start, value?.end]);
  const commitDraft = (start: DatePickerDate | null, end: DatePickerDate | null) => {
    if (!start && !end) { setRangeError(false); setValue(null); return; }
    if (!start || !end) { setRangeError(false); return; }
    const fieldsValid = isWithinYearRange(start, yearRange)
      && isWithinYearRange(end, yearRange)
      && !isDateUnavailable?.(start)
      && !isDateUnavailable?.(end);
    const ordered = compareDatePickerDates(start, end) <= 0;
    setRangeError(fieldsValid && !ordered);
    if (fieldsValid && ordered) setValue({ start, end });
  };
  return (
    <I18nProvider locale={locale}>
      <div
        {...domProps}
        className={classes(className, true)}
        data-display-mode={effectiveMode}
        data-elevation={getDatePickerElevationLevel(variant)}
        data-variant={variant}
        data-disabled={isDisabled || undefined}
        data-testid={domProps['data-testid'] ?? 'date-range-picker'}
        style={{ ...getDatePickerStyle(variant, effectiveMode, true), ...style }}
      >
        <PickerHeader title={title ?? defaultTitle(true, effectiveMode)} value={value} locale={locale} mode={effectiveMode} showModeToggle={variant !== 'docked' && showModeToggle} onModeChange={setMode} disabled={isDisabled} />
        <div className="date-picker__content" key={effectiveMode}>
          {effectiveMode === 'calendar' ? (
            <RangeCalendarBody value={value} onChange={setValue} displayedMonth={displayedMonth} onDisplayedMonthChange={setDisplayedMonth} yearRange={yearRange} locale={locale} firstDayOfWeek={firstDayOfWeek} isDateUnavailable={isDateUnavailable} disabled={isDisabled} />
          ) : (
            <div className="date-picker__input-content date-picker__range-inputs" role="group" aria-label="Date range">
              <DateInput
                label="Start date"
                value={startDraft}
                onChange={(next) => setStartDraft(next)}
                onCommit={(next, valid) => { if (valid) commitDraft(next, endDraft); }}
                yearRange={yearRange}
                unavailable={isDateUnavailable}
                disabled={isDisabled}
                focusOnMount
              />
              <DateInput
                label="End date"
                value={endDraft}
                onChange={(next) => setEndDraft(next)}
                onCommit={(next, valid) => { if (valid) commitDraft(startDraft, next); }}
                yearRange={yearRange}
                unavailable={isDateUnavailable}
                disabled={isDisabled}
              />
              {(rangeError || errorMessage) && <div className="date-picker__error" role="alert">{rangeError ? 'End date must be on or after start date.' : errorMessage}</div>}
            </div>
          )}
        </div>
      </div>
    </I18nProvider>
  );
}
