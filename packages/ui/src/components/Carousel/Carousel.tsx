import {
  Children,
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { carouselTokens } from './Carousel.defaults';
import {
  getCarouselGeometry,
  getCarouselItemGeometry,
  type CarouselGeometry,
  type CarouselVariant,
} from './Carousel.geometry';
import './carousel.css';

export interface CarouselItemDrawInfo {
  index: number;
  size: number;
  minSize: number;
  maxSize: number;
  isFocal: boolean;
}

export type CarouselItemRenderer = (info: CarouselItemDrawInfo) => ReactNode;

type CarouselController = {
  scrollToItem(index: number, behavior: ScrollBehavior): void;
};

export interface CarouselState {
  readonly currentItem: number;
  readonly itemCount: number;
  readonly isScrollInProgress: boolean;
  scrollToItem(item: number): void;
  animateScrollToItem(item: number): void;
}

interface CarouselStateInternal extends CarouselState {
  attach(controller: CarouselController | null): void;
  setCurrentItem(item: number): void;
  setScrolling(value: boolean): void;
}

export interface UseCarouselStateOptions {
  itemCount: number;
  currentItem?: number;
  defaultCurrentItem?: number;
  onCurrentItemChange?: (item: number) => void;
}

function prefersReducedMotion() {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function resolvedScrollBehavior(behavior: ScrollBehavior): ScrollBehavior {
  return behavior === 'smooth' && prefersReducedMotion() ? 'auto' : behavior;
}

export function useCarouselState({
  itemCount,
  currentItem: controlledCurrentItem,
  defaultCurrentItem = 0,
  onCurrentItemChange,
}: UseCarouselStateOptions): CarouselState {
  const [uncontrolledCurrentItem, setUncontrolledCurrentItem] = useState(defaultCurrentItem);
  const [isScrollInProgress, setScrollInProgress] = useState(false);
  const controllerRef = useRef<CarouselController | null>(null);
  const isControlled = controlledCurrentItem !== undefined;
  const currentItem = Math.min(Math.max(0, controlledCurrentItem ?? uncontrolledCurrentItem), Math.max(0, itemCount - 1));

  useEffect(() => {
    if (!isControlled && itemCount > 0 && uncontrolledCurrentItem >= itemCount) {
      const next = itemCount - 1;
      setUncontrolledCurrentItem(next);
      onCurrentItemChange?.(next);
    }
  }, [isControlled, itemCount, onCurrentItemChange, uncontrolledCurrentItem]);

  return useMemo<CarouselStateInternal>(() => ({
    currentItem,
    itemCount,
    isScrollInProgress,
    scrollToItem(item) {
      controllerRef.current?.scrollToItem(item, 'auto');
    },
    animateScrollToItem(item) {
      controllerRef.current?.scrollToItem(item, 'smooth');
    },
    attach(controller) {
      controllerRef.current = controller;
    },
    setCurrentItem(item) {
      const next = Math.min(Math.max(0, item), Math.max(0, itemCount - 1));
      if (!isControlled) setUncontrolledCurrentItem(next);
      if (next !== currentItem) onCurrentItemChange?.(next);
    },
    setScrolling(value) {
      setScrollInProgress(value);
    },
  }), [currentItem, isControlled, isScrollInProgress, itemCount, onCurrentItemChange]);
}

interface CarouselBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onScroll'> {
  state?: CarouselState;
  currentItem?: number;
  defaultCurrentItem?: number;
  onCurrentItemChange?: (item: number) => void;
  children: ReactNode | CarouselItemRenderer;
  itemCount?: number;
  itemSpacing?: number;
  contentPadding?: number | { start?: number; end?: number };
  userScrollEnabled?: boolean;
}

export interface HorizontalMultiBrowseCarouselProps extends CarouselBaseProps {
  preferredItemWidth: number;
  minSmallItemWidth?: number;
  maxSmallItemWidth?: number;
}

export interface HorizontalUncontainedCarouselProps extends CarouselBaseProps {
  itemWidth: number;
}

export interface HorizontalCenteredHeroCarouselProps extends CarouselBaseProps {
  maxItemWidth?: number;
  minSmallItemWidth?: number;
  maxSmallItemWidth?: number;
}

type InternalCarouselProps = CarouselBaseProps & {
  variant: CarouselVariant;
  preferredItemWidth?: number;
  itemWidth?: number;
  maxItemWidth?: number;
  minSmallItemWidth?: number;
  maxSmallItemWidth?: number;
};

function logicalScrollLeft(element: HTMLElement, rtl: boolean) {
  return rtl ? -element.scrollLeft : element.scrollLeft;
}

function setLogicalScrollLeft(element: HTMLElement, left: number, behavior: ScrollBehavior, rtl: boolean) {
  element.scrollTo({ left: rtl ? -left : left, behavior: resolvedScrollBehavior(behavior) });
}

function joinClassName(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(' ');
}

function Carousel({
  variant,
  state: providedState,
  currentItem,
  defaultCurrentItem,
  onCurrentItemChange,
  children,
  itemCount: explicitItemCount,
  itemSpacing = 0,
  contentPadding = 0,
  userScrollEnabled = true,
  preferredItemWidth,
  itemWidth,
  maxItemWidth,
  minSmallItemWidth,
  maxSmallItemWidth,
  className,
  style,
  dir,
  onKeyDown,
  ...props
}: InternalCarouselProps) {
  const childArray = typeof children === 'function' ? null : Children.toArray(children);
  const itemCount = explicitItemCount ?? childArray?.length ?? providedState?.itemCount ?? 0;
  const internalState = useCarouselState({ itemCount, currentItem, defaultCurrentItem, onCurrentItemChange });
  const state = (providedState ?? internalState) as CarouselStateInternal;
  const viewportRef = useRef<HTMLDivElement>(null);
  const [availableSpace, setAvailableSpace] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const scrollingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const snapOrigin = useRef<number | null>(null);
  const programmaticTarget = useRef<number | null>(null);
  const scrollDerivedItem = useRef<number | null>(null);
  const dragRef = useRef<{ pointerId: number; x: number; scroll: number } | null>(null);
  const padding = typeof contentPadding === 'number'
    ? { start: contentPadding, end: contentPadding }
    : { start: contentPadding.start ?? 0, end: contentPadding.end ?? 0 };
  const geometry = useMemo(() => getCarouselGeometry({
    variant,
    availableSpace: Math.max(0, availableSpace - padding.start - padding.end),
    itemCount,
    preferredItemWidth,
    itemWidth,
    maxItemWidth,
    itemSpacing,
    minSmallItemWidth,
    maxSmallItemWidth,
  }), [availableSpace, itemCount, itemSpacing, itemWidth, maxItemWidth, maxSmallItemWidth, minSmallItemWidth, padding.end, padding.start, preferredItemWidth, variant]);
  const rtl = dir === 'rtl';
  const stride = geometry.itemMainAxisSize + itemSpacing;
  const maxScrollOffset = Math.max(
    0,
    padding.start + padding.end +
      itemCount * geometry.itemMainAxisSize +
      Math.max(0, itemCount - 1) * itemSpacing -
      availableSpace,
  );
  const focalOffset = geometry.keylines.find((keyline) => keyline.isFocal)?.offset ?? geometry.itemMainAxisSize / 2;
  const snapBase = geometry.itemMainAxisSize / 2 - focalOffset;

  useLayoutEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const update = () => setAvailableSpace(element.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const targetOffsetForItem = useCallback((index: number) => {
    const element = viewportRef.current;
    if (!element || !stride) return 0;
    const target = Math.min(Math.max(0, index), Math.max(0, itemCount - 1));
    const maxScroll = Math.max(0, element.scrollWidth - element.clientWidth);
    return Math.min(maxScroll, Math.max(0, target * stride + snapBase));
  }, [itemCount, snapBase, stride]);

  const scrollToItem = useCallback((index: number, behavior: ScrollBehavior) => {
    const element = viewportRef.current;
    if (!element || !stride) return;
    const target = Math.min(Math.max(0, index), Math.max(0, itemCount - 1));
    programmaticTarget.current = target;
    scrollDerivedItem.current = null;
    setLogicalScrollLeft(element, targetOffsetForItem(target), behavior, rtl);
  }, [itemCount, rtl, stride, targetOffsetForItem]);

  useEffect(() => {
    state.attach({ scrollToItem });
    return () => state.attach(null);
  }, [scrollToItem, state]);

  useEffect(() => {
    if (
      !stride ||
      !viewportRef.current ||
      state.isScrollInProgress ||
      programmaticTarget.current !== null
    ) return;
    if (scrollDerivedItem.current !== null) {
      const cameFromNativeScroll = scrollDerivedItem.current === state.currentItem;
      scrollDerivedItem.current = null;
      if (cameFromNativeScroll) return;
    }
    const target = Math.min(Math.max(0, state.currentItem), Math.max(0, itemCount - 1));
    const desired = targetOffsetForItem(target);
    const actual = logicalScrollLeft(viewportRef.current, rtl);
    if (Math.abs(actual - desired) > 1) {
      programmaticTarget.current = target;
      setLogicalScrollLeft(viewportRef.current, desired, 'auto', rtl);
    }
  }, [itemCount, rtl, state.currentItem, state.isScrollInProgress, stride, targetOffsetForItem]);

  const updateFromScroll = useCallback(() => {
    const element = viewportRef.current;
    if (!element || !stride) return;
    const logical = Math.max(0, logicalScrollLeft(element, rtl));
    setScrollOffset(logical);
    if (programmaticTarget.current === null && snapOrigin.current === null) snapOrigin.current = state.currentItem;
    state.setScrolling(true);
    const nearest = Math.min(Math.max(0, Math.round((logical - snapBase) / stride)), Math.max(0, itemCount - 1));
    if (programmaticTarget.current === null) scrollDerivedItem.current = nearest;
    state.setCurrentItem(nearest);
    if (scrollingTimer.current) clearTimeout(scrollingTimer.current);
    scrollingTimer.current = setTimeout(() => {
      state.setScrolling(false);
      if (programmaticTarget.current !== null) {
        state.setCurrentItem(programmaticTarget.current);
        programmaticTarget.current = null;
      } else if (variant !== 'uncontained') {
        const origin = snapOrigin.current ?? nearest;
        const singleAdvanceTarget = Math.min(origin + 1, Math.max(origin - 1, nearest));
        const targetOffset = targetOffsetForItem(singleAdvanceTarget);
        programmaticTarget.current = singleAdvanceTarget;
        scrollDerivedItem.current = null;
        setLogicalScrollLeft(element, targetOffset, 'smooth', rtl);
        state.setCurrentItem(singleAdvanceTarget);
      }
      snapOrigin.current = null;
    }, 90);
  }, [itemCount, rtl, snapBase, state, stride, targetOffsetForItem, variant]);

  useEffect(() => () => {
    if (scrollingTimer.current) clearTimeout(scrollingTimer.current);
  }, []);

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!userScrollEnabled || event.button !== 0) return;
    const element = viewportRef.current;
    if (!element) return;
    programmaticTarget.current = null;
    scrollDerivedItem.current = null;
    snapOrigin.current = state.currentItem;
    dragRef.current = { pointerId: event.pointerId, x: event.clientX, scroll: logicalScrollLeft(element, rtl) };
    element.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const element = viewportRef.current;
    if (!drag || !element || drag.pointerId !== event.pointerId) return;
    const delta = event.clientX - drag.x;
    setLogicalScrollLeft(element, drag.scroll - delta, 'auto', rtl);
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const element = viewportRef.current;
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
      if (element?.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
    }
  }

  const keylineSizes = geometry.keylines.map((keyline) => keyline.size);
  const minSize = keylineSizes.length ? Math.min(...keylineSizes) : 0;
  const maxSize = geometry.itemMainAxisSize;
  const items = Array.from({ length: itemCount }, (_, index) => {
    const itemGeometry = getCarouselItemGeometry(
      geometry,
      index,
      scrollOffset,
      itemSpacing,
      { maxScrollOffset },
    );
    const info: CarouselItemDrawInfo = {
      index,
      size: itemGeometry.size,
      minSize,
      maxSize,
      isFocal: itemGeometry.isFocal && Math.abs(itemGeometry.size - maxSize) < 0.5,
    };
    const inset = Math.max(0, (maxSize - itemGeometry.size) / 2);
    const content = typeof children === 'function' ? (children as CarouselItemRenderer)(info) : childArray?.[index];
    return (
      <div
        className="carousel__item"
        data-carousel-item=""
        data-focal={info.isFocal || undefined}
        data-index={index}
        data-mask-size={itemGeometry.size.toFixed(3)}
        key={index}
        style={{
          inlineSize: maxSize,
          flexBasis: maxSize,
          zIndex: 1 / (1 + Math.abs(index - state.currentItem)),
          '--_carousel-mask-inset': `${inset}px`,
          '--_carousel-translation': `${rtl ? -itemGeometry.translation : itemGeometry.translation}px`,
        } as CSSProperties}
      >
        {content}
      </div>
    );
  });

  return (
    <div
      {...props}
      aria-roledescription="carousel"
      className={joinClassName('carousel', className)}
      data-current-item={state.currentItem}
      data-user-scroll-enabled={userScrollEnabled || undefined}
      data-variant={variant}
      dir={dir}
      role="region"
      style={{
        '--_carousel-item-spacing': `${itemSpacing}px`,
        '--_carousel-padding-start': `${padding.start}px`,
        '--_carousel-padding-end': `${padding.end}px`,
        '--_carousel-container-color': carouselTokens.containerColor,
        ...style,
      } as CSSProperties}
    >
      <div
        aria-disabled={!userScrollEnabled || undefined}
        className="carousel__viewport"
        data-carousel-viewport=""
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || !userScrollEnabled) return;
          const previousKey = rtl ? 'ArrowRight' : 'ArrowLeft';
          const nextKey = rtl ? 'ArrowLeft' : 'ArrowRight';
          if (event.key === nextKey) { event.preventDefault(); scrollToItem(state.currentItem + 1, 'smooth'); }
          else if (event.key === previousKey) { event.preventDefault(); scrollToItem(state.currentItem - 1, 'smooth'); }
          else if (event.key === 'Home') { event.preventDefault(); scrollToItem(0, 'smooth'); }
          else if (event.key === 'End') { event.preventDefault(); scrollToItem(itemCount - 1, 'smooth'); }
        }}
        onPointerCancel={onPointerUp}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onScroll={updateFromScroll}
        ref={viewportRef}
        style={{ overflowX: userScrollEnabled ? 'auto' : 'hidden' }}
        tabIndex={0}
      >
        <div className="carousel__track">{items}</div>
      </div>
    </div>
  );
}

export function HorizontalMultiBrowseCarousel(props: HorizontalMultiBrowseCarouselProps) {
  return <Carousel {...props} variant="multi-browse" />;
}

export function HorizontalUncontainedCarousel(props: HorizontalUncontainedCarouselProps) {
  return <Carousel {...props} variant="uncontained" />;
}

export function HorizontalCenteredHeroCarousel(props: HorizontalCenteredHeroCarouselProps) {
  return <Carousel {...props} variant="centered-hero" />;
}

export type { CarouselGeometry, CarouselVariant } from './Carousel.geometry';
export { getCarouselGeometry, getCarouselItemGeometry } from './Carousel.geometry';
