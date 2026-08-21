export const stateLayerOpacity = {
  dragged: 0.16,
  focus: 0.1,
  hover: 0.08,
  pressed: 0.1,
} as const;

export type StateLayerState = keyof typeof stateLayerOpacity;
