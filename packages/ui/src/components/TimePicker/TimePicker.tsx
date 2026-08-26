import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';
import {
  Radio as AriaRadio,
  RadioGroup as AriaRadioGroup,
  type RadioProps as AriaRadioProps,
} from 'react-aria-components';
import { TextButton } from '../Button';
import { Ripple, useRipple } from '../../internal/ripple';
import { getTimePickerStyle, timePickerRuntime } from './TimePicker.defaults';
import {
  hour12,
  normalizeTime,
  periodForHour,
  withPeriod,
  type TimeOfDay,
  type TimePickerLayout,
  type TimePickerPeriod,
  type TimePickerSelection,
  type TimePickerVariant,
} from './TimePicker.types';
import './time-picker.css';

interface SharedProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  value?: TimeOfDay;
  defaultValue?: TimeOfDay;
  onChange?: (value: TimeOfDay) => void;
  is24Hour?: boolean;
  variant?: TimePickerVariant;
  disabled?: boolean;
}

export interface TimePickerProps extends SharedProps {
  layout?: TimePickerLayout;
  selection?: TimePickerSelection;
  defaultSelection?: TimePickerSelection;
  onSelectionChange?: (selection: TimePickerSelection) => void;
}

export interface TimeInputProps extends SharedProps {}

type TimeStateProps = Pick<SharedProps, 'value' | 'defaultValue' | 'onChange'>;
type DialTrackStyle = CSSProperties & {
  '--_tp-track-angle': string;
  '--_tp-track-length': string;
};

function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(' ');
}

function useTime({ value: controlled, defaultValue, onChange }: TimeStateProps) {
  const initial = useMemo(
    () => normalizeTime(defaultValue ?? { hour: 0, minute: 0 }),
    [],
  );
  const [inner, setInner] = useState(initial);
  const value = controlled ? normalizeTime(controlled) : inner;
  const setValue = useCallback(
    (next: TimeOfDay) => {
      const valid = normalizeTime(next);
      if (controlled === undefined) setInner(valid);
      onChange?.(valid);
    },
    [controlled, onChange],
  );
  return [value, setValue] as const;
}

function useResolvedLayout(
  requested: TimePickerLayout,
  rootRef: RefObject<HTMLDivElement | null>,
): Exclude<TimePickerLayout, 'auto'> {
  const [resolved, setResolved] = useState<Exclude<TimePickerLayout, 'auto'>>(
    requested === 'horizontal' ? 'horizontal' : 'vertical',
  );

  useEffect(() => {
    if (requested !== 'auto') {
      setResolved(requested);
      return;
    }
    const parent = rootRef.current?.parentElement;
    if (!parent) return;
    const update = () =>
      setResolved(
        parent.getBoundingClientRect().width >= timePickerRuntime.autoHorizontalMinWidth
          ? 'horizontal'
          : 'vertical',
      );
    update();
    const observer = new ResizeObserver(update);
    observer.observe(parent);
    return () => observer.disconnect();
  }, [requested, rootRef]);

  return resolved;
}

function selectorValue(value: TimeOfDay, selection: TimePickerSelection, is24: boolean) {
  return selection === 'minute' ? value.minute : is24 ? value.hour : hour12(value.hour);
}

function dialTrackStyle(
  value: TimeOfDay,
  selection: TimePickerSelection,
  is24Hour: boolean,
): DialTrackStyle {
  const angle =
    selection === 'minute' ? value.minute * 6 - 90 : (value.hour % 12) * 30 - 90;
  const innerHour =
    is24Hour && selection === 'hour' && (value.hour === 0 || value.hour >= 13);
  return {
    '--_tp-track-angle': `${angle}deg`,
    '--_tp-track-length': `${innerHour ? timePickerRuntime.inner24HourRadius : timePickerRuntime.dialLabelRadius}px`,
  };
}

