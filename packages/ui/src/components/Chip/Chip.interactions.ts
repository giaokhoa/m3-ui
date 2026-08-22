import {
  endInteraction,
  latestInteraction,
  latestStateLayerInteraction,
  startInteraction,
  type MaterialInteraction,
} from '../../internal/interactions';

export type ChipInteraction = MaterialInteraction;

export const startChipInteraction = startInteraction;
export const endChipInteraction = endInteraction;
export const latestChipInteraction = latestInteraction;
export const latestChipStateLayerInteraction = latestStateLayerInteraction;
