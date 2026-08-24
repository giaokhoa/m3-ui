import * as token from '@m3/tokens';
import type { CSSProperties } from 'react';
import { pxNumber } from '../../internal/tokenValues';
import type { IconButtonShape, IconButtonSize, IconButtonVariant, IconButtonWidth } from './IconButton.types';

export type IconButtonStyle = CSSProperties & Record<`--${string}`, string | number>;
export type IconButtonShapeValue = string | number;

export interface IconButtonShapes {
  readonly shape: IconButtonShapeValue;
  readonly pressedShape: IconButtonShapeValue;
}

export interface IconToggleButtonShapes extends IconButtonShapes {
  readonly selectedShape: IconButtonShapeValue;
}

export interface IconButtonStyleState {
  readonly isDisabled: boolean;
  readonly isPressed: boolean;
  readonly isSelected?: boolean;
}

export interface IconButtonStyleOptions {
  readonly size?: IconButtonSize;
  readonly width?: IconButtonWidth;
  readonly shape?: IconButtonShape;
  readonly shapes?: IconButtonShapes | IconToggleButtonShapes;
}

interface SizeTokens {
  readonly height: number;
  readonly iconSize: number;
  readonly narrowSpace: number;
  readonly defaultSpace: number;
  readonly wideSpace: number;
  readonly outlineWidth: number;
  readonly roundShape: keyof typeof shapeRadius;
  readonly squareShape: keyof typeof shapeRadius;
  readonly pressedShape: keyof typeof shapeRadius;
  readonly selectedRoundShape: keyof typeof shapeRadius;
  readonly selectedSquareShape: keyof typeof shapeRadius;
}

interface VariantTokens {
  readonly containerColor: string;
  readonly contentColor: string;
  readonly disabledContainerColor: string;
  readonly disabledContainerOpacity: number;
  readonly disabledContentColor: string;
  readonly disabledContentOpacity: number;
  readonly outlineColor: string;
  readonly disabledOutlineColor: string;
  readonly selectedContainerColor: string;
  readonly selectedContentColor: string;
  readonly unselectedContainerColor: string;
  readonly unselectedContentColor: string;
  readonly selectedDisabledContainerColor: string;
  readonly selectedDisabledContainerOpacity: number;
}

const shapeRadius = {
  full: token.ShapeFull,
  small: token.ShapeSmall,
  medium: token.ShapeMedium,
  large: token.ShapeLarge,
  extraLarge: token.ShapeExtraLarge,
} as const;

type ShapeName = keyof typeof shapeRadius;

function sizeTokens(
  height: string,
  iconSize: string,
  narrowSpace: string,
  defaultSpace: string,
  wideSpace: string,
  outlineWidth: string,
  roundShape: string,
  squareShape: string,
  pressedShape: string,
  selectedRoundShape: string,
  selectedSquareShape: string,
): SizeTokens {
  return {
    height: pxNumber(height),
    iconSize: pxNumber(iconSize),
    narrowSpace: pxNumber(narrowSpace),
    defaultSpace: pxNumber(defaultSpace),
    wideSpace: pxNumber(wideSpace),
    outlineWidth: pxNumber(outlineWidth),
    roundShape: roundShape as ShapeName,
    squareShape: squareShape as ShapeName,
    pressedShape: pressedShape as ShapeName,
    selectedRoundShape: selectedRoundShape as ShapeName,
    selectedSquareShape: selectedSquareShape as ShapeName,
  };
}

