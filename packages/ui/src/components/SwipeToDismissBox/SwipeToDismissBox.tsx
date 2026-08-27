import {
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  SWIPE_TO_DISMISS_INTENT_SLOP,
  SWIPE_TO_DISMISS_POSITIONAL_THRESHOLD,
  dismissValueForLogicalOffset,
  resolveSwipeToDismissTarget,
  type SwipeToDismissBoxValue,
} from './SwipeToDismissBox.logic';
import './swipe-to-dismiss-box.css';

interface ActiveGesture {
  pointerId: number;
  startX: number;
  startY: number;
  lastX: number;
  lastTime: number;
  velocity: number;
  locked: boolean;
}

export interface SwipeToDismissBoxProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Controlled logical dismiss value. */
  value?: SwipeToDismissBoxValue;
  /** Initial value when uncontrolled. */
  defaultValue?: SwipeToDismissBoxValue;
  /** Called whenever a gesture resolves to a new logical value. */
  onValueChange?: (value: SwipeToDismissBoxValue) => void;
  /** Called exactly once when a gesture settles in a dismissed direction. */
  onDismiss?: (direction: Exclude<SwipeToDismissBoxValue, 'settled'>) => void;
  /** Content revealed underneath the foreground while swiping. */
  backgroundContent: ReactNode;
  /** Foreground content that moves horizontally. */
  children: ReactNode;
  /** Enables logical start-to-end dismissal. */
  enableDismissFromStartToEnd?: boolean;
  /** Enables logical end-to-start dismissal. */
  enableDismissFromEndToStart?: boolean;
  /** Enables pointer/touch gestures without disabling foreground interaction. */
  gesturesEnabled?: boolean;
  /** Positional threshold in CSS pixels. Defaults to the pinned Material 3 56dp value. */
  positionalThreshold?: number;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function joinClassName(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(' ');
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
}

export function SwipeToDismissBox({
  value: controlledValue,
  defaultValue = 'settled',
  onValueChange,
  onDismiss,
  backgroundContent,
  children,
  enableDismissFromStartToEnd = true,
  enableDismissFromEndToStart = true,
  gesturesEnabled = true,
  positionalThreshold = SWIPE_TO_DISMISS_POSITIONAL_THRESHOLD,
  className,
  style,
  dir,
  ...props
}: SwipeToDismissBoxProps) {
  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const value = controlledValue ?? uncontrolledValue;
  const rootRef = useRef<HTMLDivElement>(null);
  const gestureRef = useRef<ActiveGesture | null>(null);
  const [width, setWidth] = useState(0);
  const [dragOffset, setDragOffset] = useState<number | null>(null);
  const [settling, setSettling] = useState(false);
  const [renderedValue, setRenderedValue] = useState<SwipeToDismissBoxValue>(value);
  const dismissFiredForRef = useRef<SwipeToDismissBoxValue>('settled');

  useLayoutEffect(() => {
    const element = rootRef.current;
    if (!element) return;
    const measure = () => setWidth(element.clientWidth);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setRenderedValue(value);
    if (value === 'settled') dismissFiredForRef.current = 'settled';
  }, [value]);

  const rtl = dir === 'rtl';
  const logicalSign = rtl ? -1 : 1;
  const restingLogicalOffset =
    renderedValue === 'start-to-end'
      ? width
      : renderedValue === 'end-to-start'
        ? -width
        : 0;
  const physicalOffset = (dragOffset ?? restingLogicalOffset) * logicalSign;

  const commitValue = (target: SwipeToDismissBoxValue) => {
    setSettling(true);
    setRenderedValue(target);
    setDragOffset(null);
    if (!isControlled) setUncontrolledValue(target);
    if (target !== value) onValueChange?.(target);

    if (target === 'settled') {
      dismissFiredForRef.current = 'settled';
    } else if (dismissFiredForRef.current !== target) {
      dismissFiredForRef.current = target;
      onDismiss?.(target);
    }

    if (prefersReducedMotion()) setSettling(false);
  };

  const beginGesture = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (
      !gesturesEnabled ||
      renderedValue !== 'settled' ||
      !event.isPrimary ||
      event.button !== 0
    ) {
      return;
    }

    gestureRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastTime: event.timeStamp,
      velocity: 0,
      locked: false,
    };
  };

  const moveGesture = (event: ReactPointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId || !width) return;

    const physicalDeltaX = event.clientX - gesture.startX;
    const deltaY = event.clientY - gesture.startY;
    const logicalDelta = physicalDeltaX * logicalSign;

    if (!gesture.locked) {
      const absX = Math.abs(physicalDeltaX);
      const absY = Math.abs(deltaY);
      if (absY >= SWIPE_TO_DISMISS_INTENT_SLOP && absY > absX) {
        gestureRef.current = null;
        return;
      }
      if (absX < SWIPE_TO_DISMISS_INTENT_SLOP || absX <= absY) return;
      gesture.locked = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    const minimum = enableDismissFromEndToStart ? -width : 0;
    const maximum = enableDismissFromStartToEnd ? width : 0;
    setDragOffset(clamp(logicalDelta, minimum, maximum));

    const elapsed = event.timeStamp - gesture.lastTime;
    if (elapsed > 0) {
      gesture.velocity =
        (((event.clientX - gesture.lastX) * logicalSign) / elapsed) * 1000;
    }
    gesture.lastX = event.clientX;
    gesture.lastTime = event.timeStamp;
    event.preventDefault();
  };

  const finishGesture = (event: ReactPointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    gestureRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (!gesture.locked) {
      setDragOffset(null);
      return;
    }

    const logicalOffset = dragOffset ??
      (event.clientX - gesture.startX) * logicalSign;
    const target = resolveSwipeToDismissTarget({
      logicalOffset,
      logicalVelocity: gesture.velocity,
      enableDismissFromStartToEnd,
      enableDismissFromEndToStart,
      positionalThreshold,
    });
    commitValue(target);
  };

  const cancelGesture = (event: ReactPointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    gestureRef.current = null;
    setDragOffset(null);
    setSettling(true);
    setRenderedValue(value);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (prefersReducedMotion()) setSettling(false);
  };

  const direction = dismissValueForLogicalOffset(dragOffset ?? restingLogicalOffset);

  return (
    <div
      {...props}
      className={joinClassName('swipe-to-dismiss-box', className)}
      data-direction={direction}
      data-gestures-enabled={gesturesEnabled || undefined}
      data-state={renderedValue}
      dir={dir}
      ref={rootRef}
      style={
        {
          '--_swipe-to-dismiss-offset': `${physicalOffset}px`,
          '--_swipe-to-dismiss-transition': settling ? 'transform 220ms cubic-bezier(0.2, 0, 0, 1)' : 'none',
          ...style,
        } as CSSProperties
      }
    >
      <div className="swipe-to-dismiss-box__background">
        {backgroundContent}
      </div>
      <div
        className="swipe-to-dismiss-box__foreground"
        data-swipe-foreground=""
        onLostPointerCapture={cancelGesture}
        onPointerCancel={cancelGesture}
        onPointerDown={beginGesture}
        onPointerMove={moveGesture}
        onPointerUp={finishGesture}
        onTransitionEnd={(event) => {
          if (event.propertyName === 'transform') setSettling(false);
        }}
      >
        {children}
      </div>
    </div>
  );
}

export type { SwipeToDismissBoxValue } from './SwipeToDismissBox.logic';
