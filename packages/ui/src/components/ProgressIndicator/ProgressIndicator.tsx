import clsx from 'clsx';
import { useId, useSyncExternalStore, type CSSProperties } from 'react';
import {
  ProgressBar as AriaProgressBar,
  type ProgressBarProps as AriaProgressBarProps,
} from 'react-aria-components';
import {
  getProgressIndicatorStyle,
  progressIndicatorRuntime,
  progressIndicatorTokens,
} from './ProgressIndicator.defaults';
import {
  buildCircularWavePath,
  buildLinearWavePath,
  defaultWavyAmplitude,
  progressFraction,
} from './ProgressIndicator.geometry';
import './progress-indicator.css';

function subscribeReducedMotion(callback: () => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}

function getReducedMotionSnapshot(): boolean {
  return typeof window !== 'undefined' &&
    Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => true,
  );
}

interface MaterialProgressProps {
  color?: CSSProperties['color'];
  trackColor?: CSSProperties['color'];
}

export interface LinearProgressIndicatorProps
  extends Omit<AriaProgressBarProps, 'children' | 'style'>,
    MaterialProgressProps {
  /** Web public adaptation: known buffered progress, in the same range as value. */
  bufferValue?: number;
  /** Web public adaptation for indeterminate mode. */
  fourColor?: boolean;
  style?: AriaProgressBarProps['style'];
}

export interface CircularProgressIndicatorProps
  extends Omit<AriaProgressBarProps, 'children' | 'style'>,
    MaterialProgressProps {
  /** Web public adaptation for indeterminate mode. */
  fourColor?: boolean;
  style?: AriaProgressBarProps['style'];
}

export interface WavyProgressIndicatorProps extends MaterialProgressProps {
  /** 0..1 of the canonical active-wave amplitude. */
  amplitude?: number | ((progress: number) => number);
  /** Wave length in CSS pixels. Defaults to the canonical component token. */
  wavelength?: number;
  /** Wave travel speed in CSS pixels per second. Defaults to one wavelength per second. */
  waveSpeed?: number;
}

export interface LinearWavyProgressIndicatorProps
  extends Omit<
      LinearProgressIndicatorProps,
      'bufferValue' | 'fourColor' | 'color' | 'trackColor'
    >,
    WavyProgressIndicatorProps {}

export interface CircularWavyProgressIndicatorProps
  extends Omit<
      CircularProgressIndicatorProps,
      'fourColor' | 'color' | 'trackColor'
    >,
    WavyProgressIndicatorProps {}

function classes(
  kind: 'linear' | 'circular',
  wavy: boolean,
  userClassName: string | undefined,
): string {
  return clsx(
    'progress-indicator',
    `progress-indicator--${kind}`,
    wavy ? 'progress-indicator--wavy' : 'progress-indicator--standard',
    userClassName,
  );
}

