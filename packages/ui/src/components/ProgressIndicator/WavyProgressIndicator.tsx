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

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () =>
      typeof window !== 'undefined' &&
      Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches),
    () => true,
  );
}

export interface WavyProgressIndicatorProps {
  /** 0..1 wave amplitude multiplier. Determinate indicators use the Material lifecycle when omitted. */
  amplitude?: number;
  /** Active indicator color. */
  color?: CSSProperties['color'];
  /** Track color. */
  trackColor?: CSSProperties['color'];
  /** Active stroke thickness in CSS pixels. */
  thickness?: number;
  /** Track stroke thickness in CSS pixels. */
  trackThickness?: number;
  /** Wave length in CSS pixels. */
  wavelength?: number;
  /** Wave travel speed in CSS pixels per second. `0` produces a valid static wave. */
  waveSpeed?: number;
}

export interface LinearWavyProgressIndicatorProps
  extends Omit<AriaProgressBarProps, 'children' | 'style'>,
    WavyProgressIndicatorProps {
  style?: AriaProgressBarProps['style'];
}

export interface CircularWavyProgressIndicatorProps
  extends Omit<AriaProgressBarProps, 'children' | 'style'>,
    WavyProgressIndicatorProps {
  style?: AriaProgressBarProps['style'];
}

function finiteNonNegative(value: number | undefined, fallback: number): number {
  return Number.isFinite(value) ? Math.max(0, value as number) : fallback;
}

function resolveAmplitude(value: number | undefined, progress: number, indeterminate: boolean): number {
  const candidate = value ?? (indeterminate ? 1 : defaultWavyAmplitude(progress));
  if (!Number.isFinite(candidate)) return 0;
  return Math.min(1, Math.max(0, candidate));
}

function sanitizeRange(minValue: number | undefined, maxValue: number | undefined) {
  const min = Number.isFinite(minValue) ? (minValue as number) : 0;
  const maxCandidate = Number.isFinite(maxValue) ? (maxValue as number) : 1;
  const max = maxCandidate > min ? maxCandidate : min + 1;
  return { min, max };
}

function sanitizeValue(value: number | undefined, min: number, max: number): number {
  const finite = Number.isFinite(value) ? (value as number) : min;
  return Math.min(max, Math.max(min, finite));
}

function waveDuration(wavelength: number, waveSpeed: number): string {
  return wavelength > 0 && waveSpeed > 0 ? `${wavelength / waveSpeed}s` : '0s';
}

function classes(kind: 'linear' | 'circular', userClassName?: string): string {
  return [
    'progress-indicator',
    `progress-indicator--${kind}`,
    'progress-indicator--wavy',
    userClassName,
  ]
    .filter(Boolean)
    .join(' ');
}

function CircularWavePath({ frames, duration, className, pathLength }: {
  frames: string[];
  duration: string;
  className: string;
  pathLength?: number;
}) {
  const reducedMotion = usePrefersReducedMotion();
  return (
    <path className={className} d={frames[0]} pathLength={pathLength}>
      {!reducedMotion && duration !== '0s' && (
        <animate attributeName="d" dur={duration} repeatCount="indefinite" values={frames.join(';')} />
      )}
    </path>
  );
}

function circularFrames(
  size: number,
  thickness: number,
  amplitude: number,
  wavelength: number,
  start: number,
  end: number,
): string[] {
  return [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2, Math.PI * 2].map((phase) =>
    buildCircularWavePath(size, thickness, amplitude, wavelength, start, end, phase),
  );
}

