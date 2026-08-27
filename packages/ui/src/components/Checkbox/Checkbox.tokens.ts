import * as token from '@m3-ui/tokens';
import { msNumber, pxNumber } from '../../internal/tokenValues';

export const checkboxTokens = {
  containerSize: pxNumber(token.ComponentCheckboxContainerSize),
  containerRadius: pxNumber(token.ComponentCheckboxContainerRadius),
  stateLayerSize: pxNumber(token.ComponentCheckboxStateLayerSize),
  minimumInteractiveSize: pxNumber(token.ComponentCheckboxMinimumInteractiveSize),
  strokeWidth: pxNumber(token.ComponentCheckboxStrokeWidth),
  labelColor: token.ColorRoleOnSurface,
  selectedContainerColor: token.ComponentCheckboxColorsSelectedContainer,
  selectedIconColor: token.ComponentCheckboxColorsSelectedIcon,
  unselectedOutlineColor: token.ComponentCheckboxColorsUnselectedOutline,
  selectedDisabledContainerColor: token.ComponentCheckboxColorsDisabledSelectedContainer,
  selectedDisabledContainerOpacity: token.ComponentCheckboxDisabledOpacitySelectedContainer,
  selectedDisabledIconColor: token.ComponentCheckboxColorsDisabledSelectedIcon,
  unselectedDisabledOutlineColor: token.ComponentCheckboxColorsDisabledUnselectedOutline,
  unselectedDisabledOutlineOpacity: token.ComponentCheckboxDisabledOpacityUnselectedOutline,
  disabledLabelOpacity: token.StateDisabledContentOpacity,
  checkPath: {
    leftX: token.ComponentCheckboxMarkCheckPathLeftX,
    leftY: token.ComponentCheckboxMarkCheckPathLeftY,
    crossX: token.ComponentCheckboxMarkCheckPathCrossX,
    crossY: token.ComponentCheckboxMarkCheckPathCrossY,
    rightX: token.ComponentCheckboxMarkCheckPathRightX,
    rightY: token.ComponentCheckboxMarkCheckPathRightY,
  },
  motion: {
    defaultEffects: {
      durationMs: msNumber(token.ComponentCheckboxMotionBoxInDuration),
      easing: token.ComponentCheckboxMotionBoxInEasing,
    },
    fastEffects: {
      durationMs: msNumber(token.ComponentCheckboxMotionBoxOutDuration),
      easing: token.ComponentCheckboxMotionBoxOutEasing,
    },
    defaultSpatial: {
      durationMs: msNumber(token.ComponentCheckboxMotionMarkDuration),
      easing: token.ComponentCheckboxMotionMarkEasing,
    },
    snapDelayMs: msNumber(token.ComponentCheckboxMotionMarkOutDelay),
  },
} as const;
