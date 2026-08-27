import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { FloatingActionButton, type FloatingActionButtonProps } from '../Fab';
import { Surface } from '../Surface';
import {
  fabMenuTokens,
  getFabMenuStyle,
  getToggleFabStyle,
  type ToggleFabSize,
} from './FabMenu.defaults';
import './fab-menu.css';

type HorizontalAlignment = 'start' | 'end';

interface FabMenuContextValue {
  expanded: boolean;
}

const FabMenuContext = createContext<FabMenuContextValue | null>(null);

function useFabMenuContext(): FabMenuContextValue {
  const context = useContext(FabMenuContext);
  if (!context) {
    throw new Error('FloatingActionButtonMenuItem must be rendered inside FloatingActionButtonMenu.');
  }
  return context;
}

export interface FloatingActionButtonMenuProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> {
  expanded: boolean;
  trigger: ReactElement;
  children: ReactNode;
  horizontalAlignment?: HorizontalAlignment;
  maxMenuHeight?: CSSProperties['maxHeight'];
}

/**
 * Material 3 action group paired with a controlled FAB trigger. The trigger
 * owns the state-change callback; this container projects expanded semantics,
 * stagger/layout behavior, and keyboard focus transfer without duplicating the
 * trigger interaction. This intentionally keeps native/button semantics rather
 * than mapping the family to an ARIA menu.
 */
export function FloatingActionButtonMenu({
  expanded,
  trigger,
  children,
  horizontalAlignment = 'end',
  maxMenuHeight,
  className,
  style,
  onKeyDownCapture,
  onKeyUpCapture,
  ...props
}: FloatingActionButtonMenuProps) {
  const actionsId = useId();
  const actionsRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const wasExpanded = useRef(expanded);
  const pendingActionKey = useRef<string | null>(null);
  const childArray = Children.toArray(children);

  const focusTrigger = () => {
    triggerRef.current
      ?.querySelector<HTMLElement>('button,[role="button"],[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')
      ?.focus();
  };

  useEffect(() => {
    if (
      wasExpanded.current &&
      !expanded &&
      actionsRef.current?.contains(document.activeElement) &&
      pendingActionKey.current == null
    ) {
      focusTrigger();
    }
    wasExpanded.current = expanded;
  }, [expanded]);

  const handleKeyDownCapture = (event: KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as Node;
    const fromTrigger = triggerRef.current?.contains(target);
    const fromActions = actionsRef.current?.contains(target);

    if (fromActions && (event.key === 'Enter' || event.key === ' ')) {
      pendingActionKey.current = event.key;
    }

    if (
      fromTrigger &&
      expanded &&
      ((event.key === 'Tab' && !event.shiftKey) || event.key === 'ArrowDown')
    ) {
      const firstAction = actionsRef.current?.querySelector<HTMLElement>(
        '[data-fab-menu-item]:not([data-disabled])',
      );
      if (firstAction) {
        event.preventDefault();
        firstAction.focus();
      }
    }
    onKeyDownCapture?.(event);
  };

  const handleKeyUpCapture = (event: KeyboardEvent<HTMLDivElement>) => {
    const fromActions = actionsRef.current?.contains(event.target as Node);
    if (fromActions && pendingActionKey.current === event.key) {
      pendingActionKey.current = null;
      if (!expanded) {
        focusTrigger();
      }
    }
    onKeyUpCapture?.(event);
  };

  const triggerWithSemantics = isValidElement(trigger)
    ? cloneElement(trigger as ReactElement<Record<string, unknown>>, {
        'aria-controls': actionsId,
        'aria-expanded': expanded,
        'data-fab-menu-trigger': '',
      })
    : trigger;

  return (
    <FabMenuContext.Provider value={{ expanded }}>
      <div
        {...props}
        className={['fab-menu', className].filter(Boolean).join(' ')}
        data-alignment={horizontalAlignment}
        data-expanded={expanded ? '' : undefined}
        onKeyDownCapture={handleKeyDownCapture}
        onKeyUpCapture={handleKeyUpCapture}
        style={{ ...getFabMenuStyle(maxMenuHeight), ...style }}
      >
        <div
          ref={actionsRef}
          id={actionsId}
          aria-hidden={expanded ? undefined : true}
          className="fab-menu__actions"
          role="group"
        >
          {childArray.map((child, index) => {
            const openOrder = childArray.length - 1 - index;
            const closeOrder = index;
            return (
              <div
                key={isValidElement(child) && child.key != null ? child.key : index}
                className="fab-menu__item-slot"
                data-stagger-order={openOrder}
                style={
                  {
                    '--_fab-menu-open-delay': `${openOrder * fabMenuTokens.motion.staggerStepMs}ms`,
                    '--_fab-menu-close-delay': `${closeOrder * fabMenuTokens.motion.staggerStepMs}ms`,
                  } as CSSProperties
                }
              >
                {child}
              </div>
            );
          })}
        </div>
        <div ref={triggerRef} className="fab-menu__trigger">
          {triggerWithSemantics}
        </div>
      </div>
    </FabMenuContext.Provider>
  );
}

export interface FloatingActionButtonMenuItemProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'color' | 'onClick'> {
  children: ReactNode;
  icon: ReactNode;
  onPress: () => void;
  isDisabled?: boolean;
  containerColor?: CSSProperties['backgroundColor'];
  contentColor?: CSSProperties['color'];
}

export function FloatingActionButtonMenuItem({
  children,
  icon,
  onPress,
  isDisabled = false,
  containerColor = 'var(--primary-container)',
  contentColor = 'var(--on-primary-container)',
  className,
  style,
  tabIndex,
  ...props
}: FloatingActionButtonMenuItemProps) {
  const { expanded } = useFabMenuContext();

  return (
    <Surface
      {...props}
      aria-hidden={expanded ? undefined : true}
      className={['fab-menu-item', className].filter(Boolean).join(' ')}
      color={containerColor}
      contentColor={contentColor}
      data-fab-menu-item=""
      interaction={{ kind: 'clickable', onPress }}
      isDisabled={isDisabled}
      shadowElevation={fabMenuTokens.listItem.elevation}
      shape={fabMenuTokens.listItem.shape}
      style={style}
      tabIndex={expanded ? tabIndex : -1}
    >
      <span className="fab-menu-item__content">
        <span aria-hidden="true" className="fab-menu-item__icon">{icon}</span>
        <span className="fab-menu-item__label">{children}</span>
      </span>
    </Surface>
  );
}

export interface ToggleFloatingActionButtonProps
  extends Omit<
    FloatingActionButtonProps,
    'children' | 'className' | 'containerColor' | 'contentColor' | 'elevation' | 'onPress' | 'shape' | 'style' | 'variant'
  > {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  icon: ReactNode;
  checkedIcon?: ReactNode;
  size?: ToggleFabSize;
  className?: string;
  style?: CSSProperties;
  containerColor?: CSSProperties['backgroundColor'];
  checkedContainerColor?: CSSProperties['backgroundColor'];
  contentColor?: CSSProperties['color'];
  checkedContentColor?: CSSProperties['color'];
}

/**
 * Toggleable FAB whose visual container morphs from the selected FAB size to
 * the 56px close-button geometry while preserving the initial interaction box.
 */
export function ToggleFloatingActionButton({
  checked,
  onCheckedChange,
  icon,
  checkedIcon,
  size = 'baseline',
  className,
  style,
  containerColor,
  checkedContainerColor,
  contentColor,
  checkedContentColor,
  ...props
}: ToggleFloatingActionButtonProps) {
  const toggleStyle = getToggleFabStyle(size, checked, {
    containerColor,
    checkedContainerColor,
    contentColor,
    checkedContentColor,
  });

  return (
    <FloatingActionButton
      {...props}
      aria-pressed={checked}
      className={['fab-menu-toggle', className].filter(Boolean).join(' ')}
      data-checked={checked ? '' : undefined}
      onPress={() => onCheckedChange(!checked)}
      style={{ ...toggleStyle, ...style }}
    >
      <span className="fab-menu-toggle__icon-stack">
        <span className="fab-menu-toggle__icon fab-menu-toggle__icon--unchecked">{icon}</span>
        {checkedIcon != null ? (
          <span className="fab-menu-toggle__icon fab-menu-toggle__icon--checked">{checkedIcon}</span>
        ) : null}
      </span>
    </FloatingActionButton>
  );
}
