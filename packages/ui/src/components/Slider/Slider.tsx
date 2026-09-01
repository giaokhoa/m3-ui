import { useMemo, type CSSProperties, type ReactNode } from 'react';
import {
  Label as AriaLabel,
  Slider as AriaSlider,
  SliderThumb as AriaSliderThumb,
  SliderTrack as AriaSliderTrack,
  type SliderProps as AriaSliderProps,
  type SliderThumbRenderProps,
  type SliderTrackRenderProps,
} from 'react-aria-components';
import { Ripple, useRipple } from '../../internal/ripple';
import { getSliderStyle } from './Slider.defaults';
import type { SliderRangeValue, SliderSize } from './Slider.types';
import './slider.css';

interface MaterialSliderProps {
  /** Visible label. Supply aria-label/aria-labelledby instead for control-only use. */
  label?: ReactNode;
  /** Current Material 3 size family. xSmall is the Compose baseline geometry. */
  size?: SliderSize;
  /** Material Web adaptation: render discrete tick marks for the configured step. */
  showTicks?: boolean;
  /** Material Web adaptation: show a value indicator while a thumb is active. */
  showValueIndicator?: boolean;
  /** Per-thumb accessible labels; required for a range when the root label is not a string. */
  thumbLabels?: readonly string[];
  /** Optional visual formatter for the value indicator. */
  getValueLabel?: (value: number, index: number) => ReactNode;
}

export interface SliderProps
  extends Omit<AriaSliderProps<number>, 'children'>,
    MaterialSliderProps {}

export interface RangeSliderProps
  extends Omit<
      AriaSliderProps<number[]>,
      'children' | 'value' | 'defaultValue' | 'onChange' | 'onChangeEnd'
    >,
    MaterialSliderProps {
  value?: SliderRangeValue;
  defaultValue?: SliderRangeValue;
  onChange?: (value: SliderRangeValue) => void;
  onChangeEnd?: (value: SliderRangeValue) => void;
}

type SegmentStyle = CSSProperties & Record<`--${string}`, string | number>;

function cx(...values: Array<string | undefined | false>): string {
  return values.filter(Boolean).join(' ');
}

function thumbLabel(
  label: ReactNode,
  thumbLabels: readonly string[] | undefined,
  index: number,
  count: number,
  rootAriaLabel: string | undefined,
): string | undefined {
  if (thumbLabels?.[index]) return thumbLabels[index];
  if (count === 1) {
    if (typeof label === 'string') return label;
    return rootAriaLabel;
  }
  const base = typeof label === 'string' ? label : rootAriaLabel;
  if (!base) return undefined;
  if (count === 2) return `${base} ${index === 0 ? 'start' : 'end'}`;
  return `${base} ${index + 1}`;
}

function rangeTuple(values: number[]): SliderRangeValue {
  return [values[0] ?? 0, values[1] ?? values[0] ?? 0];
}

function activeBounds(state: SliderTrackRenderProps['state']): [number, number] {
  if (state.values.length > 1) {
    return [state.getThumbPercent(0) * 100, state.getThumbPercent(state.values.length - 1) * 100];
  }
  return [0, state.getThumbPercent(0) * 100];
}

function segmentStyle(
  start: number,
  end: number,
  orientation: SliderTrackRenderProps['orientation'],
): SegmentStyle {
  const size = Math.max(0, end - start);
  return orientation === 'vertical'
    ? { bottom: `${start}%`, height: `${size}%` }
    : { insetInlineStart: `${start}%`, width: `${size}%` };
}

function TrackSegments({ renderProps }: { renderProps: SliderTrackRenderProps }) {
  const { state, orientation } = renderProps;
  const [activeStart, activeEnd] = activeBounds(state);
  const isRange = state.values.length > 1;

  return (
    <span aria-hidden="true" className="slider__segments">
      {activeStart > 0 ? (
        <span
          className="slider__segment slider__segment--inactive slider__segment--leading"
          style={segmentStyle(0, activeStart, orientation)}
        />
      ) : null}
      {activeEnd > activeStart ? (
        <span
          className={cx(
            'slider__segment',
            'slider__segment--active',
            isRange && 'slider__segment--range',
          )}
          style={segmentStyle(activeStart, activeEnd, orientation)}
        />
      ) : null}
      {activeEnd < 100 ? (
        <span
          className="slider__segment slider__segment--inactive slider__segment--trailing"
          style={segmentStyle(activeEnd, 100, orientation)}
        />
      ) : null}
      <span
        className="slider__stop"
        data-selected={activeEnd >= 100 || undefined}
      />
    </span>
  );
}

function TickMarks({
  renderProps,
  minValue,
  maxValue,
  step,
}: {
  renderProps: SliderTrackRenderProps;
  minValue: number;
  maxValue: number;
  step: number;
}) {
  const ticks = useMemo(() => {
    if (!(Number.isFinite(step) && step > 0 && maxValue > minValue)) return [];
    const range = maxValue - minValue;
    const count = Math.floor(range / step + 1e-9);
    const result = Array.from({ length: count + 1 }, (_, index) => minValue + index * step);
    if (result[result.length - 1] < maxValue - 1e-9) result.push(maxValue);
    return result;
  }, [maxValue, minValue, step]);
  const [activeStart, activeEnd] = activeBounds(renderProps.state);

  return (
    <span aria-hidden="true" className="slider__ticks">
      {ticks.map((value, index) => {
        const percent = ((value - minValue) / (maxValue - minValue)) * 100;
        const selected = percent >= activeStart - 1e-7 && percent <= activeEnd + 1e-7;
        const style: CSSProperties =
          renderProps.orientation === 'vertical'
            ? { bottom: `${percent}%` }
            : { insetInlineStart: `${percent}%` };
        return (
          <span
            key={`${index}-${value}`}
            className="slider__tick"
            data-selected={selected || undefined}
            style={style}
          />
        );
      })}
    </span>
  );
}

