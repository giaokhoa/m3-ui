import clsx from 'clsx';
import { Children, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import {
  defaultScaffoldContainerColor,
  getScaffoldContentColor,
} from './Scaffold.defaults';
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

function hasScaffoldSlotContent(content: ReactNode): boolean {
  // AndroidX decides slot presence from the placeables emitted by subcompose.
  // React conditionals commonly produce false/true/null, which render no node;
  // Children.toArray drops those empty nodes while preserving visible values
  // such as 0, so they must not suppress insets or reserve floating spacing.
  return Children.toArray(content).length > 0;
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
  const hasTopBar = hasScaffoldSlotContent(topBar);
  const hasBottomBar = hasScaffoldSlotContent(bottomBar);
  const hasFab = hasScaffoldSlotContent(floatingActionButton);
  const hasSnackbar = hasScaffoldSlotContent(snackbarHost);
  const resolvedContentColor = getScaffoldContentColor(containerColor, contentColor);

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
        '--scaffold-container-color': containerColor ?? defaultScaffoldContainerColor,
        '--scaffold-content-color': resolvedContentColor,
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
