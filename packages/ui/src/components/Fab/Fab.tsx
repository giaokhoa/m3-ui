import '@m3-ui/tokens/fab.css';
import type { CSSProperties, ReactNode } from 'react';
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from 'react-aria-components';
import { Elevation } from '../../internal/elevation';
import { Ripple, useRipple } from '../../internal/ripple';
import {
  fabElevationTokens,
  getFabOverrideStyle,
} from './Fab.defaults';
import type {
  ExtendedFabSize,
  FabElevation,
  FabSize,
  FabVariant,
} from './Fab.types';
import './fab.css';

export interface FloatingActionButtonProps
  extends Omit<AriaButtonProps, 'children' | 'isDisabled'> {
  children: ReactNode;
  /**
   * Material FAB color family. Container-role variants preserve Compose token
   * families; surface/solid variants preserve the pinned Material Web API.
   */
  variant?: FabVariant;
  containerColor?: CSSProperties['backgroundColor'];
  contentColor?: CSSProperties['color'];
  shape?: CSSProperties['borderRadius'];
  elevation?: FabElevation;
}

export interface BrandedFloatingActionButtonProps
  extends Omit<FloatingActionButtonProps, 'variant' | 'contentColor'> {
  /** Material Web branded FAB label. Supplying it renders the current extended branded form. */
  label?: ReactNode;
}

export interface ExtendedFloatingActionButtonProps
  extends Omit<FloatingActionButtonProps, 'children'> {
  children: ReactNode;
  /** Optional icon. Without one this mirrors Compose's text-only Extended FAB overload. */
  icon?: ReactNode;
  /** Only applies when an icon is present; text-only Extended FABs remain expanded. */
  expanded?: boolean;
}

interface FabImplProps extends FloatingActionButtonProps {
  size: FabSize;
  branded?: boolean;
}

interface ExtendedFabImplProps extends ExtendedFloatingActionButtonProps {
  size: ExtendedFabSize;
  branded?: boolean;
}

function FabImpl({
  size,
  branded = false,
  children,
  className,
  style,
  variant = 'primaryContainer',
  containerColor,
  contentColor,
  shape,
  elevation = 'default',
  onPressStart,
  onPressEnd,
  ...props
}: FabImplProps) {
  const ripple = useRipple();
  const ripplePressProps = ripple.getPressProps({ onPressStart, onPressEnd });

  return (
    <AriaButton
      {...props}
      {...ripplePressProps}
      data-elevation={elevation}
      data-size={size}
      data-variant={branded ? 'branded' : variant}
      className={(renderProps) => {
        const userClassName =
          typeof className === 'function' ? className(renderProps) : className;
        const baseClassName = branded ? 'fab fab--branded' : 'fab';
        return userClassName ? `${baseClassName} ${userClassName}` : baseClassName;
      }}
      style={(renderProps) => {
        const userStyle = typeof style === 'function' ? style(renderProps) : style;
        return {
          ...getFabOverrideStyle({
            containerColor,
            contentColor: branded ? undefined : contentColor,
            shape,
          }),
          ...userStyle,
        };
      }}
    >
      {(renderProps) => (
        <span className="fab__visual">
          <Elevation
            levels={fabElevationTokens[elevation]}
            state={{
              isPressed: renderProps.isPressed,
              isHovered: renderProps.isHovered,
              isFocused: renderProps.isFocused,
            }}
          />
          <span className="fab__surface">
            <Ripple
              controller={ripple}
              focusRingRadius="var(--_fab-container-radius)"
              state={{
                isHovered: renderProps.isHovered,
                isFocusVisible: renderProps.isFocusVisible,
              }}
            />
            <span aria-hidden="true" className="fab__icon">{children}</span>
          </span>
        </span>
      )}
    </AriaButton>
  );
}

