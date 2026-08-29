import clsx from 'clsx';
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
  Button as AriaButton,
  Modal as AriaModal,
  ModalOverlay as AriaModalOverlay,
  type ButtonProps as AriaButtonProps,
} from 'react-aria-components';
import { Ripple, useRipple } from '../../internal/ripple';
import { useThemePortalContainer } from '../../theme/ThemePortalContext';
import {
  getDismissibleDrawerSheetStyle,
  getModalDrawerSheetStyle,
  getModalNavigationDrawerOverlayStyle,
  getNavigationDrawerItemStyle,
  getNavigationDrawerMotionStyle,
  getPermanentDrawerSheetStyle,
  navigationDrawerRuntime,
  type DismissibleDrawerSheetStyleOptions,
  type ModalDrawerSheetStyleOptions,
  type NavigationDrawerStyle,
  type PermanentDrawerSheetStyleOptions,
} from './NavigationDrawer.defaults';
import {
  DrawerState,
  DrawerValue,
  calculateDrawerAnchors,
  calculateDrawerFraction,
  resolveDrawerTarget,
  useDrawerState,
} from './DrawerState';
import './navigation-drawer.css';

export interface NavigationDrawerItemProps
  extends Omit<AriaButtonProps, 'children'> {
  selected: boolean;
  icon?: ReactNode;
  badge?: ReactNode;
  children: ReactNode;
}

type DrawerSheetDomProps = Omit<HTMLAttributes<HTMLElement>, 'color'>;

export interface PermanentDrawerSheetProps
  extends DrawerSheetDomProps,
    PermanentDrawerSheetStyleOptions {}

export interface DismissibleDrawerSheetProps
  extends DrawerSheetDomProps,
    DismissibleDrawerSheetStyleOptions {}

export interface ModalDrawerSheetProps
  extends DrawerSheetDomProps,
    ModalDrawerSheetStyleOptions {}

export interface PermanentNavigationDrawerProps
  extends HTMLAttributes<HTMLDivElement> {
  drawerContent: ReactNode;
}

type GestureRootProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  | 'onLostPointerCapture'
  | 'onPointerCancel'
  | 'onPointerDown'
  | 'onPointerMove'
  | 'onPointerUp'
>;

export interface DismissibleNavigationDrawerProps extends GestureRootProps {
  drawerContent: ReactNode;
  state?: DrawerState;
  gesturesEnabled?: boolean;
}

export interface ModalNavigationDrawerProps extends GestureRootProps {
  drawerContent: ReactNode;
  state?: DrawerState;
  gesturesEnabled?: boolean;
  scrimColor?: CSSProperties['backgroundColor'];
  scrimOpacity?: number;
  UNSTABLE_portalContainer?: Element;
}

interface ActiveDrag {
  pointerId: number;
  host: HTMLElement;
  direction: 1 | -1;
  startX: number;
  startOffset: number;
  lastX: number;
  lastTime: number;
  velocity: number;
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

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function durationToMilliseconds(duration: string): number {
  const normalized = duration.trim();
  const value = Number.parseFloat(normalized);
  if (!Number.isFinite(value)) return 0;
  if (normalized.endsWith('ms')) return value;
  if (normalized.endsWith('s')) return value * 1000;
  return 0;
}

function useDrawerWidth(
  frameRef: React.RefObject<HTMLDivElement | null>,
  active = true,
) {
  const [width, setWidth] = useState(navigationDrawerRuntime.maximumDrawerWidth);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    if (!active) return;
    const frame = frameRef.current;
    if (!frame) return;

    const measure = () => {
      const measured = frame.getBoundingClientRect().width;
      if (measured > 0) {
        setWidth((current) => (Math.abs(current - measured) < 0.5 ? current : measured));
        setReady(true);
      }
    };

    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [active, frameRef]);

  return { width, ready };
}

