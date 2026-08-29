import type { ReactNode } from 'react';
import {
  ToggleButton as AriaToggleButton,
  type ToggleButtonProps as AriaToggleButtonProps,
} from 'react-aria-components';
import '@m3-ui/tokens/button.css';
import { Ripple, useRipple } from '../../internal/ripple';
import { getToggleButtonStyle } from './ToggleButton.defaults';
import type { ToggleButtonSize, ToggleButtonVariant } from './ToggleButton.types';
import '../Button/button.css';
import './toggle-button.css';

export interface ToggleButtonProps
  extends Omit<AriaToggleButtonProps, 'style' | 'isSelected' | 'onChange'> {
  isSelected: boolean;
  onChange: (isSelected: boolean) => void;
  startIcon?: ReactNode;
  size?: ToggleButtonSize;
  style?: AriaToggleButtonProps['style'];
}

interface ToggleButtonImplProps extends ToggleButtonProps {
  variant: ToggleButtonVariant;
}

function variantClassName(variant: ToggleButtonVariant): string {
  return `toggle-button--${variant.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
}

function ToggleButtonImpl({
  variant,
  children,
  className,
  style,
  isSelected,
  onChange,
  startIcon,
  size = 'small',
  onPressStart,
  onPressEnd,
  ...props
}: ToggleButtonImplProps) {
  const ripple = useRipple();
  const handlePressStart: AriaToggleButtonProps['onPressStart'] = (event) => {
    ripple.onPressStart(event);
    onPressStart?.(event);
  };
  const handlePressEnd: AriaToggleButtonProps['onPressEnd'] = (event) => {
    ripple.onPressEnd();
    onPressEnd?.(event);
  };

  return (
    <AriaToggleButton
      {...props}
      isSelected={isSelected}
      onChange={onChange}
      data-has-start-icon={startIcon ? true : undefined}
      data-size={size}
      data-variant={variant}
      className={(renderProps) => {
        const userClassName = typeof className === 'function' ? className(renderProps) : className;
        const baseClassName = `button toggle-button ${variantClassName(variant)}`;
        return userClassName ? `${baseClassName} ${userClassName}` : baseClassName;
      }}
      style={(renderProps) => {
        const userStyle = typeof style === 'function' ? style(renderProps) : style;
        return {
          ...getToggleButtonStyle(
            variant,
            {
              isDisabled: renderProps.isDisabled,
              isSelected: renderProps.isSelected,
              isPressed: renderProps.isPressed,
              isHovered: renderProps.isHovered,
              isFocused: renderProps.isFocused,
            },
            size,
          ),
          ...userStyle,
        };
      }}
      onPressEnd={handlePressEnd}
      onPressStart={handlePressStart}
    >
      {(renderProps) => (
        <>
          <Ripple
            controller={ripple}
            focusRingRadius="var(--_button-container-radius)"
            isFocusVisible={renderProps.isFocusVisible}
            isHovered={renderProps.isHovered}
          />
          <span className="button__content">
            {startIcon ? (
              <span aria-hidden="true" className="button__icon">{startIcon}</span>
            ) : null}
            {typeof children === 'function' ? children(renderProps) : children}
          </span>
        </>
      )}
    </AriaToggleButton>
  );
}

export function ToggleButton(props: ToggleButtonProps) {
  return <ToggleButtonImpl {...props} variant="filled" />;
}

export function ElevatedToggleButton(props: ToggleButtonProps) {
  return <ToggleButtonImpl {...props} variant="elevated" />;
}

export function FilledTonalToggleButton(props: ToggleButtonProps) {
  return <ToggleButtonImpl {...props} variant="filledTonal" />;
}

export function OutlinedToggleButton(props: ToggleButtonProps) {
  return <ToggleButtonImpl {...props} variant="outlined" />;
}
