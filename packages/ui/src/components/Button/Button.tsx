import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from 'react-aria-components';
import { Ripple, useRipple } from '../../internal/ripple';
import { getFilledButtonStyle } from './Button.defaults';
import './button.css';

export type ButtonProps = AriaButtonProps;

export function Button({
  children,
  className,
  style,
  onPressStart,
  onPressEnd,
  ...props
}: ButtonProps) {
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
      className={(renderProps) => {
        const userClassName =
          typeof className === 'function' ? className(renderProps) : className;

        return userClassName ? `m3-button ${userClassName}` : 'm3-button';
      }}
      style={(renderProps) => {
        const userStyle =
          typeof style === 'function' ? style(renderProps) : style;

        return {
          ...getFilledButtonStyle({
            isDisabled: renderProps.isDisabled,
            isPressed: renderProps.isPressed,
            isFocused: renderProps.isFocused,
            isHovered: renderProps.isHovered,
          }),
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
            isFocusVisible={renderProps.isFocusVisible}
            isHovered={renderProps.isHovered}
          />
          <span className="m3-button__content">
            {typeof children === 'function' ? children(renderProps) : children}
          </span>
        </>
      )}
    </AriaButton>
  );
}
