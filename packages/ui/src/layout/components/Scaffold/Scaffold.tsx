import clsx from 'clsx';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import './scaffold.css';

export type ScaffoldFabPosition = 'start' | 'center' | 'end' | 'end-overlay';

export interface ScaffoldProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'color'> {
  topBar?: ReactNode;
  bottomBar?: ReactNode;
  snackbarHost?: ReactNode;
  floatingActionButton?: ReactNode;
  floatingActionButtonPosition?: ScaffoldFabPosition;
  children?: ReactNode;
  containerColor?: CSSProperties['backgroundColor'];
  contentColor?: CSSProperties['color'];
  contentClassName?: string;
  contentStyle?: CSSProperties;
}

/**
 * Material 3 screen-level composition primitive.
 *
 * AndroidX Scaffold uses subcomposition and WindowInsets. On the web this
 * implementation intentionally maps that contract to CSS grid, logical
 * properties and env(safe-area-inset-*), so resize and RTL do not require JS
 * measurement. Bars are expected to own their safe-area edge when present;
 * otherwise the content receives that edge inset.
 */
export function Scaffold({
  topBar,
  bottomBar,
  snackbarHost,
  floatingActionButton,
  floatingActionButtonPosition = 'end',
  children,
  containerColor,
  contentColor,
  contentClassName,
  contentStyle,
  className,
  style,
  ...props
}: ScaffoldProps) {
  const hasTopBar = topBar !== undefined && topBar !== null;
  const hasBottomBar = bottomBar !== undefined && bottomBar !== null;
  const hasFab = floatingActionButton !== undefined && floatingActionButton !== null;
  const hasSnackbar = snackbarHost !== undefined && snackbarHost !== null;

  return (
    <div
      {...props}
      className={clsx('scaffold', className)}
      data-has-top-bar={hasTopBar || undefined}
      data-has-bottom-bar={hasBottomBar || undefined}
      data-has-fab={hasFab || undefined}
      data-has-snackbar={hasSnackbar || undefined}
      data-fab-position={floatingActionButtonPosition}
      style={{
        '--scaffold-container-color': containerColor,
        '--scaffold-content-color': contentColor,
        ...style,
      } as CSSProperties}
    >
      {hasTopBar ? <div className="scaffold__top-bar">{topBar}</div> : null}
      <div
        className={clsx('scaffold__content', contentClassName)}
        style={contentStyle}
      >
        {children}
      </div>
      {hasBottomBar ? <div className="scaffold__bottom-bar">{bottomBar}</div> : null}

      {hasSnackbar || hasFab ? (
        <div className="scaffold__floating-layer">
          <div className="scaffold__floating-stack">
            {hasSnackbar ? (
              <div className="scaffold__snackbar">{snackbarHost}</div>
            ) : null}
            {hasFab ? (
              <div className="scaffold__fab">{floatingActionButton}</div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
