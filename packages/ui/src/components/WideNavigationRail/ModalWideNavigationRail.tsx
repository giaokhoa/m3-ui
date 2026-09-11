import clsx from 'clsx';
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import {
  Modal as AriaModal,
  ModalOverlay as AriaModalOverlay,
} from 'react-aria-components';
import { useThemePortalContainer } from '../../theme/ThemePortalContext';
import { Scrim } from '../Scrim';
import {
  WideNavigationRail,
  type WideNavigationRailArrangement,
} from './WideNavigationRail';
import '@m3-ui/tokens/elevation.css';
import '../../internal/elevation/elevation.css';
import {
  WideNavigationRailState,
  WideNavigationRailValue,
  useWideNavigationRailState,
} from './WideNavigationRailState';
import {
  calculateModalWideNavigationRailFraction,
  getModalWideNavigationRailStyle,
  modalWideNavigationRailRuntime,
  modalWideNavigationRailTokens,
  shouldDismissModalWideNavigationRail,
  type ModalWideNavigationRailStyleOptions,
} from './ModalWideNavigationRail.defaults';
import './modal-wide-navigation-rail.css';

type HostProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  | 'onLostPointerCapture'
  | 'onPointerCancel'
  | 'onPointerDown'
  | 'onPointerMove'
  | 'onPointerUp'
>;

export interface ModalWideNavigationRailProps
  extends HostProps,
    ModalWideNavigationRailStyleOptions {
  state?: WideNavigationRailState;
  hideOnCollapse?: boolean;
  header?: ReactNode;
  expandedHeaderTopPadding?: CSSProperties['paddingTop'];
  arrangement?: WideNavigationRailArrangement;
  gesturesEnabled?: boolean;
  shouldDismissOnEscape?: boolean;
  scrimColor?: CSSProperties['backgroundColor'];
  scrimOpacity?: number;
  UNSTABLE_portalContainer?: Element;
  children: ReactNode;
}

interface ActiveDrag {
  pointerId: number;
  host: HTMLElement;
  direction: 1 | -1;
  startX: number;
  width: number;
  moved: boolean;
}

