import clsx from 'clsx';
import { Children, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import {
  Button as AriaButton,
  Link as AriaLink,
  type ButtonProps as AriaButtonProps,
} from 'react-aria-components';
import { Ripple, useRipple } from '../../internal/ripple';
import {
  getCenteredOccupancy,
  getShortNavigationBarItemStyle,
  getShortNavigationBarStyle,
  type ShortNavigationBarArrangement,
  type ShortNavigationBarIconPosition,
  type ShortNavigationBarItemStyleOptions,
  type ShortNavigationBarStyleOptions,
} from './ShortNavigationBar.defaults';
import './short-navigation-bar.css';

export interface ShortNavigationBarProps
  extends Omit<HTMLAttributes<HTMLElement>, 'color'>,
    ShortNavigationBarStyleOptions {
  arrangement?: ShortNavigationBarArrangement;
  safeArea?: boolean;
}

export interface ShortNavigationBarItemProps
  extends ShortNavigationBarItemStyleOptions {
  isSelected: boolean;
  onPress?: AriaButtonProps['onPress'];
  onPressStart?: AriaButtonProps['onPressStart'];
  onPressEnd?: AriaButtonProps['onPressEnd'];
  isDisabled?: boolean;
  icon: ReactNode;
  label?: ReactNode;
  iconPosition?: ShortNavigationBarIconPosition;
  href?: string;
  target?: string;
  rel?: string;
  id?: string;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
  'data-testid'?: string;
}

export function ShortNavigationBar({
  arrangement = 'equal-weight',
  safeArea = true,
  containerColor,
  contentColor,
  className,
  style,
  children,
  'aria-label': ariaLabel = 'Primary navigation',
  ...props
}: ShortNavigationBarProps) {
  const count = Children.count(children);
  const navigationStyle = {
    ...getShortNavigationBarStyle({ containerColor, contentColor }),
    '--_short-navigation-bar-item-count': Math.max(count, 1),
    '--_short-navigation-bar-centered-occupancy': getCenteredOccupancy(count),
    ...style,
  } as CSSProperties;

  return (
    <nav
      {...props}
      aria-label={ariaLabel}
      className={clsx('short-navigation-bar', className)}
      data-arrangement={arrangement}
      data-safe-area={safeArea || undefined}
      style={navigationStyle}
    >
      <div className="short-navigation-bar__items">{children}</div>
    </nav>
  );
}

function ItemContents({
  icon,
  label,
  iconPosition,
  isFocusVisible,
  isHovered,
  ripple,
}: {
  icon: ReactNode;
  label?: ReactNode;
  iconPosition: ShortNavigationBarIconPosition;
  isFocusVisible: boolean;
  isHovered: boolean;
  ripple: ReturnType<typeof useRipple>;
}) {
  return (
    <span className="short-navigation-bar-item__layout">
      <span className="short-navigation-bar-item__indicator-ripple">
        <span className="short-navigation-bar-item__indicator" />
        <Ripple
          controller={ripple}
          focusRingRadius="var(--_short-navigation-bar-indicator-radius)"
          state={{ isFocusVisible, isHovered }}
        />
        <span
          aria-hidden={label !== undefined ? true : undefined}
          className="short-navigation-bar-item__icon"
        >
          {icon}
        </span>
        {iconPosition === 'start' && label !== undefined ? (
          <span className="short-navigation-bar-item__label">{label}</span>
        ) : null}
      </span>
      {iconPosition === 'top' && label !== undefined ? (
        <span className="short-navigation-bar-item__label">{label}</span>
      ) : null}
    </span>
  );
}

export function ShortNavigationBarItem({
  isSelected,
  onPress,
  onPressStart,
  onPressEnd,
  isDisabled = false,
  icon,
  label,
  iconPosition = 'top',
  href,
  target,
  rel,
  id,
  className,
  style,
  'aria-label': ariaLabel,
  'data-testid': testId,
  selectedIconColor,
  selectedLabelColor,
  selectedStartLabelColor,
  indicatorColor,
  unselectedIconColor,
  unselectedLabelColor,
}: ShortNavigationBarItemProps) {
  const ripple = useRipple({ origin: 'center' });
  const ripplePressProps = ripple.getPressProps({ onPressStart, onPressEnd });
  const itemClassName = clsx('short-navigation-bar-item', className);

  const renderItem = (renderProps: {
    isHovered: boolean;
    isPressed: boolean;
    isFocusVisible: boolean;
    isDisabled: boolean;
  }) => (
    <ItemContents
      icon={icon}
      label={label}
      iconPosition={iconPosition}
      isFocusVisible={renderProps.isFocusVisible}
      isHovered={renderProps.isHovered}
      ripple={ripple}
    />
  );
  const itemStyle = (renderProps: {
    isHovered: boolean;
    isPressed: boolean;
    isFocusVisible: boolean;
    isDisabled: boolean;
  }) => ({
    ...getShortNavigationBarItemStyle(
      isSelected,
      iconPosition,
      renderProps,
      {
        selectedIconColor,
        selectedLabelColor,
        selectedStartLabelColor,
        indicatorColor,
        unselectedIconColor,
        unselectedLabelColor,
      },
    ),
    ...style,
  });

  const shared = {
    id,
    className: itemClassName,
    'aria-label': ariaLabel,
    'aria-current': isSelected ? ('page' as const) : undefined,
    'data-testid': testId,
    'data-selected': isSelected || undefined,
    'data-icon-position': iconPosition,
    isDisabled,
    onPress,
    ...ripplePressProps,
    style: itemStyle,
  };

  if (href !== undefined) {
    return (
      <AriaLink {...shared} href={href} target={target} rel={rel}>
        {renderItem}
      </AriaLink>
    );
  }

  return <AriaButton {...shared}>{renderItem}</AriaButton>;
}
