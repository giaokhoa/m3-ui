import {
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import {
  getBottomSheetStyle,
  type BottomSheetStyle,
  type BottomSheetStyleOptions,
} from './BottomSheet.defaults';
import {
  SheetState,
  SheetValue,
  calculateSheetAnchors,
  dampenSheetVelocity,
  resolveSheetTarget,
  useSheetState,
  type SheetAnchors,
} from './SheetState';
import './bottom-sheet.css';

interface SheetLayout {
  viewportHeight: number;
  sheetHeight: number;
  anchors: SheetAnchors;
  expandedAnchor: number;
}

interface ActiveDrag {
  pointerId: number;
  startY: number;
  startOffset: number;
  lastY: number;
  lastTime: number;
  velocity: number;
  moved: boolean;
}

export interface BottomSheetProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color'>,
    BottomSheetStyleOptions {
  /** Compose-like state controller. An internal hidden state is used when omitted. */
  state?: SheetState;
  /** Enables pointer drag and the built-in handle action. */
  gesturesEnabled?: boolean;
  /** Replace the canonical handle bar; pass null to remove the drag affordance. */
  dragHandle?: ReactNode | null;
  /** Called when a user gesture or handle action settles to Hidden. */
  onDismissRequest?: () => void;
}

function closeEnough(a: number, b: number) {
  return Math.abs(a - b) < 0.5;
}

function layoutsEqual(a: SheetLayout | null, b: SheetLayout) {
  if (!a) return false;
  if (
    !closeEnough(a.viewportHeight, b.viewportHeight) ||
    !closeEnough(a.sheetHeight, b.sheetHeight)
  ) {
    return false;
  }

  for (const value of Object.values(SheetValue)) {
    const left = a.anchors[value];
    const right = b.anchors[value];
    if (left === undefined || right === undefined) {
      if (left !== right) return false;
    } else if (!closeEnough(left, right)) {
      return false;
    }
  }
  return true;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function anchorBounds(anchors: SheetAnchors): [number, number] {
  const offsets = Object.values(anchors).filter(
    (value): value is number => value !== undefined,
  );
  return [Math.min(...offsets), Math.max(...offsets)];
}

function restingOffset(state: SheetState, layout: SheetLayout): number {
  const anchor =
    layout.anchors[state.currentValue] ??
    layout.anchors[SheetValue.Expanded] ??
    layout.expandedAnchor;
  return Math.max(0, anchor - layout.expandedAnchor);
}

function handleActionLabel(state: SheetState): string {
  if (state.currentValue === SheetValue.PartiallyExpanded) {
    return 'Expand bottom sheet';
  }
  if (state.currentValue === SheetValue.Expanded) {
    return state.hasPartiallyExpandedState
      ? 'Collapse bottom sheet'
      : state.enabledValues.has(SheetValue.Hidden)
        ? 'Dismiss bottom sheet'
        : 'Bottom sheet drag handle';
  }
  return 'Show bottom sheet';
}

export function BottomSheet({
  state,
  gesturesEnabled = true,
  dragHandle,
  onDismissRequest,
  containerColor,
  contentColor,
  dragHandleColor,
  focusIndicatorColor,
  maxWidth,
  className,
  style,
  children,
  role = 'region',
  'aria-label': ariaLabel = 'Bottom sheet',
  'aria-hidden': ariaHidden,
  inert,
  ...props
}: BottomSheetProps) {
  const internalState = useSheetState();
  const sheetState = state ?? internalState;
  useSyncExternalStore(
    sheetState.subscribe,
    sheetState.getSnapshot,
    sheetState.getSnapshot,
  );

  const sheetRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<ActiveDrag | null>(null);
  const suppressClickRef = useRef(false);
  const [layout, setLayout] = useState<SheetLayout | null>(null);
  const [dragOffset, setDragOffset] = useState<number | null>(null);

  useLayoutEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet || typeof window === 'undefined') return;

    const measure = () => {
      const offsetParent = sheet.offsetParent;
      const measuredViewportHeight =
        offsetParent instanceof HTMLElement
          ? offsetParent.clientHeight
          : window.innerHeight;
      const viewportHeight =
        measuredViewportHeight > 0
          ? measuredViewportHeight
          : window.innerHeight;
      const sheetHeight = sheet.offsetHeight;
      const anchors = calculateSheetAnchors({
        viewportHeight,
        sheetHeight,
        enabledValues: sheetState.enabledValues,
      });
      const expandedAnchor =
        anchors[SheetValue.Expanded] ??
        Math.max(0, viewportHeight - sheetHeight);
      const nextLayout = {
        viewportHeight,
        sheetHeight,
        anchors,
        expandedAnchor,
      };

      sheetState.reconcileAnchors(anchors);
      setLayout((current) =>
        layoutsEqual(current, nextLayout) ? current : nextLayout,
      );
    };

    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }

    const observer = new ResizeObserver(measure);
    observer.observe(sheet);
    if (sheet.offsetParent instanceof Element) {
      observer.observe(sheet.offsetParent);
    }
    return () => observer.disconnect();
  }, [sheetState]);

  const beginDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (
      !gesturesEnabled ||
      !layout ||
      sheetState.currentValue === SheetValue.Hidden ||
      !event.isPrimary ||
      event.button !== 0
    ) {
      return;
    }

    const offset = restingOffset(sheetState, layout);
    dragRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startOffset: offset,
      lastY: event.clientY,
      lastTime: event.timeStamp,
      velocity: 0,
      moved: false,
    };
    setDragOffset(offset);
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  const moveDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || !layout || drag.pointerId !== event.pointerId) return;

    const [minimum, maximum] = anchorBounds(layout.anchors);
    const delta = event.clientY - drag.startY;
    const absoluteOffset = clamp(
      layout.expandedAnchor + drag.startOffset + delta,
      minimum,
      maximum,
    );
    setDragOffset(absoluteOffset - layout.expandedAnchor);

    const elapsed = event.timeStamp - drag.lastTime;
    if (elapsed > 0) {
      drag.velocity = ((event.clientY - drag.lastY) / elapsed) * 1000;
    }
    drag.lastY = event.clientY;
    drag.lastTime = event.timeStamp;
    drag.moved ||= Math.abs(delta) >= 4;
    event.preventDefault();
  };

  const finishDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || !layout || drag.pointerId !== event.pointerId) return;

    const [minimum, maximum] = anchorBounds(layout.anchors);
    const absoluteOffset = clamp(
      layout.expandedAnchor +
        drag.startOffset +
        (event.clientY - drag.startY),
      minimum,
      maximum,
    );
    const velocity = dampenSheetVelocity(
      drag.velocity,
      absoluteOffset,
      layout.anchors,
    );
    const target = resolveSheetTarget({
      currentValue: sheetState.currentValue,
      offset: absoluteOffset,
      velocity,
      anchors: layout.anchors,
      positionalThreshold: sheetState.positionalThreshold,
      velocityThreshold: sheetState.velocityThreshold,
    });
    const wasVisible = sheetState.isVisible;
    const accepted = sheetState.setValue(target);

    suppressClickRef.current = drag.moved;
    dragRef.current = null;
    setDragOffset(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (
      accepted &&
      wasVisible &&
      target === SheetValue.Hidden
    ) {
      onDismissRequest?.();
    }
  };

  const cancelDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    suppressClickRef.current = drag.moved;
    dragRef.current = null;
    setDragOffset(null);
  };

  const activateHandle = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    if (!gesturesEnabled) return;

    if (sheetState.currentValue === SheetValue.PartiallyExpanded) {
      sheetState.expand();
      return;
    }

    if (sheetState.currentValue === SheetValue.Expanded) {
      if (sheetState.hasPartiallyExpandedState) {
        sheetState.partialExpand();
      } else if (sheetState.enabledValues.has(SheetValue.Hidden)) {
        const wasVisible = sheetState.isVisible;
        if (sheetState.hide() && wasVisible) onDismissRequest?.();
      }
      return;
    }

    sheetState.show();
  };

  const offset =
    dragOffset ??
    (layout ? restingOffset(sheetState, layout) : null);
  const hidden = sheetState.currentValue === SheetValue.Hidden;
  const sheetStyle: BottomSheetStyle = {
    ...getBottomSheetStyle({
      containerColor,
      contentColor,
      dragHandleColor,
      focusIndicatorColor,
      maxWidth,
    }),
    '--_bottom-sheet-offset':
      offset === null ? (hidden ? '100%' : '0px') : `${offset}px`,
    ...style,
  };

  return (
    <div
      {...props}
      ref={sheetRef}
      role={role}
      aria-label={ariaLabel}
      aria-hidden={hidden ? true : ariaHidden}
      inert={hidden ? true : inert}
      className={['bottom-sheet', className].filter(Boolean).join(' ')}
      data-dragging={dragOffset !== null || undefined}
      data-ready={layout !== null || undefined}
      data-state={sheetState.currentValue}
      style={sheetStyle}
    >
      {dragHandle === null ? null : (
        <button
          type="button"
          className="bottom-sheet__drag-handle"
          aria-label={handleActionLabel(sheetState)}
          disabled={!gesturesEnabled}
          onClick={activateHandle}
          onLostPointerCapture={cancelDrag}
          onPointerCancel={cancelDrag}
          onPointerDown={beginDrag}
          onPointerMove={moveDrag}
          onPointerUp={finishDrag}
        >
          {dragHandle === undefined ? (
            <span aria-hidden="true" className="bottom-sheet__drag-handle-bar" />
          ) : (
            dragHandle
          )}
        </button>
      )}
      <div className="bottom-sheet__content">{children}</div>
    </div>
  );
}
