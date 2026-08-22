import {
  endInteraction,
  latestInteraction,
  latestStateLayerInteraction,
  startInteraction,
  type MaterialInteraction,
  type MaterialStateLayerInteraction,
} from '../../internal/interactions';

export type ButtonInteraction = MaterialInteraction;
export type ButtonStateLayerInteraction = MaterialStateLayerInteraction;

export const startButtonInteraction = startInteraction;
export const endButtonInteraction = endInteraction;
export const latestButtonInteraction = latestInteraction;
export const latestButtonStateLayerInteraction = latestStateLayerInteraction;
