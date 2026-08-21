import { Button as AriaButton, type ButtonProps as AriaButtonProps } from 'react-aria-components';
import { Ripple, useRipple } from '../../internal/ripple';
import './button.css';

export type ButtonProps = AriaButtonProps;

export function Button({
  children,
  className,
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
