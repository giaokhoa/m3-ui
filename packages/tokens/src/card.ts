import * as token from '@m3/tokens/generated';
import type { ElevationLevel } from './elevation.js';
import { colorRole, pxNumber } from './value.js';

export type CardVariant = 'filled' | 'elevated' | 'outlined';
export type CardColorRole = string;
export interface CardElevationTokens { readonly default: ElevationLevel; readonly pressed: ElevationLevel; readonly focused: ElevationLevel; readonly hovered: ElevationLevel; readonly dragged: ElevationLevel; readonly disabled: ElevationLevel; }
const elevation = (defaultLevel: ElevationLevel, pressed: ElevationLevel, focused: ElevationLevel, hovered: ElevationLevel, dragged: ElevationLevel, disabled: ElevationLevel): CardElevationTokens => ({ default: defaultLevel, pressed, focused, hovered, dragged, disabled });

export const cardTokens = {
  shapeRadius: pxNumber(token.ComponentCardBaseShapeRadius),
  minimumInteractiveSize: pxNumber(token.ComponentCardBaseMinimumInteractiveSize),
  disabledContentOpacity: token.ComponentCardBaseDisabledContentOpacity,
  filled: {
    containerColor: colorRole(token.ComponentCardVariantFilledContainerColor), contentColor: colorRole(token.ComponentCardVariantFilledContentColor),
    disabledContainerColor: colorRole(token.ComponentCardVariantFilledDisabledContainerColor), disabledContainerOpacity: token.ComponentCardVariantFilledDisabledContainerOpacity, disabledCompositeOver: colorRole(token.ComponentCardVariantFilledDisabledCompositeOver),
    elevation: elevation(token.ComponentCardVariantFilledElevationDefault as ElevationLevel, token.ComponentCardVariantFilledElevationPressed as ElevationLevel, token.ComponentCardVariantFilledElevationFocused as ElevationLevel, token.ComponentCardVariantFilledElevationHovered as ElevationLevel, token.ComponentCardVariantFilledElevationDragged as ElevationLevel, token.ComponentCardVariantFilledElevationDisabled as ElevationLevel),
  },
  elevated: {
    containerColor: colorRole(token.ComponentCardVariantElevatedContainerColor), contentColor: colorRole(token.ComponentCardVariantElevatedContentColor),
    disabledContainerColor: colorRole(token.ComponentCardVariantElevatedDisabledContainerColor), disabledContainerOpacity: token.ComponentCardVariantElevatedDisabledContainerOpacity, disabledCompositeOver: colorRole(token.ComponentCardVariantElevatedDisabledCompositeOver),
    elevation: elevation(token.ComponentCardVariantElevatedElevationDefault as ElevationLevel, token.ComponentCardVariantElevatedElevationPressed as ElevationLevel, token.ComponentCardVariantElevatedElevationFocused as ElevationLevel, token.ComponentCardVariantElevatedElevationHovered as ElevationLevel, token.ComponentCardVariantElevatedElevationDragged as ElevationLevel, token.ComponentCardVariantElevatedElevationDisabled as ElevationLevel),
  },
  outlined: {
    containerColor: colorRole(token.ComponentCardVariantOutlinedContainerColor), contentColor: colorRole(token.ComponentCardVariantOutlinedContentColor),
    disabledContainerColor: colorRole(token.ComponentCardVariantOutlinedDisabledContainerColor), disabledContainerOpacity: token.ComponentCardVariantOutlinedDisabledContainerOpacity, disabledCompositeOver: colorRole(token.ComponentCardVariantOutlinedDisabledCompositeOver),
    outline: { width: pxNumber(token.ComponentCardVariantOutlinedOutlineWidth), color: colorRole(token.ComponentCardVariantOutlinedOutlineColor), disabledColor: colorRole(token.ComponentCardVariantOutlinedOutlineDisabledColor), disabledOpacity: token.ComponentCardVariantOutlinedOutlineDisabledOpacity, disabledCompositeOver: colorRole(token.ComponentCardVariantOutlinedOutlineDisabledCompositeOver) },
    elevation: elevation(token.ComponentCardVariantOutlinedElevationDefault as ElevationLevel, token.ComponentCardVariantOutlinedElevationPressed as ElevationLevel, token.ComponentCardVariantOutlinedElevationFocused as ElevationLevel, token.ComponentCardVariantOutlinedElevationHovered as ElevationLevel, token.ComponentCardVariantOutlinedElevationDragged as ElevationLevel, token.ComponentCardVariantOutlinedElevationDisabled as ElevationLevel),
  },
} as const;
export type CardTokens = typeof cardTokens;
