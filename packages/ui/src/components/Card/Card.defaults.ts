import { elevationMotionTokens, type ElevationLevel } from '../../internal/elevation';
import type { CSSProperties } from 'react';
import type { CardInteraction } from './Card.interactions';
import {
  cardTokens,
  type CardElevationTokens,
  type CardVariant,
} from './Card.tokens';

export type CardStyle = CSSProperties & Record<`--${string}`, string | number>;

function cssLength(value: CSSProperties['borderRadius']): string | number | undefined {
  return typeof value === 'number' ? `${value}px` : value;
}

function disabledContainer(
  color: string,
  opacity: number,
  compositeOver: string,
): string {
  if (opacity === 1) return color;
  return `color-mix(in srgb, ${color} ${opacity * 100}%, ${compositeOver})`;
}

function elevationFor(variant: CardVariant): CardElevationTokens {
  switch (variant) {
    case 'filled':
      return cardTokens.filled.elevation;
    case 'elevated':
      return cardTokens.elevated.elevation;
    case 'outlined':
      return cardTokens.outlined.elevation;
  }
}

export function getCardElevationLevel(
  variant: CardVariant,
  isDisabled: boolean,
  interaction: CardInteraction | null,
): ElevationLevel {
  const elevation = elevationFor(variant);
  if (isDisabled) return elevation.disabled;

  switch (interaction) {
    case 'press': return elevation.pressed;
    case 'focus': return elevation.focused;
    case 'hover': return elevation.hovered;
    default: return elevation.default;
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

export function getCardStyle(
  variant: CardVariant,
  { isDisabled = false, shape }: { isDisabled?: boolean; shape?: CSSProperties['borderRadius'] } = {},
): CardStyle {
  const base: CardStyle = {
    '--_card-container-radius': cssLength(shape) ?? `${cardTokens.shapeRadius}px`,
    '--_card-min-interactive-size': `${cardTokens.minimumInteractiveSize}px`,
    '--_card-disabled-content-color': `color-mix(in srgb, ${cardTokens.disabledContentColor} ${cardTokens.disabledContentOpacity * 100}%, transparent)`,
  };

  if (variant === 'filled') {
    return {
      ...base,
      '--_card-container-color': cardTokens.filled.containerColor,
      '--_card-content-color': cardTokens.filled.contentColor,
      '--_card-disabled-container-color': disabledContainer(
        cardTokens.filled.disabledContainerColor,
        cardTokens.filled.disabledContainerOpacity,
        cardTokens.filled.disabledCompositeOver,
      ),
      '--_card-outline-width': '0px',
      '--_card-outline-color': 'transparent',
      '--_card-disabled-outline-color': 'transparent',
    };
  }

  if (variant === 'elevated') {
    return {
      ...base,
      '--_card-container-color': cardTokens.elevated.containerColor,
      '--_card-content-color': cardTokens.elevated.contentColor,
      '--_card-disabled-container-color': disabledContainer(
        cardTokens.elevated.disabledContainerColor,
        cardTokens.elevated.disabledContainerOpacity,
        cardTokens.elevated.disabledCompositeOver,
      ),
      '--_card-outline-width': '0px',
      '--_card-outline-color': 'transparent',
      '--_card-disabled-outline-color': 'transparent',
    };
  }

  return {
    ...base,
    '--_card-container-color': cardTokens.outlined.containerColor,
    '--_card-content-color': cardTokens.outlined.contentColor,
    '--_card-disabled-container-color': disabledContainer(
      cardTokens.outlined.disabledContainerColor,
      cardTokens.outlined.disabledContainerOpacity,
      cardTokens.outlined.disabledCompositeOver,
    ),
    '--_card-outline-width': `${cardTokens.outlined.outline.width}px`,
    '--_card-outline-color': cardTokens.outlined.outline.color,
    '--_card-disabled-outline-color': `color-mix(in srgb, ${cardTokens.outlined.outline.disabledColor} ${cardTokens.outlined.outline.disabledOpacity * 100}%, ${cardTokens.outlined.outline.disabledCompositeOver})`,
  };
}
