import * as token from '@m3-ui/tokens';
import { elevationMotionTokens, type ElevationLevel } from '../../internal/elevation';
import type { CardInteraction } from './Card.interactions';

export type CardVariant = 'filled' | 'elevated' | 'outlined';

interface CardElevationTokens {
  readonly default: ElevationLevel;
  readonly pressed: ElevationLevel;
  readonly focused: ElevationLevel;
  readonly hovered: ElevationLevel;
  readonly dragged: ElevationLevel;
  readonly disabled: ElevationLevel;
}

const elevation = (
  defaultLevel: ElevationLevel,
  pressed: ElevationLevel,
  focused: ElevationLevel,
  hovered: ElevationLevel,
  dragged: ElevationLevel,
  disabled: ElevationLevel,
): CardElevationTokens => ({
  default: defaultLevel,
  pressed,
  focused,
  hovered,
  dragged,
  disabled,
});

export const cardElevationTokens = {
  filled: elevation(
    token.ComponentCardVariantFilledElevationDefault as ElevationLevel,
    token.ComponentCardVariantFilledElevationPressed as ElevationLevel,
    token.ComponentCardVariantFilledElevationFocused as ElevationLevel,
    token.ComponentCardVariantFilledElevationHovered as ElevationLevel,
    token.ComponentCardVariantFilledElevationDragged as ElevationLevel,
    token.ComponentCardVariantFilledElevationDisabled as ElevationLevel,
  ),
  elevated: elevation(
    token.ComponentCardVariantElevatedElevationDefault as ElevationLevel,
    token.ComponentCardVariantElevatedElevationPressed as ElevationLevel,
    token.ComponentCardVariantElevatedElevationFocused as ElevationLevel,
    token.ComponentCardVariantElevatedElevationHovered as ElevationLevel,
    token.ComponentCardVariantElevatedElevationDragged as ElevationLevel,
    token.ComponentCardVariantElevatedElevationDisabled as ElevationLevel,
  ),
  outlined: elevation(
    token.ComponentCardVariantOutlinedElevationDefault as ElevationLevel,
    token.ComponentCardVariantOutlinedElevationPressed as ElevationLevel,
    token.ComponentCardVariantOutlinedElevationFocused as ElevationLevel,
    token.ComponentCardVariantOutlinedElevationHovered as ElevationLevel,
    token.ComponentCardVariantOutlinedElevationDragged as ElevationLevel,
    token.ComponentCardVariantOutlinedElevationDisabled as ElevationLevel,
  ),
} as const;

function elevationFor(variant: CardVariant): CardElevationTokens {
  return cardElevationTokens[variant];
}

export function getCardElevationLevel(
  variant: CardVariant,
  isDisabled: boolean,
  interaction: CardInteraction | null,
): ElevationLevel {
  const levels = elevationFor(variant);
  if (isDisabled) return levels.disabled;

  switch (interaction) {
    case 'press':
      return levels.pressed;
    case 'focus':
      return levels.focused;
    case 'hover':
      return levels.hovered;
    default:
      return levels.default;
  }
}

export function getCardElevationMotion(
  isDisabled: boolean,
  interaction: CardInteraction | null,
  previousInteraction: CardInteraction | null,
) {
  if (isDisabled) return { durationMs: 0, easing: 'linear' } as const;
  if (interaction !== null) return elevationMotionTokens.incoming;
  if (previousInteraction === 'hover') return elevationMotionTokens.hoveredOutgoing;
  if (previousInteraction !== null) return elevationMotionTokens.outgoing;
  return { durationMs: 0, easing: 'linear' } as const;
}