function LinearDeterminate({
  fraction,
  amplitude,
  wavelength,
  waveSpeed,
  thickness,
  trackThickness,
}: {
  fraction: number;
  amplitude: number;
  wavelength: number;
  waveSpeed: number;
  thickness: number;
  trackThickness: number;
}) {
  const width = progressIndicatorRuntime.linearWidth;
  const waveAmplitude = progressIndicatorTokens.linear.waveAmplitude * amplitude;
  const height = Math.max(progressIndicatorTokens.linear.waveHeight, thickness + waveAmplitude * 2);
  const gap = progressIndicatorTokens.linear.trackActiveSpace + thickness;
  const stopSize = progressIndicatorTokens.linear.stopSize;
  const stopCenter = width - stopSize / 2 - progressIndicatorTokens.linear.stopTrailingSpace;
  const activeEnd = width * fraction;
  const trackStart = fraction <= 0 ? 0 : Math.min(width, activeEnd + gap);
  const trackLineStart = Math.min(width, trackStart + trackThickness / 2);
  const trackLineEnd = Math.max(0, stopCenter - stopSize / 2 - trackThickness / 2);
  const clipId = useId().replace(/:/g, '');
  const path = buildLinearWavePath(width, height, waveAmplitude, wavelength, wavelength);

  return (
    <svg aria-hidden="true" className="progress-indicator__svg" preserveAspectRatio="none" viewBox={`0 0 ${width} ${height}`}>
      <defs><clipPath id={clipId}><rect height={height} width={activeEnd} x="0" y="0" /></clipPath></defs>
      {trackLineStart < trackLineEnd && (
        <line className="progress-indicator__track" vectorEffect="non-scaling-stroke" x1={trackLineStart} x2={trackLineEnd} y1={height / 2} y2={height / 2} />
      )}
      {fraction > 0 && (
        <path
          className="progress-indicator__active progress-indicator__wave-path"
          clipPath={`url(#${clipId})`}
          d={path}
          style={{ '--_progress-wave-wavelength': `${wavelength}px`, '--_progress-wave-duration': waveDuration(wavelength, waveSpeed) } as CSSProperties}
          vectorEffect="non-scaling-stroke"
        />
      )}
      <circle className="progress-indicator__stop" cx={stopCenter} cy={height / 2} r={stopSize / 2} />
    </svg>
  );
}

function LinearIndeterminate({ amplitude, wavelength }: { amplitude: number; wavelength: number }) {
  const width = progressIndicatorRuntime.linearWidth;
  const waveAmplitude = progressIndicatorTokens.linear.waveAmplitude * amplitude;
  const height = progressIndicatorTokens.linear.waveHeight;
  const path = buildLinearWavePath(width, height, waveAmplitude, wavelength, wavelength);
  const bar = (modifier: 'primary' | 'secondary') => (
    <span className={`progress-indicator__linear-bar progress-indicator__linear-bar--${modifier}`}>
      <span className="progress-indicator__linear-bar-inner">
        <svg aria-hidden="true" preserveAspectRatio="none" viewBox={`0 0 ${width} ${height}`}>
          <path className="progress-indicator__active progress-indicator__wave-path" d={path} vectorEffect="non-scaling-stroke" />
        </svg>
      </span>
    </span>
  );
  return <span aria-hidden="true" className="progress-indicator__linear-indeterminate">{bar('primary')}{bar('secondary')}</span>;
}

function CircularDeterminate({
  fraction,
  amplitude,
  wavelength,
  waveSpeed,
  thickness,
  trackThickness,
}: {
  fraction: number;
  amplitude: number;
  wavelength: number;
  waveSpeed: number;
  thickness: number;
  trackThickness: number;
}) {
  const baseSize = progressIndicatorTokens.circular.waveSize;
  const waveAmplitude = progressIndicatorTokens.circular.waveAmplitude * amplitude;
  const size = Math.max(baseSize, thickness + waveAmplitude * 2 + 2);
  const radius = Math.max(0, (size - thickness) / 2 - waveAmplitude);
  const trackRadius = Math.max(0, radius + (thickness - trackThickness) / 2);
  const circumference = Math.PI * 2 * Math.max(trackRadius, 1);
  const gap = progressIndicatorTokens.circular.trackActiveSpace + thickness;
  const gapFraction = Math.min(1, gap / circumference);
  const trackStart = Math.min(1, fraction + (fraction > 0 ? gapFraction : 0));
  const trackLength = Math.max(0, 1 - trackStart - (fraction > 0 ? gapFraction : 0));
  const frames = circularFrames(size, thickness, waveAmplitude, wavelength, 0, fraction);

  return (
    <svg aria-hidden="true" className="progress-indicator__svg progress-indicator__circular-svg" viewBox={`0 0 ${size} ${size}`}>
      {trackLength > 0 && (
        <circle className="progress-indicator__track" cx={size / 2} cy={size / 2} pathLength={100} r={trackRadius} strokeDasharray={`${trackLength * 100} ${(1 - trackLength) * 100}`} strokeDashoffset={-trackStart * 100} />
      )}
      {fraction > 0 && (
        <CircularWavePath className="progress-indicator__active progress-indicator__circular-wave-path" duration={waveDuration(wavelength, waveSpeed)} frames={frames} />
      )}
    </svg>
  );
}

