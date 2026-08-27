import {
  Children,
  isValidElement,
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type WheelEvent as ReactWheelEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { getScrollFieldStyle, scrollFieldRuntime, type ScrollFieldStyleOptions } from './ScrollField.defaults';
import { clampScrollFieldDrag, normalizeScrollFieldIndex, settleScrollFieldSteps } from './ScrollField.logic';
import './scroll-field.css';

export interface ScrollFieldRenderState {
  selected: boolean;
  isDisabled: boolean;
}

interface ScrollFieldCommonProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange' | 'color'>,
    ScrollFieldStyleOptions {
  selectedIndex?: number;
  defaultSelectedIndex?: number;
  onSelectionChange?: (index: number) => void;
  isDisabled?: boolean;
  getItemText?: (index: number) => string;
}

export type ScrollFieldProps = ScrollFieldCommonProps &
  (
    | {
        items: readonly ReactNode[];
        itemCount?: never;
        renderItem?: never;
      }
    | {
        items?: never;
        itemCount: number;
        renderItem: (index: number, state: ScrollFieldRenderState) => ReactNode;
      }
  );

function nodeText(node: ReactNode): string | undefined {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeText).filter(Boolean).join(' ');
  if (isValidElement<{ children?: ReactNode }>(node)) return nodeText(node.props.children);
  return undefined;
}

const SLOT_OFFSETS = [-2, -1, 0, 1, 2] as const;

type ActivePointer = {
  pointerId: number;
  startY: number;
  lastY: number;
  moved: boolean;
  targetIndex: number | null;
};

