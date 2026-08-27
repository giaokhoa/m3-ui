import {
  type CSSProperties,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  getNonInteractiveScrollbarStyle,
  nonInteractiveScrollbarDefaults,
} from './NonInteractiveScrollbar.defaults';
import {
  getNonInteractiveScrollbarGeometry,
  type NonInteractiveScrollbarGeometry,
} from './NonInteractiveScrollbar.geometry';
import type {
  NonInteractiveScrollbarMetrics,
  NonInteractiveScrollbarProps,
} from './NonInteractiveScrollbar.types';
import './non-interactive-scrollbar.css';

const hiddenGeometry: NonInteractiveScrollbarGeometry = {
  isVisible: false,
  trackLength: 0,
  thumbLength: 0,
  thumbOffset: 0,
};

function horizontalScrollOffset(element: HTMLElement): number {
  const direction = getComputedStyle(element).direction;
  if (direction !== 'rtl') return element.scrollLeft;

  // Current Chromium/Firefox/WebKit expose RTL scrolling with 0 at logical
  // inline-start and negative values as the viewport advances. Older
  // positive-reverse implementations expose a positive value instead.
  if (element.scrollLeft <= 0) return -element.scrollLeft;
  const maxScroll = Math.max(0, element.scrollWidth - element.clientWidth);
  return Math.max(0, maxScroll - element.scrollLeft);
}

function nativeMetrics(
  element: HTMLElement,
  orientation: 'vertical' | 'horizontal',
): NonInteractiveScrollbarMetrics {
  return orientation === 'vertical'
    ? {
        viewportSize: element.clientHeight,
        contentSize: element.scrollHeight,
        scrollOffset: element.scrollTop,
      }
    : {
        viewportSize: element.clientWidth,
        contentSize: element.scrollWidth,
        scrollOffset: horizontalScrollOffset(element),
      };
}

function joinClassName(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(' ');
}

export function NonInteractiveScrollbar({
  orientation = 'vertical',
  scrollRef,
  metricsAdapter,
  isFadeEnabled = true,
  fadeDuration = nonInteractiveScrollbarDefaults.fadeDuration,
  fadeDelay = nonInteractiveScrollbarDefaults.fadeDelay,
  thickness = nonInteractiveScrollbarDefaults.thickness,
  thumbMinLength = nonInteractiveScrollbarDefaults.thumbMinLength,
  thumbMaxLengthFraction = nonInteractiveScrollbarDefaults.thumbMaxLengthFraction,
  mainAxisTrackInset = nonInteractiveScrollbarDefaults.mainAxisTrackInset,
  crossAxisTrackInset = nonInteractiveScrollbarDefaults.crossAxisTrackInset,
  trackStyle,
  thumbStyle,
  className,
  style,
  ...props
}: NonInteractiveScrollbarProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [geometry, setGeometry] = useState<NonInteractiveScrollbarGeometry>(hiddenGeometry);
  const [isScrollActive, setScrollActive] = useState(false);

  const recompute = useCallback(() => {
    const root = rootRef.current;
    const scrollElement = scrollRef?.current ?? null;
    const metrics = metricsAdapter?.getMetrics() ??
      (scrollElement ? nativeMetrics(scrollElement, orientation) : null);
    if (!root || !metrics) {
      setGeometry(hiddenGeometry);
      return;
    }

    const visualViewportLength = orientation === 'vertical'
      ? (scrollElement?.clientHeight ?? root.clientHeight)
      : (scrollElement?.clientWidth ?? root.clientWidth);
    const trackLength = Math.max(0, visualViewportLength - mainAxisTrackInset * 2);
    setGeometry(getNonInteractiveScrollbarGeometry(
      metrics,
      trackLength,
      thumbMinLength,
      thumbMaxLengthFraction,
    ));
  }, [
    mainAxisTrackInset,
    metricsAdapter,
    orientation,
    scrollRef,
    thumbMaxLengthFraction,
    thumbMinLength,
  ]);

  const markScrollActive = useCallback(() => {
    recompute();
    if (!isFadeEnabled) return;
    setScrollActive(true);
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    fadeTimerRef.current = setTimeout(() => {
      fadeTimerRef.current = null;
      setScrollActive(false);
    }, Math.max(0, fadeDelay));
  }, [fadeDelay, isFadeEnabled, recompute]);

  useLayoutEffect(() => {
    recompute();
    const root = rootRef.current;
    if (!root) return;

    const scrollElement = scrollRef?.current ?? null;
    const resizeObserver = new ResizeObserver(recompute);
    resizeObserver.observe(root);

    if (!scrollElement) return () => resizeObserver.disconnect();

    resizeObserver.observe(scrollElement);
    for (const child of Array.from(scrollElement.children)) resizeObserver.observe(child);

    const mutationObserver = new MutationObserver(() => {
      resizeObserver.disconnect();
      resizeObserver.observe(root);
      resizeObserver.observe(scrollElement);
      for (const child of Array.from(scrollElement.children)) resizeObserver.observe(child);
      recompute();
    });
    mutationObserver.observe(scrollElement, {
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    });

    scrollElement.addEventListener('scroll', markScrollActive, { passive: true });
    return () => {
      scrollElement.removeEventListener('scroll', markScrollActive);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [markScrollActive, recompute, scrollRef]);

  useEffect(() => {
    if (!metricsAdapter?.subscribe) return;
    return metricsAdapter.subscribe(markScrollActive);
  }, [markScrollActive, metricsAdapter]);

  useEffect(() => {
    if (isFadeEnabled) return;
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
    setScrollActive(false);
  }, [isFadeEnabled]);

  useEffect(() => () => {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
  }, []);

  const opacity = geometry.isVisible && (!isFadeEnabled || isScrollActive) ? 1 : 0;
  const rootStyle = {
    ...getNonInteractiveScrollbarStyle({
      thickness,
      fadeDuration,
      mainAxisTrackInset,
      crossAxisTrackInset,
    }),
    ...style,
    pointerEvents: 'none',
  } as CSSProperties;
  const thumbGeometryStyle = orientation === 'vertical'
    ? {
        blockSize: geometry.thumbLength,
        insetBlockStart: mainAxisTrackInset + geometry.thumbOffset,
      }
    : {
        inlineSize: geometry.thumbLength,
        insetInlineStart: mainAxisTrackInset + geometry.thumbOffset,
      };

  return (
    <div
      {...props}
      aria-hidden="true"
      className={joinClassName('non-interactive-scrollbar', className)}
      data-fade-enabled={isFadeEnabled || undefined}
      data-orientation={orientation}
      data-overflow={geometry.isVisible || undefined}
      data-scroll-active={isScrollActive || undefined}
      ref={rootRef}
      style={rootStyle}
    >
      <div
        className="non-interactive-scrollbar__fade-layer"
        data-testid="non-interactive-scrollbar-fade-layer"
        style={{ opacity, pointerEvents: 'none' }}
      >
        <div
          className="non-interactive-scrollbar__track"
          data-testid="non-interactive-scrollbar-track"
          style={{ ...trackStyle, pointerEvents: 'none' }}
        />
        <div
          className="non-interactive-scrollbar__thumb"
          data-testid="non-interactive-scrollbar-thumb"
          style={{ ...thumbGeometryStyle, ...thumbStyle, pointerEvents: 'none' }}
        />
      </div>
    </div>
  );
}