function ExtendedFabImpl({
  size,
  branded = false,
  children,
  icon,
  expanded = true,
  className,
  style,
  variant = 'primaryContainer',
  containerColor,
  contentColor,
  shape,
  elevation = 'default',
  onPressStart,
  onPressEnd,
  'aria-label': ariaLabel,
  ...props
}: ExtendedFabImplProps) {
  const hasIcon = icon !== undefined && icon !== null;
  const resolvedExpanded = hasIcon ? expanded : true;
  const collapsedLabel =
    hasIcon && !resolvedExpanded && typeof children === 'string' ? children : undefined;
  const ripple = useRipple();
  const ripplePressProps = ripple.getPressProps({ onPressStart, onPressEnd });

  return (
    <AriaButton
      {...props}
      {...ripplePressProps}
      aria-label={ariaLabel ?? collapsedLabel}
      data-elevation={elevation}
      data-expanded={resolvedExpanded || undefined}
      data-extended="true"
      data-has-icon={hasIcon || undefined}
      data-size={size}
      data-variant={branded ? 'branded' : variant}
      className={(renderProps) => {
        const userClassName =
          typeof className === 'function' ? className(renderProps) : className;
        const baseClassName = branded
          ? 'fab fab--extended fab--branded-extended'
          : 'fab fab--extended';
        return userClassName ? `${baseClassName} ${userClassName}` : baseClassName;
      }}
      style={(renderProps) => {
        const userStyle = typeof style === 'function' ? style(renderProps) : style;
        return {
          ...getFabOverrideStyle({
            containerColor,
            contentColor: branded ? undefined : contentColor,
            shape,
          }),
          ...userStyle,
        };
      }}
    >
      {(renderProps) => (
        <span className="fab__visual">
          <Elevation
            levels={fabElevationTokens[elevation]}
            state={{
              isPressed: renderProps.isPressed,
              isHovered: renderProps.isHovered,
              isFocused: renderProps.isFocused,
            }}
          />
          <span className="fab__surface">
            <Ripple
              controller={ripple}
              focusRingRadius="var(--_fab-container-radius)"
              state={{
                isHovered: renderProps.isHovered,
                isFocusVisible: renderProps.isFocusVisible,
              }}
            />
            <span className="fab__content">
              {hasIcon ? (
                <span aria-hidden="true" className="fab__icon">{icon}</span>
              ) : null}
              <span
                aria-hidden={hasIcon && !resolvedExpanded ? true : undefined}
                className="fab__label"
              >
                {children}
              </span>
            </span>
          </span>
        </span>
      )}
    </AriaButton>
  );
}

export function FloatingActionButton(props: FloatingActionButtonProps) {
  return <FabImpl {...props} size="baseline" />;
}

export function SmallFloatingActionButton(props: FloatingActionButtonProps) {
  return <FabImpl {...props} size="small" />;
}

export function MediumFloatingActionButton(props: FloatingActionButtonProps) {
  return <FabImpl {...props} size="medium" />;
}

export function LargeFloatingActionButton(props: FloatingActionButtonProps) {
  return <FabImpl {...props} size="large" />;
}

export function BrandedFloatingActionButton({
  label,
  children,
  ...props
}: BrandedFloatingActionButtonProps) {
  return label === undefined ? (
    <FabImpl {...props} branded size="baseline">{children}</FabImpl>
  ) : (
    <ExtendedFabImpl {...props} branded icon={children} size="baseline">
      {label}
    </ExtendedFabImpl>
  );
}

export function ExtendedFloatingActionButton(props: ExtendedFloatingActionButtonProps) {
  return <ExtendedFabImpl {...props} size="baseline" />;
}

export function SmallExtendedFloatingActionButton(props: ExtendedFloatingActionButtonProps) {
  return <ExtendedFabImpl {...props} size="small" />;
}

export function MediumExtendedFloatingActionButton(props: ExtendedFloatingActionButtonProps) {
  return <ExtendedFabImpl {...props} size="medium" />;
}

export function LargeExtendedFloatingActionButton(props: ExtendedFloatingActionButtonProps) {
  return <ExtendedFabImpl {...props} size="large" />;
}
