import * as token from '@m3/tokens';
import { msNumber, pxNumber } from '../../internal/tokenValues';

export const radioButtonTokens = {
  iconSize: pxNumber(token.ComponentRadioButtonIconSize),
  stateLayerSize: pxNumber(token.ComponentRadioButtonStateLayerSize),
  minimumInteractiveSize: pxNumber(token.ComponentRadioButtonMinimumInteractiveSize),
  padding: pxNumber(token.ComponentRadioButtonPadding),
  strokeWidth: pxNumber(token.ComponentRadioButtonStrokeWidth),
  dotSize: pxNumber(token.ComponentRadioButtonDotSize),
  colors: {
    selected: token.ComponentRadioButtonColorsSelected,
    unselected: token.ComponentRadioButtonColorsUnselected,
    disabledSelected: token.ComponentRadioButtonColorsDisabledSelected,
    disabledUnselected: token.ComponentRadioButtonColorsDisabledUnselected,
  },
  disabledOpacity: token.ComponentRadioButtonDisabledOpacity,
  disabledLabelOpacity: token.StateDisabledContentOpacity,
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