export const iconButtonSizeTokens = {
  extraSmall: sizeTokens(
    token.ComponentIconButtonSizeXSmallContainerHeight,
    token.ComponentIconButtonSizeXSmallIconSize,
    token.ComponentIconButtonSizeXSmallNarrowLeadingSpace,
    token.ComponentIconButtonSizeXSmallDefaultLeadingSpace,
    token.ComponentIconButtonSizeXSmallWideLeadingSpace,
    token.ComponentIconButtonSizeXSmallOutlinedOutlineWidth,
    token.ComponentIconButtonSizeXSmallContainerShapeRound,
    token.ComponentIconButtonSizeXSmallContainerShapeSquare,
    token.ComponentIconButtonSizeXSmallPressedContainerShape,
    token.ComponentIconButtonSizeXSmallSelectedContainerShapeRound,
    token.ComponentIconButtonSizeXSmallSelectedContainerShapeSquare,
  ),
  small: sizeTokens(
    token.ComponentIconButtonSizeSmallContainerHeight,
    token.ComponentIconButtonSizeSmallIconSize,
    token.ComponentIconButtonSizeSmallNarrowLeadingSpace,
    token.ComponentIconButtonSizeSmallDefaultLeadingSpace,
    token.ComponentIconButtonSizeSmallWideLeadingSpace,
    token.ComponentIconButtonSizeSmallOutlinedOutlineWidth,
    token.ComponentIconButtonSizeSmallContainerShapeRound,
    token.ComponentIconButtonSizeSmallContainerShapeSquare,
    token.ComponentIconButtonSizeSmallPressedContainerShape,
    token.ComponentIconButtonSizeSmallSelectedContainerShapeRound,
    token.ComponentIconButtonSizeSmallSelectedContainerShapeSquare,
  ),
  medium: sizeTokens(
    token.ComponentIconButtonSizeMediumContainerHeight,
    token.ComponentIconButtonSizeMediumIconSize,
    token.ComponentIconButtonSizeMediumNarrowLeadingSpace,
    token.ComponentIconButtonSizeMediumDefaultLeadingSpace,
    token.ComponentIconButtonSizeMediumWideLeadingSpace,
    token.ComponentIconButtonSizeMediumOutlinedOutlineWidth,
    token.ComponentIconButtonSizeMediumContainerShapeRound,
    token.ComponentIconButtonSizeMediumContainerShapeSquare,
    token.ComponentIconButtonSizeMediumPressedContainerShape,
    token.ComponentIconButtonSizeMediumSelectedContainerShapeRound,
    token.ComponentIconButtonSizeMediumSelectedContainerShapeSquare,
  ),
  large: sizeTokens(
    token.ComponentIconButtonSizeLargeContainerHeight,
    token.ComponentIconButtonSizeLargeIconSize,
    token.ComponentIconButtonSizeLargeNarrowLeadingSpace,
    token.ComponentIconButtonSizeLargeUniformLeadingSpace,
    token.ComponentIconButtonSizeLargeWideLeadingSpace,
    token.ComponentIconButtonSizeLargeOutlinedOutlineWidth,
    token.ComponentIconButtonSizeLargeContainerShapeRound,
    token.ComponentIconButtonSizeLargeContainerShapeSquare,
    token.ComponentIconButtonSizeLargePressedContainerShape,
    token.ComponentIconButtonSizeLargeSelectedContainerShapeRound,
    token.ComponentIconButtonSizeLargeSelectedContainerShapeSquare,
  ),
  extraLarge: sizeTokens(
    token.ComponentIconButtonSizeXLargeContainerHeight,
    token.ComponentIconButtonSizeXLargeIconSize,
    token.ComponentIconButtonSizeXLargeNarrowLeadingSpace,
    token.ComponentIconButtonSizeXLargeDefaultLeadingSpace,
    token.ComponentIconButtonSizeXLargeWideLeadingSpace,
    token.ComponentIconButtonSizeXLargeOutlinedOutlineWidth,
    token.ComponentIconButtonSizeXLargeContainerShapeRound,
    token.ComponentIconButtonSizeXLargeContainerShapeSquare,
    token.ComponentIconButtonSizeXLargePressedContainerShape,
    token.ComponentIconButtonSizeXLargeSelectedContainerShapeRound,
    token.ComponentIconButtonSizeXLargeSelectedContainerShapeSquare,
  ),
} as const satisfies Record<IconButtonSize, SizeTokens>;

const standardTokens: VariantTokens = {
  containerColor: 'transparent',
  contentColor: token.ComponentIconButtonStandardColor,
  disabledContainerColor: 'transparent',
  disabledContainerOpacity: 0,
  disabledContentColor: token.ComponentIconButtonStandardDisabledColor,
  disabledContentOpacity: token.ComponentIconButtonStandardDisabledOpacity,
  outlineColor: 'transparent',
  disabledOutlineColor: 'transparent',
  selectedContainerColor: 'transparent',
  selectedContentColor: token.ComponentIconButtonStandardSelectedColor,
  unselectedContainerColor: 'transparent',
  unselectedContentColor: token.ComponentIconButtonStandardUnselectedColor,
  selectedDisabledContainerColor: 'transparent',
  selectedDisabledContainerOpacity: 0,
};

