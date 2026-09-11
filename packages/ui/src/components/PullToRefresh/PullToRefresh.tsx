import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { Elevation } from '../../internal/elevation';
import { CircularProgressIndicator } from '../ProgressIndicator';
import './pull-to-refresh.css';

export type PullToRefreshStatus = 'idle' | 'pulling' | 'armed' | 'refreshing';

export interface PullToRefreshIndicatorState {
  /** Pull distance normalized to the refresh threshold. Values can exceed 1 while overshooting. */
  progress: number;
  /** Material/web state derived from the current gesture and controlled refreshing state. */
  status: PullToRefreshStatus;
  /** Rendered indicator offset after Material tension is applied, in CSS pixels. */
  offset: number;
  isRefreshing: boolean;
}

export interface PullToRefreshIndicatorProps {
  state: PullToRefreshIndicatorState;
  className?: string;
}

export const pullToRefreshDefaults = {
  /** AndroidX PullToRefreshDefaults.PositionalThreshold (80.dp), projected to CSS px. */
  threshold: 80,
  /** AndroidX PullToRefreshDefaults.Elevation. */
  elevation: 'level2',
  /** AndroidX drag multiplier used before threshold/progress calculations. */
  dragMultiplier: 0.5,
} as const;

function joinClasses(...values: Array<string | undefined | false>): string {
  return values.filter(Boolean).join(' ');
}

function isScrollableY(element: HTMLElement): boolean {
  const style = getComputedStyle(element);
  const overflow = style.overflowY;
  return (overflow === 'auto' || overflow === 'scroll') && element.scrollHeight > element.clientHeight;
}

function nestedScrollableIsAwayFromTop(target: EventTarget | null, root: HTMLElement): boolean {
  let element = target instanceof HTMLElement ? target : null;
  while (element && element !== root) {
    if (isScrollableY(element) && element.scrollTop > 0) return true;
    element = element.parentElement;
  }
  return false;
}

function materialOffset(adjustedDistance: number, threshold: number): number {
  if (adjustedDistance <= threshold) return adjustedDistance;
  const progress = adjustedDistance / threshold;
  const overshootPercent = Math.abs(progress) - 1;
  const linearTension = Math.min(2, Math.max(0, overshootPercent));
  const tensionPercent = linearTension - linearTension ** 2 / 4;
  return threshold + threshold * tensionPercent;
}

function normalizeThreshold(value: number | undefined): number {
  if (value === undefined) return pullToRefreshDefaults.threshold;
  return Number.isFinite(value) && value > 0 ? value : pullToRefreshDefaults.threshold;
}

export function PullToRefreshIndicator({ state, className }: PullToRefreshIndicatorProps) {
  const visible = state.status !== 'idle';
  const determinate = Math.min(1, Math.max(0, state.progress));

  return (
    <div
      aria-hidden={!state.isRefreshing ? true : undefined}
      className={joinClasses('pull-to-refresh__indicator', className)}
      data-pull-to-refresh-indicator=""
      data-status={state.status}
      style={{
        '--_pull-to-refresh-offset': `${state.offset}px`,
        '--_pull-to-refresh-visibility': visible ? '1' : '0',
      } as CSSProperties}
    >
      <div className="pull-to-refresh__indicator-surface">
        <Elevation level={pullToRefreshDefaults.elevation} />
        <CircularProgressIndicator
          aria-hidden="true"
          {...(state.isRefreshing
            ? { 'aria-label': undefined }
            : { value: determinate * 100, minValue: 0, maxValue: 100 })}
          className="pull-to-refresh__progress"
        />
      </div>
      <span aria-atomic="true" aria-live="polite" className="pull-to-refresh__sr-only" role="status">
        {state.isRefreshing ? 'Refreshing' : ''}
      </span>
    </div>
  );
}

export interface PullToRefreshProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  isRefreshing: boolean;
  onRefresh: () => void;
  enabled?: boolean;
  /** Refresh threshold in CSS pixels. Defaults to AndroidX's 80dp positional threshold projected to 80px. */
  threshold?: number;
  /** Scrollable content rendered inside the pull-to-refresh container. */
  children: ReactNode;
  /** Custom indicator slot. A render function receives stable pull progress/state. */
  indicator?: ReactNode | ((state: PullToRefreshIndicatorState) => ReactNode);
}

interface GestureState {
  pointerId: number;
  startX: number;
  startY: number;
  claimed: boolean;
  fired: boolean;
}

interface PullState {
  progress: number;
  offset: number;
}

const restingPull: PullState = { progress: 0, offset: 0 };

