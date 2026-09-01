import * as token from '@m3-ui/tokens';
import type { CSSProperties } from 'react';
import type { ElevationLevel } from '../../internal/elevation';
import { getScrimStyle } from '../Scrim';

export type BottomSheetStyle = CSSProperties & Record<`--${string}`, string | number>;
type CssLength = NonNullable<CSSProperties['maxWidth']>;
export type BottomSheetElevation = 'standard' | 'modal';

export interface BottomSheetStyleOptions {
  containerColor?: CSSProperties['backgroundColor'];
  contentColor?: CSSProperties['color'];
  dragHandleColor?: CSSProperties['backgroundColor'];
  focusIndicatorColor?: CSSProperties['outlineColor'];
  shadowColor?: CSSProperties['color'];
  elevation?: BottomSheetElevation;
  maxWidth?: CSSProperties['maxWidth'];
}

type BottomSheetSurfaceStyleOptions = Omit<BottomSheetStyleOptions, 'shadowColor' | 'elevation'>;

export interface ModalBottomSheetOverlayStyleOptions {
  scrimColor?: CSSProperties['backgroundColor'];
  scrimOpacity?: number;
  scrimAlpha?: number;
}

// Elevation level selection feeds the runtime elevation host. Visual defaults are generated CSS.
export const bottomSheetTokens = {
  modalContainerElevation: token.ComponentSheetBottomDockedModalContainerElevation as ElevationLevel,
  standardContainerElevation: token.ComponentSheetBottomDockedStandardContainerElevation as ElevationLevel,
} as const;

export const bottomSheetRuntime = {
  positionalThreshold: 56,
  velocityThreshold: 125,
  boundaryDampeningZone: 125,
  motion: {
    hide: { duration: token.MotionSpringFastEffectsDuration },
  },
} as const;

function cssLength(value: CssLength): string {
  return typeof value === 'number' ? `${value}px` : value;
}

export function getBottomSheetElevationLevel(elevation: BottomSheetElevation = 'standard'): ElevationLevel {
  return elevation === 'modal'
    ? bottomSheetTokens.modalContainerElevation
    : bottomSheetTokens.standardContainerElevation;
}

/** Runtime-only visual overrides. Immutable defaults live in generated bottom-sheet.css. */
export function getBottomSheetStyle(options: BottomSheetSurfaceStyleOptions = {}): BottomSheetStyle {
  return {
    ...(options.containerColor === undefined ? {} : { '--_bottom-sheet-container-color': options.containerColor }),
    ...(options.contentColor === undefined ? {} : { '--_bottom-sheet-content-color': options.contentColor }),
    ...(options.dragHandleColor === undefined ? {} : { '--_bottom-sheet-drag-handle-color': options.dragHandleColor }),
    ...(options.focusIndicatorColor === undefined ? {} : { '--_bottom-sheet-focus-indicator-color': options.focusIndicatorColor }),
    ...(options.maxWidth === undefined ? {} : { '--_bottom-sheet-max-width': cssLength(options.maxWidth as CssLength) }),
  };
}

export function getModalBottomSheetOverlayStyle(options: ModalBottomSheetOverlayStyleOptions = {}): BottomSheetStyle {
  return getScrimStyle({
    containerColor: options.scrimColor,
    containerOpacity: options.scrimOpacity,
    alpha: options.scrimAlpha,
  });
}
