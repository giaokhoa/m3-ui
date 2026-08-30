import * as token from '@m3-ui/tokens';
import type { CSSProperties } from 'react';
import type { ElevationLevel } from '../../internal/elevation';

export type FloatingToolbarOrientation = 'horizontal' | 'vertical';
export type FloatingToolbarVariant = 'standard' | 'vibrant';
export type FloatingToolbarExitDirection = 'top' | 'bottom' | 'start' | 'end';
export type FloatingToolbarFabPosition = 'start' | 'end' | 'top' | 'bottom';
export type FloatingToolbarStyle = CSSProperties & Record<`--${string}`, string | number>;

type FloatingToolbarShape = 'full';

export interface FloatingToolbarState {
  offsetLimit: number;
  offset: number;
  contentOffset: number;
}

export interface FloatingToolbarStyleOptions {
  containerColor?: CSSProperties['backgroundColor'];
  contentColor?: CSSProperties['color'];
  shape?: CSSProperties['borderRadius'];
  contentPadding?: CSSProperties['padding'];
  expandedElevation?: ElevationLevel;
  collapsedElevation?: ElevationLevel;
}

const shapeRadius: Record<FloatingToolbarShape, string | number> = {
  full: token.ShapeFull,
};

export const floatingToolbarTokens = {
  containerHeight: token.ComponentToolbarFloatingContainerHeight,
  leadingSpace: token.ComponentToolbarFloatingContainerLeadingSpace,
  trailingSpace: token.ComponentToolbarFloatingContainerTrailingSpace,
  betweenSpace: token.ComponentToolbarFloatingContainerBetweenSpace,
  externalPadding: token.ComponentToolbarFloatingContainerExternalPadding,
  shape: token.ComponentToolbarFloatingContainerShape as FloatingToolbarShape,
  standardContainerColor: token.ComponentToolbarFloatingStandardContainerColor,
  vibrantContainerColor: token.ComponentToolbarFloatingVibrantContainerColor,
  fabBaselineSize: token.ComponentFabSizeBaselineContainerWidth,
  fabMediumSize: token.ComponentFabSizeMediumContainerWidth,
} as const;

// AndroidX FloatingToolbar.kt renderer mechanics at ff9a7111. These values are
// runtime behavior, not new design tokens. ContainerBetweenSpace exists in the
// generated token file but the pinned runtime does not consume it; Row/Column
// uses Arrangement.Center with no spacing.
export const floatingToolbarRuntime = {
  toolbarToFabGap: 8,
  scrollDistanceThreshold: 40,
  settleThreshold: 0.5,
  expandedElevation: 'level0' as ElevationLevel,
  collapsedElevation: 'level0' as ElevationLevel,
  expandedElevationWithFab: 'level1' as ElevationLevel,
  collapsedElevationWithFab: 'level0' as ElevationLevel,
  expandCollapseMotion: {
    duration: token.MotionSpringFastSpatialDuration,
    easing: token.MotionSpringFastSpatialEasing,
  },
  scrollSnapMotion: {
    duration: token.MotionSpringDefaultEffectsDuration,
    easing: token.MotionSpringDefaultEffectsEasing,
  },
} as const;

function dimensionNumber(value: string | number): number {
  const numeric = typeof value === 'number' ? value : Number.parseFloat(value);
  if (!Number.isFinite(numeric)) {
    throw new TypeError(`Expected a CSS dimension, received ${String(value)}`);
  }
  return numeric;
}

function cssLength(
  value: CSSProperties['borderRadius'] | CSSProperties['padding'],
  fallback: string | number,
): string | number {
  if (value === undefined) return fallback;
  return typeof value === 'number' ? `${value}px` : value;
}

export function createFloatingToolbarState(
  offsetLimit = -dimensionNumber(floatingToolbarTokens.containerHeight),
  offset = 0,
  contentOffset = 0,
): FloatingToolbarState {
  const limit = Math.min(0, Number.isFinite(offsetLimit) ? offsetLimit : 0);
  return {
    offsetLimit: limit,
    offset: Math.min(0, Math.max(limit, Number.isFinite(offset) ? offset : 0)),
    contentOffset: Number.isFinite(contentOffset) ? contentOffset : 0,
  };
}

