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

export function getScrollFieldStyle(options: ScrollFieldStyleOptions = {}): CSSProperties {
  return {
    '--scroll-field-container': options.containerColor ?? 'var(--surface-container-lowest)',
    '--scroll-field-content': options.contentColor ?? 'var(--outline)',
    '--scroll-field-selected-content': options.selectedContentColor ?? 'var(--on-surface)',
    '--scroll-field-disabled-container': options.disabledContainerColor ?? 'color-mix(in srgb, var(--surface-container-lowest) 38%, transparent)',
    '--scroll-field-disabled-content': options.disabledContentColor ?? 'color-mix(in srgb, var(--on-surface) 38%, transparent)',
    '--scroll-field-disabled-selected-content': options.disabledSelectedContentColor ?? 'color-mix(in srgb, var(--on-surface) 38%, transparent)',
  } as CSSProperties;
}
