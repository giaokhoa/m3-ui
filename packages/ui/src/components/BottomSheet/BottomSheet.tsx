import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type TransitionEvent as ReactTransitionEvent,
} from 'react';
import {
  Modal as AriaModal,
  ModalOverlay as AriaModalOverlay,
} from 'react-aria-components';
import { useThemePortalContainer } from '../../theme/ThemePortalContext';
import {
  bottomSheetRuntime,
  getBottomSheetStyle,
  getModalBottomSheetOverlayStyle,
  type BottomSheetElevation,
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

export interface ModalBottomSheetProps
  extends Omit<
    BottomSheetProps,
    'elevation' | 'onDismissRequest' | 'role' | 'state'
  > {
  /** Executes after the sheet has completed its Material hide transition. */
  onDismissRequest: () => void;
  /** Compose-like state controller. Hidden must be enabled. */
  state?: SheetState;
  /** Material scrim color. */
  scrimColor?: CSSProperties['backgroundColor'];
  /** Material scrim opacity before animated alpha is applied. */
  scrimOpacity?: number;
  /** Whether pointer interaction on the scrim requests dismissal. */
  shouldDismissOnClickOutside?: boolean;
  /** Whether Escape requests dismissal. */
  shouldDismissOnEscape?: boolean;
  /** Overrides ThemeProvider's portal host when a custom host is required. */
  UNSTABLE_portalContainer?: Element;
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

function durationToMilliseconds(duration: string): number {
  const normalized = duration.trim();
  const value = Number.parseFloat(normalized);
  if (!Number.isFinite(value)) return 0;
  if (normalized.endsWith('ms')) return value;
  if (normalized.endsWith('s')) return value * 1000;
  return 0;
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
  shadowColor,
  elevation = 'standard',
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
      shadowColor,
      elevation,
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

/**
 * Material modal sheet composition. RAC owns portal, modal focus containment,
 * outside interaction, Escape handling, scroll locking and focus restoration.
 * SheetState remains the single owner of Material anchors and drag settling.
 */
export function ModalBottomSheet({
  state,
  onDismissRequest,
  scrimColor,
  scrimOpacity,
  shouldDismissOnClickOutside = true,
  shouldDismissOnEscape = true,
  UNSTABLE_portalContainer,
  onTransitionEnd,
  ...sheetProps
}: ModalBottomSheetProps) {
  const internalState = useSheetState();
  const sheetState = state ?? internalState;
  useSyncExternalStore(
    sheetState.subscribe,
    sheetState.getSnapshot,
    sheetState.getSnapshot,
  );

  if (!sheetState.enabledValues.has(SheetValue.Hidden)) {
    throw new Error('ModalBottomSheet requires Hidden to be an enabled sheet value.');
  }

  const themePortalContainer = useThemePortalContainer();
  const modalRef = useRef<HTMLDivElement>(null);
  const [overlayOpen, setOverlayOpen] = useState(true);
  const pendingDismissRef = useRef(false);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissCallbackRef = useRef(onDismissRequest);
  dismissCallbackRef.current = onDismissRequest;

  const clearDismissTimer = () => {
    if (dismissTimerRef.current !== null) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  };

  const finishDismiss = () => {
    if (!pendingDismissRef.current) return;
    pendingDismissRef.current = false;
    clearDismissTimer();
    setOverlayOpen(false);
    dismissCallbackRef.current();
  };

  const armDismissFallback = () => {
    clearDismissTimer();
    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const duration = reducedMotion
      ? 0
      : durationToMilliseconds(bottomSheetRuntime.motion.hide.duration) + 32;
    dismissTimerRef.current = setTimeout(finishDismiss, duration);
  };

  const requestDismiss = () => {
    if (pendingDismissRef.current || !overlayOpen) return;
    pendingDismissRef.current = true;
    const accepted = sheetState.hide();
    if (!accepted) {
      pendingDismissRef.current = false;
      return;
    }
    armDismissFallback();
  };

  useLayoutEffect(() => {
    if (sheetState.currentValue === SheetValue.Hidden) {
      sheetState.show();
    }
    if (typeof window === 'undefined') return;

    const frame = window.requestAnimationFrame(() => {
      const dialog =
        modalRef.current?.querySelector<HTMLElement>('[role="dialog"]');
      if (!dialog) return;

      const activeElement = document.activeElement;
      if (!activeElement || !dialog.contains(activeElement)) {
        dialog.focus({ preventScroll: true });
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [sheetState]);

  useEffect(
    () => () => {
      clearDismissTimer();
    },
    [],
  );

  const handleTransitionEnd = (
    event: ReactTransitionEvent<HTMLDivElement>,
  ) => {
    onTransitionEnd?.(event);
    if (
      pendingDismissRef.current &&
      sheetState.currentValue === SheetValue.Hidden &&
      event.target === event.currentTarget &&
      event.propertyName === 'transform'
    ) {
      finishDismiss();
    }
  };

  const scrimVisible = sheetState.currentValue !== SheetValue.Hidden;

  return (
    <AriaModalOverlay
      isOpen={overlayOpen}
      isDismissable={shouldDismissOnClickOutside}
      isKeyboardDismissDisabled={!shouldDismissOnEscape}
      onMouseDown={(event) => {
        if (
          !shouldDismissOnClickOutside &&
          event.target === event.currentTarget
        ) {
          event.preventDefault();
        }
      }}
      onOpenChange={(open) => {
        if (!open) requestDismiss();
      }}
      UNSTABLE_portalContainer={
        UNSTABLE_portalContainer ?? themePortalContainer ?? undefined
      }
      className="modal-bottom-sheet-overlay"
      style={getModalBottomSheetOverlayStyle({
        scrimColor,
        scrimOpacity,
        scrimAlpha: scrimVisible ? 1 : 0,
      })}
    >
      <AriaModal ref={modalRef} className="modal-bottom-sheet-modal">
        <BottomSheet
          {...sheetProps}
          state={sheetState}
          elevation={'modal' satisfies BottomSheetElevation}
          role="dialog"
          aria-modal="true"
          tabIndex={sheetProps.tabIndex ?? -1}
          onDismissRequest={requestDismiss}
          onTransitionEnd={handleTransitionEnd}
        />
      </AriaModal>
    </AriaModalOverlay>
  );
}