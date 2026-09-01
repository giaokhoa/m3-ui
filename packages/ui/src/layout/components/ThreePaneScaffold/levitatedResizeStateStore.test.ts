import { describe, expect, it, vi } from 'vitest';
import {
  DockedEdge,
  DragToResizeState,
} from '../../adaptive/dragToResizeState';
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

function value(
  primary: DragToResizeState,
  secondary: DragToResizeState,
): ThreePaneScaffoldValue {
  return {
    primary: PaneAdaptedValue.Levitated(PaneAlignment.Center, undefined, primary),
    secondary: PaneAdaptedValue.Levitated(PaneAlignment.Center, undefined, secondary),
    tertiary: PaneAdaptedValue.Hidden,
  };
}

describe('levitated resize state store', () => {
  it('collects every distinct levitated resize state', () => {
    const first = new DragToResizeState({ dockedEdge: DockedEdge.Bottom });
    const second = new DragToResizeState({ dockedEdge: DockedEdge.End });

    expect(getLevitatedResizeStates(value(first, second))).toEqual([first, second]);

    const shared: ThreePaneScaffoldValue = {
      primary: PaneAdaptedValue.Levitated(PaneAlignment.Center, undefined, first),
      secondary: PaneAdaptedValue.Levitated(PaneAlignment.Center, undefined, first),
      tertiary: PaneAdaptedValue.Hidden,
    };
    expect(getLevitatedResizeStates(shared)).toEqual([first]);
  });

  it('ignores the nullable AndroidX no-state representation', () => {
    const structural: ThreePaneScaffoldValue = {
      primary: {
        type: 'levitated',
        alignment: PaneAlignment.Center,
        dragToResizeState: null,
      },
      secondary: PaneAdaptedValue.Hidden,
      tertiary: PaneAdaptedValue.Hidden,
    };

    const states = getLevitatedResizeStates(structural);
    expect(states).toEqual([]);
    expect(getLevitatedResizeStatesSnapshot(states)).toBe('');
  });

  it('notifies when any collected state changes', () => {
    const first = new DragToResizeState({ dockedEdge: DockedEdge.Bottom });
    const second = new DragToResizeState({ dockedEdge: DockedEdge.End });
    const states = getLevitatedResizeStates(value(first, second));
    const listener = vi.fn();
    const unsubscribe = subscribeLevitatedResizeStates(states, listener);
    const before = getLevitatedResizeStatesSnapshot(states);

    first.setMinSize(20);
    const afterFirst = getLevitatedResizeStatesSnapshot(states);
    second.setMaxSize(500);
    const afterSecond = getLevitatedResizeStatesSnapshot(states);

    expect(listener).toHaveBeenCalledTimes(2);
    expect(afterFirst).not.toBe(before);
    expect(afterSecond).not.toBe(afterFirst);

    unsubscribe();
    first.setMinSize(30);
    expect(listener).toHaveBeenCalledTimes(2);
  });
});