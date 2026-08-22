import * as token from '@m3/tokens';
import { colorRole, msNumber, pxNumber } from '../../internal/tokenValues';

export const radioButtonTokens = {
  iconSize: pxNumber(token.ComponentRadioButtonIconSize),
  stateLayerSize: pxNumber(token.ComponentRadioButtonStateLayerSize),
  minimumInteractiveSize: pxNumber(token.ComponentRadioButtonMinimumInteractiveSize),
  padding: pxNumber(token.ComponentRadioButtonPadding),
  strokeWidth: pxNumber(token.ComponentRadioButtonStrokeWidth),
  dotSize: pxNumber(token.ComponentRadioButtonDotSize),
  colors: {
    selected: colorRole(token.ComponentRadioButtonColorsSelected),
    unselected: colorRole(token.ComponentRadioButtonColorsUnselected),
    disabledSelected: colorRole(token.ComponentRadioButtonColorsDisabledSelected),
    disabledUnselected: colorRole(token.ComponentRadioButtonColorsDisabledUnselected),
  },
  disabledOpacity: token.ComponentRadioButtonDisabledOpacity,
  motion: {
    color: {
      durationMs: msNumber(token.ComponentRadioButtonMotionColorDuration),
      easing: token.ComponentRadioButtonMotionColorEasing,
    },
    dot: {
      durationMs: msNumber(token.ComponentRadioButtonMotionDotDuration),
      easing: token.ComponentRadioButtonMotionDotEasing,
    },
  },
} as const;