const filledTokens: VariantTokens = {
  containerColor: token.ComponentIconButtonVariantFilledContainerColor,
  contentColor: token.ComponentIconButtonVariantFilledColor,
  disabledContainerColor: token.ComponentIconButtonVariantFilledDisabledContainerColor,
  disabledContainerOpacity: token.ComponentIconButtonVariantFilledDisabledContainerOpacity,
  disabledContentColor: token.ComponentIconButtonVariantFilledDisabledColor,
  disabledContentOpacity: token.ComponentIconButtonVariantFilledDisabledOpacity,
  outlineColor: 'transparent',
  disabledOutlineColor: 'transparent',
  selectedContainerColor: token.ComponentIconButtonVariantFilledSelectedContainerColor,
  selectedContentColor: token.ComponentIconButtonVariantFilledSelectedColor,
  unselectedContainerColor: token.ComponentIconButtonVariantFilledUnselectedContainerColor,
  unselectedContentColor: token.ComponentIconButtonVariantFilledUnselectedColor,
  selectedDisabledContainerColor: token.ComponentIconButtonVariantFilledDisabledContainerColor,
  selectedDisabledContainerOpacity: token.ComponentIconButtonVariantFilledDisabledContainerOpacity,
};

const filledTonalTokens: VariantTokens = {
  containerColor: token.ComponentIconButtonVariantFilledTonalContainerColor,
  contentColor: token.ComponentIconButtonVariantFilledTonalColor,
  disabledContainerColor: token.ComponentIconButtonVariantFilledTonalDisabledContainerColor,
  disabledContainerOpacity: token.ComponentIconButtonVariantFilledTonalDisabledContainerOpacity,
  disabledContentColor: token.ComponentIconButtonVariantFilledTonalDisabledColor,
  disabledContentOpacity: token.ComponentIconButtonVariantFilledTonalDisabledOpacity,
  outlineColor: 'transparent',
  disabledOutlineColor: 'transparent',
  selectedContainerColor: token.ComponentIconButtonVariantFilledTonalSelectedContainerColor,
  selectedContentColor: token.ComponentIconButtonVariantFilledTonalSelectedColor,
  unselectedContainerColor: token.ComponentIconButtonVariantFilledTonalUnselectedContainerColor,
  unselectedContentColor: token.ComponentIconButtonVariantFilledTonalUnselectedColor,
  selectedDisabledContainerColor: token.ComponentIconButtonVariantFilledTonalDisabledContainerColor,
  selectedDisabledContainerOpacity: token.ComponentIconButtonVariantFilledTonalDisabledContainerOpacity,
};

const outlinedTokens: VariantTokens = {
  containerColor: 'transparent',
  contentColor: token.ComponentIconButtonVariantOutlinedColor,
  disabledContainerColor: 'transparent',
  disabledContainerOpacity: 0,
  disabledContentColor: token.ComponentIconButtonVariantOutlinedDisabledColor,
  disabledContentOpacity: token.ComponentIconButtonVariantOutlinedDisabledOpacity,
  outlineColor: token.ComponentIconButtonVariantOutlinedOutlineColor,
  disabledOutlineColor: token.ComponentIconButtonVariantOutlinedDisabledOutlineColor,
  selectedContainerColor: token.ComponentIconButtonVariantOutlinedSelectedContainerColor,
  selectedContentColor: token.ComponentIconButtonVariantOutlinedSelectedColor,
  unselectedContainerColor: 'transparent',
  unselectedContentColor: token.ComponentIconButtonVariantOutlinedUnselectedColor,
  selectedDisabledContainerColor: token.ComponentIconButtonVariantOutlinedSelectedDisabledContainerColor,
  selectedDisabledContainerOpacity: token.ComponentIconButtonVariantOutlinedSelectedDisabledContainerOpacity,
};

