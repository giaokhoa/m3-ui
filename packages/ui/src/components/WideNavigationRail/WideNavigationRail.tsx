import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from 'react-aria-components';
import { Ripple, useRipple } from '../../internal/ripple';
import {
  getWideNavigationRailItemStyle,
  getWideNavigationRailStyle,
  wideNavigationRailRuntime,
  wideNavigationRailTokens,
  type WideNavigationRailItemStyleOptions,
  type WideNavigationRailStyleOptions,
} from './WideNavigationRail.defaults';
import {
  WideNavigationRailState,
  WideNavigationRailValue,
  useWideNavigationRailState,
} from './WideNavigationRailState';
import './wide-navigation-rail.css';

export type WideNavigationRailArrangement = 'top' | 'center' | 'bottom';
export type WideNavigationRailIconPosition = 'top' | 'start';

export interface WideNavigationRailProps
  extends Omit<HTMLAttributes<HTMLElement>, 'color'>,
    WideNavigationRailStyleOptions {
  state?: WideNavigationRailState;
  header?: ReactNode;
  arrangement?: WideNavigationRailArrangement;
}

export interface WideNavigationRailItemProps
  extends Omit<AriaButtonProps, 'children'>,
    WideNavigationRailItemStyleOptions {
  selected: boolean;
  icon: ReactNode;
  label?: ReactNode;
  railExpanded?: boolean;
  iconPosition?: WideNavigationRailIconPosition;
}

const WideNavigationRailExpandedContext = createContext(false);

function dimensionNumber(value: string | number): number {
  const numeric = typeof value === 'number' ? value : Number.parseFloat(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

export function WideNavigationRail({
  state,
  header,
  arrangement = 'top',
  containerColor,
  contentColor,
  className,
  style,
  children,
  'aria-label': ariaLabel = 'Primary navigation',
  ...props
}: WideNavigationRailProps) {
  const fallbackState = useWideNavigationRailState();
  const railState = state ?? fallbackState;
  useSyncExternalStore(
    railState.subscribe,
    railState.getSnapshot,
    railState.getSnapshot,
  );
  const expanded = railState.targetValue === WideNavigationRailValue.Expanded;
  const railRef = useRef<HTMLElement>(null);
  const expandedMinWidth = dimensionNumber(
    wideNavigationRailTokens.expandedContainerWidthMinimum,
  );
  const expandedMaxWidth = dimensionNumber(
    wideNavigationRailTokens.expandedContainerWidthMaximum,
  );
  const [expandedWidth, setExpandedWidth] = useState(expandedMinWidth);

  useLayoutEffect(() => {
    if (!expanded) return;
    const rail = railRef.current;
    if (!rail) return;

    let nextWidth = expandedMinWidth;
    const headerElement = rail.querySelector<HTMLElement>(
      '.wide-navigation-rail__header',
    );
    if (headerElement) {
      nextWidth = Math.max(nextWidth, headerElement.scrollWidth);
    }
    rail
      .querySelectorAll<HTMLElement>('.wide-navigation-rail-item__layout')
      .forEach((layout) => {
        nextWidth = Math.max(
          nextWidth,
          layout.scrollWidth + wideNavigationRailRuntime.itemHorizontalPadding,
        );
      });

    setExpandedWidth(
      Math.min(expandedMaxWidth, Math.max(expandedMinWidth, Math.ceil(nextWidth))),
    );
  }, [children, expanded, expandedMaxWidth, expandedMinWidth, header]);

  const navigationStyle = {
    ...getWideNavigationRailStyle({ containerColor, contentColor }),
    '--_wide-navigation-rail-expanded-width': `${expandedWidth}px`,
    ...style,
  } as CSSProperties;

  return (
    <nav
      {...props}
      ref={railRef}
      aria-label={ariaLabel}
      className={
        className
          ? `wide-navigation-rail ${className}`
          : 'wide-navigation-rail'
      }
      data-expanded={expanded || undefined}
      data-state={railState.targetValue}
      style={navigationStyle}
    >
      <div
        className="wide-navigation-rail__content"
        data-arrangement={arrangement}
      >
        {header !== undefined ? (
          <div className="wide-navigation-rail__header">{header}</div>
        ) : null}
        <WideNavigationRailExpandedContext.Provider value={expanded}>
          <div
            aria-label={ariaLabel}
            aria-orientation="vertical"
            className="wide-navigation-rail__items"
            role="tablist"
          >
            {children}
          </div>
        </WideNavigationRailExpandedContext.Provider>
      </div>
    </nav>
  );
}

export function WideNavigationRailItem({
  selected,
  icon,
  label,
  railExpanded,
  iconPosition,
  selectedIconColor,
  selectedTopLabelColor,
  selectedStartLabelColor,
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
}: WideNavigationRailItemProps) {
  const contextExpanded = useContext(WideNavigationRailExpandedContext);
  const expanded = railExpanded ?? contextExpanded;
  const effectiveIconPosition =
    iconPosition ?? (expanded ? ('start' as const) : ('top' as const));
  const horizontal = effectiveIconPosition === 'start';
  const hasLabel = label !== undefined;
  const ripple = useRipple({ origin: 'center' });

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
      isDisabled={isDisabled}
      data-selected={selected || undefined}
      data-expanded={horizontal || undefined}
      data-has-label={hasLabel || undefined}
      data-icon-position={effectiveIconPosition}
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
          ? `wide-navigation-rail-item ${userClassName}`
          : 'wide-navigation-rail-item';
      }}
      style={(renderProps) => {
        const userStyle =
          typeof style === 'function' ? style(renderProps) : style;
        return {
          ...getWideNavigationRailItemStyle(
            selected,
            horizontal,
            hasLabel,
            {
              isHovered: renderProps.isHovered,
              isPressed: renderProps.isPressed,
              isFocusVisible: renderProps.isFocusVisible,
              isDisabled: renderProps.isDisabled,
            },
            {
              selectedIconColor,
              selectedTopLabelColor,
              selectedStartLabelColor,
              indicatorColor,
              unselectedIconColor,
              unselectedLabelColor,
            },
          ),
          ...userStyle,
        };
      }}
      onPressStart={handlePressStart}
      onPressEnd={handlePressEnd}
    >
      {(renderProps) => (
        <span className="wide-navigation-rail-item__layout">
          <span className="wide-navigation-rail-item__indicator-ripple">
            <span className="wide-navigation-rail-item__indicator" />
            <Ripple
              controller={ripple}
              focusRingRadius="var(--_wide-navigation-rail-indicator-radius, 9999px)"
              isFocusVisible={renderProps.isFocusVisible}
              stateInteraction={
                renderProps.isFocusVisible
                  ? 'focus'
                  : renderProps.isHovered
                    ? 'hover'
                    : null
              }
            />
          </span>
          <span
            aria-hidden={hasLabel ? true : undefined}
            className="wide-navigation-rail-item__icon"
          >
            {icon}
          </span>
          {hasLabel ? (
            <span className="wide-navigation-rail-item__label">{label}</span>
          ) : null}
        </span>
      )}
    </AriaButton>
  );
}
