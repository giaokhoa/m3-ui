import type { CSSProperties } from 'react';
import { segmentedButtonRuntime, segmentedButtonTokens } from './SegmentedButton.tokens';

export type SegmentedButtonStyle = CSSProperties &
  Record<`--${string}`, string | number>;

function withOpacity(color: string, opacity: number): string {
  if (opacity >= 1) return color;
  if (opacity <= 0) return 'transparent';
  return `color-mix(in srgb, ${color} ${opacity * 100}%, transparent)`;
}

export const segmentedButtonRowStyle: SegmentedButtonStyle = {
  '--_segmented-button-overlap': segmentedButtonTokens.outlineWidth,
  '--_segmented-button-height': segmentedButtonTokens.containerHeight,
};

export const segmentedButtonStyle: SegmentedButtonStyle = {
  '--_segmented-button-height': segmentedButtonTokens.containerHeight,
  '--_segmented-button-min-width': segmentedButtonTokens.minWidth,
  '--_segmented-button-radius': segmentedButtonTokens.shape,
  '--_segmented-button-outline-width': segmentedButtonTokens.outlineWidth,
  '--_segmented-button-outline-color': segmentedButtonTokens.outlineColor,
  '--_segmented-button-disabled-outline-color': withOpacity(
    segmentedButtonTokens.disabledOutlineColor,
    segmentedButtonTokens.disabledOutlineOpacity,
  ),
  '--_segmented-button-selected-container-color':
    segmentedButtonTokens.selectedContainerColor,
  '--_segmented-button-selected-label-color':
    segmentedButtonTokens.selectedLabelColor,
  '--_segmented-button-selected-hover-label-color':
    segmentedButtonTokens.selectedHoverLabelColor,
  '--_segmented-button-selected-focus-label-color':
    segmentedButtonTokens.selectedFocusLabelColor,
  '--_segmented-button-selected-pressed-label-color':
    segmentedButtonTokens.selectedPressedLabelColor,
  '--_segmented-button-selected-icon-color': segmentedButtonTokens.selectedIconColor,
  '--_segmented-button-selected-hover-icon-color':
    segmentedButtonTokens.selectedHoverIconColor,
  '--_segmented-button-selected-focus-icon-color':
    segmentedButtonTokens.selectedFocusIconColor,
  '--_segmented-button-selected-pressed-icon-color':
    segmentedButtonTokens.selectedPressedIconColor,
  '--_segmented-button-unselected-label-color':
    segmentedButtonTokens.unselectedLabelColor,
  '--_segmented-button-unselected-hover-label-color':
    segmentedButtonTokens.unselectedHoverLabelColor,
  '--_segmented-button-unselected-focus-label-color':
    segmentedButtonTokens.unselectedFocusLabelColor,
  '--_segmented-button-unselected-pressed-label-color':
    segmentedButtonTokens.unselectedPressedLabelColor,
  '--_segmented-button-unselected-icon-color':
    segmentedButtonTokens.unselectedIconColor,
  '--_segmented-button-unselected-hover-icon-color':
    segmentedButtonTokens.unselectedHoverIconColor,
  '--_segmented-button-unselected-focus-icon-color':
    segmentedButtonTokens.unselectedFocusIconColor,
  '--_segmented-button-unselected-pressed-icon-color':
    segmentedButtonTokens.unselectedPressedIconColor,
  '--_segmented-button-disabled-label-color': withOpacity(
    segmentedButtonTokens.disabledLabelColor,
    segmentedButtonTokens.disabledLabelOpacity,
  ),
  '--_segmented-button-disabled-icon-color': withOpacity(
    segmentedButtonTokens.disabledIconColor,
    segmentedButtonTokens.disabledIconOpacity,
  ),
  '--_segmented-button-icon-size': segmentedButtonTokens.iconSize,
  '--_segmented-button-content-padding-inline':
    segmentedButtonRuntime.contentPaddingInline,
  '--_segmented-button-icon-label-spacing': segmentedButtonRuntime.iconLabelSpacing,
  '--_segmented-button-checked-z-index': segmentedButtonRuntime.checkedZIndex,
  '--_segmented-button-interaction-z-index': segmentedButtonRuntime.interactionZIndex,
  '--_segmented-button-content-motion-duration':
    segmentedButtonRuntime.motion.contentDisplacement.duration,
  '--_segmented-button-content-motion-easing':
    segmentedButtonRuntime.motion.contentDisplacement.easing,
  '--_segmented-button-icon-motion-duration':
    segmentedButtonRuntime.motion.iconEffects.duration,
  '--_segmented-button-icon-motion-easing': segmentedButtonRuntime.motion.iconEffects.easing,
  '--_segmented-button-font-family': segmentedButtonTokens.labelTypography.fontFamily,
  '--_segmented-button-font-size': segmentedButtonTokens.labelTypography.fontSize,
  '--_segmented-button-line-height': segmentedButtonTokens.labelTypography.lineHeight,
  '--_segmented-button-font-weight': segmentedButtonTokens.labelTypography.fontWeight,
  '--_segmented-button-letter-spacing':
    segmentedButtonTokens.labelTypography.letterSpacing,
};

export function getSegmentedButtonDisabledColors() {
  return {
    label: withOpacity(
      segmentedButtonTokens.disabledLabelColor,
      segmentedButtonTokens.disabledLabelOpacity,
    ),
    icon: withOpacity(
      segmentedButtonTokens.disabledIconColor,
      segmentedButtonTokens.disabledIconOpacity,
    ),
    outline: withOpacity(
      segmentedButtonTokens.disabledOutlineColor,
      segmentedButtonTokens.disabledOutlineOpacity,
    ),
  } as const;
}
