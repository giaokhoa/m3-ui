import type { CSSProperties } from 'react';

export type ModalWideNavigationRailStyle = CSSProperties & Record<`--${string}`, string | number>;
export interface ModalWideNavigationRailStyleOptions {
  modalContainerColor?: CSSProperties['backgroundColor'];
  modalContentColor?: CSSProperties['color'];
  modalShape?: CSSProperties['borderRadius'];
}

/** JS requires these durations to delay overlay unmount until CSS motion completes. */
export const modalWideNavigationRailRuntime = {
  positionalThreshold: 0.5,
  activationThreshold: 0.3,
  dragSlop: 4,
  motion: {
    expandWidth: { duration: '137ms' },
    slide: { duration: '194ms' },
    effects: { duration: '166ms' },
  },
} as const;

export function getModalWideNavigationRailStyle(
  options: ModalWideNavigationRailStyleOptions = {},
): ModalWideNavigationRailStyle {
  return {
    ...(options.modalContainerColor !== undefined ? { '--_modal-wide-navigation-rail-container-color': options.modalContainerColor } : {}),
    ...(options.modalContentColor !== undefined ? { '--_modal-wide-navigation-rail-content-color': options.modalContentColor } : {}),
    ...(options.modalShape !== undefined ? { '--_modal-wide-navigation-rail-radius': options.modalShape } : {}),
  };
}

export function calculateModalWideNavigationRailFraction(offset: number, width: number): number {
  if (!Number.isFinite(width) || width <= 0) return 0;
  return Math.min(1, Math.max(0, 1 + offset / width));
}

export function shouldDismissModalWideNavigationRail(offset: number, width: number): boolean {
  if (!Number.isFinite(width) || width <= 0) return false;
  return -offset >= width * modalWideNavigationRailRuntime.positionalThreshold;
}