function resolvedAmplitude(
  amplitude: WavyProgressIndicatorProps['amplitude'],
  progress: number,
): number {
  const value =
    typeof amplitude === 'function'
      ? amplitude(progress)
      : amplitude ?? defaultWavyAmplitude(progress);
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function LinearDeterminateVisual({
  fraction,
  wavy,
  amplitude,
  wavelength,
  waveSpeed,
}: {
  fraction: number;
  wavy: boolean;
  amplitude?: WavyProgressIndicatorProps['amplitude'];
  wavelength?: number;
  waveSpeed?: number;
}) {
  const width = progressIndicatorRuntime.linearWidth;
  const height = wavy
    ? progressIndicatorTokens.linear.waveHeight
    : progressIndicatorTokens.linear.height;
  const activeThickness = progressIndicatorTokens.linear.activeThickness;
  const trackThickness = progressIndicatorTokens.linear.trackThickness;
  const gap = progressIndicatorTokens.linear.trackActiveSpace + activeThickness;
  const stopSize = progressIndicatorTokens.linear.stopSize;
  const stopCenter =
    width - stopSize / 2 - progressIndicatorTokens.linear.stopTrailingSpace;
  const progressX = width * fraction;
  const trackStart = fraction <= 0 ? 0 : Math.min(width, progressX + gap);
  const trackLineStart = Math.min(width, trackStart + trackThickness / 2);
  const trackLineEnd = Math.max(
    0,
    stopCenter - stopSize / 2 - trackThickness / 2,
  );
  const activeEnd = Math.max(0, Math.min(width, progressX));
  const defaultWavelength = progressIndicatorTokens.linear.waveWavelength;
  const resolvedWavelength = Math.max(0, wavelength ?? defaultWavelength);
  const amplitudeFactor = resolvedAmplitude(amplitude, fraction);
  const waveAmplitude =
    progressIndicatorTokens.linear.waveAmplitude * amplitudeFactor;
  const wavePath = buildLinearWavePath(
    width,
    height,
    waveAmplitude,
    resolvedWavelength,
    resolvedWavelength,
  );
  const clipId = useId().replace(/:/g, '');
  const phaseStyle = {
    '--_progress-wave-wavelength': `${resolvedWavelength}px`,
    '--_progress-wave-duration':
      resolvedWavelength > 0 && (waveSpeed ?? resolvedWavelength) > 0
        ? `${resolvedWavelength / (waveSpeed ?? resolvedWavelength)}s`
        : '0s',
  } as CSSProperties;

  return (
    <svg
      aria-hidden="true"
      className="progress-indicator__svg"
      preserveAspectRatio="none"
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <clipPath id={clipId}>
          <rect height={height} width={activeEnd} x="0" y="0" />
        </clipPath>
      </defs>
      {trackLineStart < trackLineEnd && (
        <line
          className="progress-indicator__track"
          vectorEffect="non-scaling-stroke"
          x1={trackLineStart}
          x2={trackLineEnd}
          y1={height / 2}
          y2={height / 2}
        />
      )}
      {fraction > 0 &&
        (wavy ? (
          <path
            className="progress-indicator__active progress-indicator__wave-path"
            clipPath={`url(#${clipId})`}
            d={wavePath}
            style={phaseStyle}
            vectorEffect="non-scaling-stroke"
          />
        ) : (
          <line
            className="progress-indicator__active"
            vectorEffect="non-scaling-stroke"
            x1={activeThickness / 2}
            x2={Math.max(activeThickness / 2, activeEnd - activeThickness / 2)}
            y1={height / 2}
            y2={height / 2}
          />
        ))}
      <circle
        className="progress-indicator__stop"
        cx={stopCenter}
        cy={height / 2}
        r={stopSize / 2}
      />
    </svg>
  );
}

function LinearIndeterminateVisual({
  wavy,
  fourColor,
  amplitude,
  wavelength,
}: {
  wavy: boolean;
  fourColor: boolean;
  amplitude?: WavyProgressIndicatorProps['amplitude'];
  wavelength?: number;
}) {
  const height = wavy
    ? progressIndicatorTokens.linear.waveHeight
    : progressIndicatorTokens.linear.height;
  const resolvedWavelength = Math.max(
    0,
    wavelength ?? progressIndicatorTokens.linear.indeterminateWaveWavelength,
  );
  const wavePath = buildLinearWavePath(
    progressIndicatorRuntime.linearWidth,
    height,
    progressIndicatorTokens.linear.waveAmplitude *
      resolvedAmplitude(amplitude, 0.5),
    resolvedWavelength,
    resolvedWavelength,
  );

  return (
    <span
      aria-hidden="true"
      className={clsx(
        'progress-indicator__linear-indeterminate',
        fourColor && 'progress-indicator__linear-indeterminate--four-color',
      )}
    >
      <span className="progress-indicator__linear-bar progress-indicator__linear-bar--primary">
        <span className="progress-indicator__linear-bar-inner">
          {wavy && (
            <svg preserveAspectRatio="none" viewBox={`0 0 240 ${height}`}>
              <path
                className="progress-indicator__active progress-indicator__wave-path"
                d={wavePath}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          )}
        </span>
      </span>
      <span className="progress-indicator__linear-bar progress-indicator__linear-bar--secondary">
        <span className="progress-indicator__linear-bar-inner">
          {wavy && (
            <svg preserveAspectRatio="none" viewBox={`0 0 240 ${height}`}>
              <path
                className="progress-indicator__active progress-indicator__wave-path"
                d={wavePath}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          )}
        </span>
      </span>
    </span>
  );
}

function LinearBufferVisual({
  fraction,
  bufferFraction,
}: {
  fraction: number;
  bufferFraction: number;
}) {
  return (
    <span aria-hidden="true" className="progress-indicator__buffer">
      <span className="progress-indicator__buffer-dots" />
      <span
        className="progress-indicator__buffer-track"
        style={{ transform: `scaleX(${bufferFraction})` }}
      />
      <span
        className="progress-indicator__buffer-active"
        style={{ transform: `scaleX(${fraction})` }}
      />
    </span>
  );
}

function circleMetrics(size: number, thickness: number) {
  const radius = Math.max(0, (size - thickness) / 2);
  const circumference = Math.PI * 2 * radius;
  return { radius, circumference };
}

function circularWaveFrames(
  size: number,
  thickness: number,
  amplitude: number,
  wavelength: number,
  startFraction: number,
  endFraction: number,
): string[] {
  return [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2, Math.PI * 2].map(
    (phase) =>
      buildCircularWavePath(
        size,
        thickness,
        amplitude,
        wavelength,
        startFraction,
        endFraction,
        phase,
      ),
  );
}

function CircularWavePath({
  className,
  frames,
  duration,
  pathLength,
}: {
  className: string;
  frames: string[];
  duration: string;
  pathLength?: number;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  return (
    <path className={className} d={frames[0]} pathLength={pathLength}>
      {!prefersReducedMotion && duration !== '0s' && (
        <animate
          attributeName="d"
          dur={duration}
          repeatCount="indefinite"
          values={frames.join(';')}
        />
      )}
    </path>
  );
}

function CircularDeterminateVisual({
  fraction,
  wavy,
  amplitude,
  wavelength,
  waveSpeed,
}: {
  fraction: number;
  wavy: boolean;
  amplitude?: WavyProgressIndicatorProps['amplitude'];
  wavelength?: number;
  waveSpeed?: number;
}) {
  const size = wavy
    ? progressIndicatorTokens.circular.waveSize
    : progressIndicatorTokens.circular.size;
  const thickness = progressIndicatorTokens.circular.activeThickness;
  const gap = progressIndicatorTokens.circular.trackActiveSpace + thickness;
  const { radius } = circleMetrics(size, thickness);
  const defaultWavelength = progressIndicatorTokens.circular.waveWavelength;
  const resolvedWavelength = Math.max(0, wavelength ?? defaultWavelength);
  const amplitudeFactor = resolvedAmplitude(amplitude, fraction);
  const waveAmplitude =
    progressIndicatorTokens.circular.waveAmplitude * amplitudeFactor;
  const trackRadius = Math.max(0, radius - (wavy ? waveAmplitude : 0));
  const trackCircumference = Math.PI * 2 * trackRadius;
  const gapFraction =
    trackCircumference > 0 ? Math.min(1, gap / trackCircumference) : 0;
  const trackStart = Math.min(
    1,
    fraction + (fraction > 0 ? gapFraction : 0),
  );
  const trackLength = Math.max(
    0,
    1 - trackStart - (fraction > 0 ? gapFraction : 0),
  );
  const activeWaveFrames = circularWaveFrames(
    size,
    thickness,
    waveAmplitude,
    resolvedWavelength,
    0,
    fraction,
  );
  const phaseDuration =
    resolvedWavelength > 0 && (waveSpeed ?? resolvedWavelength) > 0
      ? `${resolvedWavelength / (waveSpeed ?? resolvedWavelength)}s`
      : '0s';

  return (
    <svg
      aria-hidden="true"
      className="progress-indicator__svg progress-indicator__circular-svg"
      viewBox={`0 0 ${size} ${size}`}
    >
      {!wavy ? (
        <>
          {trackLength > 0 && (
            <circle
              className="progress-indicator__track"
              cx={size / 2}
              cy={size / 2}
              pathLength={100}
              r={radius}
              strokeDasharray={`${trackLength * 100} ${(1 - trackLength) * 100}`}
              strokeDashoffset={-trackStart * 100}
            />
          )}
          {fraction > 0 && (
            <circle
              className="progress-indicator__active progress-indicator__circular-active"
              cx={size / 2}
              cy={size / 2}
              pathLength={100}
              r={radius}
              strokeDasharray={`${fraction * 100} ${(1 - fraction) * 100}`}
            />
          )}
        </>
      ) : (
        <>
          {trackLength > 0 && (
            <circle
              className="progress-indicator__track"
              cx={size / 2}
              cy={size / 2}
              pathLength={100}
              r={trackRadius}
              strokeDasharray={`${trackLength * 100} ${(1 - trackLength) * 100}`}
              strokeDashoffset={-trackStart * 100}
            />
          )}
          {fraction > 0 && (
            <CircularWavePath
              className="progress-indicator__active progress-indicator__circular-wave-path"
              duration={phaseDuration}
              frames={activeWaveFrames}
            />
          )}
        </>
      )}
    </svg>
  );
}

function CircularIndeterminateVisual({
  wavy,
  fourColor,
  amplitude,
  wavelength,
  waveSpeed,
}: {
  wavy: boolean;
  fourColor: boolean;
  amplitude?: WavyProgressIndicatorProps['amplitude'];
  wavelength?: number;
  waveSpeed?: number;
}) {
  const size = wavy
    ? progressIndicatorTokens.circular.waveSize
    : progressIndicatorTokens.circular.size;
  const thickness = progressIndicatorTokens.circular.activeThickness;
  const { radius } = circleMetrics(size, thickness);
  const waveAmplitude = wavy
    ? progressIndicatorTokens.circular.waveAmplitude *
      resolvedAmplitude(amplitude, 0.5)
    : 0;
  const trackRadius = Math.max(0, radius - waveAmplitude);
  const trackCircumference = Math.PI * 2 * trackRadius;
  const adjustedGap =
    progressIndicatorTokens.circular.trackActiveSpace + thickness;
  const gapFraction =
    trackCircumference > 0
      ? Math.min(0.5, adjustedGap / trackCircumference)
      : 0;
  const minProgress = progressIndicatorRuntime.composeCircularMinProgress;
  const maxProgress = progressIndicatorRuntime.composeCircularMaxProgress;
  const trackDash = (progress: number) => {
    const length = Math.max(0, 1 - progress - gapFraction * 2);
    return `${length * 100} ${(1 - length) * 100}`;
  };
  const trackOffset = (progress: number) =>
    `-${(progress + gapFraction) * 100}`;
  const trackStyle = {
    '--_progress-circular-track-dash-min': trackDash(minProgress),
    '--_progress-circular-track-dash-max': trackDash(maxProgress),
    '--_progress-circular-track-offset-min': trackOffset(minProgress),
    '--_progress-circular-track-offset-max': trackOffset(maxProgress),
  } as CSSProperties;
  const resolvedWavelength = Math.max(
    0,
    wavelength ?? progressIndicatorTokens.circular.waveWavelength,
  );
  const resolvedWaveSpeed = waveSpeed ?? resolvedWavelength;
  const waveFrames = circularWaveFrames(
    size,
    thickness,
    waveAmplitude,
    resolvedWavelength,
    0,
    1,
  );
  const phaseDuration =
    resolvedWavelength > 0 && resolvedWaveSpeed > 0
      ? `${resolvedWavelength / resolvedWaveSpeed}s`
      : '0s';

  return (
    <svg
      aria-hidden="true"
      className={clsx(
        'progress-indicator__svg',
        'progress-indicator__circular-svg',
        'progress-indicator__circular-indeterminate',
        fourColor && 'progress-indicator__circular-indeterminate--four-color',
      )}
      viewBox={`0 0 ${size} ${size}`}
    >
      <g className="progress-indicator__circular-global-rotation">
        <g className="progress-indicator__circular-additional-rotation">
          <circle
            className="progress-indicator__track progress-indicator__circular-indeterminate-track"
            cx={size / 2}
            cy={size / 2}
            pathLength={100}
            r={trackRadius}
            style={trackStyle}
          />
          {wavy ? (
            <CircularWavePath
              className="progress-indicator__active progress-indicator__circular-indeterminate-active"
              duration={phaseDuration}
              frames={waveFrames}
              pathLength={100}
            />
          ) : (
            <circle
              className="progress-indicator__active progress-indicator__circular-indeterminate-active"
              cx={size / 2}
              cy={size / 2}
              pathLength={100}
              r={radius}
            />
          )}
        </g>
      </g>
    </svg>
  );
}

function ProgressRoot({
  kind,
  wavy,
  className,
  style,
  color,
  trackColor,
  amplitude,
  wavelength,
  waveSpeed,
  fourColor = false,
  bufferValue,
  maxValue = 1,
  minValue = 0,
  value = 0,
  ...props
}: (LinearProgressIndicatorProps | CircularProgressIndicatorProps) &
  Partial<WavyProgressIndicatorProps> & {
    kind: 'linear' | 'circular';
    wavy: boolean;
    bufferValue?: number;
  }) {
  const bufferFraction = progressFraction(bufferValue, minValue, maxValue);

  return (
    <AriaProgressBar
      {...props}
      minValue={minValue}
      maxValue={maxValue}
      value={value}
      data-buffer={
        kind === 'linear' && bufferValue !== undefined ? bufferValue : undefined
      }
      data-four-color={fourColor || undefined}
      data-kind={kind}
      data-variant={wavy ? 'wavy' : 'standard'}
      className={(renderProps) => {
        const userClassName =
          typeof className === 'function' ? className(renderProps) : className;
        return classes(kind, wavy, userClassName);
      }}
      style={(renderProps) => {
        const userStyle =
          typeof style === 'function' ? style(renderProps) : style;
        return {
          ...getProgressIndicatorStyle(kind, wavy, {
            color,
            trackColor,
            isIndeterminate: renderProps.isIndeterminate,
            wavelength,
            waveSpeed,
          }),
          ...userStyle,
        };
      }}
    >
      {(renderProps) => {
        const fraction = (renderProps.percentage ?? 0) / 100;
        if (kind === 'linear') {
          if (renderProps.isIndeterminate) {
            return (
              <LinearIndeterminateVisual
                amplitude={amplitude}
                fourColor={fourColor}
                wavelength={wavelength}
                wavy={wavy}
              />
            );
          }
          if (!wavy && bufferValue !== undefined && bufferFraction > 0) {
            return (
              <LinearBufferVisual
                bufferFraction={Math.max(fraction, bufferFraction)}
                fraction={fraction}
              />
            );
          }
          return (
            <LinearDeterminateVisual
              amplitude={amplitude}
              fraction={fraction}
              wavelength={wavelength}
              waveSpeed={waveSpeed}
              wavy={wavy}
            />
          );
        }

        if (renderProps.isIndeterminate) {
          return (
            <CircularIndeterminateVisual
              amplitude={amplitude}
              fourColor={fourColor}
              wavelength={wavelength}
              waveSpeed={waveSpeed}
              wavy={wavy}
            />
          );
        }
        return (
          <CircularDeterminateVisual
            amplitude={amplitude}
            fraction={fraction}
            wavelength={wavelength}
            waveSpeed={waveSpeed}
            wavy={wavy}
          />
        );
      }}
    </AriaProgressBar>
  );
}

export function LinearProgressIndicator(props: LinearProgressIndicatorProps) {
  return <ProgressRoot {...props} kind="linear" wavy={false} />;
}

export function CircularProgressIndicator(
  props: CircularProgressIndicatorProps,
) {
  return <ProgressRoot {...props} kind="circular" wavy={false} />;
}

export function LinearWavyProgressIndicator(
  props: LinearWavyProgressIndicatorProps,
) {
  return <ProgressRoot {...props} kind="linear" wavy />;
}

export function CircularWavyProgressIndicator(
  props: CircularWavyProgressIndicatorProps,
) {
  return <ProgressRoot {...props} kind="circular" wavy />;
}
