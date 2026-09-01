import {
  cssValue,
  defineCssAdapter,
  tokenReader,
} from '../adapter-helpers.mjs';

export function createDragHandleCss(context) {
  const get = tokenReader(context, 'DragHandle CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  const shape = (path) => get(`shape.${get(path)}`);

  return [
    '.drag-handle {',
    line('--_drag-handle-container-width', get('component.dragHandle.default.containerWidth')),
    line('--_drag-handle-default-color', get('component.dragHandle.default.color')),
    line('--_drag-handle-default-height', get('component.dragHandle.default.height')),
    line('--_drag-handle-default-shape', shape('component.dragHandle.default.shape')),
    line('--_drag-handle-default-width', get('component.dragHandle.default.width')),
    line('--_drag-handle-pressed-color', get('component.dragHandle.pressed.color')),
    line('--_drag-handle-pressed-height', get('component.dragHandle.pressed.height')),
    line('--_drag-handle-pressed-shape', shape('component.dragHandle.pressed.shape')),
    line('--_drag-handle-pressed-width', get('component.dragHandle.pressed.width')),
    line('--_drag-handle-dragged-color', get('component.dragHandle.dragged.color')),
    line('--_drag-handle-dragged-height', get('component.dragHandle.dragged.height')),
    line('--_drag-handle-dragged-shape', shape('component.dragHandle.dragged.shape')),
    line('--_drag-handle-dragged-width', get('component.dragHandle.dragged.width')),
    line('--_drag-handle-focus-state-layer-color', get('component.dragHandle.focusStateLayerColor')),
    line('--_drag-handle-hover-state-layer-color', get('component.dragHandle.hoverStateLayerColor')),
    '}',
    '',
  ].join('\n');
}

export default defineCssAdapter('drag-handle', createDragHandleCss);
