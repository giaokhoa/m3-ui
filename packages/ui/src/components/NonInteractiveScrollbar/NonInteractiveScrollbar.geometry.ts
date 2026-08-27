import type { NonInteractiveScrollbarMetrics } from './NonInteractiveScrollbar.types';

export interface NonInteractiveScrollbarGeometry {
  readonly isVisible: boolean;
  readonly trackLength: number;
  readonly thumbLength: number;
  readonly thumbOffset: number;
}

export function getNonInteractiveScrollbarGeometry(
  metrics: NonInteractiveScrollbarMetrics,
  trackLength: number,
  thumbMinLength: number,
  thumbMaxLengthFraction: number,
): NonInteractiveScrollbarGeometry {
  if (!(thumbMaxLengthFraction >= 0 && thumbMaxLengthFraction <= 1)) {
    throw new RangeError('thumbMaxLengthFraction must be between 0 and 1');
  }

  const viewportSize = Math.max(0, metrics.viewportSize);
  const contentSize = Math.max(0, metrics.contentSize);
  const resolvedTrackLength = Math.max(0, trackLength);
  const resolvedMinLength = Math.max(0, thumbMinLength);

  if (
    contentSize <= viewportSize ||
    viewportSize === 0 ||
    contentSize === 0 ||
    resolvedTrackLength < resolvedMinLength
  ) {
    return { isVisible: false, trackLength: resolvedTrackLength, thumbLength: 0, thumbOffset: 0 };
  }

  const maxThumbLength = resolvedTrackLength * thumbMaxLengthFraction;
  if (maxThumbLength < resolvedMinLength) {
    return { isVisible: false, trackLength: resolvedTrackLength, thumbLength: 0, thumbOffset: 0 };
  }

  const proportionalLength = resolvedTrackLength * (viewportSize / contentSize);
  const thumbLength = Math.min(maxThumbLength, Math.max(resolvedMinLength, proportionalLength));
  const maxScrollOffset = contentSize - viewportSize;
  const scrollOffset = Math.min(maxScrollOffset, Math.max(0, metrics.scrollOffset));
  const thumbOffset = maxScrollOffset > 0
    ? (scrollOffset / maxScrollOffset) * (resolvedTrackLength - thumbLength)
    : 0;

  return {
    isVisible: true,
    trackLength: resolvedTrackLength,
    thumbLength,
    thumbOffset,
  };
}
