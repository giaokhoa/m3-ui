import * as token from '@m3/tokens';
import type { CSSProperties } from 'react';
import { pxNumber } from '../../internal/tokenValues';

export type LoadingIndicatorStyle = CSSProperties &
  Record<`--${string}`, string | number>;

const shapeRadius = {
  full: token.ShapeFull,
} as const;

type ShapeName = keyof typeof shapeRadius;

export const loadingIndicatorTokens = {
  activeColor: token.ComponentLoadingIndicatorActiveIndicatorColor,
  activeSize: pxNumber(token.ComponentLoadingIndicatorActiveSize),
  containedActiveColor: token.ComponentLoadingIndicatorContainedActiveColor,
  containedContainerColor: token.ComponentLoadingIndicatorContainedContainerColor,
  containerHeight: pxNumber(token.ComponentLoadingIndicatorContainerHeight),
  containerShape: token.ComponentLoadingIndicatorContainerShape as ShapeName,
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
  const indicatorColor = contained
    ? options.indicatorColor ?? loadingIndicatorTokens.containedActiveColor
    : options.color ?? loadingIndicatorTokens.activeColor;
  const containerColor = contained
    ? options.containerColor ?? loadingIndicatorTokens.containedContainerColor
    : 'transparent';

  return {
    '--_loading-width': `${loadingIndicatorTokens.containerWidth}px`,
    '--_loading-height': `${loadingIndicatorTokens.containerHeight}px`,
    '--_loading-active-size': `${loadingIndicatorTokens.activeSize}px`,
    '--_loading-container-radius': shapeRadius[loadingIndicatorTokens.containerShape],
    '--_loading-indicator-color': indicatorColor,
    '--_loading-container-color': containerColor,
  };
}
