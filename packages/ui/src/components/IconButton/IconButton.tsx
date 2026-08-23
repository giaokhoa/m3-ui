import type { ReactNode } from 'react';
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from 'react-aria-components';
import { Ripple, useRipple } from '../../internal/ripple';
import {
  getIconButtonStyle,
  type IconButtonShapes,
  type IconToggleButtonShapes,
} from './IconButton.defaults';
import type {
  IconButtonShape,
  IconButtonSize,
  IconButtonVariant,
  IconButtonWidth,
} from './IconButton.types';
import './icon-button.css';

interface CommonIconButtonProps extends Omit<AriaButtonProps, 'children' | 'style'> {
  children: ReactNode;
  size?: IconButtonSize;
  width?: IconButtonWidth;
  shape?: IconButtonShape;
  style?: AriaButtonProps['style'];
}

export interface IconButtonProps extends CommonIconButtonProps {
  shapes?: IconButtonShapes;
}

export interface IconToggleButtonProps
  extends Omit<CommonIconButtonProps, 'onPress'> {
  isSelected: boolean;
  onChange: (isSelected: boolean) => void;
  shapes?: IconToggleButtonShapes;
}

interface IconButtonImplProps extends CommonIconButtonProps {
  variant: IconButtonVariant;
  isSelected?: boolean;
  onSelectedChange?: (isSelected: boolean) => void;
  shapes?: IconButtonShapes | IconToggleButtonShapes;
}

function variantClassName(variant: IconButtonVariant): string {
  return `m3-icon-button--${variant.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
}

function IconButtonImpl({
  variant,
  children,
  className,
  style,
  size,
  width,
  shape,
  shapes,
  isSelected,
  onSelectedChange,
  onPress,
  onPressStart,
  onPressEnd,
  ...props
}: IconButtonImplProps) {
  const ripple = useRipple({ origin: 'center' });
  const isToggle = isSelected !== undefined;
  const handlePress: AriaButtonProps['onPress'] = (event) => {
    if (isToggle) onSelectedChange?.(!isSelected);
    onPress?.(event);
  };
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
      aria-pressed={isToggle ? isSelected : undefined}
      data-selected={isToggle && isSelected ? true : undefined}
      data-size={size}
      data-variant={variant}
      data-width={width}
      className={(renderProps) => {
        const userClassName = typeof className === 'function' ? className(renderProps) : className;
        const baseClassName = `m3-icon-button ${variantClassName(variant)}`;
        return userClassName ? `${baseClassName} ${userClassName}` : baseClassName;
      }}
      style={(renderProps) => {
        const userStyle = typeof style === 'function' ? style(renderProps) : style;
        return {
          ...getIconButtonStyle(
            variant,
            {
              isDisabled: renderProps.isDisabled,
              isPressed: renderProps.isPressed,
              isSelected,
            },
            { size, width, shape, shapes },
          ),
          ...userStyle,
        };
      }}
      onPress={handlePress}
      onPressEnd={handlePressEnd}
      onPressStart={handlePressStart}
    >
      {(renderProps) => (
        <span className="m3-icon-button__surface">
          <Ripple
            controller={ripple}
            focusRingRadius="var(--_icon-button-container-radius)"
            isFocusVisible={renderProps.isFocusVisible}
            isHovered={renderProps.isHovered}
          />
          <span aria-hidden="true" className="m3-icon-button__icon">
            {children}
          </span>
        </span>
      )}
    </AriaButton>
  );
}

function actionVariant(variant: IconButtonVariant) {
  return function MaterialIconButton(props: IconButtonProps) {
    return <IconButtonImpl {...props} variant={variant} />;
  };
}

function toggleVariant(variant: IconButtonVariant) {
  return function MaterialIconToggleButton({
    isSelected,
    onChange,
    ...props
  }: IconToggleButtonProps) {
    return (
      <IconButtonImpl
        {...props}
        variant={variant}
        isSelected={isSelected}
        onSelectedChange={onChange}
      />
    );
  };
}

export const IconButton = actionVariant('standard');
export const FilledIconButton = actionVariant('filled');
export const FilledTonalIconButton = actionVariant('filledTonal');
export const OutlinedIconButton = actionVariant('outlined');

export const IconToggleButton = toggleVariant('standard');
export const FilledIconToggleButton = toggleVariant('filled');
export const FilledTonalIconToggleButton = toggleVariant('filledTonal');
export const OutlinedIconToggleButton = toggleVariant('outlined');
