import * as token from '@m3/tokens/generated';
import { colorRole, msNumber, pxNumber } from './value.js';

export type CheckboxColorRole = string;
export const checkboxTokens = {
  containerSize: pxNumber(token.ComponentCheckboxContainerSize), containerRadius: pxNumber(token.ComponentCheckboxContainerRadius), stateLayerSize: pxNumber(token.ComponentCheckboxStateLayerSize), minimumInteractiveSize: pxNumber(token.ComponentCheckboxMinimumInteractiveSize), strokeWidth: pxNumber(token.ComponentCheckboxStrokeWidth),
  selectedContainerColor: colorRole(token.ComponentCheckboxColorsSelectedContainer), selectedIconColor: colorRole(token.ComponentCheckboxColorsSelectedIcon), unselectedOutlineColor: colorRole(token.ComponentCheckboxColorsUnselectedOutline),
  selectedDisabledContainerColor: colorRole(token.ComponentCheckboxColorsDisabledSelectedContainer), selectedDisabledContainerOpacity: token.ComponentCheckboxDisabledOpacitySelectedContainer, selectedDisabledIconColor: colorRole(token.ComponentCheckboxColorsDisabledSelectedIcon), unselectedDisabledOutlineColor: colorRole(token.ComponentCheckboxColorsDisabledUnselectedOutline), unselectedDisabledOutlineOpacity: token.ComponentCheckboxDisabledOpacityUnselectedOutline,
  checkPath: { leftX: token.ComponentCheckboxMarkCheckPathLeftX, leftY: token.ComponentCheckboxMarkCheckPathLeftY, crossX: token.ComponentCheckboxMarkCheckPathCrossX, crossY: token.ComponentCheckboxMarkCheckPathCrossY, rightX: token.ComponentCheckboxMarkCheckPathRightX, rightY: token.ComponentCheckboxMarkCheckPathRightY },
  motion: {
    defaultEffects: { durationMs: msNumber(token.ComponentCheckboxMotionBoxInDuration), easing: token.ComponentCheckboxMotionBoxInEasing },
    fastEffects: { durationMs: msNumber(token.ComponentCheckboxMotionBoxOutDuration), easing: token.ComponentCheckboxMotionBoxOutEasing },
    defaultSpatial: { durationMs: msNumber(token.ComponentCheckboxMotionMarkDuration), easing: token.ComponentCheckboxMotionMarkEasing },
    snapDelayMs: msNumber(token.ComponentCheckboxMotionMarkOutDelay),
  },
} as const;
export type CheckboxTokens = typeof checkboxTokens;