const focusableSelector = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function durationToMilliseconds(duration: string): number {
  const normalized = duration.trim();
  const value = Number.parseFloat(normalized);
  if (!Number.isFinite(value)) return 0;
  if (normalized.endsWith('ms')) return value;
  if (normalized.endsWith('s')) return value * 1000;
  return 0;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function ModalWideNavigationRail({
  state,
  hideOnCollapse = false,
  header,
  expandedHeaderTopPadding = 0,
  arrangement = 'top',
  gesturesEnabled = true,
  shouldDismissOnEscape = true,
  modalContainerColor,
  modalContentColor,
  modalShape,
  scrimColor,
  scrimOpacity,
  UNSTABLE_portalContainer,
  className,
  style,
  children,
  'aria-label': ariaLabel = 'Primary navigation',
  ...props
}: ModalWideNavigationRailProps) {
  const fallbackState = useWideNavigationRailState();
  const railState = state ?? fallbackState;
  useSyncExternalStore(
    railState.subscribe,
    railState.getSnapshot,
    railState.getSnapshot,
  );

  const themePortalContainer = useThemePortalContainer();
  const expanded = railState.targetValue === WideNavigationRailValue.Expanded;
  const [collapsedRailState] = useState(
    () =>
      new WideNavigationRailState({
        initialValue: WideNavigationRailValue.Collapsed,
      }),
  );
  const [modalRailState] = useState(
    () =>
      new WideNavigationRailState({
        initialValue: hideOnCollapse
          ? WideNavigationRailValue.Expanded
          : WideNavigationRailValue.Collapsed,
      }),
  );
  const [overlayMounted, setOverlayMounted] = useState(false);
  const [visualExpanded, setVisualExpanded] = useState(false);
  const [dragOffset, setDragOffset] = useState<number | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<ActiveDrag | null>(null);
  const suppressClickRef = useRef(false);
  const suppressClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = () => {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const suppressNextClick = () => {
    if (suppressClickTimerRef.current !== null) {
      clearTimeout(suppressClickTimerRef.current);
    }
    suppressClickRef.current = true;
    suppressClickTimerRef.current = setTimeout(() => {
      suppressClickRef.current = false;
      suppressClickTimerRef.current = null;
    }, 0);
  };

  const consumeSuppressedClick = () => {
    if (!suppressClickRef.current) return false;
    suppressClickRef.current = false;
    if (suppressClickTimerRef.current !== null) {
      clearTimeout(suppressClickTimerRef.current);
      suppressClickTimerRef.current = null;
    }
    return true;
  };

  useEffect(() => {
    clearCloseTimer();
    if (expanded) {
      setOverlayMounted(true);
      const frame = requestAnimationFrame(() => setVisualExpanded(true));
      return () => cancelAnimationFrame(frame);
    }

    setVisualExpanded(false);
    setDragOffset(null);
    if (!overlayMounted) return;

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const motionDuration = hideOnCollapse
      ? modalWideNavigationRailRuntime.motion.slide.duration
      : modalWideNavigationRailRuntime.motion.expandWidth.duration;
    const effectsDuration = modalWideNavigationRailRuntime.motion.effects.duration;
    const delay = reducedMotion
      ? 0
      : Math.max(
          durationToMilliseconds(motionDuration),
          durationToMilliseconds(effectsDuration),
        ) + 32;
    closeTimerRef.current = setTimeout(() => {
      if (railState.targetValue === WideNavigationRailValue.Collapsed) {
        setOverlayMounted(false);
      }
    }, delay);
    return clearCloseTimer;
  }, [expanded, hideOnCollapse, overlayMounted, railState]);

  useEffect(() => {
    modalRailState.snapTo(
      hideOnCollapse || visualExpanded
        ? WideNavigationRailValue.Expanded
        : WideNavigationRailValue.Collapsed,
    );
  }, [hideOnCollapse, modalRailState, visualExpanded]);

  useEffect(() => {
    if (!overlayMounted || !visualExpanded) return;
    const frame = requestAnimationFrame(() => {
      frameRef.current?.querySelector<HTMLElement>(focusableSelector)?.focus({
        preventScroll: true,
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [overlayMounted, visualExpanded]);

  useEffect(
    () => () => {
      clearCloseTimer();
      if (suppressClickTimerRef.current !== null) {
        clearTimeout(suppressClickTimerRef.current);
      }
    },
    [],
  );

  const beginDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (
      !hideOnCollapse ||
      !gesturesEnabled ||
      !expanded ||
      !event.isPrimary ||
      event.button !== 0
    ) {
      return;
    }
    const host = event.currentTarget;
    const frame = frameRef.current;
    const width = frame?.getBoundingClientRect().width ?? 0;
    dragRef.current = {
      pointerId: event.pointerId,
      host,
      direction: getComputedStyle(frame ?? host).direction === 'rtl' ? -1 : 1,
      startX: event.clientX,
      width,
      moved: false,
    };
  };

  const moveDrag = (event: ReactPointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const logicalDelta = (event.clientX - drag.startX) * drag.direction;
    if (!drag.moved && Math.abs(logicalDelta) < modalWideNavigationRailRuntime.dragSlop) {
      return;
    }
    if (!drag.moved) {
      drag.moved = true;
      if (!drag.host.hasPointerCapture(event.pointerId)) {
        drag.host.setPointerCapture(event.pointerId);
      }
    }
    setDragOffset(clamp(logicalDelta, -drag.width, 0));
    event.preventDefault();
  };

  const finishDrag = (event: ReactPointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (!drag.moved) return;

    const logicalDelta = (event.clientX - drag.startX) * drag.direction;
    const offset = clamp(logicalDelta, -drag.width, 0);
    if (shouldDismissModalWideNavigationRail(offset, drag.width)) {
      railState.collapse();
    }
    suppressNextClick();
    setDragOffset(null);
    if (drag.host.hasPointerCapture(event.pointerId)) {
      drag.host.releasePointerCapture(event.pointerId);
    }
    event.preventDefault();
  };

  const cancelDrag = (event: ReactPointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (drag.moved) suppressNextClick();
    setDragOffset(null);
  };

  const frameWidth = frameRef.current?.getBoundingClientRect().width ?? 0;
  const dragFraction =
    dragOffset === null
      ? visualExpanded
        ? 1
        : 0
      : calculateModalWideNavigationRailFraction(dragOffset, frameWidth);
  const modalStyle = getModalWideNavigationRailStyle({
    modalContainerColor,
    modalContentColor,
    modalShape,
  });
  const railStyle = {
    ...modalStyle,
    '--_wide-navigation-rail-spatial-duration':
      'var(--_modal-wide-navigation-rail-width-duration)',
    '--_wide-navigation-rail-spatial-easing':
      'var(--_modal-wide-navigation-rail-width-easing)',
    borderRadius: 'var(--_modal-wide-navigation-rail-radius)',
    ...style,
  } as CSSProperties;
  const frameStyle = {
    ...modalStyle,
    '--_modal-wide-navigation-rail-drag-offset': `${dragOffset ?? 0}px`,
  } as CSSProperties;

  return (
    <div
      {...props}
      className={clsx('modal-wide-navigation-rail-host', className)}
      data-hide-on-collapse={hideOnCollapse || undefined}
      data-state={railState.targetValue}
    >
      {!hideOnCollapse ? (
        <WideNavigationRail
          aria-label={ariaLabel}
          className="modal-wide-navigation-rail__collapsed-rail"
          header={header}
          arrangement={arrangement}
          state={collapsedRailState}
        >
          {overlayMounted ? null : children}
        </WideNavigationRail>
      ) : null}

      <AriaModalOverlay
        isOpen={overlayMounted}
        isDismissable={false}
        isKeyboardDismissDisabled={!shouldDismissOnEscape}
        onOpenChange={(open) => {
          if (!open && shouldDismissOnEscape) railState.collapse();
        }}
        UNSTABLE_portalContainer={
          UNSTABLE_portalContainer ?? themePortalContainer ?? undefined
        }
        className="modal-wide-navigation-rail-overlay"
        data-dragging={dragOffset !== null || undefined}
        data-expanded={visualExpanded || undefined}
        data-hide-on-collapse={hideOnCollapse || undefined}
        data-state={railState.targetValue}
        onClick={(event) => {
          if (frameRef.current?.contains(event.target as Node)) return;
          if (consumeSuppressedClick()) {
            event.preventDefault();
            return;
          }
          railState.collapse();
        }}
      >
        <Scrim
          alpha={dragFraction}
          className="modal-wide-navigation-rail__scrim"
          containerColor={scrimColor ?? modalWideNavigationRailTokens.scrimColor}
          containerOpacity={
            scrimOpacity ?? modalWideNavigationRailTokens.scrimOpacity
          }
        />
        <AriaModal className="modal-wide-navigation-rail__modal">
          <div
            ref={frameRef}
            className="modal-wide-navigation-rail__frame"
            data-dragging={dragOffset !== null || undefined}
            data-expanded={visualExpanded || undefined}
            data-hide-on-collapse={hideOnCollapse || undefined}
            onLostPointerCapture={cancelDrag}
            onPointerCancelCapture={cancelDrag}
            onPointerDownCapture={beginDrag}
            onPointerMoveCapture={moveDrag}
            onPointerUpCapture={finishDrag}
            style={frameStyle}
          >
            <WideNavigationRail
              aria-label={ariaLabel}
              className="modal-wide-navigation-rail__rail elevation-host"
              containerColor={
                modalContainerColor ??
                modalWideNavigationRailTokens.modalContainerColor
              }
              contentColor={modalContentColor}
              data-elevation={modalWideNavigationRailTokens.modalContainerElevation}
              header={
                header !== undefined ? (
                  <div style={{ paddingTop: expandedHeaderTopPadding }}>
                    {header}
                  </div>
                ) : undefined
              }
              arrangement={arrangement}
              state={modalRailState}
              style={railStyle}
            >
              {children}
            </WideNavigationRail>
          </div>
        </AriaModal>
      </AriaModalOverlay>
    </div>
  );
}