function ThumbVisual({
  renderProps,
  index,
  showValueIndicator,
  getValueLabel,
}: {
  renderProps: SliderThumbRenderProps;
  index: number;
  showValueIndicator: boolean;
  getValueLabel?: MaterialSliderProps['getValueLabel'];
}) {
  const ripple = useRipple({ origin: 'center' });
  const value = renderProps.state.values[index] ?? 0;
  const active = renderProps.isDragging || renderProps.isFocused || renderProps.isHovered;

  return (
    <>
      <span aria-hidden="true" className="slider__handle">
        <Ripple
          controller={ripple}
          focusRingRadius="var(--_slider-handle-radius)"
          state={{ isFocusVisible: renderProps.isFocusVisible }}
        />
        <span className="slider__handle-nub" />
      </span>
      {showValueIndicator && active ? (
        <span aria-hidden="true" className="slider__value-indicator">
          {getValueLabel ? getValueLabel(value, index) : value}
        </span>
      ) : null}
    </>
  );
}

interface MaterialSliderBodyProps extends MaterialSliderProps {
  minValue: number;
  maxValue: number;
  step: number;
  rootAriaLabel?: string;
}

function MaterialSliderBody({
  label,
  showTicks = false,
  showValueIndicator = false,
  thumbLabels,
  getValueLabel,
  minValue,
  maxValue,
  step,
  rootAriaLabel,
}: MaterialSliderBodyProps) {
  return (
    <>
      {label ? <AriaLabel className="slider__label">{label}</AriaLabel> : null}
      <AriaSliderTrack className="slider__track">
        {(trackProps) => {
          const thumbCount = trackProps.state.values.length;
          return (
            <>
              <TrackSegments renderProps={trackProps} />
              {showTicks ? (
                <TickMarks
                  maxValue={maxValue}
                  minValue={minValue}
                  renderProps={trackProps}
                  step={step}
                />
              ) : null}
              {trackProps.state.values.map((_, index) => (
                <AriaSliderThumb
                  key={index}
                  aria-label={thumbLabel(label, thumbLabels, index, thumbCount, rootAriaLabel)}
                  className="slider__thumb"
                  index={index}
                >
                  {(thumbProps) => (
                    <ThumbVisual
                      getValueLabel={getValueLabel}
                      index={index}
                      renderProps={thumbProps}
                      showValueIndicator={showValueIndicator}
                    />
                  )}
                </AriaSliderThumb>
              ))}
            </>
          );
        }}
      </AriaSliderTrack>
    </>
  );
}

export function Slider({
  label,
  size = 'xSmall',
  showTicks,
  showValueIndicator,
  thumbLabels,
  getValueLabel,
  className,
  style,
  minValue = 0,
  maxValue = 100,
  step = 1,
  ...props
}: SliderProps) {
  return (
    <AriaSlider
      {...props}
      minValue={minValue}
      maxValue={maxValue}
      step={step}
      data-size={size}
      className={(renderProps) => {
        const userClassName = typeof className === 'function' ? className(renderProps) : className;
        return cx('slider', userClassName);
      }}
      style={(renderProps) => {
        const userStyle = typeof style === 'function' ? style(renderProps) : style;
        return { ...getSliderStyle(size), ...userStyle };
      }}
    >
      <MaterialSliderBody
        getValueLabel={getValueLabel}
        label={label}
        maxValue={maxValue}
        minValue={minValue}
        rootAriaLabel={props['aria-label']}
        showTicks={showTicks}
        showValueIndicator={showValueIndicator}
        step={step}
        thumbLabels={thumbLabels}
      />
    </AriaSlider>
  );
}

export function RangeSlider({
  label,
  size = 'xSmall',
  showTicks,
  showValueIndicator,
  thumbLabels,
  getValueLabel,
  className,
  style,
  minValue = 0,
  maxValue = 100,
  step = 1,
  value,
  defaultValue = [minValue, maxValue],
  onChange,
  onChangeEnd,
  ...props
}: RangeSliderProps) {
  return (
    <AriaSlider<number[]>
      {...props}
      value={value ? [...value] : undefined}
      defaultValue={[...defaultValue]}
      minValue={minValue}
      maxValue={maxValue}
      step={step}
      onChange={onChange ? (next) => onChange(rangeTuple(next)) : undefined}
      onChangeEnd={onChangeEnd ? (next) => onChangeEnd(rangeTuple(next)) : undefined}
      data-size={size}
      className={(renderProps) => {
        const userClassName = typeof className === 'function' ? className(renderProps) : className;
        return cx('slider', 'slider--range', userClassName);
      }}
      style={(renderProps) => {
        const userStyle = typeof style === 'function' ? style(renderProps) : style;
        return { ...getSliderStyle(size), ...userStyle };
      }}
    >
      <MaterialSliderBody
        getValueLabel={getValueLabel}
        label={label}
        maxValue={maxValue}
        minValue={minValue}
        rootAriaLabel={props['aria-label']}
        showTicks={showTicks}
        showValueIndicator={showValueIndicator}
        step={step}
        thumbLabels={thumbLabels}
      />
    </AriaSlider>
  );
}
