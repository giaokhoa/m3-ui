import type { ReactNode } from 'react';
import {
  FieldError,
  Label,
  Radio as AriaRadio,
  RadioGroup as AriaRadioGroup,
  Text,
  type FieldErrorProps,
  type RadioGroupProps as AriaRadioGroupProps,
  type RadioProps as AriaRadioProps,
} from 'react-aria-components';
import '@m3-ui/tokens/radio-button.css';
import { Ripple, useRipple } from '../../internal/ripple';
import { radioButtonRippleGeometry } from './RadioButton.runtime';
import './radio-button.css';

export interface RadioButtonProps extends AriaRadioProps {}

export interface RadioGroupProps extends Omit<AriaRadioGroupProps, 'children'> {
  children: ReactNode;
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: FieldErrorProps['children'];
}

function joinClassNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

function resolveChildren(
  children: AriaRadioProps['children'],
  renderProps: Parameters<Exclude<AriaRadioProps['children'], ReactNode>>[0],
) {
  return typeof children === 'function' ? children(renderProps) : children;
}

export function RadioButton({
  children,
  className,
  onPressStart,
  onPressEnd,
  ...props
}: RadioButtonProps) {
  const ripple = useRipple({ origin: 'center', radius: radioButtonRippleGeometry.radius });
  const ripplePressProps = ripple.getPressProps({ onPressStart, onPressEnd });

  return (
    <AriaRadio
      {...props}
      {...ripplePressProps}
      className={(renderProps) => {
        const userClassName = typeof className === 'function' ? className(renderProps) : className;
        return joinClassNames('radio-button', userClassName);
      }}
    >
      {(renderProps) => {
        const label = resolveChildren(children, renderProps);
        return (
          <>
            <span className="radio-button__control-slot" aria-hidden="true">
              <span className="radio-button__state-layer">
                <Ripple
                  controller={ripple}
                  focusRingInset={radioButtonRippleGeometry.focusRingInset}
                  focusRingRadius={radioButtonRippleGeometry.focusRingRadius}
                  state={{
                    isFocusVisible: renderProps.isFocusVisible,
                    isHovered: renderProps.isHovered,
                  }}
                />
              </span>
              <span className="radio-button__control">
                <span className="radio-button__dot" />
              </span>
            </span>
            {label !== undefined && label !== null ? (
              <span className="radio-button__label">{label}</span>
            ) : null}
          </>
        );
      }}
    </AriaRadio>
  );
}

export function RadioGroup({
  children,
  label,
  description,
  errorMessage,
  orientation = 'vertical',
  className,
  ...props
}: RadioGroupProps) {
  return (
    <AriaRadioGroup
      {...props}
      orientation={orientation}
      className={(renderProps) => {
        const userClassName = typeof className === 'function' ? className(renderProps) : className;
        return joinClassNames(
          'radio-group',
          orientation === 'horizontal' ? 'radio-group--horizontal' : null,
          userClassName,
        );
      }}
    >
      {label != null ? <Label className="radio-group__label">{label}</Label> : null}
      <div className="radio-group__options">{children}</div>
      {description != null ? (
        <Text slot="description" className="radio-group__description">{description}</Text>
      ) : null}
      <FieldError className="radio-group__error">{errorMessage}</FieldError>
    </AriaRadioGroup>
  );
}
