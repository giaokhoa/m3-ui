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
import { Ripple, useRipple } from '../../internal/ripple';
import { radioButtonBaseStyle, radioGroupBaseStyle } from './RadioButton.defaults';
import { radioButtonTokens } from './RadioButton.tokens';
import './radio-button.css';

export interface RadioButtonProps extends AriaRadioProps {}

export interface RadioGroupProps extends Omit<AriaRadioGroupProps, 'children'> {
  children: ReactNode;
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: FieldErrorProps['children'];
}

const radioIndicationSize = radioButtonTokens.iconSize + radioButtonTokens.padding * 2;
const radioFocusRingInset = (radioButtonTokens.minimumInteractiveSize - radioIndicationSize) / 2;
const radioFocusRingRadius = radioIndicationSize / 2;

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
  style,
  onPressStart,
  onPressEnd,
  ...props
}: RadioButtonProps) {
  const ripple = useRipple({ origin: 'center', radius: radioButtonTokens.stateLayerSize / 2 });
  const handlePressStart: AriaRadioProps['onPressStart'] = (event) => {
    ripple.onPressStart(event);
    onPressStart?.(event);
  };
  const handlePressEnd: AriaRadioProps['onPressEnd'] = (event) => {
    ripple.onPressEnd();
    onPressEnd?.(event);
  };

  return (
    <AriaRadio
      {...props}
      className={(renderProps) => {
        const userClassName = typeof className === 'function' ? className(renderProps) : className;
        return joinClassNames('m3-radio-button', userClassName);
      }}
      style={(renderProps) => {
        const userStyle = typeof style === 'function' ? style(renderProps) : style;
        return { ...radioButtonBaseStyle, ...userStyle };
      }}
      onPressEnd={handlePressEnd}
      onPressStart={handlePressStart}
    >
      {(renderProps) => {
        const label = resolveChildren(children, renderProps);
        return (
          <>
            <span className="m3-radio-button__control-slot" aria-hidden="true">
              <span className="m3-radio-button__state-layer">
                <Ripple
                  controller={ripple}
                  focusRingInset={radioFocusRingInset}
                  focusRingRadius={radioFocusRingRadius}
                  isFocusVisible={renderProps.isFocusVisible}
                  isHovered={renderProps.isHovered}
                />
              </span>
              <span className="m3-radio-button__control">
                <span className="m3-radio-button__dot" />
              </span>
            </span>
            {label !== undefined && label !== null ? (
              <span className="m3-radio-button__label">{label}</span>
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
  style,
  ...props
}: RadioGroupProps) {
  return (
    <AriaRadioGroup
      {...props}
      orientation={orientation}
      className={(renderProps) => {
        const userClassName = typeof className === 'function' ? className(renderProps) : className;
        return joinClassNames(
          'm3-radio-group',
          orientation === 'horizontal' ? 'm3-radio-group--horizontal' : null,
          userClassName,
        );
      }}
      style={(renderProps) => {
        const userStyle = typeof style === 'function' ? style(renderProps) : style;
        return { ...radioGroupBaseStyle, ...userStyle };
      }}
    >
      {label != null ? <Label className="m3-radio-group__label">{label}</Label> : null}
      <div className="m3-radio-group__options">{children}</div>
      {description != null ? (
        <Text slot="description" className="m3-radio-group__description">{description}</Text>
      ) : null}
      <FieldError className="m3-radio-group__error">{errorMessage}</FieldError>
    </AriaRadioGroup>
  );
}
