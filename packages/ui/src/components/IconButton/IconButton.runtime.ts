import * as token from '@m3-ui/tokens';
import type { CSSProperties } from 'react';
import type { IconButtonShape, IconButtonSize } from './IconButton.types';

export type IconButtonShapeValue = string | number;

export interface IconButtonShapes {
  readonly shape: IconButtonShapeValue;
  readonly pressedShape: IconButtonShapeValue;
}

export interface IconToggleButtonShapes extends IconButtonShapes {
  readonly selectedShape: IconButtonShapeValue;
}

type IconButtonRuntimeStyle = CSSProperties & Record<`--${string}`, string | number>;

const shapeRadius = {
  full: token.ShapeFull,
  small: token.ShapeSmall,
  medium: token.ShapeMedium,
  large: token.ShapeLarge,
  extraLarge: token.ShapeExtraLarge,
} as const;

type ShapeName = keyof typeof shapeRadius;

const shapesBySize = {
  extraSmall: {
    round: token.ComponentIconButtonSizeXSmallContainerShapeRound,
    square: token.ComponentIconButtonSizeXSmallContainerShapeSquare,
    pressed: token.ComponentIconButtonSizeXSmallPressedContainerShape,
    selectedRound: token.ComponentIconButtonSizeXSmallSelectedContainerShapeRound,
    selectedSquare: token.ComponentIconButtonSizeXSmallSelectedContainerShapeSquare,
  },
  small: {
    round: token.ComponentIconButtonSizeSmallContainerShapeRound,
    square: token.ComponentIconButtonSizeSmallContainerShapeSquare,
    pressed: token.ComponentIconButtonSizeSmallPressedContainerShape,
    selectedRound: token.ComponentIconButtonSizeSmallSelectedContainerShapeRound,
    selectedSquare: token.ComponentIconButtonSizeSmallSelectedContainerShapeSquare,
  },
  medium: {
    round: token.ComponentIconButtonSizeMediumContainerShapeRound,
    square: token.ComponentIconButtonSizeMediumContainerShapeSquare,
    pressed: token.ComponentIconButtonSizeMediumPressedContainerShape,
    selectedRound: token.ComponentIconButtonSizeMediumSelectedContainerShapeRound,
    selectedSquare: token.ComponentIconButtonSizeMediumSelectedContainerShapeSquare,
  },
  large: {
    round: token.ComponentIconButtonSizeLargeContainerShapeRound,
    square: token.ComponentIconButtonSizeLargeContainerShapeSquare,
    pressed: token.ComponentIconButtonSizeLargePressedContainerShape,
    selectedRound: token.ComponentIconButtonSizeLargeSelectedContainerShapeRound,
    selectedSquare: token.ComponentIconButtonSizeLargeSelectedContainerShapeSquare,
  },
  extraLarge: {
    round: token.ComponentIconButtonSizeXLargeContainerShapeRound,
    square: token.ComponentIconButtonSizeXLargeContainerShapeSquare,
    pressed: token.ComponentIconButtonSizeXLargePressedContainerShape,
    selectedRound: token.ComponentIconButtonSizeXLargeSelectedContainerShapeRound,
    selectedSquare: token.ComponentIconButtonSizeXLargeSelectedContainerShapeSquare,
  },
} as const satisfies Record<IconButtonSize, Record<string, string>>;

function radius(name: string): string {
  return shapeRadius[name as ShapeName];
}

function baseShapes(size: IconButtonSize, shape: IconButtonShape) {
  const values = shapesBySize[size];
  return {
    shape: radius(shape === 'round' ? values.round : values.square),
    pressedShape: radius(values.pressed),
    selectedShape: radius(shape === 'round' ? values.selectedRound : values.selectedSquare),
  } as const;
}

export function iconButtonShapesForSize(
  size: IconButtonSize = 'small',
  shape: IconButtonShape = 'round',
): IconButtonShapes {
  const values = baseShapes(size, shape);
  return { shape: values.shape, pressedShape: values.pressedShape };
}

export function iconToggleButtonShapesForSize(
  size: IconButtonSize = 'small',
  shape: IconButtonShape = 'round',
): IconToggleButtonShapes {
  return baseShapes(size, shape);
}

function cssLength(value: IconButtonShapeValue): string | number {
  return typeof value === 'number' ? `${value}px` : value;
}

export function getIconButtonRuntimeStyle(
  state: { readonly isPressed: boolean; readonly isSelected?: boolean },
  shapes?: IconButtonShapes | IconToggleButtonShapes,
): IconButtonRuntimeStyle {
  if (!shapes) return {};

  const selectedShape =
    state.isSelected && 'selectedShape' in shapes ? shapes.selectedShape : shapes.shape;
  const activeShape = state.isPressed ? shapes.pressedShape : selectedShape;

  return {
    '--_icon-button-container-radius': cssLength(activeShape),
  };
}
