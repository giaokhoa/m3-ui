import clsx from 'clsx';
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import '@m3-ui/tokens/card.css';
import { Elevation } from '../../internal/elevation';
import { Ripple, useRipple } from '../../internal/ripple';
import { cardElevationTokens, type CardVariant } from './Card.elevation';
import './card.css';

export interface CardProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onClick'> {
  children?: ReactNode;
  onPress?: () => void;
  isDisabled?: boolean;
  shape?: CSSProperties['borderRadius'];
}

type CardStyle = CSSProperties & Record<`--${string}`, string | number | undefined>;

interface CardImplProps extends CardProps {
  variant: CardVariant;
}

const nestedInteractiveSelector =
  'a[href],button,input,select,textarea,summary,[contenteditable="true"],[role="button"],[role="link"],[role="checkbox"],[role="radio"],[role="switch"]';

function isNestedInteractive(target: EventTarget | null, root: HTMLElement): boolean {
  if (!(target instanceof Element)) return false;
  const interactive = target.closest(nestedInteractiveSelector);
  return interactive !== null && interactive !== root && root.contains(interactive);
}

function variantClassName(variant: CardVariant): string {
  return `card--${variant}`;
}

function cssLength(value: CSSProperties['borderRadius']): string | number | undefined {
  return typeof value === 'number' ? `${value}px` : value;
}

function CardImpl({
  variant,
  children,
  className,
  style,
  onPress,
  isDisabled = false,
  shape,
  role,
  tabIndex,
  onBlur,
  onFocus,
  onKeyDown,
  onKeyUp,
  onPointerCancel,
  onPointerDown,
  onPointerEnter,
  onPointerLeave,
  onPointerUp,
  ...props
}: CardImplProps) {
  const interactive = onPress !== undefined;
  const disabled = interactive && isDisabled;
  const ripple = useRipple();
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isFocusVisible, setIsFocusVisible] = useState(false);
  const pointerPressRef = useRef(false);
  const keyboardPressRef = useRef<'Enter' | ' ' | null>(null);

  const endPress = () => {
    setIsPressed(false);
    ripple.onPressEnd();
  };

  const handlePointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    if (interactive && !disabled) setIsHovered(true);
    onPointerEnter?.(event);
  };

  const handlePointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    if (interactive && !disabled) {
      setIsHovered(false);
      if (pointerPressRef.current) {
        pointerPressRef.current = false;
        endPress();
      }
    }
    onPointerLeave?.(event);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (
      interactive &&
      !disabled &&
      event.button === 0 &&
      !isNestedInteractive(event.target, event.currentTarget)
    ) {
      pointerPressRef.current = true;
      setIsPressed(true);
      const bounds = event.currentTarget.getBoundingClientRect();
      ripple.onPressStart({
        pointerType:
          event.pointerType === 'touch' || event.pointerType === 'pen'
            ? event.pointerType
            : 'mouse',
        target: event.currentTarget,
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });
    }
    onPointerDown?.(event);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (pointerPressRef.current) {
      pointerPressRef.current = false;
      endPress();
    }
    onPointerUp?.(event);
  };

  const handlePointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    if (pointerPressRef.current) {
      pointerPressRef.current = false;
      endPress();
    }
    onPointerCancel?.(event);
  };

  const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (interactive && !disabled && event.target === event.currentTarget) {
      setIsFocused(true);
      setIsFocusVisible(event.currentTarget.matches(':focus-visible'));
    }
    onFocus?.(event);
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      setIsFocused(false);
      setIsFocusVisible(false);
      keyboardPressRef.current = null;
      endPress();
    }
    onBlur?.(event);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      interactive &&
      !disabled &&
      event.target === event.currentTarget &&
      !event.repeat &&
      (event.key === 'Enter' || event.key === ' ')
    ) {
      if (event.key === ' ') event.preventDefault();
      keyboardPressRef.current = event.key;
      setIsPressed(true);
      ripple.onPressStart({
        pointerType: 'keyboard',
        target: event.currentTarget,
        x: 0,
        y: 0,
      });
      if (event.key === 'Enter') onPress?.();
    }
    onKeyDown?.(event);
  };

  const handleKeyUp = (event: KeyboardEvent<HTMLDivElement>) => {
    if (keyboardPressRef.current === event.key) {
      if (event.key === ' ') {
        event.preventDefault();
        onPress?.();
      }
      keyboardPressRef.current = null;
      endPress();
    }
    onKeyUp?.(event);
  };

  useEffect(() => {
    if (disabled) {
      setIsHovered(false);
      setIsFocused(false);
      setIsPressed(false);
      setIsFocusVisible(false);
      pointerPressRef.current = false;
      keyboardPressRef.current = null;
      ripple.onPressEnd();
    }
  }, [disabled, ripple.onPressEnd]);

  const shapeRadius = cssLength(shape);
  const resolvedStyle: CardStyle = {
    ...(shapeRadius === undefined
      ? {}
      : { '--_card-container-radius': shapeRadius }),
    ...style,
  };
  const resolvedClassName = clsx('card', variantClassName(variant), className);
  const elevationLevels = cardElevationTokens[variant];

  return (
    <div
      {...props}
      aria-disabled={disabled || undefined}
      className={resolvedClassName}
      data-disabled={disabled || undefined}
      data-focused={isFocused || undefined}
      data-hovered={isHovered || undefined}
      data-interactive={interactive || undefined}
      data-pressed={isPressed || undefined}
      onBlur={handleBlur}
      onClick={(event) => {
        if (
          interactive &&
          !disabled &&
          !isNestedInteractive(event.target, event.currentTarget)
        ) {
          if (!pointerPressRef.current && event.detail === 0) {
            ripple.onPressStart({
              pointerType: 'virtual',
              target: event.currentTarget,
              x: 0,
              y: 0,
            });
            ripple.onPressEnd();
          }
          onPress?.();
        }
      }}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onPointerCancel={handlePointerCancel}
      onPointerDown={handlePointerDown}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerUp={handlePointerUp}
      role={role}
      style={resolvedStyle}
      tabIndex={tabIndex ?? (interactive ? (disabled ? -1 : 0) : undefined)}
    >
      {interactive ? (
        <Elevation
          levels={elevationLevels}
          state={{
            isDisabled: disabled,
            isPressed,
            isHovered,
            isFocused,
          }}
        />
      ) : (
        <Elevation level={elevationLevels.default} />
      )}
      <div className="card__surface">
        {interactive ? (
          <Ripple
            controller={ripple}
            focusRingRadius="var(--_card-container-radius)"
            state={{ isHovered, isFocusVisible }}
          />
        ) : null}
        <div className="card__content">{children}</div>
      </div>
    </div>
  );
}

export function Card(props: CardProps) {
  return <CardImpl {...props} variant="filled" />;
}

export function ElevatedCard(props: CardProps) {
  return <CardImpl {...props} variant="elevated" />;
}

export function OutlinedCard(props: CardProps) {
  return <CardImpl {...props} variant="outlined" />;
}
