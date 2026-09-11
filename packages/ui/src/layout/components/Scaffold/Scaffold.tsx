import clsx from 'clsx';
import {
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { hasReactNodeContent } from '../../reactNode';
import {
  defaultScaffoldContainerColor,
  getScaffoldContentColor,
} from './Scaffold.defaults';
import './scaffold.css';

export type ScaffoldFabPosition = 'start' | 'center' | 'end' | 'end-overlay';
export type ScaffoldInsetValue = string | number;

export interface ScaffoldWindowInsets {
  top?: ScaffoldInsetValue;
  right?: ScaffoldInsetValue;
  bottom?: ScaffoldInsetValue;
  left?: ScaffoldInsetValue;
}

export interface ScaffoldInnerPadding {
  /** CSS value for the block-start padding calculated by Scaffold. */
  top: string;
  /** CSS value for the block-end padding calculated by Scaffold. */
  bottom: string;
  /** CSS value for the logical inline-start padding calculated by Scaffold. */
  start: string;
  /** CSS value for the logical inline-end padding calculated by Scaffold. */
  end: string;
  /** Convenience style for callers that want conventional padded content. */
  style: CSSProperties;
}

export const scaffoldDefaultContentWindowInsets: Required<ScaffoldWindowInsets> = {
  top: 'var(--scaffold-safe-top, env(safe-area-inset-top, 0px))',
  right: 'var(--scaffold-safe-right, env(safe-area-inset-right, 0px))',
  bottom: 'var(--scaffold-safe-bottom, env(safe-area-inset-bottom, 0px))',
  left: 'var(--scaffold-safe-left, env(safe-area-inset-left, 0px))',
};

const zeroInsets: Required<ScaffoldWindowInsets> = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

function toCssLength(value: ScaffoldInsetValue | undefined, fallback: ScaffoldInsetValue) {
  const resolved = value ?? fallback;
  return typeof resolved === 'number' ? `${resolved}px` : resolved;
}

export interface ScaffoldProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'color'> {
  topBar?: ReactNode;
  bottomBar?: ReactNode;
  snackbarHost?: ReactNode;
  floatingActionButton?: ReactNode;
  floatingActionButtonPosition?: ScaffoldFabPosition;
  children?: ReactNode | ((innerPadding: ScaffoldInnerPadding) => ReactNode);
  containerColor?: CSSProperties['backgroundColor'];
  contentColor?: CSSProperties['color'];
  contentClassName?: string;
  contentStyle?: CSSProperties;
  /**
   * Browser equivalent of Material3 Scaffold's contentWindowInsets.
   * Physical edges are used here because browser safe-area env() values are physical.
   */
  contentWindowInsets?: ScaffoldWindowInsets;
  /**
   * Insets already consumed by an ancestor. Scaffold subtracts these before deriving
   * content/floating offsets, preventing nested inset-aware layouts from double padding.
   */
  consumedWindowInsets?: ScaffoldWindowInsets;
}

/**
 * Material 3 screen-level composition primitive.
 *
 * Like AndroidX Material3 Scaffold, content occupies the full scaffold bounds and bars
 * are layered in the same coordinate space. Scaffold calculates inner padding and passes
 * it to a render-prop child; callers decide whether and where to consume that padding.
 * Browser safe-area values are configurable through contentWindowInsets, while
 * consumedWindowInsets provides an explicit web contract for ancestor-consumed insets.
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
  contentWindowInsets = scaffoldDefaultContentWindowInsets,
  consumedWindowInsets = zeroInsets,
  className,
  style,
  ...props
}: ScaffoldProps) {
  const hasTopBar = hasReactNodeContent(topBar);
  const hasBottomBar = hasReactNodeContent(bottomBar);
  const hasFab = hasReactNodeContent(floatingActionButton);
  const hasSnackbar = hasReactNodeContent(snackbarHost);
  const resolvedContentColor = getScaffoldContentColor(containerColor, contentColor);
  const scaffoldRef = useRef<HTMLDivElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scaffold = scaffoldRef.current;
    if (!scaffold) return;

    const observed = [
      ['--scaffold-top-bar-height', hasTopBar ? topBarRef.current : null],
      ['--scaffold-bottom-bar-height', hasBottomBar ? bottomBarRef.current : null],
    ] as const;

    const update = () => {
      for (const [property, element] of observed) {
        scaffold.style.setProperty(property, `${element?.getBoundingClientRect().height ?? 0}px`);
      }
    };

    update();
    const ResizeObserverCtor = scaffold.ownerDocument.defaultView?.ResizeObserver;
    if (!ResizeObserverCtor) return;

    const observer = new ResizeObserverCtor(update);
    for (const [, element] of observed) {
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [hasBottomBar, hasTopBar]);

  const innerPadding = useMemo<ScaffoldInnerPadding>(() => {
    const top = 'var(--scaffold-inner-padding-top)';
    const bottom = 'var(--scaffold-inner-padding-bottom)';
    const start = 'var(--scaffold-inner-padding-start)';
    const end = 'var(--scaffold-inner-padding-end)';
    return {
      top,
      bottom,
      start,
      end,
      style: {
        boxSizing: 'border-box',
        paddingBlockStart: top,
        paddingBlockEnd: bottom,
        paddingInlineStart: start,
        paddingInlineEnd: end,
      },
    };
  }, []);

  const resolvedChildren =
    typeof children === 'function' ? children(innerPadding) : children;

  return (
    <div
      {...props}
      ref={scaffoldRef}
      className={clsx('scaffold', className)}
      data-has-top-bar={hasTopBar || undefined}
      data-has-bottom-bar={hasBottomBar || undefined}
      data-has-fab={hasFab || undefined}
      data-has-snackbar={hasSnackbar || undefined}
      data-fab-position={floatingActionButtonPosition}
      style={{
        '--scaffold-container-color': containerColor ?? defaultScaffoldContainerColor,
        '--scaffold-content-color': resolvedContentColor,
        '--scaffold-inset-top': toCssLength(
          contentWindowInsets.top,
          scaffoldDefaultContentWindowInsets.top,
        ),
        '--scaffold-inset-right': toCssLength(
          contentWindowInsets.right,
          scaffoldDefaultContentWindowInsets.right,
        ),
        '--scaffold-inset-bottom': toCssLength(
          contentWindowInsets.bottom,
          scaffoldDefaultContentWindowInsets.bottom,
        ),
        '--scaffold-inset-left': toCssLength(
          contentWindowInsets.left,
          scaffoldDefaultContentWindowInsets.left,
        ),
        '--scaffold-consumed-top': toCssLength(consumedWindowInsets.top, 0),
        '--scaffold-consumed-right': toCssLength(consumedWindowInsets.right, 0),
        '--scaffold-consumed-bottom': toCssLength(consumedWindowInsets.bottom, 0),
        '--scaffold-consumed-left': toCssLength(consumedWindowInsets.left, 0),
        ...style,
      } as CSSProperties}
    >
      <div
        className={clsx('scaffold__content', contentClassName)}
        style={contentStyle}
      >
        {resolvedChildren}
      </div>
      {hasTopBar ? (
        <div ref={topBarRef} className="scaffold__top-bar">
          {topBar}
        </div>
      ) : null}
      {hasBottomBar ? (
        <div ref={bottomBarRef} className="scaffold__bottom-bar">
          {bottomBar}
        </div>
      ) : null}

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
