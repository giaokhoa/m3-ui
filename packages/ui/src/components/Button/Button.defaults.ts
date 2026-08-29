import * as token from '@m3-ui/tokens';
import type { CSSProperties } from 'react';
import {
  elevationMotionTokens,
  type ElevationLevel,
} from '../../internal/elevation';
import type { ButtonInteraction } from './Button.interactions';
import type { ButtonSize, ButtonVariant } from './Button.types';

export type ButtonStyle = CSSProperties & Record<`--${string}`, string | number>;
export type ButtonShapeValue = string | number;

export interface ButtonShapes {
  readonly shape: ButtonShapeValue;
  readonly pressedShape: ButtonShapeValue;
}

export interface ButtonStyleOptions {
  /** Static size values are applied by generated CSS through `data-size`. */
  readonly size?: ButtonSize;
  readonly shapes?: ButtonShapes;
}

export interface ButtonInteractionState {
  readonly isDisabled: boolean;
  readonly interaction: ButtonInteraction | null;
  readonly previousInteraction?: ButtonInteraction | null;
}

interface ButtonElevationTokens {
  readonly defaultElevation: ElevationLevel;
  readonly hoveredElevation: ElevationLevel;
  readonly focusedElevation: ElevationLevel;
  readonly pressedElevation: ElevationLevel;
  readonly disabledElevation: ElevationLevel;
}

const buttonElevationTokens = {
  filled: {
    defaultElevation: token.ComponentButtonVariantFilledDefaultElevation,
    hoveredElevation: token.ComponentButtonVariantFilledHoveredElevation,
    focusedElevation: token.ComponentButtonVariantFilledFocusedElevation,
    pressedElevation: token.ComponentButtonVariantFilledPressedElevation,
    disabledElevation: token.ComponentButtonVariantFilledDisabledElevation,
  },
  elevated: {
    defaultElevation: token.ComponentButtonVariantElevatedDefaultElevation,
    hoveredElevation: token.ComponentButtonVariantElevatedHoveredElevation,
    focusedElevation: token.ComponentButtonVariantElevatedFocusedElevation,
    pressedElevation: token.ComponentButtonVariantElevatedPressedElevation,
    disabledElevation: token.ComponentButtonVariantElevatedDisabledElevation,
  },
  filledTonal: {
    defaultElevation: token.ComponentButtonVariantFilledTonalDefaultElevation,
    hoveredElevation: token.ComponentButtonVariantFilledTonalHoveredElevation,
    focusedElevation: token.ComponentButtonVariantFilledTonalFocusedElevation,
    pressedElevation: token.ComponentButtonVariantFilledTonalPressedElevation,
    disabledElevation: token.ComponentButtonVariantFilledTonalDisabledElevation,
  },
  outlined: {
    defaultElevation: token.ComponentButtonVariantOutlinedDefaultElevation,
    hoveredElevation: token.ComponentButtonVariantOutlinedHoveredElevation,
    focusedElevation: token.ComponentButtonVariantOutlinedFocusedElevation,
    pressedElevation: token.ComponentButtonVariantOutlinedPressedElevation,
    disabledElevation: token.ComponentButtonVariantOutlinedDisabledElevation,
  },
  text: {
    defaultElevation: token.ComponentButtonVariantTextDefaultElevation,
    hoveredElevation: token.ComponentButtonVariantTextHoveredElevation,
    focusedElevation: token.ComponentButtonVariantTextFocusedElevation,
    pressedElevation: token.ComponentButtonVariantTextPressedElevation,
    disabledElevation: token.ComponentButtonVariantTextDisabledElevation,
  },
} as const satisfies Record<ButtonVariant, ButtonElevationTokens>;

const shapeRadius = {
  full: token.ShapeFull,
  small: token.ShapeSmall,
  medium: token.ShapeMedium,
  large: token.ShapeLarge,
  extraLarge: token.ShapeExtraLarge,
} as const;

type ButtonPressedShape = keyof typeof shapeRadius;

const pressedShapeBySize = {
  extraSmall: token.ComponentButtonSizeExtraSmallPressedShape,
  small: token.ComponentButtonSizeSmallPressedShape,
  medium: token.ComponentButtonSizeMediumPressedShape,
  large: token.ComponentButtonSizeLargePressedShape,
  extraLarge: token.ComponentButtonSizeExtraLargePressedShape,
} as const satisfies Record<ButtonSize, ButtonPressedShape>;

const buttonShapeTransition =
  `border-radius ${token.MotionSpringDefaultEffectsDuration} ${token.MotionSpringDefaultEffectsEasing}`;

function normalizeShapeValue(value: ButtonShapeValue): string | number {
  return typeof value === 'number' ? `${value}px` : value;
}

export function buttonShapesForSize(size: ButtonSize): ButtonShapes {
  return {
    shape: token.ShapeFull,
    pressedShape: shapeRadius[pressedShapeBySize[size]],
  };
}

export function resolveButtonElevation(
  variant: ButtonVariant,
  { isDisabled, interaction }: ButtonInteractionState,
): ElevationLevel {
  const tokens = buttonElevationTokens[variant];
  if (isDisabled) return tokens.disabledElevation;
  switch (interaction) {
    case 'press': return tokens.pressedElevation;
    case 'hover': return tokens.hoveredElevation;
    case 'focus': return tokens.focusedElevation;
    default: return tokens.defaultElevation;
  }
}

export function resolveButtonElevationTransition({
  isDisabled,
  interaction,
  previousInteraction = null,
}: ButtonInteractionState): string {
  if (isDisabled) return 'none';
  if (interaction !== null) {
    const { durationMs, easing } = elevationMotionTokens.incoming;
    return `box-shadow ${durationMs}ms ${easing}`;
  }
  if (previousInteraction === null) return 'none';
  const spec = previousInteraction === 'hover'
    ? elevationMotionTokens.hoveredOutgoing
    : elevationMotionTokens.outgoing;
  return `box-shadow ${spec.durationMs}ms ${spec.easing}`;
}

function resolveButtonShapeTransition(
  state: ButtonInteractionState,
  hasAnimatedShape: boolean,
): string {
  return hasAnimatedShape && !state.isDisabled ? buttonShapeTransition : 'none';
}

export function getButtonStyle(
  _variant: ButtonVariant,
  state: ButtonInteractionState,
  options: ButtonStyleOptions = {},
): ButtonStyle {
  const activeShape = options.shapes
    ? state.interaction === 'press'
      ? options.shapes.pressedShape
      : options.shapes.shape
    : null;

  return {
    ...(activeShape === null
      ? {}
      : { '--_button-container-radius': normalizeShapeValue(activeShape) }),
    transition: resolveButtonShapeTransition(
      state,
      options.shapes !== undefined,
    ),
  };
}
