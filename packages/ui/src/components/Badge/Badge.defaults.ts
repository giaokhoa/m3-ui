import type { CSSProperties } from 'react';

export type BadgeStyle = CSSProperties & Record<`--${string}`, string | number>;

// Layout mechanics from pinned AndroidX Compose Badge.kt. These are renderer
// behavior rather than canonical design tokens and deliberately stay beside
// the consumer.
export const badgeRuntime = {
  contentHorizontalPadding: 4,
  dotOffset: 6,
  contentHorizontalOffset: 12,
  contentVerticalOffset: 14,
} as const;

export function getBadgeStyle(
  hasContent: boolean,
  options: {
    containerColor?: CSSProperties['color'];
    contentColor?: CSSProperties['color'];
  } = {},
): BadgeStyle {
  const style: BadgeStyle = {
    '--_badge-padding-inline': hasContent
      ? `${badgeRuntime.contentHorizontalPadding}px`
      : '0px',
  };

  if (options.containerColor !== undefined) {
    style['--_badge-container-color'] = options.containerColor;
  }
  if (hasContent && options.contentColor !== undefined) {
    style['--_badge-content-color'] = options.contentColor;
  }

  return style;
}

export function getBadgedBoxStyle(): BadgeStyle {
  return {
    '--_badge-dot-offset': `${badgeRuntime.dotOffset}px`,
    '--_badge-content-horizontal-offset': `${badgeRuntime.contentHorizontalOffset}px`,
    '--_badge-content-vertical-offset': `${badgeRuntime.contentVerticalOffset}px`,
  };
}
