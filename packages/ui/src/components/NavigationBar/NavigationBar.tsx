import clsx from 'clsx';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from 'react-aria-components';
import { Ripple, useRipple } from '../../internal/ripple';
import {
  getNavigationBarItemStyle,
  getNavigationBarStyle,
  type NavigationBarItemStyleOptions,
  type NavigationBarStyleOptions,
} from './NavigationBar.defaults';
import './navigation-bar.css';

export interface NavigationBarProps
  extends Omit<HTMLAttributes<HTMLElement>, 'color'>,
    NavigationBarStyleOptions {}

export interface NavigationBarItemProps
  extends Omit<AriaButtonProps, 'children'>,
    NavigationBarItemStyleOptions {
  selected: boolean;
  icon: ReactNode;
  label?: ReactNode;
  alwaysShowLabel?: boolean;
}

export function NavigationBar({
  containerColor,
  contentColor,
  className,
  style,
  children,
  'aria-label': ariaLabel = 'Primary navigation',
  ...props
}: NavigationBarProps) {
  const navigationStyle = {
    ...getNavigationBarStyle({ containerColor, contentColor }),
    ...style,
  } as CSSProperties;

  return (
    <nav
      {...props}
      aria-label={ariaLabel}
      className={clsx('navigation-bar', className)}
      style={navigationStyle}
    >
      <div
        aria-label={ariaLabel}
        className="navigation-bar__items"
        role="tablist"
      >
        {children}
      </div>
    </nav>
  );
}

export function NavigationBarItem({
  selected,
  icon,
  label,
  alwaysShowLabel = true,
  selectedIconColor,
  selectedLabelColor,
  indicatorColor,
  unselectedIconColor,
  unselectedLabelColor,
  className,
  style,
  render,
  onPressStart,
  onPressEnd,
  isDisabled,
  ...props
}: NavigationBarItemProps) {
  const ripple = useRipple({ origin: 'center' });
  const ripplePressProps = ripple.getPressProps({ onPressStart, onPressEnd });

  return (
    <AriaButton
      {...props}
      {...ripplePressProps}
      isDisabled={isDisabled}
      data-selected={selected || undefined}
      data-label-hidden={!alwaysShowLabel && !selected ? true : undefined}
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
          ? `navigation-bar-item ${userClassName}`
          : 'navigation-bar-item';
      }}
      style={(renderProps) => {
        const userStyle =
          typeof style === 'function' ? style(renderProps) : style;
        return {
          ...getNavigationBarItemStyle(
            selected,
            {
              isHovered: renderProps.isHovered,
              isPressed: renderProps.isPressed,
              isFocusVisible: renderProps.isFocusVisible,
              isDisabled: renderProps.isDisabled,
            },
            {
              selectedIconColor,
              selectedLabelColor,
              indicatorColor,
              unselectedIconColor,
              unselectedLabelColor,
            },
          ),
          ...userStyle,
        };
      }}
    >
      {(renderProps) => (
        <span className="navigation-bar-item__layout">
          <span className="navigation-bar-item__indicator-ripple">
            <span className="navigation-bar-item__indicator" />
            <Ripple
              controller={ripple}
              focusRingRadius="var(--_navigation-bar-indicator-radius)"
              state={{
                isFocusVisible: renderProps.isFocusVisible,
                isHovered: renderProps.isHovered,
              }}
            />
            <span
              aria-hidden={label !== undefined ? true : undefined}
              className="navigation-bar-item__icon"
            >
              {icon}
            </span>
          </span>
          {label !== undefined ? (
            <span className="navigation-bar-item__label">{label}</span>
          ) : null}
        </span>
      )}
    </AriaButton>
  );
}
