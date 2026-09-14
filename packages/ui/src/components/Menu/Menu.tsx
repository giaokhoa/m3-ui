import '@m3-ui/tokens/menu.css';
import clsx from 'clsx';
import type {
  CSSProperties,
  ReactElement,
  ReactNode,
} from 'react';
import {
  Button as AriaButton,
  Header as AriaHeader,
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  MenuTrigger as AriaMenuTrigger,
  Popover as AriaPopover,
  Section as AriaSection,
  SubmenuTrigger as AriaSubmenuTrigger,
  type MenuItemProps as AriaMenuItemProps,
  type MenuProps as AriaMenuProps,
  type PopoverProps as AriaPopoverProps,
} from 'react-aria-components';
import { Elevation } from '../../internal/elevation';
import { Ripple, useRipple } from '../../internal/ripple';
import { getTextFieldStaticClassName } from '../TextField/TextField';
import { menuContainerElevation, menuRuntime } from './Menu.defaults';
import './menu.css';

export interface MenuProps<T extends object>
  extends Omit<AriaMenuProps<T>, 'className' | 'style'> {
  trigger: ReactElement;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  placement?: AriaPopoverProps['placement'];
  offset?: number;
  crossOffset?: number;
  className?: string;
  style?: CSSProperties;
  popoverClassName?: string;
}

function MenuSurface({ children }: { children: ReactNode }) {
  return (
    <div className="menu-surface">
      <Elevation level={menuContainerElevation} />
      <div className="menu-surface__clip">{children}</div>
    </div>
  );
}

/**
 * Material renderer around React Aria menu semantics and overlay positioning.
 * RAC owns roving focus, Home/End/arrows, Escape, outside dismissal and focus
 * restoration. Material owns tokens, geometry and motion.
 */
export function Menu<T extends object>({
  trigger,
  isOpen,
  defaultOpen,
  onOpenChange,
  placement = 'bottom start',
  offset = 4,
  crossOffset = 0,
  className,
  style,
  popoverClassName,
  ...menuProps
}: MenuProps<T>) {

  return (
    <AriaMenuTrigger
      isOpen={isOpen}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      {trigger}
      <AriaPopover
        placement={placement}
        offset={offset}
        crossOffset={crossOffset}
        containerPadding={menuRuntime.viewportMargin}
        className={clsx('menu-popover', popoverClassName)}
      >
        <MenuSurface>
          <AriaMenu
            {...menuProps}
            className={clsx('menu', className)}
            style={style}
          />
        </MenuSurface>
      </AriaPopover>
    </AriaMenuTrigger>
  );
}

export interface MenuItemProps
  extends Omit<AriaMenuItemProps, 'children' | 'className'> {
  children: ReactNode;
  leading?: ReactNode;
  selectedLeading?: ReactNode;
  trailing?: ReactNode;
  supportingText?: ReactNode;
  className?: string;
}

type MenuItemRipple = ReturnType<typeof useRipple>;

function materialMenuItem(
  {
    children,
    leading,
    selectedLeading,
    trailing,
    supportingText,
    className,
    onPressStart,
    onPressEnd,
    ...props
  }: MenuItemProps,
  ripple: MenuItemRipple,
) {
  const ripplePressProps = ripple.getPressProps({ onPressStart, onPressEnd });

  return (
    <AriaMenuItem
      {...props}
      {...ripplePressProps}
      className={clsx('menu-item', className)}
      textValue={
        props.textValue ??
        (typeof children === 'string' ? children : undefined)
      }
    >
      {(renderProps) => (
        <>
          <Ripple
            controller={ripple}
            state={{
              isFocusVisible: renderProps.isFocusVisible,
              isHovered: renderProps.isHovered,
            }}
          />
          {(renderProps.isSelected ? selectedLeading ?? leading : leading) !=
          null ? (
            <span className="menu-item__leading">
              {renderProps.isSelected ? selectedLeading ?? leading : leading}
            </span>
          ) : null}
          <span className="menu-item__body">
            <span className="menu-item__label">{children}</span>
            {supportingText != null ? (
              <span className="menu-item__supporting">{supportingText}</span>
            ) : null}
          </span>
          {trailing != null ? (
            <span className="menu-item__trailing">{trailing}</span>
          ) : null}
        </>
      )}
    </AriaMenuItem>
  );
}

export function MenuItem(props: MenuItemProps) {
  const ripple = useRipple();
  return materialMenuItem(props, ripple);
}

export interface MenuSubmenuProps<T extends object>
  extends Omit<AriaMenuProps<T>, 'className' | 'style'> {
  trigger: ReactElement<MenuItemProps, typeof MenuItem>;
  delay?: number;
  placement?: AriaPopoverProps['placement'];
  offset?: number;
  crossOffset?: number;
  className?: string;
  style?: CSSProperties;
  popoverClassName?: string;
}

