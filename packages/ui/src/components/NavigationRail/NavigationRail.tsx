import clsx from 'clsx';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from 'react-aria-components';
import { Ripple, useRipple } from '../../internal/ripple';
import {
  getNavigationRailItemStyle,
  getNavigationRailStyle,
  type NavigationRailItemStyleOptions,
  type NavigationRailStyleOptions,
} from './NavigationRail.defaults';
import './navigation-rail.css';

export interface NavigationRailProps
  extends Omit<HTMLAttributes<HTMLElement>, 'color'>,
    NavigationRailStyleOptions {
  header?: ReactNode;
  /**
   * Controls the semantic wrapper around rail items. The default preserves the
   * existing tab-style NavigationRailItem contract; route-navigation rails can
   * opt into native link semantics with `links`.
   */
  itemSemantics?: 'tabs' | 'links';
}

export interface NavigationRailItemProps
  extends Omit<AriaButtonProps, 'children'>,
    NavigationRailItemStyleOptions {
  selected: boolean;
  icon: ReactNode;
  label?: ReactNode;
  alwaysShowLabel?: boolean;
}

export function NavigationRail({
  containerColor,
  contentColor,
  header,
  itemSemantics = 'tabs',
  className,
  style,
  children,
  'aria-label': ariaLabel = 'Primary navigation',
  ...props
}: NavigationRailProps) {
  const navigationStyle = {
    ...getNavigationRailStyle({ containerColor, contentColor }),
    ...style,
  } as CSSProperties;
  const tabSemantics = itemSemantics === 'tabs';

  return (
    <nav
      {...props}
      aria-label={ariaLabel}
      className={clsx('navigation-rail', className)}
      style={navigationStyle}
    >
      <div className="navigation-rail__content">
        {header !== undefined ? (
          <>
            <div className="navigation-rail__header">{header}</div>
            <div aria-hidden="true" className="navigation-rail__header-spacer" />
          </>
        ) : null}
        <div
          aria-label={tabSemantics ? ariaLabel : undefined}
          className="navigation-rail__items"
          role={tabSemantics ? 'tablist' : undefined}
          aria-orientation={tabSemantics ? 'vertical' : undefined}
        >
          {children}
        </div>
      </div>
    </nav>
  );
}

export function NavigationRailItem({
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
}: NavigationRailItemProps) {
  const ripple = useRipple({ origin: 'center' });
  const hasLabel = label !== undefined;
  const ripplePressProps = ripple.getPressProps({ onPressStart, onPressEnd });

  return (
    <AriaButton
      {...props}
      {...ripplePressProps}
      isDisabled={isDisabled}
      data-selected={selected || undefined}
      data-has-label={hasLabel || undefined}
      data-label-hidden={hasLabel && !alwaysShowLabel && !selected ? true : undefined}
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
          ? `navigation-rail-item ${userClassName}`
          : 'navigation-rail-item';
      }}
      style={(renderProps) => {
        const userStyle =
          typeof style === 'function' ? style(renderProps) : style;
        return {
          ...getNavigationRailItemStyle(
            selected,
            hasLabel,
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
        <span className="navigation-rail-item__layout">
          <span className="navigation-rail-item__indicator-ripple">
            <span className="navigation-rail-item__indicator" />
            <Ripple
              controller={ripple}
              focusRingRadius="var(--_navigation-rail-indicator-radius)"
              state={{
                isFocusVisible: renderProps.isFocusVisible,
                isHovered: renderProps.isHovered,
              }}
            />
            <span
              aria-hidden={hasLabel ? true : undefined}
              className="navigation-rail-item__icon"
            >
              {icon}
            </span>
          </span>
          {hasLabel ? (
            <span className="navigation-rail-item__label">{label}</span>
          ) : null}
        </span>
      )}
    </AriaButton>
  );
}
