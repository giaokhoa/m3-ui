import * as token from '@m3-ui/tokens';
import type { ElevationLevels } from '../../internal/elevation';
import type { ButtonVariant } from './Button.types';

export const buttonElevationLevels = {
  filled: {
    default: token.ComponentButtonVariantFilledDefaultElevation,
    hovered: token.ComponentButtonVariantFilledHoveredElevation,
    focused: token.ComponentButtonVariantFilledFocusedElevation,
    pressed: token.ComponentButtonVariantFilledPressedElevation,
    disabled: token.ComponentButtonVariantFilledDisabledElevation,
  },
  elevated: {
    default: token.ComponentButtonVariantElevatedDefaultElevation,
    hovered: token.ComponentButtonVariantElevatedHoveredElevation,
    focused: token.ComponentButtonVariantElevatedFocusedElevation,
    pressed: token.ComponentButtonVariantElevatedPressedElevation,
    disabled: token.ComponentButtonVariantElevatedDisabledElevation,
  },
  filledTonal: {
    default: token.ComponentButtonVariantFilledTonalDefaultElevation,
    hovered: token.ComponentButtonVariantFilledTonalHoveredElevation,
    focused: token.ComponentButtonVariantFilledTonalFocusedElevation,
    pressed: token.ComponentButtonVariantFilledTonalPressedElevation,
    disabled: token.ComponentButtonVariantFilledTonalDisabledElevation,
  },
  outlined: {
    default: token.ComponentButtonVariantOutlinedDefaultElevation,
    hovered: token.ComponentButtonVariantOutlinedHoveredElevation,
    focused: token.ComponentButtonVariantOutlinedFocusedElevation,
    pressed: token.ComponentButtonVariantOutlinedPressedElevation,
    disabled: token.ComponentButtonVariantOutlinedDisabledElevation,
  },
  text: {
    default: token.ComponentButtonVariantTextDefaultElevation,
    hovered: token.ComponentButtonVariantTextHoveredElevation,
    focused: token.ComponentButtonVariantTextFocusedElevation,
    pressed: token.ComponentButtonVariantTextPressedElevation,
    disabled: token.ComponentButtonVariantTextDisabledElevation,
  },
} as const satisfies Record<ButtonVariant, ElevationLevels>;