function CircularIndeterminate({
  amplitude,
  wavelength,
  waveSpeed,
  thickness,
  trackThickness,
}: {
  amplitude: number;
  wavelength: number;
  waveSpeed: number;
  thickness: number;
  trackThickness: number;
}) {
  const baseSize = progressIndicatorTokens.circular.waveSize;
  const waveAmplitude = progressIndicatorTokens.circular.waveAmplitude * amplitude;
  const size = Math.max(baseSize, thickness + waveAmplitude * 2 + 2);
  const radius = Math.max(0, (size - thickness) / 2 - waveAmplitude);
  const trackRadius = Math.max(0, radius + (thickness - trackThickness) / 2);
  const circumference = Math.PI * 2 * Math.max(trackRadius, 1);
  const gapFraction = Math.min(0.5, (progressIndicatorTokens.circular.trackActiveSpace + thickness) / circumference);
  const minProgress = progressIndicatorRuntime.composeCircularMinProgress;
  const maxProgress = progressIndicatorRuntime.composeCircularMaxProgress;
  const dash = (progress: number) => {
    const length = Math.max(0, 1 - progress - gapFraction * 2);
    return `${length * 100} ${(1 - length) * 100}`;
  };
  const trackStyle = {
    '--_progress-circular-track-dash-min': dash(minProgress),
    '--_progress-circular-track-dash-max': dash(maxProgress),
    '--_progress-circular-track-offset-min': `-${(minProgress + gapFraction) * 100}`,
    '--_progress-circular-track-offset-max': `-${(maxProgress + gapFraction) * 100}`,
  } as CSSProperties;
  const frames = circularFrames(size, thickness, waveAmplitude, wavelength, 0, 1);

  return (
    <svg aria-hidden="true" className="progress-indicator__svg progress-indicator__circular-svg progress-indicator__circular-indeterminate" viewBox={`0 0 ${size} ${size}`}>
      <g className="progress-indicator__circular-global-rotation"><g className="progress-indicator__circular-additional-rotation">
        <circle className="progress-indicator__track progress-indicator__circular-indeterminate-track" cx={size / 2} cy={size / 2} pathLength={100} r={trackRadius} style={trackStyle} />
        <CircularWavePath className="progress-indicator__active progress-indicator__circular-indeterminate-active" duration={waveDuration(wavelength, waveSpeed)} frames={frames} pathLength={100} />
      </g></g>
    </svg>
  );
}

