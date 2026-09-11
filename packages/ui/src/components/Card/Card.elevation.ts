import * as token from '@m3-ui/tokens';
import type { ElevationLevel, ElevationLevels } from '../../internal/elevation';

export type CardVariant = 'filled' | 'elevated' | 'outlined';

export interface CardElevationTokens extends ElevationLevels {
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
} as const satisfies Record<CardVariant, CardElevationTokens>;
