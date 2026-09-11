import clsx from 'clsx';
import {
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import {
  BottomSheet,
  SheetState,
  SheetValue,
  calculateSheetAnchors,
  useSheetState,
} from '../BottomSheet';
import { Scaffold } from '../../layout/components/Scaffold';
import './bottom-sheet-scaffold.css';

export const bottomSheetScaffoldDefaults = {
  peekHeight: 56,
  maxSheetWidth: 640,
} as const;

type BottomSheetScaffoldStyle = CSSProperties &
  Record<`--${string}`, string | number | undefined>;

export interface BottomSheetScaffoldProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'color'> {
  /** Persistent sheet content rendered alongside the main body. */
  sheetContent: ReactNode;
  /** Main screen content. */
  children?: ReactNode;
  /** Optional app bar passed through to Scaffold. */
  topBar?: ReactNode;
  /** Optional snackbar host; it tracks the current settled sheet edge. */
  snackbarHost?: ReactNode;
  /** Reuses the standard BottomSheet SheetState controller. */
  state?: SheetState;
  /** Visible sheet height while partially expanded, in CSS pixels. */
  peekHeight?: number;
  /** Maximum inline size of the sheet. */
  maxSheetWidth?: CSSProperties['maxWidth'];
  /** Disables pointer swiping without disabling handle/programmatic state changes. */
  isSwipeEnabled?: boolean;
  /** Replace the standard drag handle; pass null to remove it. */
  dragHandle?: ReactNode | null;
  /** Scaffold container color. */
  containerColor?: CSSProperties['backgroundColor'];
  /** Scaffold content color. */
  contentColor?: CSSProperties['color'];
  /** Bottom sheet container color. */
  sheetContainerColor?: CSSProperties['backgroundColor'];
  /** Bottom sheet content color. */
  sheetContentColor?: CSSProperties['color'];
  /** Styles applied to the BottomSheet itself. */
  sheetStyle?: CSSProperties;
  /** Class name applied to the BottomSheet itself. */
  sheetClassName?: string;
}

interface Geometry {
  rootHeight: number;
  sheetHeight: number;
}

function closeEnough(a: number, b: number) {
  return Math.abs(a - b) < 0.5;
}

export function getBottomSheetScaffoldMetrics({
  rootHeight,
  sheetHeight,
  peekHeight,
  state,
}: Geometry & { peekHeight: number; state: SheetState }) {
  const clampedPeek = Math.min(Math.max(0, peekHeight), rootHeight);
  const anchors = calculateSheetAnchors({
    viewportHeight: rootHeight,
    sheetHeight,
    enabledValues: state.enabledValues,
    partialExpandedHeight: clampedPeek,
  });
  const anchor =
    anchors[state.currentValue] ??
    anchors[SheetValue.Expanded] ??
    rootHeight;
  const visibleHeight =
    state.currentValue === SheetValue.Hidden
      ? 0
      : Math.max(0, Math.min(rootHeight, rootHeight - anchor));

  return {
    visibleHeight,
    reserveHeight: clampedPeek,
  };
}

/**
 * Material 3 standard/persistent bottom-sheet scaffold.
 *
 * BottomSheet and SheetState remain the owners of drag settling, anchors and
 * accessibility semantics. This composition supplies AndroidX's explicit
 * peek-height anchor and positions Scaffold content/snackbars around the
 * persistent sheet. It intentionally does not create modal focus containment
 * or a second state model.
 */
export function BottomSheetScaffold({
  sheetContent,
  children,
  topBar,
  snackbarHost,
  state,
  peekHeight = bottomSheetScaffoldDefaults.peekHeight,
  maxSheetWidth = bottomSheetScaffoldDefaults.maxSheetWidth,
  isSwipeEnabled = true,
  dragHandle,
  containerColor,
  contentColor,
  sheetContainerColor,
  sheetContentColor,
  sheetStyle,
  sheetClassName,
  className,
  style,
  ...props
}: BottomSheetScaffoldProps) {
  if (!(Number.isFinite(peekHeight) && peekHeight >= 0)) {
    throw new RangeError('peekHeight must be a finite non-negative number.');
  }

  const internalState = useSheetState({
    enabledValues: [SheetValue.PartiallyExpanded, SheetValue.Expanded],
    initialValue: SheetValue.PartiallyExpanded,
  });
  const sheetState = state ?? internalState;
  useSyncExternalStore(
    sheetState.subscribe,
    sheetState.getSnapshot,
    sheetState.getSnapshot,
  );

  const rootRef = useRef<HTMLDivElement>(null);
  const sheetLayerRef = useRef<HTMLDivElement>(null);
  const [geometry, setGeometry] = useState<Geometry>({
    rootHeight: 0,
    sheetHeight: 0,
  });

  useLayoutEffect(() => {
    const root = rootRef.current;
    const sheet = sheetLayerRef.current?.querySelector<HTMLElement>('.bottom-sheet');
    if (!root || !sheet || typeof window === 'undefined') return;

    const measure = () => {
      const next = {
        rootHeight: root.clientHeight,
        sheetHeight: sheet.offsetHeight,
      };
      setGeometry((current) =>
        closeEnough(current.rootHeight, next.rootHeight) &&
        closeEnough(current.sheetHeight, next.sheetHeight)
          ? current
          : next,
      );
    };

    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }

    const observer = new ResizeObserver(measure);
    observer.observe(root);
    observer.observe(sheet);
    return () => observer.disconnect();
  }, []);

  const metrics = getBottomSheetScaffoldMetrics({
    ...geometry,
    peekHeight,
    state: sheetState,
  });

  const rootStyle: BottomSheetScaffoldStyle = {
    '--_bottom-sheet-scaffold-peek-height': `${metrics.reserveHeight}px`,
    '--_bottom-sheet-scaffold-visible-height': `${metrics.visibleHeight}px`,
    ...style,
  };

  return (
    <div
      {...props}
      ref={rootRef}
      className={clsx('bottom-sheet-scaffold', className)}
      data-sheet-state={sheetState.currentValue}
      style={rootStyle}
    >
      <Scaffold
        className="bottom-sheet-scaffold__scaffold"
        topBar={topBar}
        snackbarHost={
          snackbarHost == null ? undefined : (
            <div className="bottom-sheet-scaffold__snackbar-host">
              {snackbarHost}
            </div>
          )
        }
        containerColor={containerColor}
        contentColor={contentColor}
        contentClassName="bottom-sheet-scaffold__body"
      >
        {children}
      </Scaffold>

      <div ref={sheetLayerRef} className="bottom-sheet-scaffold__sheet-layer">
        <BottomSheet
          state={sheetState}
          gesturesEnabled={isSwipeEnabled}
          handleActionEnabled
          partialExpandedHeight={peekHeight}
          dragHandle={dragHandle}
          maxWidth={maxSheetWidth}
          containerColor={sheetContainerColor}
          contentColor={sheetContentColor}
          className={sheetClassName}
          style={{ minBlockSize: `${peekHeight}px`, ...sheetStyle }}
        >
          {sheetContent}
        </BottomSheet>
      </div>
    </div>
  );
}
