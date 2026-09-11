import type { CSSProperties } from 'react';

export const scrollFieldRuntime = {
  height: 200,
  visibleItemCount: 3,
  wheelSettleDelay: 80,
  dragThreshold: 4,
} as const;

export interface ScrollFieldStyleOptions {
  containerColor?: CSSProperties['backgroundColor'];
  contentColor?: CSSProperties['color'];
  selectedContentColor?: CSSProperties['color'];
  disabledContainerColor?: CSSProperties['backgroundColor'];
  disabledContentColor?: CSSProperties['color'];
  disabledSelectedContentColor?: CSSProperties['color'];
}

/**
 * Serializes only explicit instance color overrides. Immutable ScrollField
 * role defaults and disabled composites live in `scroll-field.css`.
 */
export function getScrollFieldStyle(options: ScrollFieldStyleOptions = {}): CSSProperties {
  const style = {} as CSSProperties & Record<`--${string}`, string | number>;
  if (options.containerColor !== undefined) {
    style['--scroll-field-container'] = options.containerColor as string;
  }
  if (options.contentColor !== undefined) {
    style['--scroll-field-content'] = options.contentColor as string;
  }
  if (options.selectedContentColor !== undefined) {
    style['--scroll-field-selected-content'] = options.selectedContentColor as string;
  }
  if (options.disabledContainerColor !== undefined) {
    style['--scroll-field-disabled-container'] = options.disabledContainerColor as string;
  }
  if (options.disabledContentColor !== undefined) {
    style['--scroll-field-disabled-content'] = options.disabledContentColor as string;
  }
  if (options.disabledSelectedContentColor !== undefined) {
    style['--scroll-field-disabled-selected-content'] = options.disabledSelectedContentColor as string;
  }
  return style;
}
