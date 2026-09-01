import * as token from '@m3-ui/tokens';
import { pxNumber } from '../../internal/tokenValues';

const iconSize = pxNumber(token.ComponentRadioButtonIconSize);
const padding = pxNumber(token.ComponentRadioButtonPadding);
const stateLayerSize = pxNumber(token.ComponentRadioButtonStateLayerSize);
const minimumInteractiveSize = pxNumber(token.ComponentRadioButtonMinimumInteractiveSize);
const indicationSize = iconSize + padding * 2;

export const radioButtonRippleGeometry = {
  radius: stateLayerSize / 2,
  focusRingInset: (minimumInteractiveSize - indicationSize) / 2,
  focusRingRadius: indicationSize / 2,
} as const;
