import {
  useEffect,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from 'react';
import {
  ProgressBar as AriaProgressBar,
  type ProgressBarProps as AriaProgressBarProps,
} from 'react-aria-components';
import {
  getLoadingIndicatorStyle,
  loadingIndicatorRuntime,
  loadingIndicatorTokens,
} from './LoadingIndicator.defaults';
import {
  calculateScaleFactor,
  clampProgress,
  determinateLoadingPolygons,
  indeterminateLoadingPolygons,
  morphSequence,
  processedMorphPath,
  springMorphProgress,
} from './LoadingIndicator.geometry';
import './loading-indicator.css';

const determinateMorphs = morphSequence(determinateLoadingPolygons, false);
const indeterminateMorphs = morphSequence(indeterminateLoadingPolygons, true);
const activeScale =
  loadingIndicatorTokens.activeSize /
  Math.min(
    loadingIndicatorTokens.containerWidth,
    loadingIndicatorTokens.containerHeight,
  );
const determinateScaleFactor =
  calculateScaleFactor(determinateLoadingPolygons) * activeScale;
const indeterminateScaleFactor =
  calculateScaleFactor(indeterminateLoadingPolygons) * activeScale;

function subscribeReducedMotion(callback: () => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}

function getReducedMotionSnapshot(): boolean {
  return (
    typeof window !== 'undefined' &&
    Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
  );
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => true,
  );
}

function useAnimationClock(enabled: boolean): number {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!enabled || typeof requestAnimationFrame === 'undefined') {
      setElapsed(0);
      return undefined;
    }

    let frame = 0;
    let start: number | undefined;
    const tick = (now: number) => {
      start ??= now;
      setElapsed(now - start);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [enabled]);

  return elapsed;
}

interface MaterialLoadingProps
  extends Omit<
    AriaProgressBarProps,
    | 'children'
    | 'isIndeterminate'
    | 'maxValue'
    | 'minValue'
    | 'style'
    | 'value'
  > {
  /** Provide a value from 0..1 for determinate mode; omit it for indeterminate mode. */
  value?: number;
  style?: AriaProgressBarProps['style'];
}

export interface LoadingIndicatorProps extends MaterialLoadingProps {
  color?: CSSProperties['color'];
}

export interface ContainedLoadingIndicatorProps extends MaterialLoadingProps {
  containerColor?: CSSProperties['color'];
  indicatorColor?: CSSProperties['color'];
}

function LoadingVisual({ value }: { value?: number }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const indeterminate = value === undefined;
  const elapsed = useAnimationClock(indeterminate && !prefersReducedMotion);
  const size = loadingIndicatorTokens.containerWidth;

  let path = '';
  let rotation = 0;

  if (!indeterminate) {
    const progress = clampProgress(value);
    const morphIndex = Math.min(
      Math.floor(determinateMorphs.length * progress),
      determinateMorphs.length - 1,
    );
    const morphProgress =
      progress === 1 && morphIndex === determinateMorphs.length - 1
        ? 1
        : (progress * determinateMorphs.length) % 1;
    path = processedMorphPath(
      determinateMorphs[morphIndex],
      morphProgress,
      size,
      determinateScaleFactor,
    );
    rotation = -progress * loadingIndicatorRuntime.determinateRotation;
  } else {
    const intervalCount = Math.floor(
      elapsed / loadingIndicatorRuntime.morphIntervalMs,
    );
    const morphIndex = intervalCount % indeterminateMorphs.length;
    const intervalElapsed =
      elapsed % loadingIndicatorRuntime.morphIntervalMs;
    const morphProgress = springMorphProgress(intervalElapsed);
    const targetRotation =
      ((intervalCount + 1) * loadingIndicatorRuntime.quarterRotation) % 360;
    const globalRotation =
      ((elapsed % loadingIndicatorRuntime.globalRotationDurationMs) /
        loadingIndicatorRuntime.globalRotationDurationMs) *
      360;
    path = processedMorphPath(
      indeterminateMorphs[morphIndex],
      morphProgress,
      size,
      indeterminateScaleFactor,
    );
    rotation =
      morphProgress * loadingIndicatorRuntime.quarterRotation +
      targetRotation +
      globalRotation;
  }

  return (
    <svg
      aria-hidden="true"
      className="m3-loading-indicator__svg"
      viewBox={`0 0 ${size} ${size}`}
    >
      <g transform={`rotate(${rotation} ${size / 2} ${size / 2})`}>
        <path className="m3-loading-indicator__active" d={path} />
      </g>
    </svg>
  );
}

function LoadingRoot({
  contained,
  value,
  className,
  style,
  color,
  indicatorColor,
  containerColor,
  ...props
}: MaterialLoadingProps & {
  contained: boolean;
  color?: CSSProperties['color'];
  indicatorColor?: CSSProperties['color'];
  containerColor?: CSSProperties['color'];
}) {
  const isIndeterminate = value === undefined;
  const progress = isIndeterminate ? undefined : clampProgress(value);

  return (
    <AriaProgressBar
      {...props}
      data-contained={contained || undefined}
      data-mode={isIndeterminate ? 'indeterminate' : 'determinate'}
      isIndeterminate={isIndeterminate}
      maxValue={1}
      minValue={0}
      value={progress}
      className={(renderProps) => {
        const userClassName =
          typeof className === 'function' ? className(renderProps) : className;
        return [
          'm3-loading-indicator',
          contained && 'm3-loading-indicator--contained',
          userClassName,
        ]
          .filter(Boolean)
          .join(' ');
      }}
      style={(renderProps) => {
        const userStyle =
          typeof style === 'function' ? style(renderProps) : style;
        return {
          ...getLoadingIndicatorStyle(contained, {
            color,
            indicatorColor,
            containerColor,
          }),
          ...userStyle,
        };
      }}
    >
      <LoadingVisual value={progress} />
    </AriaProgressBar>
  );
}

export function LoadingIndicator({ color, ...props }: LoadingIndicatorProps) {
  return <LoadingRoot {...props} color={color} contained={false} />;
}

export function ContainedLoadingIndicator({
  containerColor,
  indicatorColor,
  ...props
}: ContainedLoadingIndicatorProps) {
  return (
    <LoadingRoot
      {...props}
      contained
      containerColor={containerColor}
      indicatorColor={indicatorColor}
    />
  );
}