function useFocusFirstWhenOpen(
  state: DrawerState,
  frameRef: React.RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    if (!state.isOpen || typeof window === 'undefined') return;
    const frame = window.requestAnimationFrame(() => {
      const first = frameRef.current?.querySelector<HTMLElement>(focusableSelector);
      first?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [frameRef, state, state.isOpen]);
}

function useDrawerGesture(
  state: DrawerState,
  drawerWidth: number,
  gesturesEnabled: boolean,
) {
  const dragRef = useRef<ActiveDrag | null>(null);
  const suppressClickRef = useRef(false);
  const suppressClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dragOffset, setDragOffset] = useState<number | null>(null);

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

  useEffect(
    () => () => {
      if (suppressClickTimerRef.current !== null) {
        clearTimeout(suppressClickTimerRef.current);
      }
    },
    [],
  );

  const begin = (event: ReactPointerEvent<HTMLElement>) => {
    if (!gesturesEnabled || !event.isPrimary || event.button !== 0) return;
    const direction = getComputedStyle(event.currentTarget).direction === 'rtl' ? -1 : 1;
    dragRef.current = {
      pointerId: event.pointerId,
      host: event.currentTarget,
      direction,
      startX: event.clientX,
      startOffset: state.isOpen ? 0 : -drawerWidth,
      lastX: event.clientX,
      lastTime: event.timeStamp,
      velocity: 0,
      moved: false,
    };
  };

  const move = (event: ReactPointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const physicalDelta = event.clientX - drag.startX;
    const logicalDelta = physicalDelta * drag.direction;

    if (!drag.moved && Math.abs(logicalDelta) < navigationDrawerRuntime.dragSlop) {
      return;
    }
    if (!drag.moved) {
      drag.moved = true;
      if (!drag.host.hasPointerCapture(event.pointerId)) {
        drag.host.setPointerCapture(event.pointerId);
      }
    }

    const offset = clamp(drag.startOffset + logicalDelta, -drawerWidth, 0);
    setDragOffset(offset);
    const elapsed = event.timeStamp - drag.lastTime;
    if (elapsed > 0) {
      drag.velocity = (((event.clientX - drag.lastX) / elapsed) * 1000) * drag.direction;
    }
    drag.lastX = event.clientX;
    drag.lastTime = event.timeStamp;
    event.preventDefault();
  };

  const finish = (event: ReactPointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;

    if (!drag.moved) return;
    const logicalDelta = (event.clientX - drag.startX) * drag.direction;
    const offset = clamp(drag.startOffset + logicalDelta, -drawerWidth, 0);
    const anchors = calculateDrawerAnchors(drawerWidth);
    const target = resolveDrawerTarget({
      currentValue: state.currentValue,
      offset,
      velocity: drag.velocity,
      anchors,
      positionalThreshold: state.positionalThreshold,
      velocityThreshold: state.velocityThreshold,
    });
    state.setValue(target);
    suppressNextClick();
    setDragOffset(null);
    if (drag.host.hasPointerCapture(event.pointerId)) {
      drag.host.releasePointerCapture(event.pointerId);
    }
    event.preventDefault();
  };

  const cancel = (event: ReactPointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (drag.moved) suppressNextClick();
    setDragOffset(null);
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

  return {
    dragOffset,
    isDragging: dragOffset !== null,
    begin,
    move,
    finish,
    cancel,
    consumeSuppressedClick,
  };
}

export function NavigationDrawerItem({
  selected,
  icon,
  badge,
  children,
  className,
  style,
  render,
  onPressStart,
  onPressEnd,
  ...props
}: NavigationDrawerItemProps) {
  const ripple = useRipple();
  const handlePressStart: AriaButtonProps['onPressStart'] = (event) => {
    ripple.onPressStart(event);
    onPressStart?.(event);
  };
  const handlePressEnd: AriaButtonProps['onPressEnd'] = (event) => {
    ripple.onPressEnd();
    onPressEnd?.(event);
  };

  return (
    <AriaButton
      {...props}
      data-selected={selected || undefined}
      render={(domProps, renderProps) => {
        const tabProps = {
          ...domProps,
          role: 'tab' as const,
          'aria-selected': selected,
        };
        return render ? render(tabProps, renderProps) : <button {...tabProps} />;
      }}
      className={(renderProps) => {
        const userClassName = typeof className === 'function' ? className(renderProps) : className;
        return userClassName ? `navigation-drawer-item ${userClassName}` : 'navigation-drawer-item';
      }}
      style={(renderProps) => {
        const userStyle = typeof style === 'function' ? style(renderProps) : style;
        return {
          ...getNavigationDrawerItemStyle(selected, {
            isHovered: renderProps.isHovered,
            isPressed: renderProps.isPressed,
            isFocusVisible: renderProps.isFocusVisible,
          }),
          ...userStyle,
        };
      }}
      onPressStart={handlePressStart}
      onPressEnd={handlePressEnd}
    >
      {(renderProps) => (
        <>
          <Ripple
            controller={ripple}
            focusRingRadius="var(--_navigation-drawer-item-radius)"
            isFocusVisible={renderProps.isFocusVisible}
            stateInteraction={
              renderProps.isFocusVisible ? 'focus' : renderProps.isHovered ? 'hover' : null
            }
          />
          {icon ? <span aria-hidden="true" className="navigation-drawer-item__icon">{icon}</span> : null}
          <span className="navigation-drawer-item__label">{children}</span>
          {badge ? <span className="navigation-drawer-item__badge">{badge}</span> : null}
        </>
      )}
    </AriaButton>
  );
}

function DrawerSheet({
  variant,
  containerColor,
  contentColor,
  width,
  shape,
  className,
  style,
  children,
  'aria-label': ariaLabel = 'Navigation menu',
  ...props
}: DrawerSheetDomProps &
  PermanentDrawerSheetStyleOptions & {
    variant: 'permanent' | 'dismissible' | 'modal';
  }) {
  const styleFactory =
    variant === 'modal'
      ? getModalDrawerSheetStyle
      : variant === 'dismissible'
        ? getDismissibleDrawerSheetStyle
        : getPermanentDrawerSheetStyle;
  const sheetStyle = {
    ...styleFactory({ containerColor, contentColor, width, shape }),
    ...style,
  } as CSSProperties;

  return (
    <aside
      {...props}
      aria-label={ariaLabel}
      className={clsx('navigation-drawer-sheet',
        `${variant}-drawer-sheet`,
        className,)}
      style={sheetStyle}
    >
      {children}
    </aside>
  );
}

export function PermanentDrawerSheet(props: PermanentDrawerSheetProps) {
  return <DrawerSheet {...props} variant="permanent" />;
}

export function DismissibleDrawerSheet(props: DismissibleDrawerSheetProps) {
  return <DrawerSheet {...props} variant="dismissible" />;
}

export function ModalDrawerSheet(props: ModalDrawerSheetProps) {
  return <DrawerSheet {...props} variant="modal" />;
}

export function PermanentNavigationDrawer({
  drawerContent,
  className,
  children,
  ...props
}: PermanentNavigationDrawerProps) {
  return (
    <div
      {...props}
      className={clsx('permanent-navigation-drawer', className)}
    >
      {drawerContent}
      <div className="permanent-navigation-drawer__content">{children}</div>
    </div>
  );
}

export function DismissibleNavigationDrawer({
  drawerContent,
  state,
  gesturesEnabled = true,
  className,
  style,
  children,
  onKeyUp,
  ...props
}: DismissibleNavigationDrawerProps) {
  const internalState = useDrawerState();
  const drawerState = state ?? internalState;
  useSyncExternalStore(drawerState.subscribe, drawerState.getSnapshot, drawerState.getSnapshot);

  const frameRef = useRef<HTMLDivElement>(null);
  const { width: drawerWidth, ready } = useDrawerWidth(frameRef);
  const gesture = useDrawerGesture(drawerState, drawerWidth, gesturesEnabled);
  const offset = gesture.dragOffset ?? (drawerState.isOpen ? 0 : -drawerWidth);
  useFocusFirstWhenOpen(drawerState, frameRef);

  const rootStyle: NavigationDrawerStyle = {
    ...getNavigationDrawerMotionStyle(offset, drawerWidth),
    ...style,
  };

  return (
    <div
      {...props}
      className={clsx('dismissible-navigation-drawer', className)}
      data-dragging={gesture.isDragging || undefined}
      data-ready={ready || undefined}
      data-state={drawerState.currentValue}
      style={rootStyle}
      onKeyUp={(event) => {
        onKeyUp?.(event);
        if (!event.defaultPrevented && drawerState.isOpen && event.key === 'Escape') {
          if (drawerState.close()) event.preventDefault();
        }
      }}
      onLostPointerCapture={gesture.cancel}
      onPointerCancel={gesture.cancel}
      onPointerDown={gesture.begin}
      onPointerMove={gesture.move}
      onPointerUp={gesture.finish}
    >
      <div
        ref={frameRef}
        aria-hidden={drawerState.isClosed && !gesture.isDragging ? true : undefined}
        className="dismissible-navigation-drawer__sheet-frame"
        inert={drawerState.isClosed && !gesture.isDragging ? true : undefined}
      >
        {drawerContent}
      </div>
      <div className="dismissible-navigation-drawer__content">{children}</div>
    </div>
  );
}

export function ModalNavigationDrawer({
  drawerContent,
  state,
  gesturesEnabled = true,
  scrimColor,
  scrimOpacity,
  UNSTABLE_portalContainer,
  className,
  style,
  children,
  ...props
}: ModalNavigationDrawerProps) {
  const internalState = useDrawerState();
  const drawerState = state ?? internalState;
  useSyncExternalStore(drawerState.subscribe, drawerState.getSnapshot, drawerState.getSnapshot);

  const themePortalContainer = useThemePortalContainer();
  const frameRef = useRef<HTMLDivElement>(null);
  const [keepOverlayMounted, setKeepOverlayMounted] = useState(drawerState.isOpen);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overlayActive = keepOverlayMounted || drawerState.isOpen;
  const { width: drawerWidth } = useDrawerWidth(frameRef, overlayActive);
  const gesture = useDrawerGesture(drawerState, drawerWidth, gesturesEnabled);
  const offset = gesture.dragOffset ?? (drawerState.isOpen ? 0 : -drawerWidth);
  const anchors = calculateDrawerAnchors(drawerWidth);
  const fraction = calculateDrawerFraction(offset, anchors);
  const overlayVisible = overlayActive || gesture.isDragging;
  useFocusFirstWhenOpen(drawerState, frameRef);

  const clearCloseTimer = () => {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const finishClose = () => {
    if (!drawerState.isClosed || gesture.isDragging) return;
    clearCloseTimer();
    setKeepOverlayMounted(false);
  };

  useEffect(() => {
    if (drawerState.isOpen || gesture.isDragging) {
      clearCloseTimer();
      setKeepOverlayMounted(true);
      return;
    }
    if (!keepOverlayMounted) return;

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const delay = reducedMotion
      ? 0
      : durationToMilliseconds(navigationDrawerRuntime.motion.close.duration) + 32;
    closeTimerRef.current = setTimeout(finishClose, delay);
    return clearCloseTimer;
  }, [drawerState.isOpen, gesture.isDragging, keepOverlayMounted]);

  useEffect(() => () => clearCloseTimer(), []);

  const motionStyle = getNavigationDrawerMotionStyle(offset, drawerWidth);
  const overlayStyle: NavigationDrawerStyle = {
    ...getModalNavigationDrawerOverlayStyle({
      scrimColor,
      scrimOpacity,
      alpha: fraction,
    }),
    ...motionStyle,
  };

  const handleSheetTransitionEnd = (event: ReactTransitionEvent<HTMLDivElement>) => {
    if (
      event.target === event.currentTarget &&
      event.propertyName === 'transform' &&
      drawerState.isClosed
    ) {
      finishClose();
    }
  };

  return (
    <div
      {...props}
      className={clsx('modal-navigation-drawer', className)}
      data-state={drawerState.currentValue}
      style={style}
      onLostPointerCapture={gesture.cancel}
      onPointerCancel={gesture.cancel}
      onPointerDown={gesture.begin}
      onPointerMove={gesture.move}
      onPointerUp={gesture.finish}
    >
      <div className="modal-navigation-drawer__content">{children}</div>
      <AriaModalOverlay
        isOpen={overlayVisible}
        isDismissable={false}
        isKeyboardDismissDisabled={false}
        onOpenChange={(open) => {
          if (!open) drawerState.close();
        }}
        UNSTABLE_portalContainer={
          UNSTABLE_portalContainer ?? themePortalContainer ?? undefined
        }
        className="modal-navigation-drawer-overlay"
        data-dragging={gesture.isDragging || undefined}
        data-state={drawerState.currentValue}
        style={overlayStyle}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          if (gesture.consumeSuppressedClick()) {
            event.preventDefault();
            return;
          }
          if (gesturesEnabled) drawerState.close();
        }}
        onLostPointerCapture={gesture.cancel}
        onPointerCancel={gesture.cancel}
        onPointerDown={gesture.begin}
        onPointerMove={gesture.move}
        onPointerUp={gesture.finish}
      >
        <AriaModal className="modal-navigation-drawer__modal">
          <div
            ref={frameRef}
            className="modal-navigation-drawer__sheet-frame"
            style={motionStyle}
            onTransitionEnd={handleSheetTransitionEnd}
          >
            {drawerContent}
          </div>
        </AriaModal>
      </AriaModalOverlay>
    </div>
  );
}
