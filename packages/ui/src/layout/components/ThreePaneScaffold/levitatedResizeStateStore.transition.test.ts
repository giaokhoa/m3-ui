import { describe, expect, it, vi } from 'vitest';
import { DockedEdge, DragToResizeState } from '../../adaptive/dragToResizeState';
import {
  PaneAdaptedValue,
  PaneAlignment,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';
import {
  getLevitatedResizeStates,
  getLevitatedResizeStatesSnapshot,
  subscribeLevitatedResizeStates,
} from './levitatedResizeStateStore';

function value(primary: DragToResizeState, secondary?: DragToResizeState): ThreePaneScaffoldValue {
  return {
    primary: PaneAdaptedValue.Levitated(PaneAlignment.Center, undefined, primary),
    secondary:
      secondary === undefined
        ? PaneAdaptedValue.Hidden
        : PaneAdaptedValue.Levitated(PaneAlignment.Center, undefined, secondary),
    tertiary: PaneAdaptedValue.Hidden,
  };
}

describe('levitated resize transition state store', () => {
  it('collects and deduplicates resize states from current and target values', () => {
    const currentOnly = new DragToResizeState({ dockedEdge: DockedEdge.Start });
    const shared = new DragToResizeState({ dockedEdge: DockedEdge.End });
    const targetOnly = new DragToResizeState({ dockedEdge: DockedEdge.Bottom });

    const states = getLevitatedResizeStates(
      value(currentOnly, shared),
      value(shared, targetOnly),
    );

    expect(states).toEqual([currentOnly, shared, targetOnly]);
  });

  it('notifies when a resize state that exists only in currentValue changes', () => {
    const currentOnly = new DragToResizeState({ dockedEdge: DockedEdge.Start });
    const targetOnly = new DragToResizeState({ dockedEdge: DockedEdge.End });
    const states = getLevitatedResizeStates(value(currentOnly), value(targetOnly));
    const listener = vi.fn();
    const unsubscribe = subscribeLevitatedResizeStates(states, listener);
    const before = getLevitatedResizeStatesSnapshot(states);

    currentOnly.setMaxSize(700);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(getLevitatedResizeStatesSnapshot(states)).not.toBe(before);

    unsubscribe();
  });
});
