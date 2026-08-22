import {
  endInteraction,
  latestInteraction,
  latestStateLayerInteraction,
  startInteraction,
  type MaterialInteraction,
} from '../../internal/interactions';

export type CardInteraction = MaterialInteraction;

export const startCardInteraction = startInteraction;
export const endCardInteraction = endInteraction;
export const latestCardInteraction = latestInteraction;
export const latestCardStateLayerInteraction = latestStateLayerInteraction;
