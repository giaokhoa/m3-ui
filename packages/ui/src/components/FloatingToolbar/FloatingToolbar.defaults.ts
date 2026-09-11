import * as token from '@m3-ui/tokens';
import '@m3-ui/tokens/floating-toolbar.css';
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

// AndroidX FloatingToolbar.kt renderer mechanics at ff9a7111. Elevation and
// scroll behavior remain runtime-owned; immutable token projections are CSS.
export const floatingToolbarRuntime = {
  toolbarToFabGap: 8,
  scrollDistanceThreshold: 40,
  settleThreshold: 0.5,
  expandedElevation: 'level0' as ElevationLevel,
  collapsedElevation: 'level0' as ElevationLevel,
  expandedElevationWithFab: 'level1' as ElevationLevel,
  collapsedElevationWithFab: 'level0' as ElevationLevel,
} as const;

function dimensionNumber(value: string | number): number {
  const numeric = typeof value === 'number' ? value : Number.parseFloat(value);
  if (!Number.isFinite(numeric)) {
    throw new TypeError(`Expected a CSS dimension, received ${String(value)}`);
  }
  return numeric;
}

function explicitCssLength(
  value: CSSProperties['borderRadius'] | CSSProperties['padding'],
): string | number | undefined {
  if (value === undefined) return undefined;
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
  _variant: FloatingToolbarVariant,
  _expanded: boolean,
  _withFab: boolean,
  options: FloatingToolbarStyleOptions = {},
): FloatingToolbarStyle {
  const style: FloatingToolbarStyle = {
    '--_floating-toolbar-fab-gap': `${floatingToolbarRuntime.toolbarToFabGap}px`,
  };
  if (options.containerColor !== undefined) {
    style['--_floating-toolbar-container-color'] = options.containerColor as string | number;
  }
  if (options.contentColor !== undefined) {
    style['--_floating-toolbar-content-color'] = options.contentColor as string | number;
  }
  const shape = explicitCssLength(options.shape);
  if (shape !== undefined) style['--_floating-toolbar-container-radius'] = shape;
  const padding = explicitCssLength(options.contentPadding);
  if (padding !== undefined) style['--_floating-toolbar-content-padding'] = padding;
  return style;
}
