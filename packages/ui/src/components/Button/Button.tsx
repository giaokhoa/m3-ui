import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from 'react-aria-components';
import '@m3-ui/tokens/button.css';
import { Ripple, useRipple } from '../../internal/ripple';
import { getButtonStyle, type ButtonShapes } from './Button.defaults';
import {
  endButtonInteraction,
  latestButtonInteraction,
  latestButtonStateLayerInteraction,
  startButtonInteraction,
  type ButtonInteraction,
} from './Button.interactions';
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
  onBlur,
  onFocus,
  onHoverEnd,
  onHoverStart,
  onPressStart,
  onPressEnd,
  ...props
}: ButtonImplProps) {
  const ripple = useRipple();
  const [activeInteractions, setActiveInteractions] = useState<ButtonInteraction[]>([]);
  const startInteraction = (interaction: ButtonInteraction) => {
    setActiveInteractions((active) => startButtonInteraction(active, interaction));
  };
  const endInteraction = (interaction: ButtonInteraction) => {
    setActiveInteractions((active) => endButtonInteraction(active, interaction));
  };
  const handlePressStart: AriaButtonProps['onPressStart'] = (event) => {
    startInteraction('press');
    ripple.onPressStart(event);
    onPressStart?.(event);
  };
  const handlePressEnd: AriaButtonProps['onPressEnd'] = (event) => {
    endInteraction('press');
    ripple.onPressEnd();
    onPressEnd?.(event);
  };
  const handleHoverStart: AriaButtonProps['onHoverStart'] = (event) => {
    startInteraction('hover');
    onHoverStart?.(event);
  };
  const handleHoverEnd: AriaButtonProps['onHoverEnd'] = (event) => {
    endInteraction('hover');
    onHoverEnd?.(event);
  };
  const handleFocus: AriaButtonProps['onFocus'] = (event) => {
    startInteraction('focus');
    onFocus?.(event);
  };
  const handleBlur: AriaButtonProps['onBlur'] = (event) => {
    endInteraction('focus');
    onBlur?.(event);
  };
  const interaction = latestButtonInteraction(activeInteractions);
  const previousInteractionRef = useRef<ButtonInteraction | null>(null);
  const previousInteraction = previousInteractionRef.current;
  useEffect(() => {
    previousInteractionRef.current = interaction;
  }, [interaction]);
  const variantClass = variantClassName(variant);

  return (
    <AriaButton
      {...props}
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
            variant,
            {
              isDisabled: renderProps.isDisabled,
              interaction,
              previousInteraction,
            },
            { size, shapes },
          ),
          ...userStyle,
        };
      }}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onHoverEnd={handleHoverEnd}
      onHoverStart={handleHoverStart}
      onPressEnd={handlePressEnd}
      onPressStart={handlePressStart}
    >
      {(renderProps) => (
        <>
          <Ripple
            controller={ripple}
            focusRingRadius="var(--_button-container-radius)"
            isFocusVisible={renderProps.isFocusVisible}
            stateInteraction={latestButtonStateLayerInteraction(
              activeInteractions,
              renderProps.isFocusVisible,
            )}
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
