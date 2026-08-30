import * as token from '@m3-ui/tokens';
import type { CSSProperties } from 'react';
import { type ElevationLevel } from '../../internal/elevation';
import {
  elevationLevelToPx,
  getSurfaceBackground,
} from '../Surface/Surface.defaults';

export type BottomAppBarStyle = CSSProperties &
  Record<`--${string}`, string | number>;

export interface BottomAppBarStyleOptions {
  containerColor?: CSSProperties['backgroundColor'];
  contentColor?: CSSProperties['color'];
  tonalElevation?: ElevationLevel;
}

export const bottomAppBarTokens = {
  containerColor: token.ComponentBottomAppBarContainerColor,
  containerElevation:
    token.ComponentBottomAppBarContainerElevation as ElevationLevel,
  containerHeight: token.ComponentBottomAppBarContainerHeight,
  containerShape: token.ComponentBottomAppBarContainerShape,
  flexibleContainerColor: token.ComponentToolbarDockedContainerColor,
  flexibleContainerHeight: token.ComponentToolbarDockedContainerHeight,
  flexibleContainerShape: token.ComponentToolbarDockedContainerShape,
  flexibleLeadingSpace: token.ComponentToolbarDockedContainerLeadingSpace,
  flexibleTrailingSpace: token.ComponentToolbarDockedContainerTrailingSpace,
  flexibleMinSpacing: token.ComponentToolbarDockedContainerMinSpacing,
  flexibleMaxSpacing: token.ComponentToolbarDockedContainerMaxSpacing,
  // AndroidX FlexibleBottomAppBar intentionally uses AppBarTokens.ContainerElevation.
  flexibleContainerElevation:
    token.ComponentAppBarBaseContainerElevation as ElevationLevel,
  fabContainerColor: token.ComponentFabContainerSecondaryContainerColor,
} as const;

export const bottomAppBarRuntime = {
  contentHorizontalPadding: 4,
  contentTopPadding: 4,
  fabHorizontalPadding: 12,
  fabVerticalPadding: 8,
  snapThreshold: 0.5,
  motion: {
    duration: token.MotionSpringFastSpatialDuration,
    easing: token.MotionSpringFastSpatialEasing,
  },
} as const;

function dimensionNumber(value: string | number): number {
  const numeric = typeof value === 'number' ? value : Number.parseFloat(value);
  if (!Number.isFinite(numeric)) {
    throw new TypeError(`Expected a CSS dimension, received ${String(value)}`);
  }
  return numeric;
}

export function clampBottomAppBarFraction(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function bottomAppBarHeight(
  variant: 'regular' | 'flexible',
  expandedHeight?: number,
): number {
  if (
    variant === 'flexible' &&
    expandedHeight !== undefined &&
    Number.isFinite(expandedHeight) &&
    expandedHeight > 0
  ) {
    return expandedHeight;
  }
  return dimensionNumber(
    variant === 'regular'
      ? bottomAppBarTokens.containerHeight
      : bottomAppBarTokens.flexibleContainerHeight,
  );
}

export function shouldCollapseBottomAppBar(fraction: number): boolean {
  return clampBottomAppBarFraction(fraction) >= bottomAppBarRuntime.snapThreshold;
}

export function getBottomAppBarStyle(
  variant: 'regular' | 'flexible',
  collapsedFraction = 0,
  options: BottomAppBarStyleOptions = {},
  expandedHeight?: number,
): BottomAppBarStyle {
  const fraction = clampBottomAppBarFraction(collapsedFraction);
  const fullHeight = bottomAppBarHeight(variant, expandedHeight);
  const height = fullHeight * (1 - fraction);
  const flexible = variant === 'flexible';
  const elevation =
    options.tonalElevation ??
    (flexible
      ? bottomAppBarTokens.flexibleContainerElevation
      : bottomAppBarTokens.containerElevation);
  const containerColor =
    options.containerColor ??
    (flexible
      ? bottomAppBarTokens.flexibleContainerColor
      : bottomAppBarTokens.containerColor);
  const resolvedContainerColor =
    getSurfaceBackground(containerColor, elevationLevelToPx(elevation)) ??
    containerColor;

  return {
    '--_bottom-app-bar-height': `${height}px`,
    '--_bottom-app-bar-expanded-height': `${fullHeight}px`,
    '--_bottom-app-bar-container-color': resolvedContainerColor,
    '--_bottom-app-bar-content-color': options.contentColor ?? 'var(--on-surface)',
    '--_bottom-app-bar-content-horizontal-padding': `${bottomAppBarRuntime.contentHorizontalPadding}px`,
    '--_bottom-app-bar-content-top-padding': `${bottomAppBarRuntime.contentTopPadding}px`,
    '--_bottom-app-bar-fab-horizontal-padding': `${bottomAppBarRuntime.fabHorizontalPadding}px`,
    '--_bottom-app-bar-fab-vertical-padding': `${bottomAppBarRuntime.fabVerticalPadding}px`,
    '--_bottom-app-bar-flexible-leading-space':
      bottomAppBarTokens.flexibleLeadingSpace,
    '--_bottom-app-bar-flexible-trailing-space':
      bottomAppBarTokens.flexibleTrailingSpace,
    '--_bottom-app-bar-flexible-min-spacing':
      bottomAppBarTokens.flexibleMinSpacing,
    '--_bottom-app-bar-flexible-max-spacing':
      bottomAppBarTokens.flexibleMaxSpacing,
    '--_bottom-app-bar-motion-duration': bottomAppBarRuntime.motion.duration,
    '--_bottom-app-bar-motion-easing': bottomAppBarRuntime.motion.easing,
  };
}