export const iconButtonVariantTokens = {
  standard: standardTokens,
  filled: filledTokens,
  filledTonal: filledTonalTokens,
  outlined: outlinedTokens,
} as const satisfies Record<IconButtonVariant, VariantTokens>;

const minimumInteractiveSize = 48;

function composite(color: string, opacity: number): string {
  if (color === 'transparent' || opacity === 0) return 'transparent';
  if (opacity === 1) return color;
  return `color-mix(in srgb, ${color} ${opacity * 100}%, transparent)`;
}

function widthFor(tokens: SizeTokens, width: IconButtonWidth): number {
  const space = width === 'narrow' ? tokens.narrowSpace : width === 'wide' ? tokens.wideSpace : tokens.defaultSpace;
  return tokens.iconSize + space * 2;
}

function baseShapes(size: IconButtonSize, shape: IconButtonShape) {
  const tokens = iconButtonSizeTokens[size];
  return {
    shape: shapeRadius[shape === 'round' ? tokens.roundShape : tokens.squareShape],
    pressedShape: shapeRadius[tokens.pressedShape],
    selectedShape: shapeRadius[shape === 'round' ? tokens.selectedRoundShape : tokens.selectedSquareShape],
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

function hasSelectedShape(shapes: IconButtonShapes): shapes is IconToggleButtonShapes {
  if (!('selectedShape' in shapes)) return false;
  return typeof shapes.selectedShape === 'string' || typeof shapes.selectedShape === 'number';
}

function cssLength(value: IconButtonShapeValue): string {
  return typeof value === 'number' ? `${value}px` : value;
}

export function getIconButtonStyle(
  variant: IconButtonVariant,
  state: IconButtonStyleState,
  options: IconButtonStyleOptions = {},
): IconButtonStyle {
  const size = options.size ?? 'small';
  const width = options.width ?? 'default';
  const shape = options.shape ?? 'round';
  const sizes = iconButtonSizeTokens[size];
  const colors = iconButtonVariantTokens[variant];
  const staticShape = baseShapes(size, shape).shape;
  const expressiveShapes = options.shapes;
  const selectedShape = expressiveShapes && hasSelectedShape(expressiveShapes)
    ? expressiveShapes.selectedShape
    : expressiveShapes?.shape;
  const radius = expressiveShapes
    ? state.isPressed
      ? expressiveShapes.pressedShape
      : state.isSelected
        ? selectedShape ?? expressiveShapes.shape
        : expressiveShapes.shape
    : staticShape;
  const isToggle = state.isSelected !== undefined;

  let containerColor = isToggle
    ? state.isSelected ? colors.selectedContainerColor : colors.unselectedContainerColor
    : colors.containerColor;
  let contentColor = isToggle
    ? state.isSelected ? colors.selectedContentColor : colors.unselectedContentColor
    : colors.contentColor;
  let outlineColor = variant === 'outlined' && (!isToggle || !state.isSelected)
    ? colors.outlineColor
    : 'transparent';

  if (state.isDisabled) {
    containerColor = isToggle && state.isSelected
      ? composite(colors.selectedDisabledContainerColor, colors.selectedDisabledContainerOpacity)
      : composite(colors.disabledContainerColor, colors.disabledContainerOpacity);
    contentColor = composite(colors.disabledContentColor, colors.disabledContentOpacity);
    outlineColor = variant === 'outlined' && (!isToggle || !state.isSelected)
      ? colors.disabledOutlineColor
      : 'transparent';
  }

  return {
    '--_icon-button-target-size': `${Math.max(minimumInteractiveSize, sizes.height)}px`,
    '--_icon-button-container-height': `${sizes.height}px`,
    '--_icon-button-container-width': `${widthFor(sizes, width)}px`,
    '--_icon-button-icon-size': `${sizes.iconSize}px`,
    '--_icon-button-container-radius': cssLength(radius),
    '--_icon-button-container-color': containerColor,
    '--_icon-button-content-color': contentColor,
    '--_icon-button-outline-width': `${sizes.outlineWidth}px`,
    '--_icon-button-outline-color': outlineColor,
    '--_icon-button-shape-duration': token.MotionSpringFastSpatialDuration,
    '--_icon-button-shape-easing': token.MotionSpringFastSpatialEasing,
  };
}
