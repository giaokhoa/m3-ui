import * as token from '@m3-ui/tokens';
import { describe, expect, it } from 'vitest';
import {
  dragHandleRuntime,
  dragHandleTokens,
  getDragHandleRippleStyle,
  getDragHandleStyle,
} from './DragHandle.defaults';

describe('VerticalDragHandle defaults', () => {
  it('projects the complete canonical Material 3 drag handle state family', () => {
    expect(dragHandleTokens).toEqual({
      containerWidth: 24,
      default: {
        color: token.ComponentDragHandleDefaultColor,
        elevation: token.ComponentDragHandleDefaultElevation,
        height: 48,
        shape: token.ComponentDragHandleDefaultShape,
        width: 4,
      },
      pressed: {
        color: token.ComponentDragHandlePressedColor,
        elevation: token.ComponentDragHandlePressedElevation,
        height: 52,
        shape: token.ComponentDragHandlePressedShape,
        width: 12,
      },
      dragged: {
        color: token.ComponentDragHandleDraggedColor,
        elevation: token.ComponentDragHandleDraggedElevation,
        height: 52,
        shape: token.ComponentDragHandleDraggedShape,
        width: 12,
      },
      focus: {
        stateLayerColor: token.ComponentDragHandleFocusStateLayerColor,
        stateLayerOpacity: token.ComponentDragHandleFocusStateLayerOpacity,
      },
      hover: {
        stateLayerColor: token.ComponentDragHandleHoverStateLayerColor,
        stateLayerOpacity: token.ComponentDragHandleHoverStateLayerOpacity,
      },
    });
  });

  it('keeps Compose minimum-interactive sizing as renderer behavior', () => {
    expect(dragHandleRuntime).toEqual({ minimumInteractiveSize: 48 });
  });

  it('emits canonical geometry, colors and shapes for every visual state', () => {
    expect(getDragHandleStyle()).toMatchObject({
      '--_drag-handle-container-width': '24px',
      '--_drag-handle-min-interactive-size': '48px',
      '--_drag-handle-default-color': token.ComponentDragHandleDefaultColor,
      '--_drag-handle-default-height': '48px',
      '--_drag-handle-default-shape': token.ShapeFull,
      '--_drag-handle-default-width': '4px',
      '--_drag-handle-pressed-color': token.ComponentDragHandlePressedColor,
      '--_drag-handle-pressed-height': '52px',
      '--_drag-handle-pressed-shape': token.ShapeMedium,
      '--_drag-handle-pressed-width': '12px',
      '--_drag-handle-dragged-color': token.ComponentDragHandleDraggedColor,
      '--_drag-handle-dragged-height': '52px',
      '--_drag-handle-dragged-shape': token.ShapeMedium,
      '--_drag-handle-dragged-width': '12px',
    });
  });

  it('feeds component-specific hover/focus state aliases into the shared Ripple', () => {
    expect(getDragHandleRippleStyle()).toEqual({
      '--_ripple-focus-opacity': token.ComponentDragHandleFocusStateLayerOpacity,
      '--_ripple-hover-opacity': token.ComponentDragHandleHoverStateLayerOpacity,
    });
  });

  it('keeps public visual overrides local to their matching states', () => {
    expect(
      getDragHandleStyle({
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
    ).toMatchObject({
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
