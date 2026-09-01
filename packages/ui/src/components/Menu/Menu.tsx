import clsx from 'clsx';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  Header as AriaHeader,
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  MenuTrigger as AriaMenuTrigger,
  Popover as AriaPopover,
  Section as AriaSection,
  type MenuItemProps as AriaMenuItemProps,
  type MenuProps as AriaMenuProps,
  type PopoverProps as AriaPopoverProps,
} from 'react-aria-components';
import { Elevation } from '../../internal/elevation';
import { Ripple, useRipple } from '../../internal/ripple';
import { useThemePortalContainer } from '../../theme/ThemePortalContext';
import { TextField } from '../TextField';
import { getMenuStyle, menuRuntime, menuTokens } from './Menu.defaults';
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
      <Elevation level={menuTokens.containerElevation} />
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
  const themePortalContainer = useThemePortalContainer();

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
        UNSTABLE_portalContainer={themePortalContainer ?? undefined}
        className={clsx('menu-popover', popoverClassName)}
        style={getMenuStyle()}
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
  trailing?: ReactNode;
  supportingText?: ReactNode;
  className?: string;
}

export function MenuItem({
  children,
  leading,
  trailing,
  supportingText,
  className,
  onPressStart,
  onPressEnd,
  ...props
}: MenuItemProps) {
  const ripple = useRipple();
  const ripplePressProps = ripple.getPressProps({ onPressStart, onPressEnd });

  return (
    <AriaMenuItem
      {...props}
      {...ripplePressProps}
      className={clsx('menu-item', className)}
      textValue={props.textValue ?? (typeof children === 'string' ? children : undefined)}
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
          {leading != null ? <span className="menu-item__leading">{leading}</span> : null}
          <span className="menu-item__body">
            <span className="menu-item__label">{children}</span>
            {supportingText != null ? (
              <span className="menu-item__supporting">{supportingText}</span>
            ) : null}
          </span>
          {trailing != null ? <span className="menu-item__trailing">{trailing}</span> : null}
        </>
      )}
    </AriaMenuItem>
  );
}

export interface MenuSectionProps {
  children: ReactNode;
  label?: ReactNode;
  variant?: 'standard' | 'segmented';
  className?: string;
}

export function MenuSection({
  children,
  label,
  variant = 'standard',
  className,
}: MenuSectionProps) {
  return (
    <AriaSection
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

/**
 * Read-only exposed/select-style menu. The anchor is the existing Material
 * TextField rather than a forked input renderer. This is intentionally a menu,
 * not an editable combobox/autocomplete.
 */
export function ExposedMenu<T extends object>({
  label,
  value,
  isOpen: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  isDisabled = false,
  className,
  style,
  matchAnchorWidth = menuRuntime.exposedMatchAnchorWidth,
  trailingIcon = '▾',
  ...menuProps
}: ExposedMenuProps<T>) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const themePortalContainer = useThemePortalContainer();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = controlledOpen ?? uncontrolledOpen;

  const focusAnchor = useCallback(() => {
    anchorRef.current?.querySelector<HTMLInputElement>('input')?.focus();
  }, []);
  const setOpen = useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange],
  );

  useEffect(() => {
    if (!isOpen) return;
    const frame = requestAnimationFrame(() => {
      const menu = document.querySelector<HTMLElement>('[data-exposed-menu="true"]');
      menu?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  return (
    <div
      ref={anchorRef}
      className={clsx('exposed-menu', className)}
      style={{ ...getMenuStyle(), ...style }}
      onPointerDownCapture={(event) => {
        if (isDisabled || event.button !== 0) return;
        event.preventDefault();
        setOpen(!isOpen);
      }}
      onKeyDownCapture={(event) => {
        if (isDisabled) return;
        if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          setOpen(true);
        }
        if (event.key === 'Escape' && isOpen) {
          event.preventDefault();
          setOpen(false);
          focusAnchor();
        }
      }}
    >
      <TextField
        label={label}
        value={value}
        isReadOnly
        isDisabled={isDisabled}
        isMultiline={false}
        trailingIcon={trailingIcon}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      />
      <AriaPopover
        isOpen={isOpen}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) requestAnimationFrame(focusAnchor);
        }}
        triggerRef={anchorRef}
        placement="bottom start"
        offset={4}
        containerPadding={menuRuntime.viewportMargin}
        UNSTABLE_portalContainer={themePortalContainer ?? undefined}
        className="menu-popover exposed-menu__popover"
        style={{
          ...getMenuStyle(),
          ...(matchAnchorWidth && anchorRef.current
            ? { minWidth: anchorRef.current.getBoundingClientRect().width }
            : null),
        }}
      >
        <MenuSurface>
          <AriaMenu
            {...menuProps}
            autoFocus="first"
            data-exposed-menu="true"
            className="menu"
          />
        </MenuSurface>
      </AriaPopover>
    </div>
  );
}
