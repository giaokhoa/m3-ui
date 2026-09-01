import * as token from '@m3-ui/tokens';
import type { CSSProperties } from 'react';
import type { ElevationLevel } from '../../internal/elevation';
import type { FabElevation } from './Fab.types';

export type FabStyle = CSSProperties & Record<`--${string}`, string | number>;

export interface FabOverrideStyleOptions {
  readonly containerColor?: CSSProperties['backgroundColor'];
  readonly contentColor?: CSSProperties['color'];
  readonly shape?: CSSProperties['borderRadius'];
}

const defaultElevation = {
  default: token.ComponentFabContainerPrimaryContainerElevation as ElevationLevel,
  focused: token.ComponentFabContainerPrimaryFocusedContainerElevation as ElevationLevel,
  hovered: token.ComponentFabContainerPrimaryHoveredContainerElevation as ElevationLevel,
  pressed: token.ComponentFabContainerPrimaryPressedContainerElevation as ElevationLevel,
} as const;

const loweredElevation = {
  default: token.ComponentFabSurfaceLoweredContainerElevation as ElevationLevel,
  focused: token.ComponentFabSurfaceLoweredFocusContainerElevation as ElevationLevel,
  hovered: token.ComponentFabSurfaceLoweredHoverContainerElevation as ElevationLevel,
  pressed: token.ComponentFabSurfaceLoweredPressedContainerElevation as ElevationLevel,
} as const;

/** Shared Elevation requires semantic levels at runtime; all visual defaults are generated CSS. */
export const fabElevationTokens = {
  default: defaultElevation,
  lowered: loweredElevation,
} as const satisfies Record<
  FabElevation,
  Record<'default' | 'focused' | 'hovered' | 'pressed', ElevationLevel>
>;

function cssLength(value: CSSProperties['borderRadius']): string | number | undefined {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
}

/** Serialize only caller overrides. Static family defaults are selected by generated CSS. */
export function getFabOverrideStyle(
  options: FabOverrideStyleOptions = {},
): FabStyle {
  const style: FabStyle = {};
  if (options.containerColor !== undefined) {
    style['--_fab-container-color'] = options.containerColor;
  }
  if (options.contentColor !== undefined) {
    style['--_fab-content-color'] = options.contentColor;
    style['--_fab-state-layer-color'] = options.contentColor;
    style['--_fab-label-color'] = options.contentColor;
  }
  const shape = cssLength(options.shape);
  if (shape !== undefined) style['--_fab-container-radius'] = shape;
  return style;
}
