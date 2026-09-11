import type { ReactNode } from 'react';
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from 'react-aria-components';
import { Ripple, useRipple } from '../../internal/ripple';
import { getNavigationDrawerItemStyle } from './NavigationDrawer.defaults';
import './navigation-drawer.css';

export interface NavigationDrawerButtonProps
  extends Omit<AriaButtonProps, 'children'> {
  selected?: boolean;
  icon?: ReactNode;
  badge?: ReactNode;
  children: ReactNode;
}

/**
 * Semantic action counterpart to NavigationDrawerItem. Use this for drawer
 * actions such as hierarchy drill-in/back controls that are buttons rather
 * than destinations or tab selections.
 */
export function NavigationDrawerButton({
  selected = false,
  icon,
  badge,
  children,
  className,
  style,
  onPressStart,
  onPressEnd,
  ...props
}: NavigationDrawerButtonProps) {
  const ripple = useRipple();
  const ripplePressProps = ripple.getPressProps({ onPressStart, onPressEnd });

  return (
    <AriaButton
      {...props}
      {...ripplePressProps}
      data-selected={selected || undefined}
      className={(renderProps) => {
        const userClassName =
          typeof className === 'function' ? className(renderProps) : className;
        return userClassName
          ? `navigation-drawer-item ${userClassName}`
          : 'navigation-drawer-item';
      }}
      style={(renderProps) => {
        const userStyle =
          typeof style === 'function' ? style(renderProps) : style;
        return {
          ...getNavigationDrawerItemStyle(selected, {
            isHovered: renderProps.isHovered,
            isPressed: renderProps.isPressed,
            isFocusVisible: renderProps.isFocusVisible,
          }),
          ...userStyle,
        };
      }}
    >
      {(renderProps) => (
        <>
          <Ripple
            controller={ripple}
            focusRingRadius="var(--_navigation-drawer-item-radius)"
            state={{
              isFocusVisible: renderProps.isFocusVisible,
              isHovered: renderProps.isHovered,
            }}
          />
          {icon ? (
            <span aria-hidden="true" className="navigation-drawer-item__icon">
              {icon}
            </span>
          ) : null}
          <span className="navigation-drawer-item__label">{children}</span>
          {badge ? (
            <span className="navigation-drawer-item__badge">{badge}</span>
          ) : null}
        </>
      )}
    </AriaButton>
  );
}
