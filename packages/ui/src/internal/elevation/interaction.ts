import { elevationMotionTokens, type ElevationLevel } from './tokens';

export interface ElevationInteractionState {
  readonly isDisabled?: boolean;
  readonly isPressed?: boolean;
  readonly isHovered?: boolean;
  readonly isFocused?: boolean;
}

export interface ElevationLevels {
  readonly default: ElevationLevel;
  readonly hovered?: ElevationLevel;
  readonly focused?: ElevationLevel;
  readonly pressed?: ElevationLevel;
  readonly disabled?: ElevationLevel;
}

export type ElevationInteraction = 'pressed' | 'hovered' | 'focused' | null;

export function resolveElevationInteraction(
  state: ElevationInteractionState,
): ElevationInteraction {
  if (state.isDisabled) return null;
  if (state.isPressed) return 'pressed';
  if (state.isHovered) return 'hovered';
  if (state.isFocused) return 'focused';
  return null;
}

export function resolveElevationLevel(
  levels: ElevationLevels,
  state: ElevationInteractionState,
): ElevationLevel {
  if (state.isDisabled) return levels.disabled ?? levels.default;

  switch (resolveElevationInteraction(state)) {
    case 'pressed':
      return levels.pressed ?? levels.default;
    case 'hovered':
      return levels.hovered ?? levels.default;
    case 'focused':
      return levels.focused ?? levels.default;
    default:
      return levels.default;
  }
}

export function resolveElevationTransition(
  state: ElevationInteractionState,
  interaction: ElevationInteraction,
  previousInteraction: ElevationInteraction,
): string {
  if (state.isDisabled) return 'none';

  if (interaction !== null) {
    const { durationMs, easing } = elevationMotionTokens.incoming;
    return `box-shadow ${durationMs}ms ${easing}`;
  }

  if (previousInteraction === null) return 'none';

  const spec = previousInteraction === 'hovered'
    ? elevationMotionTokens.hoveredOutgoing
    : elevationMotionTokens.outgoing;

  return `box-shadow ${spec.durationMs}ms ${spec.easing}`;
}
