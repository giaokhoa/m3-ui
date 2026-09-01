import * as token from '@m3-ui/tokens';
import type { CSSProperties } from 'react';
import { pxNumber } from '../../internal/tokenValues';

export type LoadingIndicatorStyle = CSSProperties &
  Record<`--${string}`, string | number>;

// Numeric canonical geometry remains in TypeScript only because the morph
// renderer needs it for live path scaling and SVG view-box arithmetic.
export const loadingIndicatorTokens = {
  activeSize: pxNumber(token.ComponentLoadingIndicatorActiveSize),
  containerHeight: pxNumber(token.ComponentLoadingIndicatorContainerHeight),
  containerWidth: pxNumber(token.ComponentLoadingIndicatorContainerWidth),
} as const;

// Renderer mechanics from pinned AndroidX Compose. They deliberately remain
// beside the consumer instead of becoming fabricated canonical DTCG tokens.
export const loadingIndicatorRuntime = {
  globalRotationDurationMs: 4666,
  morphIntervalMs: 650,
  springDampingRatio: 0.6,
  springStiffness: 200,
  springVisibilityThreshold: 0.1,
  quarterRotation: 90,
  determinateRotation: 180,
} as const;

export function getLoadingIndicatorStyle(
  contained: boolean,
  options: {
    color?: CSSProperties['color'];
    indicatorColor?: CSSProperties['color'];
    containerColor?: CSSProperties['color'];
  } = {},
): LoadingIndicatorStyle {
  const style: LoadingIndicatorStyle = {};

  if (contained) {
    if (options.indicatorColor !== undefined) {
      style['--_loading-indicator-color'] = options.indicatorColor;
    }
    if (options.containerColor !== undefined) {
      style['--_loading-container-color'] = options.containerColor;
    }
  } else if (options.color !== undefined) {
    style['--_loading-indicator-color'] = options.color;
  }

  return style;
}
