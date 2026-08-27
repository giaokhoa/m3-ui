import * as token from '@m3-ui/tokens';
import type { CSSProperties } from 'react';
import {
  getElevationBoxShadow,
  type ElevationLevel,
} from '../../internal/elevation';
import { getScrimStyle } from '../Scrim';

export type BottomSheetStyle = CSSProperties &
  Record<`--${string}`, string | number>;

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

export interface ModalBottomSheetOverlayStyleOptions {
  scrimColor?: CSSProperties['backgroundColor'];
  scrimOpacity?: number;
  scrimAlpha?: number;
}

export const bottomSheetTokens = {
  containerColor: token.ComponentSheetBottomDockedContainerColor,
  containerShape: token.ComponentSheetBottomDockedContainerShape,
  dragHandleColor: token.ComponentSheetBottomDockedDragHandleColor,
  dragHandleHeight: token.ComponentSheetBottomDockedDragHandleHeight,
  dragHandleWidth: token.ComponentSheetBottomDockedDragHandleWidth,
  minimizedContainerShape:
    token.ComponentSheetBottomDockedMinimizedContainerShape,
  modalContainerElevation:
    token.ComponentSheetBottomDockedModalContainerElevation as ElevationLevel,
  standardContainerElevation:
    token.ComponentSheetBottomDockedStandardContainerElevation as ElevationLevel,
  focusIndicatorColor: token.ComponentSheetBottomFocusIndicatorColor,
} as const;

// AndroidX BottomSheet.kt / SheetDefaults.kt own these renderer and gesture
// mechanics rather than SheetBottomTokens.kt. Keep them beside the consumer
// instead of promoting implementation constants into canonical DTCG.
export const bottomSheetRuntime = {
  maximumWidth: 640,
  dragHandleVerticalPadding: 22,
  positionalThreshold: 56,
  velocityThreshold: 125,
  boundaryDampeningZone: 125,
  motion: {
    show: {
      duration: token.MotionSpringDefaultSpatialDuration,
      easing: token.MotionSpringDefaultSpatialEasing,
    },
    settle: {
      duration: token.MotionSpringDefaultSpatialDuration,
      easing: token.MotionSpringDefaultSpatialEasing,
    },
    hide: {
      duration: token.MotionSpringFastEffectsDuration,
      easing: token.MotionSpringFastEffectsEasing,
    },
    scrim: {
      duration: token.MotionSpringDefaultEffectsDuration,
      easing: token.MotionSpringDefaultEffectsEasing,
    },
  },
} as const;

function cssLength(value: CssLength): string {
  return typeof value === 'number' ? `${value}px` : value;
}

export function getBottomSheetStyle(
  options: BottomSheetStyleOptions = {},
): BottomSheetStyle {
  const elevation = options.elevation ?? 'standard';
  const elevationLevel =
    elevation === 'modal'
      ? bottomSheetTokens.modalContainerElevation
      : bottomSheetTokens.standardContainerElevation;

  return {
    '--_bottom-sheet-container-color':
      options.containerColor ?? bottomSheetTokens.containerColor,
    '--_bottom-sheet-content-color':
      options.contentColor ?? token.ColorRoleOnSurface,
    '--_bottom-sheet-radius-top-start':
      token.ShapeCornerExtraLargeTopTopStart,
    '--_bottom-sheet-radius-top-end':
      token.ShapeCornerExtraLargeTopTopEnd,
    '--_bottom-sheet-radius-bottom-end':
      token.ShapeCornerExtraLargeTopBottomEnd,
    '--_bottom-sheet-radius-bottom-start':
      token.ShapeCornerExtraLargeTopBottomStart,
    '--_bottom-sheet-drag-handle-color':
      options.dragHandleColor ?? bottomSheetTokens.dragHandleColor,
    '--_bottom-sheet-drag-handle-width':
      bottomSheetTokens.dragHandleWidth,
    '--_bottom-sheet-drag-handle-height':
      bottomSheetTokens.dragHandleHeight,
    '--_bottom-sheet-drag-handle-padding-block':
      `${bottomSheetRuntime.dragHandleVerticalPadding}px`,
    '--_bottom-sheet-focus-indicator-color':
      options.focusIndicatorColor ?? bottomSheetTokens.focusIndicatorColor,
    '--_bottom-sheet-focus-indicator-width':
      token.RippleFocusRingOuterStrokeWidth,
    '--_bottom-sheet-box-shadow': getElevationBoxShadow(
      elevationLevel,
      (options.shadowColor ?? 'var(--shadow)') as string,
    ),
    '--_bottom-sheet-max-width': cssLength(
      (options.maxWidth ?? bottomSheetRuntime.maximumWidth) as CssLength,
    ),
    '--_bottom-sheet-show-duration':
      bottomSheetRuntime.motion.show.duration,
    '--_bottom-sheet-show-easing':
      bottomSheetRuntime.motion.show.easing,
    '--_bottom-sheet-settle-duration':
      bottomSheetRuntime.motion.settle.duration,
    '--_bottom-sheet-settle-easing':
      bottomSheetRuntime.motion.settle.easing,
    '--_bottom-sheet-hide-duration':
      bottomSheetRuntime.motion.hide.duration,
    '--_bottom-sheet-hide-easing':
      bottomSheetRuntime.motion.hide.easing,
  };
}

export function getModalBottomSheetOverlayStyle(
  options: ModalBottomSheetOverlayStyleOptions = {},
): BottomSheetStyle {
  return {
    ...getScrimStyle({
      containerColor: options.scrimColor,
      containerOpacity: options.scrimOpacity,
      alpha: options.scrimAlpha,
    }),
    '--_modal-bottom-sheet-scrim-duration':
      bottomSheetRuntime.motion.scrim.duration,
    '--_modal-bottom-sheet-scrim-easing':
      bottomSheetRuntime.motion.scrim.easing,
  };
}
