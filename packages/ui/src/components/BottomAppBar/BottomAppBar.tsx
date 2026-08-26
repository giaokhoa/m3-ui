import type {
  CSSProperties,
  HTMLAttributes,
  ReactNode,
} from 'react';
import {
  clampBottomAppBarFraction,
  getBottomAppBarStyle,
  shouldCollapseBottomAppBar,
  type BottomAppBarStyleOptions,
} from './BottomAppBar.defaults';
import './bottom-app-bar.css';

export interface BottomAppBarState {
  collapsedFraction: number;
  heightOffset?: number;
  contentOffset?: number;
}

export interface BottomAppBarScrollBehavior {
  type: 'exit-always';
  state: BottomAppBarState;
}

export function createBottomAppBarState(
  collapsedFraction = 0,
  contentOffset = 0,
): BottomAppBarState {
  return {
    collapsedFraction: clampBottomAppBarFraction(collapsedFraction),
    contentOffset,
  };
}

export function exitAlwaysBottomAppBarScrollBehavior(
  state: BottomAppBarState,
): BottomAppBarScrollBehavior {
  return { type: 'exit-always', state };
}

export function settleBottomAppBarState(
  state: BottomAppBarState,
): BottomAppBarState {
  return {
    ...state,
    collapsedFraction: shouldCollapseBottomAppBar(state.collapsedFraction)
      ? 1
      : 0,
  };
}

export const BottomAppBarDefaults = {
  createState: createBottomAppBarState,
  exitAlwaysScrollBehavior: exitAlwaysBottomAppBarScrollBehavior,
  settleState: settleBottomAppBarState,
} as const;

type HostProps = Omit<HTMLAttributes<HTMLDivElement>, 'color'>;

export interface BottomAppBarProps
  extends HostProps,
    BottomAppBarStyleOptions {
  actions?: ReactNode;
  floatingActionButton?: ReactNode;
  state?: BottomAppBarState;
  scrollBehavior?: BottomAppBarScrollBehavior;
  collapsedFraction?: number;
  children?: ReactNode;
}

export type FlexibleBottomAppBarArrangement =
  | 'space-between'
  | 'fixed'
  | 'start'
  | 'center'
  | 'end';

export interface FlexibleBottomAppBarProps
  extends HostProps,
    BottomAppBarStyleOptions {
  state?: BottomAppBarState;
  scrollBehavior?: BottomAppBarScrollBehavior;
  collapsedFraction?: number;
  expandedHeight?: number;
  horizontalArrangement?: FlexibleBottomAppBarArrangement;
  children: ReactNode;
}

function effectiveFraction(
  collapsedFraction: number | undefined,
  state: BottomAppBarState | undefined,
  scrollBehavior: BottomAppBarScrollBehavior | undefined,
) {
  return clampBottomAppBarFraction(
    collapsedFraction ?? scrollBehavior?.state.collapsedFraction ?? state?.collapsedFraction ?? 0,
  );
}

export function BottomAppBar({
  actions,
  floatingActionButton,
  state,
  scrollBehavior,
  collapsedFraction,
  containerColor,
  contentColor,
  tonalElevation,
  className,
  style,
  children,
  ...props
}: BottomAppBarProps) {
  const fraction = effectiveFraction(collapsedFraction, state, scrollBehavior);
  const appBarStyle = {
    ...getBottomAppBarStyle('regular', fraction, {
      containerColor,
      contentColor,
      tonalElevation,
    }),
    ...style,
  } as CSSProperties;
  const content = actions ?? children;

  return (
    <div
      {...props}
      className={className ? `bottom-app-bar ${className}` : 'bottom-app-bar'}
      data-variant="regular"
      data-collapsed-fraction={fraction}
      data-collapsed={fraction >= 1 ? true : undefined}
      data-scroll-behavior={scrollBehavior?.type}
      style={appBarStyle}
    >
      <div className="bottom-app-bar__content">
        <div className="bottom-app-bar__actions">{content}</div>
        {floatingActionButton !== undefined ? (
          <div className="bottom-app-bar__fab">{floatingActionButton}</div>
        ) : null}
      </div>
    </div>
  );
}

export function FlexibleBottomAppBar({
  state,
  scrollBehavior,
  collapsedFraction,
  expandedHeight,
  horizontalArrangement = 'space-between',
  containerColor,
  contentColor,
  tonalElevation,
  className,
  style,
  children,
  ...props
}: FlexibleBottomAppBarProps) {
  const fraction = effectiveFraction(collapsedFraction, state, scrollBehavior);
  const appBarStyle = {
    ...getBottomAppBarStyle(
      'flexible',
      fraction,
      { containerColor, contentColor, tonalElevation },
      expandedHeight,
    ),
    ...style,
  } as CSSProperties;

  return (
    <div
      {...props}
      className={className ? `bottom-app-bar ${className}` : 'bottom-app-bar'}
      data-variant="flexible"
      data-arrangement={horizontalArrangement}
      data-collapsed-fraction={fraction}
      data-collapsed={fraction >= 1 ? true : undefined}
      data-scroll-behavior={scrollBehavior?.type}
      style={appBarStyle}
    >
      <div className="bottom-app-bar__content bottom-app-bar__flexible-content">
        {children}
      </div>
    </div>
  );
}