/**
 * Material 3 pull-to-refresh adapted to Pointer Events and a web scroll container.
 * The component only claims a downward gesture at the container's top boundary.
 */
export function PullToRefresh({
  isRefreshing,
  onRefresh,
  enabled = true,
  threshold: thresholdProp,
  indicator,
  children,
  className,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onScroll,
  ...props
}: PullToRefreshProps) {
  const threshold = normalizeThreshold(thresholdProp);
  const rootRef = useRef<HTMLDivElement>(null);
  const gestureRef = useRef<GestureState | null>(null);
  const pullRef = useRef<PullState>(restingPull);
  const [pull, setPull] = useState<PullState>(restingPull);
  const [atTop, setAtTop] = useState(true);

  function updatePull(next: PullState) {
    pullRef.current = next;
    setPull(next);
  }

  useEffect(() => {
    if (isRefreshing) {
      updatePull({ progress: 1, offset: threshold });
      return;
    }
    gestureRef.current = null;
    updatePull(restingPull);
  }, [isRefreshing, threshold]);

  const status: PullToRefreshStatus = isRefreshing
    ? 'refreshing'
    : pull.progress >= 1
      ? 'armed'
      : pull.progress > 0
        ? 'pulling'
        : 'idle';
  const indicatorState: PullToRefreshIndicatorState = {
    progress: isRefreshing ? 1 : pull.progress,
    status,
    offset: isRefreshing ? threshold : pull.offset,
    isRefreshing,
  };

  function beginGesture(event: ReactPointerEvent<HTMLDivElement>) {
    const root = rootRef.current;
    if (
      !root ||
      !enabled ||
      isRefreshing ||
      event.isPrimary === false ||
      (event.pointerType === 'mouse' && event.button !== 0) ||
      root.scrollTop > 0 ||
      nestedScrollableIsAwayFromTop(event.target, root)
    ) {
      return;
    }
    gestureRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      claimed: false,
      fired: false,
    };
  }

  function moveGesture(event: ReactPointerEvent<HTMLDivElement>) {
    const root = rootRef.current;
    const gesture = gestureRef.current;
    if (!root || !gesture || gesture.pointerId !== event.pointerId || isRefreshing || !enabled) return;

    const dy = event.clientY - gesture.startY;
    const dx = event.clientX - gesture.startX;
    if (dy <= 0 || Math.abs(dx) > Math.abs(dy) || root.scrollTop > 0) {
      if (gesture.claimed && dy <= 0) updatePull(restingPull);
      return;
    }

    if (!gesture.claimed) {
      gesture.claimed = true;
      root.setPointerCapture?.(event.pointerId);
    }
    event.preventDefault();
    const adjustedDistance = dy * pullToRefreshDefaults.dragMultiplier;
    updatePull({
      progress: adjustedDistance / threshold,
      offset: materialOffset(adjustedDistance, threshold),
    });
  }

  function finishGesture(event: ReactPointerEvent<HTMLDivElement>, cancelled: boolean) {
    const root = rootRef.current;
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;

    gestureRef.current = null;
    if (root?.hasPointerCapture?.(event.pointerId)) root.releasePointerCapture(event.pointerId);

    if (
      !cancelled &&
      gesture.claimed &&
      !gesture.fired &&
      !isRefreshing &&
      pullRef.current.progress > 1
    ) {
      gesture.fired = true;
      onRefresh();
    }
    if (!isRefreshing) updatePull(restingPull);
  }

  return (
    <div
      {...props}
      className={joinClasses('pull-to-refresh', className)}
      data-at-top={atTop ? 'true' : 'false'}
      data-enabled={enabled ? 'true' : 'false'}
      data-pull-progress={indicatorState.progress.toFixed(3)}
      data-pull-status={indicatorState.status}
      onPointerCancel={(event) => {
        finishGesture(event, true);
        onPointerCancel?.(event);
      }}
      onPointerDown={(event) => {
        beginGesture(event);
        onPointerDown?.(event);
      }}
      onPointerMove={(event) => {
        moveGesture(event);
        onPointerMove?.(event);
      }}
      onPointerUp={(event) => {
        finishGesture(event, false);
        onPointerUp?.(event);
      }}
      onScroll={(event) => {
        setAtTop(event.currentTarget.scrollTop <= 0);
        onScroll?.(event);
      }}
      ref={rootRef}
    >
      <div className="pull-to-refresh__content" data-pull-to-refresh-content="">{children}</div>
      {typeof indicator === 'function'
        ? indicator(indicatorState)
        : indicator ?? <PullToRefreshIndicator state={indicatorState} />}
    </div>
  );
}
