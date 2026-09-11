import clsx from 'clsx';
import {
  useMemo,
  useSyncExternalStore,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import {
  NavigationBar,
  NavigationBarItem,
  NavigationDrawerItem,
  NavigationRail,
  NavigationRailItem,
  PermanentDrawerSheet,
  ShortNavigationBar,
  ShortNavigationBarItem,
  WideNavigationRail,
  WideNavigationRailItem,
  WideNavigationRailState,
  WideNavigationRailValue,
} from '../../../components';
import type { WindowAdaptiveInfo } from '../../adaptive/paneScaffoldDirective';
import { useWindowAdaptiveInfo } from '../../adaptive/useWindowAdaptiveInfo';
import {
  NavigationSuiteScaffoldState,
  useNavigationSuiteScaffoldState,
} from './NavigationSuiteScaffoldState';
import './navigation-suite-scaffold.css';

export const NavigationSuiteType = {
  ShortNavigationBarCompact: 'short-navigation-bar-compact',
  ShortNavigationBarMedium: 'short-navigation-bar-medium',
  WideNavigationRailCollapsed: 'wide-navigation-rail-collapsed',
  WideNavigationRailExpanded: 'wide-navigation-rail-expanded',
  NavigationBar: 'navigation-bar',
  NavigationRail: 'navigation-rail',
  NavigationDrawer: 'navigation-drawer',
  None: 'none',
} as const;

export type NavigationSuiteType =
  (typeof NavigationSuiteType)[keyof typeof NavigationSuiteType];

export type NavigationSuiteVerticalArrangement = 'top' | 'center' | 'bottom';
export type NavigationSuitePrimaryActionAlignment = 'start' | 'center' | 'end';

export interface NavigationSuiteItem {
  selected: boolean;
  icon: ReactNode;
  label?: ReactNode;
  badge?: ReactNode;
  disabled?: boolean;
  onPress?: () => void;
  ariaLabel?: string;
}

export interface NavigationSuiteScaffoldProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'color'> {
  /** Generic destinations projected into the selected Material navigation family. */
  items: readonly NavigationSuiteItem[];
  /** Explicit semantic override. Material-recommended adaptive selection is the default. */
  navigationSuiteType?: NavigationSuiteType;
  /**
   * Optional precomputed adaptive info for SSR/tests/platform adapters. When omitted,
   * the canonical browser `useWindowAdaptiveInfo()` source is used.
   */
  adaptiveInfo?: WindowAdaptiveInfo;
  /** Observable show/hide state corresponding to the AndroidX scaffold capability. */
  state?: NavigationSuiteScaffoldState;
  /** Optional FAB/action content associated with the navigation suite. */
  primaryAction?: ReactNode;
  /** Logical alignment used when the primary action sits above bottom navigation. */
  primaryActionAlignment?: NavigationSuitePrimaryActionAlignment;
  verticalArrangement?: NavigationSuiteVerticalArrangement;
  containerColor?: CSSProperties['backgroundColor'];
  contentColor?: CSSProperties['color'];
  children?: ReactNode;
  contentClassName?: string;
  contentStyle?: CSSProperties;
}

/**
 * Current AndroidX Material3 Adaptive Navigation Suite recommended mapping.
 *
 * Compact width takes precedence. Otherwise tabletop/compact-height windows use
 * the horizontal-item short navigation bar; all remaining classes use a
 * collapsed wide rail. Expanded wide rail and legacy types are explicit only.
 */
export function calculateNavigationSuiteType(
  adaptiveInfo: WindowAdaptiveInfo,
): NavigationSuiteType {
  if (adaptiveInfo.windowSizeClass.width === 'compact') {
    return NavigationSuiteType.ShortNavigationBarCompact;
  }
  if (
    adaptiveInfo.windowPosture.isTabletop ||
    adaptiveInfo.windowSizeClass.height === 'compact'
  ) {
    return NavigationSuiteType.ShortNavigationBarMedium;
  }
  return NavigationSuiteType.WideNavigationRailCollapsed;
}

function isBottomNavigation(type: NavigationSuiteType) {
  return (
    type === NavigationSuiteType.ShortNavigationBarCompact ||
    type === NavigationSuiteType.ShortNavigationBarMedium ||
    type === NavigationSuiteType.NavigationBar
  );
}

function ItemIcon({ icon, badge }: Pick<NavigationSuiteItem, 'icon' | 'badge'>) {
  if (badge === undefined) return <>{icon}</>;
  return (
    <span className="navigation-suite-scaffold__badged-icon">
      {icon}
      <span className="navigation-suite-scaffold__badge">{badge}</span>
    </span>
  );
}

function NavigationItems({
  type,
  items,
}: {
  type: NavigationSuiteType;
  items: readonly NavigationSuiteItem[];
}) {
  return items.map((item, index) => {
    const key = `${item.ariaLabel ?? String(index)}-${index}`;
    const icon = <ItemIcon icon={item.icon} badge={item.badge} />;

    if (
      type === NavigationSuiteType.ShortNavigationBarCompact ||
      type === NavigationSuiteType.ShortNavigationBarMedium
    ) {
      return (
        <ShortNavigationBarItem
          key={key}
          isSelected={item.selected}
          isDisabled={item.disabled}
          icon={icon}
          label={item.label}
          iconPosition={
            type === NavigationSuiteType.ShortNavigationBarCompact ? 'top' : 'start'
          }
          onPress={item.onPress}
          aria-label={item.ariaLabel}
        />
      );
    }

    if (
      type === NavigationSuiteType.WideNavigationRailCollapsed ||
      type === NavigationSuiteType.WideNavigationRailExpanded
    ) {
      return (
        <WideNavigationRailItem
          key={key}
          selected={item.selected}
          isDisabled={item.disabled}
          icon={icon}
          label={item.label}
          railExpanded={type === NavigationSuiteType.WideNavigationRailExpanded}
          onPress={item.onPress}
          aria-label={item.ariaLabel}
        />
      );
    }

    if (type === NavigationSuiteType.NavigationRail) {
      return (
        <NavigationRailItem
          key={key}
          selected={item.selected}
          isDisabled={item.disabled}
          icon={icon}
          label={item.label}
          onPress={item.onPress}
          aria-label={item.ariaLabel}
        />
      );
    }

    if (type === NavigationSuiteType.NavigationDrawer) {
      return (
        <NavigationDrawerItem
          key={key}
          selected={item.selected}
          isDisabled={item.disabled}
          icon={item.icon}
          badge={item.badge}
          onPress={item.onPress}
          aria-label={item.ariaLabel}
        >
          {item.label ?? item.ariaLabel ?? ''}
        </NavigationDrawerItem>
      );
    }

    return (
      <NavigationBarItem
        key={key}
        selected={item.selected}
        isDisabled={item.disabled}
        icon={icon}
        label={item.label}
        onPress={item.onPress}
        aria-label={item.ariaLabel}
      />
    );
  });
}

function NavigationSuite({
  type,
  items,
  primaryAction,
  verticalArrangement,
}: {
  type: NavigationSuiteType;
  items: readonly NavigationSuiteItem[];
  primaryAction?: ReactNode;
  verticalArrangement: NavigationSuiteVerticalArrangement;
}) {
  const wideRailState = useMemo(
    () =>
      new WideNavigationRailState({
        initialValue:
          type === NavigationSuiteType.WideNavigationRailExpanded
            ? WideNavigationRailValue.Expanded
            : WideNavigationRailValue.Collapsed,
      }),
    [type],
  );
  const itemNodes = <NavigationItems type={type} items={items} />;

  if (
    type === NavigationSuiteType.ShortNavigationBarCompact ||
    type === NavigationSuiteType.ShortNavigationBarMedium
  ) {
    return (
      <ShortNavigationBar
        arrangement={
          type === NavigationSuiteType.ShortNavigationBarCompact
            ? 'equal-weight'
            : 'centered'
        }
        safeArea
      >
        {itemNodes}
      </ShortNavigationBar>
    );
  }

  if (
    type === NavigationSuiteType.WideNavigationRailCollapsed ||
    type === NavigationSuiteType.WideNavigationRailExpanded
  ) {
    return (
      <WideNavigationRail
        state={wideRailState}
        header={primaryAction}
        arrangement={verticalArrangement}
      >
        {itemNodes}
      </WideNavigationRail>
    );
  }

  if (type === NavigationSuiteType.NavigationRail) {
    return <NavigationRail header={primaryAction}>{itemNodes}</NavigationRail>;
  }

  if (type === NavigationSuiteType.NavigationDrawer) {
    return (
      <PermanentDrawerSheet>
        {primaryAction !== undefined ? (
          <div className="navigation-suite-scaffold__drawer-primary-action">
            {primaryAction}
          </div>
        ) : null}
        <div className="navigation-suite-scaffold__drawer-items">{itemNodes}</div>
      </PermanentDrawerSheet>
    );
  }

  return <NavigationBar>{itemNodes}</NavigationBar>;
}

/** Material 3 adaptive navigation-suite orchestrator for screen-level composition. */
export function NavigationSuiteScaffold({
  items,
  navigationSuiteType,
  adaptiveInfo: adaptiveInfoProp,
  state,
  primaryAction,
  primaryActionAlignment = 'end',
  verticalArrangement = 'top',
  containerColor,
  contentColor,
  children,
  contentClassName,
  contentStyle,
  className,
  style,
  ...props
}: NavigationSuiteScaffoldProps) {
  const measuredAdaptiveInfo = useWindowAdaptiveInfo();
  const adaptiveInfo = adaptiveInfoProp ?? measuredAdaptiveInfo;
  const resolvedType =
    navigationSuiteType ?? calculateNavigationSuiteType(adaptiveInfo);
  const fallbackState = useNavigationSuiteScaffoldState();
  const scaffoldState = state ?? fallbackState;

  useSyncExternalStore(
    scaffoldState.subscribe,
    scaffoldState.getSnapshot,
    scaffoldState.getSnapshot,
  );

  const bottomNavigation = isBottomNavigation(resolvedType);
  const navigationHidden =
    scaffoldState.isHidden || resolvedType === NavigationSuiteType.None;
  const navigationPosition =
    resolvedType === NavigationSuiteType.None
      ? 'none'
      : bottomNavigation
        ? 'bottom'
        : 'start';

  return (
    <div
      {...props}
      className={clsx('navigation-suite-scaffold', className)}
      data-navigation-position={navigationPosition}
      data-navigation-suite-type={resolvedType}
      data-navigation-visible={!navigationHidden || undefined}
      style={{
        background: containerColor,
        color: contentColor,
        ...style,
      }}
    >
      <div
        className={clsx('navigation-suite-scaffold__content', contentClassName)}
        style={contentStyle}
      >
        {children}
      </div>
      {!navigationHidden ? (
        <div className="navigation-suite-scaffold__navigation">
          {bottomNavigation && primaryAction !== undefined ? (
            <div
              className="navigation-suite-scaffold__bottom-primary-action"
              data-alignment={primaryActionAlignment}
            >
              {primaryAction}
            </div>
          ) : null}
          <NavigationSuite
            type={resolvedType}
            items={items}
            primaryAction={bottomNavigation ? undefined : primaryAction}
            verticalArrangement={verticalArrangement}
          />
        </div>
      ) : null}
    </div>
  );
}
