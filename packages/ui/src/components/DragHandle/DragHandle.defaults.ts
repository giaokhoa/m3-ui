import * as token from '@m3/tokens';
import type { CSSProperties } from 'react';
import { pxNumber } from '../../internal/tokenValues';

export type DragHandleStyle = CSSProperties &
  Record<`--${string}`, string | number>;

type CssLength = NonNullable<CSSProperties['width']>;
type DragHandleShape = keyof typeof shapeRadius;

const shapeRadius = {
  full: token.ShapeFull,
  medium: token.ShapeMedium,
} as const;

export interface DragHandleSizeOverride {
  width?: CssLength;
  height?: CssLength;
}

export interface DragHandleStyleOptions {
  color?: CSSProperties['color'];
  pressedColor?: CSSProperties['color'];
  draggedColor?: CSSProperties['color'];
  size?: DragHandleSizeOverride;
  pressedSize?: DragHandleSizeOverride;
  draggedSize?: DragHandleSizeOverride;
  shape?: CSSProperties['borderRadius'];
  pressedShape?: CSSProperties['borderRadius'];
  draggedShape?: CSSProperties['borderRadius'];
}

export const dragHandleTokens = {
  containerWidth: pxNumber(token.ComponentDragHandleDefaultContainerWidth),
  default: {
    color: token.ComponentDragHandleDefaultColor,
    elevation: token.ComponentDragHandleDefaultElevation,
    height: pxNumber(token.ComponentDragHandleDefaultHeight),
    shape: token.ComponentDragHandleDefaultShape as DragHandleShape,
    width: pxNumber(token.ComponentDragHandleDefaultWidth),
  },
  pressed: {
    color: token.ComponentDragHandlePressedColor,
    elevation: token.ComponentDragHandlePressedElevation,
    height: pxNumber(token.ComponentDragHandlePressedHeight),
    shape: token.ComponentDragHandlePressedShape as DragHandleShape,
    width: pxNumber(token.ComponentDragHandlePressedWidth),
  },
  dragged: {
    color: token.ComponentDragHandleDraggedColor,
    elevation: token.ComponentDragHandleDraggedElevation,
    height: pxNumber(token.ComponentDragHandleDraggedHeight),
    shape: token.ComponentDragHandleDraggedShape as DragHandleShape,
    width: pxNumber(token.ComponentDragHandleDraggedWidth),
  },
  focus: {
    stateLayerColor: token.ComponentDragHandleFocusStateLayerColor,
    stateLayerOpacity: token.ComponentDragHandleFocusStateLayerOpacity,
  },
  hover: {
    stateLayerColor: token.ComponentDragHandleHoverStateLayerColor,
    stateLayerOpacity: token.ComponentDragHandleHoverStateLayerOpacity,
  },
} as const;

// AndroidX minimumInteractiveComponentSize() is renderer behavior rather than
// a component design token. Keep that platform adaptation beside the UI
// consumer instead of promoting it into the canonical token graph.
export const dragHandleRuntime = {
  minimumInteractiveSize: 48,
} as const;

function cssLength(value: CssLength): string {
  return typeof value === 'number' ? `${value}px` : value;
}

function shapeValue(
  tokenShape: DragHandleShape,
  override?: CSSProperties['borderRadius'],
): string {
  return cssLength((override ?? shapeRadius[tokenShape]) as CssLength);
}

export function getDragHandleStyle(
  options: DragHandleStyleOptions = {},
): DragHandleStyle {
  return {
    '--_drag-handle-container-width': `${dragHandleTokens.containerWidth}px`,
    '--_drag-handle-min-interactive-size': `${dragHandleRuntime.minimumInteractiveSize}px`,
    '--_drag-handle-default-color':
      options.color ?? dragHandleTokens.default.color,
    '--_drag-handle-default-height': cssLength(
      options.size?.height ?? dragHandleTokens.default.height,
    ),
    '--_drag-handle-default-shape': shapeValue(
      dragHandleTokens.default.shape,
      options.shape,
    ),
    '--_drag-handle-default-width': cssLength(
      options.size?.width ?? dragHandleTokens.default.width,
    ),
    '--_drag-handle-pressed-color':
      options.pressedColor ?? dragHandleTokens.pressed.color,
    '--_drag-handle-pressed-height': cssLength(
      options.pressedSize?.height ?? dragHandleTokens.pressed.height,
    ),
    '--_drag-handle-pressed-shape': shapeValue(
      dragHandleTokens.pressed.shape,
      options.pressedShape,
    ),
    '--_drag-handle-pressed-width': cssLength(
      options.pressedSize?.width ?? dragHandleTokens.pressed.width,
    ),
    '--_drag-handle-dragged-color':
      options.draggedColor ?? dragHandleTokens.dragged.color,
    '--_drag-handle-dragged-height': cssLength(
      options.draggedSize?.height ?? dragHandleTokens.dragged.height,
    ),
    '--_drag-handle-dragged-shape': shapeValue(
      dragHandleTokens.dragged.shape,
      options.draggedShape,
    ),
    '--_drag-handle-dragged-width': cssLength(
      options.draggedSize?.width ?? dragHandleTokens.dragged.width,
    ),
    '--_drag-handle-focus-state-layer-color':
      dragHandleTokens.focus.stateLayerColor,
    '--_drag-handle-hover-state-layer-color':
      dragHandleTokens.hover.stateLayerColor,
  };
}

export function getDragHandleRippleStyle(): DragHandleStyle {
  return {
    '--_ripple-focus-opacity': dragHandleTokens.focus.stateLayerOpacity,
    '--_ripple-hover-opacity': dragHandleTokens.hover.stateLayerOpacity,
  };
}