/**
 * Material submenu composition backed by React Aria's SubmenuTrigger.
 * RAC owns arrow-key/hover disclosure, Escape and focus travel while the
 * Material layer owns surface paint, spacing and motion.
 */
export function MenuSubmenu<T extends object>({
  trigger,
  delay = 200,
  placement = 'end top',
  offset = 4,
  crossOffset = 0,
  className,
  style,
  popoverClassName,
  ...menuProps
}: MenuSubmenuProps<T>) {
  const ripple = useRipple();

  return (
    <AriaSubmenuTrigger delay={delay}>
      {materialMenuItem(trigger.props, ripple)}
      <AriaPopover
        placement={placement}
        offset={offset}
        crossOffset={crossOffset}
        containerPadding={menuRuntime.viewportMargin}
        className={clsx(
          'menu-popover',
          'menu-submenu-popover',
          popoverClassName,
        )}
      >
        <MenuSurface>
          <AriaMenu
            {...menuProps}
            className={clsx('menu', className)}
            style={style}
          />
        </MenuSurface>
      </AriaPopover>
    </AriaSubmenuTrigger>
  );
}

export interface MenuSectionProps {
  children: ReactNode;
  label?: ReactNode;
  variant?: 'standard' | 'segmented';
  tone?: 'standard' | 'vibrant';
  className?: string;
}

export function MenuSection({
  children,
  label,
  variant = 'standard',
  tone = 'standard',
  className,
}: MenuSectionProps) {
  return (
    <AriaSection
      data-tone={variant === 'segmented' ? tone : undefined}
      className={clsx(
        'menu-section',
        variant === 'segmented' && 'menu-section--segmented',
        className,
      )}
    >
      {label != null ? <AriaHeader className="menu-section__label">{label}</AriaHeader> : null}
      {children}
    </AriaSection>
  );
}

export interface ExposedMenuProps<T extends object>
  extends Omit<AriaMenuProps<T>, 'className' | 'style'> {
  label?: ReactNode;
  value: string;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  isDisabled?: boolean;
  className?: string;
  style?: CSSProperties;
  matchAnchorWidth?: boolean;
  trailingIcon?: ReactNode;
}

function ExposedMenuTrigger({
  label,
  value,
  isDisabled,
  trailingIcon,
}: {
  label?: ReactNode;
  value: string;
  isDisabled: boolean;
  trailingIcon?: ReactNode;
}) {
  const textFieldClassName = getTextFieldStaticClassName({
    variant: 'filled',
    label,
    trailingIcon,
    isMultiline: false,
  });

  return (
    <AriaButton
      isDisabled={isDisabled}
      className={clsx(textFieldClassName, 'exposed-menu__trigger')}
    >
      {(renderProps) => (
        <span className="text-field__container">
          <span className="text-field__content">
            {label != null ? (
              <span className="text-field__label">{label}</span>
            ) : null}
            <span className="text-field__input-row">
              <span
                className="text-field__control text-field__input"
                data-focused={renderProps.isFocused || undefined}
              >
                {value}
              </span>
            </span>
          </span>
          {trailingIcon != null ? (
            <span
              className="text-field__icon text-field__icon--trailing"
              aria-hidden="true"
            >
              {trailingIcon}
            </span>
          ) : null}
          <span className="text-field__indicator" aria-hidden="true" />
        </span>
      )}
    </AriaButton>
  );
}

/**
 * Read-only exposed/select-style menu. React Aria MenuTrigger owns the
 * press/keyboard/open/focus lifecycle while Material reuses the filled
 * TextField presentation for the trigger. This is intentionally a menu, not an
 * editable combobox/autocomplete.
 */
export function ExposedMenu<T extends object>({
  label,
  value,
  isOpen,
  defaultOpen = false,
  onOpenChange,
  isDisabled = false,
  className,
  style,
  matchAnchorWidth = menuRuntime.exposedMatchAnchorWidth,
  trailingIcon = '▾',
  ...menuProps
}: ExposedMenuProps<T>) {
  return (
    <div className={clsx('exposed-menu', className)} style={style}>
      <AriaMenuTrigger
        isOpen={isOpen}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
      >
        <ExposedMenuTrigger
          label={label}
          value={value}
          isDisabled={isDisabled}
          trailingIcon={trailingIcon}
        />
        <AriaPopover
          placement="bottom start"
          offset={4}
          containerPadding={menuRuntime.viewportMargin}
          className={clsx(
            'menu-popover',
            'exposed-menu__popover',
            matchAnchorWidth && 'exposed-menu__popover--match-anchor',
          )}
        >
          <MenuSurface>
            <AriaMenu
              {...menuProps}
              autoFocus="first"
              className="menu"
            />
          </MenuSurface>
        </AriaPopover>
      </AriaMenuTrigger>
    </div>
  );
}