export function setFloatingToolbarOffset(
  state: FloatingToolbarState,
  offset: number,
): FloatingToolbarState {
  const limit = Math.min(0, state.offsetLimit);
  return {
    ...state,
    offset: Math.min(0, Math.max(limit, Number.isFinite(offset) ? offset : 0)),
  };
}

export function floatingToolbarCollapsedFraction(state: FloatingToolbarState): number {
  if (state.offsetLimit === 0) return 0;
  const fraction = state.offset / state.offsetLimit;
  return Math.min(1, Math.max(0, Number.isFinite(fraction) ? fraction : 0));
}

export function shouldCollapseFloatingToolbar(state: FloatingToolbarState): boolean {
  return floatingToolbarCollapsedFraction(state) >= floatingToolbarRuntime.settleThreshold;
}

export function settleFloatingToolbarState(
  state: FloatingToolbarState,
): FloatingToolbarState {
  return setFloatingToolbarOffset(
    state,
    shouldCollapseFloatingToolbar(state) ? state.offsetLimit : 0,
  );
}

export function getFloatingToolbarTranslation(
  state: FloatingToolbarState | undefined,
  exitDirection: FloatingToolbarExitDirection,
  direction: 'ltr' | 'rtl' = 'ltr',
): string {
  const offset = state?.offset ?? 0;
  if (exitDirection === 'top') return `translateY(${offset}px)`;
  if (exitDirection === 'bottom') return `translateY(${-offset}px)`;
  const logicalOffset = direction === 'rtl' ? -offset : offset;
  return exitDirection === 'start'
    ? `translateX(${logicalOffset}px)`
    : `translateX(${-logicalOffset}px)`;
}

export function resolveFloatingToolbarElevation(
  expanded: boolean,
  withFab: boolean,
  options: Pick<
    FloatingToolbarStyleOptions,
    'expandedElevation' | 'collapsedElevation'
  > = {},
): ElevationLevel {
  const defaultExpandedElevation = withFab
    ? floatingToolbarRuntime.expandedElevationWithFab
    : floatingToolbarRuntime.expandedElevation;
  const defaultCollapsedElevation = withFab
    ? floatingToolbarRuntime.collapsedElevationWithFab
    : floatingToolbarRuntime.collapsedElevation;
  return expanded
    ? options.expandedElevation ?? defaultExpandedElevation
    : options.collapsedElevation ?? defaultCollapsedElevation;
}

export function getFloatingToolbarStyle(
  variant: FloatingToolbarVariant,
  expanded: boolean,
  _withFab: boolean,
  options: FloatingToolbarStyleOptions = {},
): FloatingToolbarStyle {
  const defaultContainerColor =
    variant === 'standard'
      ? floatingToolbarTokens.standardContainerColor
      : floatingToolbarTokens.vibrantContainerColor;
  const defaultContentColor =
    variant === 'standard' ? 'var(--on-surface)' : 'var(--on-primary-container)';

  return {
    '--_floating-toolbar-container-size': floatingToolbarTokens.containerHeight,
    '--_floating-toolbar-container-radius': cssLength(
      options.shape,
      shapeRadius[floatingToolbarTokens.shape],
    ),
    '--_floating-toolbar-content-padding': cssLength(
      options.contentPadding,
      floatingToolbarTokens.leadingSpace,
    ),
    '--_floating-toolbar-screen-offset': floatingToolbarTokens.externalPadding,
    '--_floating-toolbar-container-color':
      options.containerColor ?? defaultContainerColor,
    '--_floating-toolbar-content-color': options.contentColor ?? defaultContentColor,
    '--_floating-toolbar-fab-gap': `${floatingToolbarRuntime.toolbarToFabGap}px`,
    '--_floating-toolbar-fab-size': expanded
      ? floatingToolbarTokens.fabBaselineSize
      : floatingToolbarTokens.fabMediumSize,
    '--_floating-toolbar-fab-max-size': floatingToolbarTokens.fabMediumSize,
    '--_floating-toolbar-motion-duration':
      floatingToolbarRuntime.expandCollapseMotion.duration,
    '--_floating-toolbar-motion-easing':
      floatingToolbarRuntime.expandCollapseMotion.easing,
    '--_floating-toolbar-snap-duration': floatingToolbarRuntime.scrollSnapMotion.duration,
    '--_floating-toolbar-snap-easing': floatingToolbarRuntime.scrollSnapMotion.easing,
  };
}