function Dial({
  value,
  setValue,
  selection,
  setSelection,
  is24Hour,
  disabled,
}: {
  value: TimeOfDay;
  setValue: (v: TimeOfDay) => void;
  selection: TimePickerSelection;
  setSelection: (v: TimePickerSelection) => void;
  is24Hour: boolean;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const labels =
    selection === 'minute'
      ? Array.from({ length: 12 }, (_, i) => i * 5)
      : is24Hour
        ? Array.from({ length: 24 }, (_, i) => i)
        : Array.from({ length: 12 }, (_, i) => i + 1);

  const commitFromPoint = (clientX: number, clientY: number, finish = false) => {
    if (disabled || !ref.current) return;
    const box = ref.current.getBoundingClientRect();
    const x = clientX - (box.left + box.width / 2);
    const y = clientY - (box.top + box.height / 2);
    const radius = Math.hypot(x, y);
    if (radius < timePickerRuntime.pointerDeadZone) return;
    const angle = (Math.atan2(y, x) * 180 / Math.PI + 450) % 360;

    if (selection === 'minute') {
      setValue({ ...value, minute: Math.round(angle / 6) % 60 });
      return;
    }

    if (is24Hour) {
      const index = Math.round(angle / 30) % 12;
      const outer =
        radius >=
        (timePickerRuntime.dialLabelRadius + timePickerRuntime.inner24HourRadius) / 2;
      const outerHour = index === 0 ? 12 : index;
      const hour = outer ? outerHour : outerHour === 12 ? 0 : outerHour + 12;
      setValue({ ...value, hour });
    } else {
      const h12 = Math.round(angle / 30) % 12 || 12;
      setValue({ ...value, hour: withPeriod(h12, periodForHour(value.hour)) });
    }
    if (finish) setSelection('minute');
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    commitFromPoint(event.clientX, event.clientY);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const delta =
      event.key === 'ArrowUp' || event.key === 'ArrowRight'
        ? 1
        : event.key === 'ArrowDown' || event.key === 'ArrowLeft'
          ? -1
          : 0;
    if (delta) {
      event.preventDefault();
      if (selection === 'minute') {
        setValue({ ...value, minute: (value.minute + delta + 60) % 60 });
      } else {
        setValue({ ...value, hour: (value.hour + delta + 24) % 24 });
      }
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setSelection(selection === 'hour' ? 'minute' : 'hour');
    }
  };

  const current = selectorValue(value, selection, is24Hour);
  return (
    <div
      ref={ref}
      className="time-picker__dial"
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={selection === 'hour' ? 'Hour dial' : 'Minute dial'}
      aria-valuemin={selection === 'hour' ? (is24Hour ? 0 : 1) : 0}
      aria-valuemax={selection === 'hour' ? (is24Hour ? 23 : 12) : 59}
      aria-valuenow={current}
      aria-disabled={disabled || undefined}
      data-selection={selection}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
          commitFromPoint(event.clientX, event.clientY);
        }
      }}
      onPointerUp={(event) => {
        commitFromPoint(event.clientX, event.clientY, true);
        event.currentTarget.releasePointerCapture?.(event.pointerId);
      }}
    >
      <span
        className="time-picker__track"
        aria-hidden="true"
        style={dialTrackStyle(value, selection, is24Hour)}
      />
      <span className="time-picker__center" aria-hidden="true" />
      {labels.map((label, index) => {
        const isInner =
          selection === 'hour' && is24Hour && (label >= 13 || label === 0);
        const visualIndex = selection === 'minute' ? index : label % 12;
        const angle = visualIndex * 30 - 90;
        const radius = isInner
          ? timePickerRuntime.inner24HourRadius
          : timePickerRuntime.dialLabelRadius;
        const labelStyle = {
          '--_tp-label-x': `${Math.cos(angle * Math.PI / 180) * radius}px`,
          '--_tp-label-y': `${Math.sin(angle * Math.PI / 180) * radius}px`,
        } as CSSProperties;
        return (
          <span
            key={label}
            aria-hidden="true"
            className="time-picker__dial-label"
            data-selected={label === current || undefined}
            style={labelStyle}
          >
            {String(label).padStart(2, '0')}
          </span>
        );
      })}
    </div>
  );
}

function PeriodRadio({
  period,
  disabled,
}: {
  period: TimePickerPeriod;
  disabled?: boolean;
}) {
  const ripple = useRipple({ origin: 'center' });
  const handlePressStart: AriaRadioProps['onPressStart'] = (event) => {
    ripple.onPressStart(event);
  };
  const handlePressEnd: AriaRadioProps['onPressEnd'] = () => {
    ripple.onPressEnd();
  };

  return (
    <AriaRadio
      value={period}
      isDisabled={disabled}
      className="time-picker__period-button"
      onPressStart={handlePressStart}
      onPressEnd={handlePressEnd}
    >
      {(renderProps) => (
        <>
          <Ripple
            controller={ripple}
            isFocusVisible={renderProps.isFocusVisible}
            isHovered={renderProps.isHovered}
          />
          <span className="time-picker__period-label">{period.toUpperCase()}</span>
        </>
      )}
    </AriaRadio>
  );
}

function PeriodSelector({
  value,
  setValue,
  disabled,
  orientation = 'vertical',
}: {
  value: TimeOfDay;
  setValue: (v: TimeOfDay) => void;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
}) {
  const selected = periodForHour(value.hour);
  const setPeriod = (period: string) => {
    if (period !== 'am' && period !== 'pm') return;
    setValue({ ...value, hour: withPeriod(hour12(value.hour), period) });
  };

  return (
    <AriaRadioGroup
      className="time-picker__period"
      aria-label="AM or PM"
      value={selected}
      isDisabled={disabled}
      orientation={orientation}
      onChange={setPeriod}
    >
      {(['am', 'pm'] as TimePickerPeriod[]).map((period) => (
        <PeriodRadio key={period} period={period} disabled={disabled} />
      ))}
    </AriaRadioGroup>
  );
}

