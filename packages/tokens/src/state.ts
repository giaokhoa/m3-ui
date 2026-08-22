import { stateTokensGenerated } from './generated/androidx/state.js';

export const stateLayerOpacity = {
  dragged: stateTokensGenerated.draggedStateLayerOpacity,
  focus: stateTokensGenerated.focusStateLayerOpacity,
  hover: stateTokensGenerated.hoverStateLayerOpacity,
  pressed: stateTokensGenerated.pressedStateLayerOpacity,
} as const;

export type StateLayerState = keyof typeof stateLayerOpacity;
