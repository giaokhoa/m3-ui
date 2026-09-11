import * as token from '@m3-ui/tokens';
import type { CSSProperties } from 'react';
import type { ButtonSize } from './Button.types';

export type ButtonStyle = CSSProperties & Record<`--${string}`, string | number>;
export type ButtonShapeValue = string | number;

export interface ButtonShapes {
  readonly shape: ButtonShapeValue;
  readonly pressedShape: ButtonShapeValue;
}

export interface ButtonStyleOptions {
  readonly shapes?: ButtonShapes;
}

export interface ButtonRuntimeState {
  readonly isDisabled: boolean;
  readonly isPressed: boolean;
}

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

export function getButtonStyle(
  state: ButtonRuntimeState,
  options: ButtonStyleOptions = {},
): ButtonStyle {
  const activeShape = options.shapes
    ? state.isPressed
      ? options.shapes.pressedShape
      : options.shapes.shape
    : null;

  return {
    ...(activeShape === null
      ? {}
      : { '--_button-container-radius': normalizeShapeValue(activeShape) }),
    transition:
      options.shapes !== undefined && !state.isDisabled
        ? buttonShapeTransition
        : 'none',
  };
}
