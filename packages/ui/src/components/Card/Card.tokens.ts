import * as token from '@m3/tokens';
import type { ElevationLevel } from '../../internal/elevation';
import { pxNumber } from '../../internal/tokenValues';

export type CardVariant = 'filled' | 'elevated' | 'outlined';

export interface CardElevationTokens {
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
): CardElevationTokens => ({ default: defaultLevel, pressed, focused, hovered, dragged, disabled });

export const cardTokens = {
  shapeRadius: pxNumber(token.ComponentCardBaseShapeRadius),
  minimumInteractiveSize: pxNumber(token.ComponentCardBaseMinimumInteractiveSize),
  disabledContentColor: token.ComponentCardBaseDisabledContentColor,
  disabledContentOpacity: token.ComponentCardBaseDisabledContentOpacity,
  filled: {
    containerColor: token.ComponentCardVariantFilledContainerColor,
    contentColor: token.ComponentCardVariantFilledContentColor,
    disabledContainerColor: token.ComponentCardVariantFilledDisabledContainerColor,
    disabledContainerOpacity: token.ComponentCardVariantFilledDisabledContainerOpacity,
    disabledCompositeOver: token.ComponentCardVariantFilledDisabledCompositeOver,
    elevation: elevation(
      token.ComponentCardVariantFilledElevationDefault as ElevationLevel,
      token.ComponentCardVariantFilledElevationPressed as ElevationLevel,
      token.ComponentCardVariantFilledElevationFocused as ElevationLevel,
      token.ComponentCardVariantFilledElevationHovered as ElevationLevel,
      token.ComponentCardVariantFilledElevationDragged as ElevationLevel,
      token.ComponentCardVariantFilledElevationDisabled as ElevationLevel,
    ),
  },
  elevated: {
    containerColor: token.ComponentCardVariantElevatedContainerColor,
    contentColor: token.ComponentCardVariantElevatedContentColor,
    disabledContainerColor: token.ComponentCardVariantElevatedDisabledContainerColor,
    disabledContainerOpacity: token.ComponentCardVariantElevatedDisabledContainerOpacity,
    disabledCompositeOver: token.ComponentCardVariantElevatedDisabledCompositeOver,
    elevation: elevation(
      token.ComponentCardVariantElevatedElevationDefault as ElevationLevel,
      token.ComponentCardVariantElevatedElevationPressed as ElevationLevel,
      token.ComponentCardVariantElevatedElevationFocused as ElevationLevel,
      token.ComponentCardVariantElevatedElevationHovered as ElevationLevel,
      token.ComponentCardVariantElevatedElevationDragged as ElevationLevel,
      token.ComponentCardVariantElevatedElevationDisabled as ElevationLevel,
    ),
  },
  outlined: {
    containerColor: token.ComponentCardVariantOutlinedContainerColor,
    contentColor: token.ComponentCardVariantOutlinedContentColor,
    disabledContainerColor: token.ComponentCardVariantOutlinedDisabledContainerColor,
    disabledContainerOpacity: token.ComponentCardVariantOutlinedDisabledContainerOpacity,
    disabledCompositeOver: token.ComponentCardVariantOutlinedDisabledCompositeOver,
    outline: {
      width: pxNumber(token.ComponentCardVariantOutlinedOutlineWidth),
      color: token.ComponentCardVariantOutlinedOutlineColor,
      disabledColor: token.ComponentCardVariantOutlinedOutlineDisabledColor,
      disabledOpacity: token.ComponentCardVariantOutlinedOutlineDisabledOpacity,
      disabledCompositeOver: token.ComponentCardVariantOutlinedOutlineDisabledCompositeOver,
    },
    elevation: elevation(
      token.ComponentCardVariantOutlinedElevationDefault as ElevationLevel,
      token.ComponentCardVariantOutlinedElevationPressed as ElevationLevel,
      token.ComponentCardVariantOutlinedElevationFocused as ElevationLevel,
      token.ComponentCardVariantOutlinedElevationHovered as ElevationLevel,
      token.ComponentCardVariantOutlinedElevationDragged as ElevationLevel,
      token.ComponentCardVariantOutlinedElevationDisabled as ElevationLevel,
    ),
  },
} as const;
