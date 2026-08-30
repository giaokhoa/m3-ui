import type {
  CSSProperties,
  HTMLAttributes,
  ReactNode,
} from 'react';
import { Elevation } from '../../internal/elevation';
import {
  getFloatingToolbarStyle,
  getFloatingToolbarTranslation,
  resolveFloatingToolbarElevation,
  type FloatingToolbarExitDirection,
  type FloatingToolbarFabPosition,
  type FloatingToolbarOrientation,
  type FloatingToolbarState,
  type FloatingToolbarStyleOptions,
  type FloatingToolbarVariant,
} from './FloatingToolbar.defaults';
import './floating-toolbar.css';

export interface FloatingToolbarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'>,
    FloatingToolbarStyleOptions {
  expanded: boolean;
  children: ReactNode;
  leadingContent?: ReactNode;
  trailingContent?: ReactNode;
  floatingActionButton?: ReactNode;
  variant?: FloatingToolbarVariant;
  state?: FloatingToolbarState;
  exitDirection?: FloatingToolbarExitDirection;
  floatingActionButtonPosition?: FloatingToolbarFabPosition;
  orientation?: FloatingToolbarOrientation;
}

function joinClassName(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(' ');
}

export function FloatingToolbar({
  expanded,
  children,
  leadingContent,
  trailingContent,
  floatingActionButton,
  variant = 'standard',
  state,
  exitDirection = 'bottom',
  floatingActionButtonPosition,
  orientation = 'horizontal',
  containerColor,
  contentColor,
  shape,
  contentPadding,
  expandedElevation,
  collapsedElevation,
  className,
  style,
  dir,
  ...props
}: FloatingToolbarProps) {
  const withFab = floatingActionButton !== undefined && floatingActionButton !== null;
  const defaultFabPosition = orientation === 'horizontal' ? 'end' : 'bottom';
  const fabPosition = floatingActionButtonPosition ?? defaultFabPosition;
  const resolvedDir = dir === 'rtl' ? 'rtl' : 'ltr';
  const tokenStyle = getFloatingToolbarStyle(variant, expanded, withFab, {
    containerColor,
    contentColor,
    shape,
    contentPadding,
    expandedElevation,
    collapsedElevation,
  });
  const elevationLevel = resolveFloatingToolbarElevation(expanded, withFab, {
    expandedElevation,
    collapsedElevation,
  });
  const transform = getFloatingToolbarTranslation(state, exitDirection, resolvedDir);
  const toolbar = (
    <div className="floating-toolbar__surface-shell">
      <Elevation
        className="floating-toolbar__elevation"
        level={elevationLevel}
      />
      <div
        aria-hidden={withFab && !expanded ? true : undefined}
        className="floating-toolbar__surface"
        data-expanded={expanded || undefined}
      >
        <div
          aria-hidden={!expanded || undefined}
          className="floating-toolbar__conditional floating-toolbar__leading"
        >
          {leadingContent}
        </div>
        <div className="floating-toolbar__content">{children}</div>
        <div
          aria-hidden={!expanded || undefined}
          className="floating-toolbar__conditional floating-toolbar__trailing"
        >
          {trailingContent}
        </div>
      </div>
    </div>
  );

  const fab = withFab ? (
    <div className="floating-toolbar__fab">{floatingActionButton}</div>
  ) : null;

  return (
    <div
      {...props}
      aria-orientation={orientation}
      className={joinClassName('floating-toolbar', className)}
      data-expanded={expanded || undefined}
      data-exit-direction={exitDirection}
      data-fab-position={withFab ? fabPosition : undefined}
      data-offset={state?.offset}
      data-orientation={orientation}
      data-variant={variant}
      data-with-fab={withFab || undefined}
      dir={dir}
      role="toolbar"
      style={{
        ...tokenStyle,
        transform,
        ...style,
      } as CSSProperties}
    >
      {withFab && (fabPosition === 'start' || fabPosition === 'top') ? fab : null}
      {toolbar}
      {withFab && (fabPosition === 'end' || fabPosition === 'bottom') ? fab : null}
    </div>
  );
}

export type HorizontalFloatingToolbarProps = Omit<
  FloatingToolbarProps,
  'orientation' | 'floatingActionButtonPosition'
> & {
  floatingActionButtonPosition?: 'start' | 'end';
};

export function HorizontalFloatingToolbar(props: HorizontalFloatingToolbarProps) {
  return <FloatingToolbar {...props} orientation="horizontal" />;
}

export type VerticalFloatingToolbarProps = Omit<
  FloatingToolbarProps,
  'orientation' | 'floatingActionButtonPosition'
> & {
  floatingActionButtonPosition?: 'top' | 'bottom';
};

export function VerticalFloatingToolbar(props: VerticalFloatingToolbarProps) {
  return <FloatingToolbar {...props} orientation="vertical" />;
}
