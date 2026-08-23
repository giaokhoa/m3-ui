import type { ReactNode } from 'react';
import {
  Button as AriaButton,
  ToggleButton as AriaToggleButton,
  type ButtonProps as AriaButtonProps,
  type ToggleButtonProps as AriaToggleButtonProps,
} from 'react-aria-components';
import {
  Ripple,
  useRipple,
  type RippleController,
} from '../../internal/ripple';
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

interface IconButtonMaterialProps {
  children: ReactNode;
  size?: IconButtonSize;
  width?: IconButtonWidth;
  shape?: IconButtonShape;
}

export interface IconButtonProps
  extends Omit<AriaButtonProps, 'children' | 'style'>,
    IconButtonMaterialProps {
  shapes?: IconButtonShapes;
  style?: AriaButtonProps['style'];
}

export interface IconToggleButtonProps
  extends Omit<
      AriaToggleButtonProps,
      'children' | 'style' | 'isSelected' | 'onChange'
    >,
    IconButtonMaterialProps {
  isSelected: boolean;
  onChange: (isSelected: boolean) => void;
  shapes?: IconToggleButtonShapes;
  style?: AriaToggleButtonProps['style'];
}

interface SurfaceProps {
  children: ReactNode;
  ripple: RippleController;
  isFocusVisible: boolean;
  isHovered: boolean;
}

function variantClassName(variant: IconButtonVariant): string {
  return `m3-icon-button--${variant.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
}

function IconButtonSurface({
  children,
  ripple,
  isFocusVisible,
  isHovered,
}: SurfaceProps) {
  return (
    <span className="m3-icon-button__surface">
      <Ripple
        controller={ripple}
        focusRingRadius="var(--_icon-button-container-radius)"
        isFocusVisible={isFocusVisible}
        isHovered={isHovered}
      />
      <span aria-hidden="true" className="m3-icon-button__icon">
        {children}
      </span>
    </span>
  );
}

function ActionIconButtonImpl({
  variant,
  children,
  className,
  style,
  size,
  width,
  shape,
  shapes,
  onPressStart,
  onPressEnd,
  ...props
}: IconButtonProps & { variant: IconButtonVariant }) {
  const ripple = useRipple({ origin: 'center' });
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
            },
            { size, width, shape, shapes },
          ),
          ...userStyle,
        };
      }}
      onPressEnd={handlePressEnd}
      onPressStart={handlePressStart}
    >
      {(renderProps) => (
        <IconButtonSurface
          ripple={ripple}
          isFocusVisible={renderProps.isFocusVisible}
          isHovered={renderProps.isHovered}
        >
          {children}
        </IconButtonSurface>
      )}
    </AriaButton>
  );
}

function ToggleIconButtonImpl({
  variant,
  children,
  className,
  style,
  size,
  width,
  shape,
  shapes,
  isSelected,
  onChange,
  onPressStart,
  onPressEnd,
  ...props
}: IconToggleButtonProps & { variant: IconButtonVariant }) {
  const ripple = useRipple({ origin: 'center' });
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
              isSelected: renderProps.isSelected,
            },
            { size, width, shape, shapes },
          ),
          ...userStyle,
        };
      }}
      onPressEnd={handlePressEnd}
      onPressStart={handlePressStart}
    >
      {(renderProps) => (
        <IconButtonSurface
          ripple={ripple}
          isFocusVisible={renderProps.isFocusVisible}
          isHovered={renderProps.isHovered}
        >
          {children}
        </IconButtonSurface>
      )}
    </AriaToggleButton>
  );
}

function actionVariant(variant: IconButtonVariant) {
  return function MaterialIconButton(props: IconButtonProps) {
    return <ActionIconButtonImpl {...props} variant={variant} />;
  };
}

function toggleVariant(variant: IconButtonVariant) {
  return function MaterialIconToggleButton(props: IconToggleButtonProps) {
    return <ToggleIconButtonImpl {...props} variant={variant} />;
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
