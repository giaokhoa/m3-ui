import * as token from '@m3-ui/tokens';
import type { CSSProperties } from 'react';
import {
  getElevationBoxShadow,
  type ElevationLevel,
} from '../../internal/elevation';

export type ModalWideNavigationRailStyle = CSSProperties &
  Record<`--${string}`, string | number>;

export interface ModalWideNavigationRailStyleOptions {
  modalContainerColor?: CSSProperties['backgroundColor'];
  modalContentColor?: CSSProperties['color'];
  modalShape?: CSSProperties['borderRadius'];
}

export const modalWideNavigationRailTokens = {
  modalContainerColor: token.ComponentNavigationRailExpandedModalContainerColor,
  modalContainerElevation:
    token.ComponentNavigationRailExpandedModalContainerElevation as ElevationLevel,
  modalContainerShape: token.ComponentNavigationRailExpandedModalContainerShape,
  scrimColor: token.ScrimContainerColor,
  scrimOpacity: token.ScrimContainerOpacity,
} as const;

export const modalWideNavigationRailRuntime = {
  positionalThreshold: 0.5,
  activationThreshold: 0.3,
  dragSlop: 4,
  modalRadius: token.ShapeCornerLarge,
  motion: {
    expandWidth: {
      duration: token.MotionSpringFastSpatialDuration,
      easing: token.MotionSpringFastSpatialEasing,
    },
    slide: {
      duration: token.MotionSpringDefaultSpatialDuration,
      easing: token.MotionSpringDefaultSpatialEasing,
    },
    effects: {
      duration: token.MotionSpringDefaultEffectsDuration,
      easing: token.MotionSpringDefaultEffectsEasing,
    },
  },
} as const;

export function getModalWideNavigationRailStyle(
  options: ModalWideNavigationRailStyleOptions = {},
): ModalWideNavigationRailStyle {
  return {
    '--_modal-wide-navigation-rail-container-color':
      options.modalContainerColor ?? modalWideNavigationRailTokens.modalContainerColor,
    '--_modal-wide-navigation-rail-content-color':
      options.modalContentColor ?? token.ColorRoleOnSurface,
    '--_modal-wide-navigation-rail-radius':
      options.modalShape ?? modalWideNavigationRailRuntime.modalRadius,
    '--_modal-wide-navigation-rail-box-shadow': getElevationBoxShadow(
      modalWideNavigationRailTokens.modalContainerElevation,
    ),
    '--_modal-wide-navigation-rail-width-duration':
      modalWideNavigationRailRuntime.motion.expandWidth.duration,
    '--_modal-wide-navigation-rail-width-easing':
      modalWideNavigationRailRuntime.motion.expandWidth.easing,
    '--_modal-wide-navigation-rail-slide-duration':
      modalWideNavigationRailRuntime.motion.slide.duration,
    '--_modal-wide-navigation-rail-slide-easing':
      modalWideNavigationRailRuntime.motion.slide.easing,
    '--_modal-wide-navigation-rail-effects-duration':
      modalWideNavigationRailRuntime.motion.effects.duration,
    '--_modal-wide-navigation-rail-effects-easing':
      modalWideNavigationRailRuntime.motion.effects.easing,
  };
}

export function calculateModalWideNavigationRailFraction(
  offset: number,
  width: number,
): number {
  if (!Number.isFinite(width) || width <= 0) return 0;
  return Math.min(1, Math.max(0, 1 + offset / width));
}

export function shouldDismissModalWideNavigationRail(
  offset: number,
  width: number,
): boolean {
  if (!Number.isFinite(width) || width <= 0) return false;
  return -offset >= width * modalWideNavigationRailRuntime.positionalThreshold;
}
