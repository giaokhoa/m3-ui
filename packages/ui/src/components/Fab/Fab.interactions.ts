import {
  elevationMotionTokens,
  type ElevationLevel,
} from '../../internal/elevation';
import {
  endInteraction,
  latestInteraction,
  latestStateLayerInteraction,
  startInteraction,
  type MaterialInteraction,
} from '../../internal/interactions';
import { fabElevationTokens } from './Fab.defaults';
import type { FabElevation } from './Fab.types';

export type FabInteraction = MaterialInteraction;

export const startFabInteraction = startInteraction;
export const endFabInteraction = endInteraction;
export const latestFabInteraction = latestInteraction;
export const latestFabStateLayerInteraction = latestStateLayerInteraction;

export function getFabInteractionElevationLevel(
  elevation: FabElevation,
  interaction: FabInteraction | null,
): ElevationLevel {
  const levels = fabElevationTokens[elevation];
  if (interaction === 'press') return levels.pressed;
  if (interaction === 'focus') return levels.focused;
  if (interaction === 'hover') return levels.hovered;
  return levels.default;
}

/**
 * Mirrors Material3 internal animateElevation(from, to): every non-null `to`
 * interaction uses the incoming tween; returning to default uses the outgoing
 * tween for the interaction being left, with a shorter hover-specific exit.
 */
export function getFabElevationMotion(
  interaction: FabInteraction | null,
  previousInteraction: FabInteraction | null,
) {
  if (interaction !== null) return elevationMotionTokens.incoming;
  if (previousInteraction === 'hover') return elevationMotionTokens.hoveredOutgoing;
  if (previousInteraction !== null) return elevationMotionTokens.outgoing;
  return null;
}
