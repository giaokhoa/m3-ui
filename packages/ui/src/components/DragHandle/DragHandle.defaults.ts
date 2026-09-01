import type { CSSProperties } from 'react';

export type DragHandleStyle = CSSProperties &
  Record<`--${string}`, string | number>;

type CssLength = NonNullable<CSSProperties['width']>;

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

// AndroidX minimumInteractiveComponentSize() is renderer behavior rather than
// a component design token. Keep that platform adaptation beside the UI
// consumer instead of promoting it into the canonical token graph.
export const dragHandleRuntime = {
  minimumInteractiveSize: 48,
} as const;

function cssLength(value: CssLength): string {
  return typeof value === 'number' ? `${value}px` : value;
}

export function getDragHandleRuntimeStyle(
  options: DragHandleStyleOptions = {},
): DragHandleStyle {
  const style: DragHandleStyle = {
    '--_drag-handle-min-interactive-size': `${dragHandleRuntime.minimumInteractiveSize}px`,
  };

  if (options.color !== undefined) style['--_drag-handle-default-color'] = options.color;
  if (options.size?.height !== undefined) {
    style['--_drag-handle-default-height'] = cssLength(options.size.height);
  }
  if (options.shape !== undefined) {
    style['--_drag-handle-default-shape'] = cssLength(options.shape as CssLength);
  }
  if (options.size?.width !== undefined) {
    style['--_drag-handle-default-width'] = cssLength(options.size.width);
  }

  if (options.pressedColor !== undefined) {
    style['--_drag-handle-pressed-color'] = options.pressedColor;
  }
  if (options.pressedSize?.height !== undefined) {
    style['--_drag-handle-pressed-height'] = cssLength(options.pressedSize.height);
  }
  if (options.pressedShape !== undefined) {
    style['--_drag-handle-pressed-shape'] = cssLength(options.pressedShape as CssLength);
  }
  if (options.pressedSize?.width !== undefined) {
    style['--_drag-handle-pressed-width'] = cssLength(options.pressedSize.width);
  }

  if (options.draggedColor !== undefined) {
    style['--_drag-handle-dragged-color'] = options.draggedColor;
  }
  if (options.draggedSize?.height !== undefined) {
    style['--_drag-handle-dragged-height'] = cssLength(options.draggedSize.height);
  }
  if (options.draggedShape !== undefined) {
    style['--_drag-handle-dragged-shape'] = cssLength(options.draggedShape as CssLength);
  }
  if (options.draggedSize?.width !== undefined) {
    style['--_drag-handle-dragged-width'] = cssLength(options.draggedSize.width);
  }

  return style;
}
