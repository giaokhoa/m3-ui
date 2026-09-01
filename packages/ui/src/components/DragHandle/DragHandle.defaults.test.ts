import { describe, expect, it } from 'vitest';
import {
  dragHandleRuntime,
  getDragHandleRuntimeStyle,
} from './DragHandle.defaults';

describe('VerticalDragHandle runtime defaults', () => {
  it('keeps Compose minimum-interactive sizing as renderer behavior', () => {
    expect(dragHandleRuntime).toEqual({ minimumInteractiveSize: 48 });
    expect(getDragHandleRuntimeStyle()).toEqual({
      '--_drag-handle-min-interactive-size': '48px',
    });
  });

  it('projects only explicit public visual overrides', () => {
    expect(
      getDragHandleRuntimeStyle({
        color: 'rebeccapurple',
        pressedColor: 'tomato',
        draggedColor: 'seagreen',
        size: { width: 6, height: 50 },
        pressedSize: { width: '1rem', height: 54 },
        draggedSize: { width: 14, height: '3.5rem' },
        shape: 3,
        pressedShape: '10px',
        draggedShape: '25%',
      }),
    ).toEqual({
      '--_drag-handle-min-interactive-size': '48px',
      '--_drag-handle-default-color': 'rebeccapurple',
      '--_drag-handle-default-height': '50px',
      '--_drag-handle-default-shape': '3px',
      '--_drag-handle-default-width': '6px',
      '--_drag-handle-pressed-color': 'tomato',
      '--_drag-handle-pressed-height': '54px',
      '--_drag-handle-pressed-shape': '10px',
      '--_drag-handle-pressed-width': '1rem',
      '--_drag-handle-dragged-color': 'seagreen',
      '--_drag-handle-dragged-height': '3.5rem',
      '--_drag-handle-dragged-shape': '25%',
      '--_drag-handle-dragged-width': '14px',
    });
  });
});
