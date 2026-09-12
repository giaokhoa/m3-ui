import * as token from '@m3-ui/tokens';
import type { CSSProperties } from 'react';
import type { ButtonShapeType, ButtonSize } from './Button.types';

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

const containerShapeBySizeAndType = {
  round: {
    extraSmall: token.ComponentButtonSizeExtraSmallContainerShapeRound,
    small: token.ComponentButtonSizeSmallContainerShapeRound,
    medium: token.ComponentButtonSizeMediumContainerShapeRound,
    large: token.ComponentButtonSizeLargeContainerShapeRound,
    extraLarge: token.ComponentButtonSizeExtraLargeContainerShapeRound,
  },
  square: {
    extraSmall: token.ComponentButtonSizeExtraSmallContainerShapeSquare,
    small: token.ComponentButtonSizeSmallContainerShapeSquare,
    medium: token.ComponentButtonSizeMediumContainerShapeSquare,
    large: token.ComponentButtonSizeLargeContainerShapeSquare,
    extraLarge: token.ComponentButtonSizeExtraLargeContainerShapeSquare,
  },
} as const satisfies Record<ButtonShapeType, Record<ButtonSize, ButtonPressedShape>>;

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

export function buttonShapesForSize(
  size: ButtonSize,
  type: ButtonShapeType = 'round',
): ButtonShapes {
  return {
    shape: shapeRadius[containerShapeBySizeAndType[type][size]],
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
