import type { CSSProperties, HTMLAttributes, RefObject } from 'react';

export type NonInteractiveScrollbarOrientation = 'vertical' | 'horizontal';

/** Logical scroll metrics. Horizontal offsets are measured from inline-start. */
export interface NonInteractiveScrollbarMetrics {
  readonly viewportSize: number;
  readonly contentSize: number;
  readonly scrollOffset: number;
}

/**
 * Adapter for non-native scrollers. `subscribe` is optional when `scrollRef`
 * supplies native scroll/resize/mutation notifications.
 */
export interface NonInteractiveScrollbarMetricsAdapter {
  getMetrics(): NonInteractiveScrollbarMetrics;
  subscribe?(listener: () => void): () => void;
}

export interface NonInteractiveScrollbarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'role'> {
  orientation?: NonInteractiveScrollbarOrientation;
  /** Native scroll viewport used for metrics and lifecycle notifications. */
  scrollRef?: RefObject<HTMLElement | null>;
  /** Optional metric source for virtual/non-native scroll containers. */
  metricsAdapter?: NonInteractiveScrollbarMetricsAdapter;
  isFadeEnabled?: boolean;
  /** Opacity fade duration in milliseconds. */
  fadeDuration?: number;
  /** Idle delay before fading in milliseconds. */
  fadeDelay?: number;
  /** Scrollbar thickness in CSS pixels. */
  thickness?: number;
  /** Minimum thumb length in CSS pixels. */
  thumbMinLength?: number;
  /** Maximum thumb length as a fraction of the available track. */
  thumbMaxLengthFraction?: number;
  /** Main-axis inset at both ends of the track, in CSS pixels. */
  mainAxisTrackInset?: number;
  /** Cross-axis inset from the logical edge, in CSS pixels. */
  crossAxisTrackInset?: number;
  trackStyle?: CSSProperties;
  thumbStyle?: CSSProperties;
}
