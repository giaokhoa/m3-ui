import '@m3-ui/tokens/card.css';
import clsx from 'clsx';
import { useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { useFocusRing } from 'react-aria/useFocusRing';
import { useHover } from 'react-aria/useHover';
import { usePress } from 'react-aria/usePress';
import { mergeProps } from 'react-aria';
import { Elevation } from '../../internal/elevation';
import { suppressNestedInteractivePresses } from '../../internal/nestedInteractivePress';
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
  const rootRef = useRef<HTMLDivElement>(null);
  const interactive = onPress !== undefined;
  const disabled = interactive && isDisabled;
  const ripple = useRipple();
  const ripplePressProps = ripple.getPressProps();
  const { pressProps, isPressed } = usePress({
    ref: rootRef,
    isDisabled: !interactive || disabled,
    allowTextSelectionOnPress: true,
    onPress: () => onPress?.(),
    ...ripplePressProps,
  });
  const { hoverProps, isHovered } = useHover({
    isDisabled: !interactive || disabled,
  });
  const { focusProps, isFocused, isFocusVisible } = useFocusRing();
  const callerEventProps = {
    onBlur,
    onFocus,
    onKeyDown,
    onKeyUp,
    onPointerCancel,
    onPointerDown,
    onPointerEnter,
    onPointerLeave,
    onPointerUp,
  };
  const interactionProps = interactive
    ? mergeProps(
        suppressNestedInteractivePresses(pressProps),
        hoverProps,
        focusProps,
        callerEventProps,
      )
    : callerEventProps;

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
      {...interactionProps}
      ref={rootRef}
      aria-disabled={disabled || undefined}
      className={resolvedClassName}
      data-disabled={disabled || undefined}
      data-focused={(interactive && !disabled && isFocused) || undefined}
      data-hovered={isHovered || undefined}
      data-interactive={interactive || undefined}
      data-pressed={isPressed || undefined}
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
            isFocused: !disabled && isFocused,
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
            state={{
              isHovered,
              isFocusVisible: !disabled && isFocusVisible,
            }}
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
