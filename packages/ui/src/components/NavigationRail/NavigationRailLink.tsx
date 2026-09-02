import type { ReactNode } from 'react';
import {
  Link as AriaLink,
  type LinkProps as AriaLinkProps,
} from 'react-aria-components';
import { Ripple, useRipple } from '../../internal/ripple';
import {
  getNavigationRailItemStyle,
  type NavigationRailItemStyleOptions,
} from './NavigationRail.defaults';
import './navigation-rail.css';

export interface NavigationRailLinkProps
  extends Omit<AriaLinkProps, 'children'>,
    NavigationRailItemStyleOptions {
  selected: boolean;
  icon: ReactNode;
  label?: ReactNode;
  alwaysShowLabel?: boolean;
}

/**
 * Semantic-link counterpart to NavigationRailItem for route navigation.
 * It preserves the canonical Material rail visuals while exposing native link
 * semantics and aria-current instead of tab selection semantics.
 */
export function NavigationRailLink({
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
  onPressStart,
  onPressEnd,
  ...props
}: NavigationRailLinkProps) {
  const ripple = useRipple({ origin: 'center' });
  const hasLabel = label !== undefined;
  const ripplePressProps = ripple.getPressProps({ onPressStart, onPressEnd });

  return (
    <AriaLink
      {...props}
      {...ripplePressProps}
      aria-current={selected ? 'page' : undefined}
      data-selected={selected || undefined}
      data-has-label={hasLabel || undefined}
      data-label-hidden={hasLabel && !alwaysShowLabel && !selected ? true : undefined}
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
    </AriaLink>
  );
}
