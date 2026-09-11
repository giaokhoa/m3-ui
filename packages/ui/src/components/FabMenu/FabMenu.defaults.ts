import * as token from '@m3-ui/tokens';
import type { CSSProperties } from 'react';
import type { ElevationLevel } from '../../internal/elevation';

export type FabMenuStyle = CSSProperties & Record<`--${string}`, string | number>;
export type ToggleFabSize = 'baseline' | 'medium' | 'large';

function cssLength(value: CSSProperties['maxHeight']): string | number | undefined {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
}

/** Runtime values consumed by index-based stagger and shared Elevation semantics. */
export const fabMenuRuntime = {
  staggerStepMs: Number.parseFloat(token.MotionDurationShort1),
  listItemElevation: token.ComponentFabMenuListItemContainerElevation as ElevationLevel,
} as const;

/** Viewport-dependent max height remains a runtime positioning mechanic. */
export function getFabMenuRuntimeStyle(
  maxMenuHeight: CSSProperties['maxHeight'] = 'calc(100dvh - 96px)',
): FabMenuStyle {
  return {
    '--_fab-menu-max-height': cssLength(maxMenuHeight) ?? 'calc(100dvh - 96px)',
  };
}

export interface ToggleFabStyleOptions {
  readonly containerColor?: CSSProperties['backgroundColor'];
  readonly checkedContainerColor?: CSSProperties['backgroundColor'];
  readonly contentColor?: CSSProperties['color'];
  readonly checkedContentColor?: CSSProperties['color'];
}

/** Serialize only caller overrides; toggle geometry/color defaults are generated CSS. */
export function getToggleFabOverrideStyle(
  checked: boolean,
  options: ToggleFabStyleOptions = {},
): FabMenuStyle {
  const containerColor = checked ? options.checkedContainerColor : options.containerColor;
  const contentColor = checked ? options.checkedContentColor : options.contentColor;
  const style: FabMenuStyle = {};
  if (containerColor !== undefined) style['--_fab-container-color'] = containerColor;
  if (contentColor !== undefined) {
    style['--_fab-content-color'] = contentColor;
    style['--_fab-state-layer-color'] = contentColor;
  }
  return style;
}