export function ScrollField({
  items,
  itemCount: explicitItemCount,
  renderItem,
  selectedIndex: controlledSelectedIndex,
  defaultSelectedIndex = 0,
  onSelectionChange,
  isDisabled = false,
  getItemText,
  containerColor,
  contentColor,
  selectedContentColor,
  disabledContainerColor,
  disabledContentColor,
  disabledSelectedContentColor,
  className,
  style,
  onKeyDown,
  onWheel,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onClickCapture,
  tabIndex,
  role,
  'aria-label': ariaLabel,
  'aria-valuetext': ariaValueText,
  ...props
}: ScrollFieldProps) {
  const itemCount = items?.length ?? Math.max(0, Math.floor(explicitItemCount ?? 0));
  if (itemCount <= 0) {
    throw new Error('ScrollField requires at least one item');
  }

  const [uncontrolledIndex, setUncontrolledIndex] = useState(() =>
    normalizeScrollFieldIndex(defaultSelectedIndex, itemCount),
  );
  const selectedIndex = normalizeScrollFieldIndex(
    controlledSelectedIndex ?? uncontrolledIndex,
    itemCount,
  );
  const optimisticIndexRef = useRef(selectedIndex);
  const rootRef = useRef<HTMLDivElement>(null);
  const rowExtentRef = useRef(scrollFieldRuntime.height / scrollFieldRuntime.visibleItemCount);
  const pointerRef = useRef<ActivePointer | null>(null);
  const wheelOffsetRef = useRef(0);
  const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressClickRef = useRef(false);
  const [dragOffset, setDragOffset] = useState(0);

  useLayoutEffect(() => {
    optimisticIndexRef.current = selectedIndex;
  });

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const measure = () => {
      const height = root.getBoundingClientRect().height || scrollFieldRuntime.height;
      rowExtentRef.current = height / scrollFieldRuntime.visibleItemCount;
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (controlledSelectedIndex === undefined && uncontrolledIndex >= itemCount) {
      setUncontrolledIndex(normalizeScrollFieldIndex(uncontrolledIndex, itemCount));
    }
  }, [controlledSelectedIndex, itemCount, uncontrolledIndex]);

  useEffect(
    () => () => {
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    },
    [],
  );

  const commitIndex = useCallback(
    (nextIndex: number) => {
      const next = normalizeScrollFieldIndex(nextIndex, itemCount);
      if (next === optimisticIndexRef.current) return;
      optimisticIndexRef.current = next;
      if (controlledSelectedIndex === undefined) setUncontrolledIndex(next);
      onSelectionChange?.(next);
    },
    [controlledSelectedIndex, itemCount, onSelectionChange],
  );

  const settleOffset = useCallback(
    (offset: number) => {
      const steps = settleScrollFieldSteps(offset, rowExtentRef.current);
      if (steps !== 0) commitIndex(optimisticIndexRef.current + steps);
      setDragOffset(0);
    },
    [commitIndex],
  );

  const render = useCallback(
    (index: number, selected: boolean) => {
      if (items) return items[index];
      return renderItem?.(index, { selected, isDisabled });
    },
    [isDisabled, items, renderItem],
  );

  const currentValueText = useMemo(() => {
    if (ariaValueText) return ariaValueText;
    if (getItemText) return getItemText(selectedIndex);
    if (items) return nodeText(items[selectedIndex]) ?? String(selectedIndex);
    return String(selectedIndex);
  }, [ariaValueText, getItemText, items, selectedIndex]);

  function handleWheel(event: ReactWheelEvent<HTMLDivElement>) {
    onWheel?.(event);
    if (event.defaultPrevented || isDisabled) return;
    event.preventDefault();
    wheelOffsetRef.current += event.deltaY;
    setDragOffset(
      clampScrollFieldDrag(-wheelOffsetRef.current, rowExtentRef.current),
    );
    if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    wheelTimerRef.current = setTimeout(() => {
      const offset = wheelOffsetRef.current;
      wheelOffsetRef.current = 0;
      settleOffset(offset);
    }, scrollFieldRuntime.wheelSettleDelay);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    onPointerDown?.(event);
    if (event.defaultPrevented || isDisabled || event.button !== 0 || !event.isPrimary) return;
    const target = event.target;
    const item =
      target instanceof Element
        ? (target.closest('[data-scroll-field-item]') as HTMLElement | null)
        : null;
    const parsedIndex = item ? Number(item.dataset.index) : Number.NaN;
    pointerRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      lastY: event.clientY,
      moved: false,
      targetIndex: Number.isInteger(parsedIndex) ? parsedIndex : null,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    onPointerMove?.(event);
    const pointer = pointerRef.current;
    if (event.defaultPrevented || !pointer || pointer.pointerId !== event.pointerId) return;
    pointer.lastY = event.clientY;
    const delta = event.clientY - pointer.startY;
    if (Math.abs(delta) >= scrollFieldRuntime.dragThreshold) pointer.moved = true;
    setDragOffset(clampScrollFieldDrag(delta, rowExtentRef.current));
  }

  function finishPointer(event: ReactPointerEvent<HTMLDivElement>, cancelled: boolean) {
    const pointer = pointerRef.current;
    if (!pointer || pointer.pointerId !== event.pointerId) return;
    pointerRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (cancelled) {
      setDragOffset(0);
      return;
    }

    if (!pointer.moved) {
      suppressClickRef.current = false;
      setDragOffset(0);
      if (pointer.targetIndex !== null) commitIndex(pointer.targetIndex);
      return;
    }

    const delta = pointer.lastY - pointer.startY;
    suppressClickRef.current = true;
    settleOffset(-delta);
  }

  const classes = ['scroll-field', className].filter(Boolean).join(' ');
  const componentStyle = {
    ...getScrollFieldStyle({
      containerColor,
      contentColor,
      selectedContentColor,
      disabledContainerColor,
      disabledContentColor,
      disabledSelectedContentColor,
    }),
    '--scroll-field-drag-offset': `${dragOffset}px`,
    ...style,
  } as CSSProperties;

  return (
    <div
      {...props}
      ref={rootRef}
      className={classes}
      style={componentStyle}
      role={role ?? 'spinbutton'}
      tabIndex={isDisabled ? -1 : (tabIndex ?? 0)}
      aria-label={ariaLabel}
      aria-disabled={isDisabled || undefined}
      aria-valuemin={0}
      aria-valuemax={itemCount - 1}
      aria-valuenow={selectedIndex}
      aria-valuetext={currentValueText}
      data-selected-index={selectedIndex}
      data-disabled={isDisabled || undefined}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || isDisabled) return;
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          commitIndex(optimisticIndexRef.current + 1);
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          commitIndex(optimisticIndexRef.current - 1);
        }
      }}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => {
        onPointerUp?.(event);
        if (!event.defaultPrevented) finishPointer(event, false);
      }}
      onPointerCancel={(event) => {
        onPointerCancel?.(event);
        finishPointer(event, true);
      }}
      onClickCapture={(event) => {
        onClickCapture?.(event);
        if (suppressClickRef.current) {
          suppressClickRef.current = false;
          event.preventDefault();
          event.stopPropagation();
        }
      }}
    >
      <div className="scroll-field__viewport" aria-hidden="true">
        {SLOT_OFFSETS.map((offset) => {
          const index = normalizeScrollFieldIndex(selectedIndex + offset, itemCount);
          const selected = offset === 0;
          return (
            <div
              key={`${offset}:${index}`}
              className="scroll-field__item"
              data-scroll-field-item=""
              data-index={index}
              data-offset={offset}
              data-selected={selected || undefined}
              data-disabled={isDisabled || undefined}
              style={{ '--scroll-field-slot': offset } as CSSProperties}
              onClick={() => {
                if (!isDisabled && offset !== 0) commitIndex(index);
              }}
            >
              {render(index, selected)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
