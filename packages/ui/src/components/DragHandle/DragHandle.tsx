import {
  useState,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  Ripple,
  useRipple,
  type RippleController,
  type RipplePointerType,
  type RipplePressEvent,
  type RippleStateInteraction,
} from '../../internal/ripple';
import {
  getDragHandleRippleStyle,
  getDragHandleStyle,
  type DragHandleStyleOptions,
} from './DragHandle.defaults';
import './drag-handle.css';

export interface VerticalDragHandleProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'color'>,
    DragHandleStyleOptions {
  /**
   * Controlled drag state supplied by the resize/drag owner. The handle owns
   * pointer-press feedback, but it does not invent a drag gesture on its own.
   */
  isDragged?: boolean;
}

function ripplePointerType(pointerType: string): RipplePointerType {
  if (pointerType === 'pen' || pointerType === 'touch') return pointerType;
  return 'mouse';
}

function toRipplePressEvent(
  event: ReactPointerEvent<HTMLSpanElement>,
  controller: RippleController,
): RipplePressEvent {
  const target = controller.containerRef.current ?? event.currentTarget;
  const bounds = target.getBoundingClientRect();

  return {
    pointerType: ripplePointerType(event.pointerType),
    target,
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top,
  };
}

export function VerticalDragHandle({
  isDragged = false,
  color,
  pressedColor,
  draggedColor,
  size,
  pressedSize,
  draggedSize,
  shape,
  pressedShape,
  draggedShape,
  className,
  style,
  onBlur,
  onFocus,
  onLostPointerCapture,
  onPointerCancel,
  onPointerDown,
  onPointerEnter,
  onPointerLeave,
  onPointerUp,
  ...props
}: VerticalDragHandleProps) {
  const ripple = useRipple();
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocusVisible, setIsFocusVisible] = useState(false);

  const endPress = () => {
    setIsPressed(false);
    ripple.onPressEnd();
  };

  const handlePointerDown: HTMLAttributes<HTMLSpanElement>['onPointerDown'] = (
    event,
  ) => {
    if (event.isPrimary && event.button === 0) {
      setIsPressed(true);
      ripple.onPressStart(toRipplePressEvent(event, ripple));
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
    }
    onPointerDown?.(event);
  };

  const handlePointerUp: HTMLAttributes<HTMLSpanElement>['onPointerUp'] = (
    event,
  ) => {
    endPress();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    onPointerUp?.(event);
  };

  const handlePointerCancel: HTMLAttributes<HTMLSpanElement>['onPointerCancel'] = (
    event,
  ) => {
    endPress();
    onPointerCancel?.(event);
  };

  const handleLostPointerCapture: HTMLAttributes<HTMLSpanElement>['onLostPointerCapture'] = (
    event,
  ) => {
    endPress();
    onLostPointerCapture?.(event);
  };

  const handlePointerEnter: HTMLAttributes<HTMLSpanElement>['onPointerEnter'] = (
    event,
  ) => {
    setIsHovered(true);
    onPointerEnter?.(event);
  };

  const handlePointerLeave: HTMLAttributes<HTMLSpanElement>['onPointerLeave'] = (
    event,
  ) => {
    setIsHovered(false);
    onPointerLeave?.(event);
  };

  const handleFocus: HTMLAttributes<HTMLSpanElement>['onFocus'] = (event) => {
    setIsFocusVisible(event.currentTarget.matches(':focus-visible'));
    onFocus?.(event);
  };

  const handleBlur: HTMLAttributes<HTMLSpanElement>['onBlur'] = (event) => {
    setIsFocusVisible(false);
    onBlur?.(event);
  };

  const stateInteraction: RippleStateInteraction | null = isFocusVisible
    ? 'focus'
    : isHovered
      ? 'hover'
      : null;

  return (
    <span
      {...props}
      className={['drag-handle', className].filter(Boolean).join(' ')}
      data-dragged={isDragged || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-hovered={isHovered || undefined}
      data-pressed={isPressed || undefined}
      data-state={isDragged ? 'dragged' : isPressed ? 'pressed' : 'default'}
      style={{
        ...getDragHandleStyle({
          color,
          pressedColor,
          draggedColor,
          size,
          pressedSize,
          draggedSize,
          shape,
          pressedShape,
          draggedShape,
        }),
        ...style,
      }}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onLostPointerCapture={handleLostPointerCapture}
      onPointerCancel={handlePointerCancel}
      onPointerDown={handlePointerDown}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerUp={handlePointerUp}
    >
      <span className="drag-handle__container" aria-hidden="true">
        <span className="drag-handle__bar" />
        <Ripple
          controller={ripple}
          focusRingRadius="var(--_drag-handle-current-shape)"
          isFocusVisible={isFocusVisible}
          stateInteraction={stateInteraction}
          style={getDragHandleRippleStyle()}
        />
      </span>
    </span>
  );
}
