import type { ReactNode } from 'react';
import {
  Link as AriaLink,
  type LinkProps as AriaLinkProps,
} from 'react-aria-components';
import { Ripple, useRipple } from '../../internal/ripple';
import { getNavigationDrawerItemStyle } from './NavigationDrawer.defaults';
import './navigation-drawer.css';

export interface NavigationDrawerLinkProps
  extends Omit<AriaLinkProps, 'children'> {
  selected: boolean;
  icon?: ReactNode;
  badge?: ReactNode;
  children: ReactNode;
}

/**
 * Semantic-link counterpart to NavigationDrawerItem for route/document navigation.
 * It keeps the canonical Material drawer-item visuals while exposing native link
 * semantics and aria-current instead of tab selection semantics.
 */
export function NavigationDrawerLink({
  selected,
  icon,
  badge,
  children,
  className,
  style,
  onPressStart,
  onPressEnd,
  ...props
}: NavigationDrawerLinkProps) {
  const ripple = useRipple();
  const ripplePressProps = ripple.getPressProps({ onPressStart, onPressEnd });

  return (
    <AriaLink
      {...props}
      {...ripplePressProps}
      aria-current={selected ? 'page' : undefined}
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
    </AriaLink>
  );
}
