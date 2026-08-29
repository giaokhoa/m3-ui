import clsx from 'clsx';
import {
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import {
  Tab as AriaTab,
  TabList as AriaTabList,
  Tabs as AriaTabs,
  type TabProps as AriaTabProps,
} from 'react-aria-components';
import { Ripple, useRipple } from '../../internal/ripple';
import { HorizontalDivider } from '../Divider';
import {
  getTabStyle,
  getTabsStyle,
  tabsRuntime,
  type TabsMode,
  type TabsVariant,
} from './Tabs.defaults';
import './tabs.css';

export interface MaterialTab {
  id: string | number;
  label?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  /** Use "start" for AndroidX LeadingIconTab parity. */
  iconPlacement?: 'top' | 'start';
}

export interface TabsProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'children' | 'defaultValue' | 'onChange'
  > {
  items: readonly MaterialTab[];
  selectedKey?: string | number;
  defaultSelectedKey?: string | number;
  onSelectionChange?: (key: string | number) => void;
  variant?: TabsVariant;
  mode?: TabsMode;
  showDivider?: boolean;
  containerColor?: CSSProperties['backgroundColor'];
  indicatorColor?: CSSProperties['backgroundColor'];
  'aria-label'?: string;
}

interface MaterialTabItemProps
  extends Omit<AriaTabProps, 'children' | 'id'> {
  item: MaterialTab;
  variant: TabsVariant;
}

function MaterialTabItem({
  item,
  variant,
  onPressStart,
  onPressEnd,
  ...props
}: MaterialTabItemProps) {
  const ripple = useRipple();
  const hasIconAndLabel = item.icon !== undefined && item.label !== undefined;
  const leading = hasIconAndLabel && item.iconPlacement === 'start';

  return (
    <AriaTab
      {...props}
      id={item.id}
      isDisabled={item.disabled}
      className="tabs__tab"
      onPressStart={(event) => {
        ripple.onPressStart(event);
        onPressStart?.(event);
      }}
      onPressEnd={(event) => {
        ripple.onPressEnd();
        onPressEnd?.(event);
      }}
      style={(renderProps) =>
        getTabStyle(variant, {
          selected: renderProps.isSelected,
          disabled: renderProps.isDisabled,
        })
      }
    >
      {(renderProps) => (
        <>
          <Ripple
            controller={ripple}
            isHovered={renderProps.isHovered}
            isFocusVisible={renderProps.isFocusVisible}
            focusRingRadius="0px"
          />
          <span
            className="tabs__content"
            data-icon-and-label={hasIconAndLabel || undefined}
            data-leading={leading || undefined}
          >
            {item.icon !== undefined ? (
              <span className="tabs__icon" aria-hidden="true">
                {item.icon}
              </span>
            ) : null}
            {item.label !== undefined ? (
              <span className="tabs__label">{item.label}</span>
            ) : null}
          </span>
        </>
      )}
    </AriaTab>
  );
}

export function Tabs({
  items,
  selectedKey,
  defaultSelectedKey,
  onSelectionChange,
  variant = 'primary',
  mode = 'fixed',
  showDivider = true,
  containerColor,
  indicatorColor,
  className,
  style,
  'aria-label': ariaLabel = 'Tabs',
  ...props
}: TabsProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const updateIndicator = () => {
      const selected = track.querySelector<HTMLElement>(
        '.tabs__tab[data-selected]',
      );
      if (!selected) return;
      const source =
        variant === 'primary'
          ? selected.querySelector<HTMLElement>('.tabs__content') ?? selected
          : selected;
      const trackRect = track.getBoundingClientRect();
      const sourceRect = source.getBoundingClientRect();

      track.style.setProperty(
        '--_tabs-indicator-x',
        `${sourceRect.left - trackRect.left}px`,
      );
      track.style.setProperty(
        '--_tabs-indicator-width',
        `${sourceRect.width}px`,
      );

      if (mode === 'scrollable') {
        const reduceMotion = window.matchMedia(
          '(prefers-reduced-motion: reduce)',
        ).matches;
        selected.scrollIntoView({
          behavior: reduceMotion ? 'auto' : 'smooth',
          block: 'nearest',
          inline: 'nearest',
        });
      }
    };

    updateIndicator();
    const resizeObserver = new ResizeObserver(updateIndicator);
    resizeObserver.observe(viewport);
    resizeObserver.observe(track);
    const mutationObserver = new MutationObserver(updateIndicator);
    mutationObserver.observe(track, {
      attributes: true,
      subtree: true,
      attributeFilter: ['data-selected'],
    });
    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [items.length, mode, variant]);

  const tabsStyle = {
    ...getTabsStyle(variant, mode, {
      containerColor,
      indicatorColor,
    }),
    ...style,
  } as CSSProperties;

  return (
    <div
      {...props}
      className={clsx('tabs',
        `tabs--${variant}`,
        `tabs--${mode}`,
        className,)}
      data-mode={mode}
      data-variant={variant}
      style={tabsStyle}
    >
      <AriaTabs
        selectedKey={selectedKey}
        defaultSelectedKey={defaultSelectedKey}
        onSelectionChange={(key) =>
          onSelectionChange?.(key as string | number)
        }
        keyboardActivation="automatic"
      >
        <div className="tabs__viewport" ref={viewportRef}>
          <div className="tabs__track" ref={trackRef}>
            <AriaTabList aria-label={ariaLabel} className="tabs__list">
              {items.map((item) => (
                <MaterialTabItem
                  key={String(item.id)}
                  item={item}
                  variant={variant}
                />
              ))}
            </AriaTabList>
            <span
              aria-hidden="true"
              className="tabs__indicator"
              data-testid="tabs-indicator"
            />
          </div>
        </div>
      </AriaTabs>
      {showDivider ? (
        <HorizontalDivider className="tabs__divider" />
      ) : null}
    </div>
  );
}

export { tabsRuntime };
