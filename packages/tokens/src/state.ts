import * as token from '@m3/tokens/generated';

export const stateLayerOpacity = {
  dragged: token.StateLayerOpacityDragged,
  focus: token.StateLayerOpacityFocus,
  hover: token.StateLayerOpacityHover,
  pressed: token.StateLayerOpacityPressed,
} as const;

export type StateLayerState = keyof typeof stateLayerOpacity;
