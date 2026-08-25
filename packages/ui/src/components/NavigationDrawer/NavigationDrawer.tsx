import type {
  CSSProperties,
  HTMLAttributes,
  ReactNode,
} from 'react';
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from 'react-aria-components';
import { Ripple, useRipple } from '../../internal/ripple';
import {
  getNavigationDrawerItemStyle,
  getPermanentDrawerSheetStyle,
  type PermanentDrawerSheetStyleOptions,
} from './NavigationDrawer.defaults';
import './navigation-drawer.css';

export interface NavigationDrawerItemProps
  extends Omit<AriaButtonProps, 'children'> {
  selected: boolean;
  icon?: ReactNode;
  badge?: ReactNode;
  children: ReactNode;
}

export interface PermanentDrawerSheetProps
  extends Omit<HTMLAttributes<HTMLElement>, 'color'>,
    PermanentDrawerSheetStyleOptions {}

export interface PermanentNavigationDrawerProps
  extends HTMLAttributes<HTMLDivElement> {
  drawerContent: ReactNode;
}

export function NavigationDrawerItem({
  selected,
  icon,
  badge,
  children,
  className,
  style,
  render,
  onPressStart,
  onPressEnd,
  ...props
}: NavigationDrawerItemProps) {
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
      data-selected={selected || undefined}
      render={(domProps, renderProps) => {
        const tabProps = {
          ...domProps,
          role: 'tab' as const,
          'aria-selected': selected,
        };
        return render ? render(tabProps, renderProps) : <button {...tabProps} />;
      }}
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
      onPressStart={handlePressStart}
      onPressEnd={handlePressEnd}
    >
      {(renderProps) => (
        <>
          <Ripple
            controller={ripple}
            focusRingRadius="var(--_navigation-drawer-item-radius)"
            isFocusVisible={renderProps.isFocusVisible}
            stateInteraction={
              renderProps.isFocusVisible
                ? 'focus'
                : renderProps.isHovered
                  ? 'hover'
                  : null
            }
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

export function PermanentDrawerSheet({
  containerColor,
  width,
  className,
  style,
  children,
  'aria-label': ariaLabel = 'Navigation menu',
  ...props
}: PermanentDrawerSheetProps) {
  const sheetStyle = {
    ...getPermanentDrawerSheetStyle({ containerColor, width }),
    ...style,
  } as CSSProperties;

  return (
    <aside
      {...props}
      aria-label={ariaLabel}
      className={
        className
          ? `permanent-drawer-sheet ${className}`
          : 'permanent-drawer-sheet'
      }
      style={sheetStyle}
    >
      {children}
    </aside>
  );
}

export function PermanentNavigationDrawer({
  drawerContent,
  className,
  children,
  ...props
}: PermanentNavigationDrawerProps) {
  return (
    <div
      {...props}
      className={
        className
          ? `permanent-navigation-drawer ${className}`
          : 'permanent-navigation-drawer'
      }
    >
      {drawerContent}
      <div className="permanent-navigation-drawer__content">{children}</div>
    </div>
  );
}
