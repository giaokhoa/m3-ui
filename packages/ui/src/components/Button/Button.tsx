import type { ReactNode } from 'react';
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from 'react-aria-components';
import '@m3-ui/tokens/button.css';
import { Elevation } from '../../internal/elevation';
import { Ripple, useRipple } from '../../internal/ripple';
import { buttonElevationLevels } from './Button.elevation';
import {
  getButtonStyle,
  type ButtonShapes,
} from './Button.runtime';
import type { ButtonSize, ButtonVariant } from './Button.types';
import './button.css';

export interface ButtonProps extends AriaButtonProps {
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  /**
   * Applies AndroidX Material3 expressive size helper geometry. Omit this prop to
   * keep the common non-expressive baseline defaults.
   */
  size?: ButtonSize;
  /**
   * Optional normal/pressed container shapes. Supplying shapes enables the
   * Material expressive pressed-shape morph while preserving RAC interactions.
   */
  shapes?: ButtonShapes;
}

interface ButtonImplProps extends ButtonProps {
  variant: ButtonVariant;
}

function variantClassName(variant: ButtonVariant): string {
  return `button--${variant.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
}

function ButtonImpl({
  variant,
  children,
  className,
  style,
  startIcon,
  endIcon,
  size,
  shapes,
  onPressStart,
  onPressEnd,
  ...props
}: ButtonImplProps) {
  const ripple = useRipple();
  const ripplePressProps = ripple.getPressProps({ onPressStart, onPressEnd });
  const variantClass = variantClassName(variant);

  return (
    <AriaButton
      {...props}
      {...ripplePressProps}
      data-has-end-icon={endIcon ? true : undefined}
      data-has-start-icon={startIcon ? true : undefined}
      data-size={size}
      className={(renderProps) => {
        const userClassName = typeof className === 'function' ? className(renderProps) : className;
        const baseClassName = `button ${variantClass}`;
        return userClassName ? `${baseClassName} ${userClassName}` : baseClassName;
      }}
      style={(renderProps) => {
        const userStyle = typeof style === 'function' ? style(renderProps) : style;
        return {
          ...getButtonStyle(
            {
              isDisabled: renderProps.isDisabled,
              isPressed: renderProps.isPressed,
            },
            { shapes },
          ),
          ...userStyle,
        };
      }}
    >
      {(renderProps) => (
        <>
          <Elevation
            levels={buttonElevationLevels[variant]}
            state={{
              isDisabled: renderProps.isDisabled,
              isPressed: renderProps.isPressed,
              isHovered: renderProps.isHovered,
              isFocused: renderProps.isFocused,
            }}
          />
          <Ripple
            controller={ripple}
            focusRingRadius="var(--_button-container-radius)"
            state={{
              isHovered: renderProps.isHovered,
              isFocusVisible: renderProps.isFocusVisible,
            }}
          />
          <span className="button__content">
            {startIcon ? (
              <span aria-hidden="true" className="button__icon">{startIcon}</span>
            ) : null}
            {typeof children === 'function' ? children(renderProps) : children}
            {endIcon ? (
              <span aria-hidden="true" className="button__icon">{endIcon}</span>
            ) : null}
          </span>
        </>
      )}
    </AriaButton>
  );
}

export function Button(props: ButtonProps) { return <ButtonImpl {...props} variant="filled" />; }
export function ElevatedButton(props: ButtonProps) { return <ButtonImpl {...props} variant="elevated" />; }
export function FilledTonalButton(props: ButtonProps) { return <ButtonImpl {...props} variant="filledTonal" />; }
export function OutlinedButton(props: ButtonProps) { return <ButtonImpl {...props} variant="outlined" />; }
export function TextButton(props: ButtonProps) { return <ButtonImpl {...props} variant="text" />; }