export function TimePicker({
  layout = 'auto',
  variant = 'standard',
  is24Hour = false,
  disabled,
  selection,
  defaultSelection = 'hour',
  onSelectionChange,
  value: controlled,
  defaultValue,
  onChange,
  className,
  style,
  ...domProps
}: TimePickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const resolvedLayout = useResolvedLayout(layout, rootRef);
  const [value, setValue] = useTime({ value: controlled, defaultValue, onChange });
  const [innerSelection, setInnerSelection] = useState<TimePickerSelection>(defaultSelection);
  const active = selection ?? innerSelection;
  const setSelection = (next: TimePickerSelection) => {
    if (selection === undefined) setInnerSelection(next);
    onSelectionChange?.(next);
  };

  return (
    <div
      {...domProps}
      ref={rootRef}
      className={cx('time-picker', className)}
      data-layout={resolvedLayout}
      data-layout-requested={layout}
      data-variant={variant}
      data-24-hour={is24Hour || undefined}
      style={{ ...getTimePickerStyle(), ...style }}
    >
      <div className="time-picker__selectors">
        <TextButton
          isDisabled={disabled}
          aria-pressed={active === 'hour'}
          className="time-picker__time-selector"
          data-selected={active === 'hour' || undefined}
          onPress={() => setSelection('hour')}
        >
          {String(is24Hour ? value.hour : hour12(value.hour)).padStart(2, '0')}
        </TextButton>
        <span className="time-picker__separator">:</span>
        <TextButton
          isDisabled={disabled}
          aria-pressed={active === 'minute'}
          className="time-picker__time-selector"
          data-selected={active === 'minute' || undefined}
          onPress={() => setSelection('minute')}
        >
          {String(value.minute).padStart(2, '0')}
        </TextButton>
        {!is24Hour ? (
          <PeriodSelector
            value={value}
            setValue={setValue}
            disabled={disabled}
            orientation={resolvedLayout}
          />
        ) : null}
      </div>
      <Dial
        value={value}
        setValue={setValue}
        selection={active}
        setSelection={setSelection}
        is24Hour={is24Hour}
        disabled={disabled}
      />
    </div>
  );
}

function inputValid(raw: string, kind: 'hour' | 'minute', is24Hour: boolean) {
  if (!/^\d{1,2}$/.test(raw)) return false;
  const value = Number(raw);
  return kind === 'minute'
    ? value <= 59
    : is24Hour
      ? value <= 23
      : value >= 1 && value <= 12;
}

function commitInput(
  raw: string,
  kind: 'hour' | 'minute',
  current: TimeOfDay,
  is24Hour: boolean,
  setValue: (v: TimeOfDay) => void,
) {
  if (!inputValid(raw, kind, is24Hour)) return false;
  const value = Number(raw);
  if (kind === 'minute') {
    setValue({ ...current, minute: value });
  } else {
    setValue({
      ...current,
      hour: is24Hour ? value : withPeriod(value, periodForHour(current.hour)),
    });
  }
  return true;
}

export function TimeInput({
  variant = 'standard',
  is24Hour = false,
  disabled,
  value: controlled,
  defaultValue,
  onChange,
  className,
  style,
  ...domProps
}: TimeInputProps) {
  const [value, setValue] = useTime({ value: controlled, defaultValue, onChange });
  const hourText = () =>
    String(is24Hour ? value.hour : hour12(value.hour)).padStart(2, '0');
  const minuteText = () => String(value.minute).padStart(2, '0');
  const [hourDraft, setHourDraft] = useState(hourText);
  const [minuteDraft, setMinuteDraft] = useState(minuteText);
  const hourRef = useRef<HTMLInputElement>(null);
  const minuteRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (document.activeElement !== hourRef.current) setHourDraft(hourText());
    if (document.activeElement !== minuteRef.current) setMinuteDraft(minuteText());
  }, [value.hour, value.minute, is24Hour]);

  const field = (
    kind: 'hour' | 'minute',
    draft: string,
    setDraft: (v: string) => void,
    ref: RefObject<HTMLInputElement | null>,
  ) => (
    <label className="time-input__field">
      <input
        ref={ref}
        disabled={disabled}
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={2}
        value={draft}
        aria-label={kind === 'hour' ? 'Hour' : 'Minute'}
        aria-invalid={(draft !== '' && !inputValid(draft, kind, is24Hour)) || undefined}
        onFocus={(event) => event.currentTarget.select()}
        onChange={(event) => {
          const raw = event.target.value.replace(/\D/g, '').slice(0, 2);
          setDraft(raw);
          if (
            commitInput(raw, kind, value, is24Hour, setValue) &&
            raw.length === 2 &&
            kind === 'hour'
          ) {
            minuteRef.current?.focus();
          }
        }}
        onBlur={() => setDraft(kind === 'hour' ? hourText() : minuteText())}
      />
    </label>
  );

  return (
    <div
      {...domProps}
      className={cx('time-input', className)}
      data-variant={variant}
      style={{ ...getTimePickerStyle(), ...style }}
    >
      {field('hour', hourDraft, setHourDraft, hourRef)}
      <span className="time-input__separator">:</span>
      {field('minute', minuteDraft, setMinuteDraft, minuteRef)}
      {!is24Hour ? (
        <PeriodSelector value={value} setValue={setValue} disabled={disabled} />
      ) : null}
    </div>
  );
}
