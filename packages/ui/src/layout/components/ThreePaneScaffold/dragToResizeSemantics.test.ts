import { describe, expect, it } from 'vitest';
import {
  DockedEdge,
  DragToResizeState,
} from '../../adaptive/dragToResizeState';
import { getDragToResizeHandleAriaState } from './dragToResizeSemantics';

function measuredState() {
  const state = new DragToResizeState({ dockedEdge: DockedEdge.Bottom });
  state.measure({
    measuringWidth: 720,
    measuringHeight: 320,
    scaffoldWidth: 720,
    scaffoldHeight: 640,
  });
  return state;
}

describe('drag-to-resize semantics', () => {
  it('mirrors the pinned AndroidX state and next-action descriptions', () => {
    const state = measuredState();

    expect(getDragToResizeHandleAriaState(state)).toEqual({
      stateDescription: 'partially expanded',
      actionDescription: 'expand',
      description: 'partially expanded. expand',
    });

    state.moveToNextState();
    expect(getDragToResizeHandleAriaState(state)).toEqual({
      stateDescription: 'expanded',
      actionDescription: 'collapse',
      description: 'expanded. collapse',
    });

    state.moveToNextState();
    expect(getDragToResizeHandleAriaState(state)).toEqual({
      stateDescription: 'collapsed',
      actionDescription: 'partially expand',
      description: 'collapsed. partially expand',
    });

    state.moveToNextState();
    expect(getDragToResizeHandleAriaState(state)).toEqual({
      stateDescription: 'partially expanded',
      actionDescription: 'expand',
      description: 'partially expanded. expand',
    });
  });

  it('supports application localization overrides', () => {
    const state = measuredState();

    expect(
      getDragToResizeHandleAriaState(state, {
        partiallyExpandedState: 'partial',
        expandAction: 'grow',
        describe: (current, action) => `${current} → ${action}`,
      }),
    ).toEqual({
      stateDescription: 'partial',
      actionDescription: 'grow',
      description: 'partial → grow',
    });
  });
});