function WavyProgressRoot({
  kind,
  amplitude,
  color,
  trackColor,
  thickness,
  trackThickness,
  wavelength,
  waveSpeed,
  minValue,
  maxValue,
  value,
  isIndeterminate = false,
  className,
  style,
  ...props
}: (LinearWavyProgressIndicatorProps | CircularWavyProgressIndicatorProps) & { kind: 'linear' | 'circular' }) {
  const range = sanitizeRange(minValue, maxValue);
  const safeValue = sanitizeValue(value, range.min, range.max);
  const fraction = progressFraction(safeValue, range.min, range.max);
  const resolvedAmplitude = resolveAmplitude(amplitude, fraction, isIndeterminate);
  const tokenThickness = kind === 'linear' ? progressIndicatorTokens.linear.activeThickness : progressIndicatorTokens.circular.activeThickness;
  const tokenTrackThickness = kind === 'linear' ? progressIndicatorTokens.linear.trackThickness : progressIndicatorTokens.circular.trackThickness;
  const activeThickness = finiteNonNegative(thickness, tokenThickness);
  const inactiveThickness = finiteNonNegative(trackThickness, tokenTrackThickness);
  const defaultWavelength = kind === 'linear'
    ? isIndeterminate
      ? progressIndicatorTokens.linear.indeterminateWaveWavelength
      : progressIndicatorTokens.linear.waveWavelength
    : progressIndicatorTokens.circular.waveWavelength;
  const resolvedWavelength = finiteNonNegative(wavelength, defaultWavelength);
  const resolvedWaveSpeed = finiteNonNegative(waveSpeed, resolvedWavelength);
  const linearHeight = Math.max(progressIndicatorTokens.linear.waveHeight, activeThickness + progressIndicatorTokens.linear.waveAmplitude * resolvedAmplitude * 2);
  const circularSize = Math.max(progressIndicatorTokens.circular.waveSize, activeThickness + progressIndicatorTokens.circular.waveAmplitude * resolvedAmplitude * 2 + 2);

  return (
    <AriaProgressBar
      {...props}
      isIndeterminate={isIndeterminate}
      minValue={range.min}
      maxValue={range.max}
      value={isIndeterminate ? undefined : safeValue}
      data-amplitude={resolvedAmplitude}
      data-kind={kind}
      data-thickness={activeThickness}
      data-track-thickness={inactiveThickness}
      data-variant="wavy"
      data-wave-speed={resolvedWaveSpeed}
      data-wavelength={resolvedWavelength}
      className={(renderProps) => classes(kind, typeof className === 'function' ? className(renderProps) : className)}
      style={(renderProps) => {
        const userStyle = typeof style === 'function' ? style(renderProps) : style;
        return {
          ...getProgressIndicatorStyle(kind, true, { color, trackColor, isIndeterminate, wavelength: resolvedWavelength, waveSpeed: resolvedWaveSpeed }),
          '--_progress-linear-active-thickness': `${activeThickness}px`,
          '--_progress-linear-track-thickness': `${inactiveThickness}px`,
          '--_progress-linear-height': `${linearHeight}px`,
          '--_progress-circular-active-thickness': `${activeThickness}px`,
          '--_progress-circular-track-thickness': `${inactiveThickness}px`,
          '--_progress-circular-size': `${circularSize}px`,
          ...userStyle,
        } as CSSProperties;
      }}
    >
      {kind === 'linear'
        ? isIndeterminate
          ? <LinearIndeterminate amplitude={resolvedAmplitude} wavelength={resolvedWavelength} />
          : <LinearDeterminate amplitude={resolvedAmplitude} fraction={fraction} thickness={activeThickness} trackThickness={inactiveThickness} wavelength={resolvedWavelength} waveSpeed={resolvedWaveSpeed} />
        : isIndeterminate
          ? <CircularIndeterminate amplitude={resolvedAmplitude} thickness={activeThickness} trackThickness={inactiveThickness} wavelength={resolvedWavelength} waveSpeed={resolvedWaveSpeed} />
          : <CircularDeterminate amplitude={resolvedAmplitude} fraction={fraction} thickness={activeThickness} trackThickness={inactiveThickness} wavelength={resolvedWavelength} waveSpeed={resolvedWaveSpeed} />}
    </AriaProgressBar>
  );
}

export function LinearWavyProgressIndicator(props: LinearWavyProgressIndicatorProps) {
  return <WavyProgressRoot {...props} kind="linear" />;
}

export function CircularWavyProgressIndicator(props: CircularWavyProgressIndicatorProps) {
  return <WavyProgressRoot {...props} kind="circular" />;
}
