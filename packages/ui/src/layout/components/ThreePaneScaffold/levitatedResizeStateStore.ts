import type { DragToResizeState } from '../../adaptive/dragToResizeState';
import {
  getPaneAdaptedValue,
  type ThreePaneScaffoldRole,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';

const roles: readonly ThreePaneScaffoldRole[] = ['primary', 'secondary', 'tertiary'];

/** Collect every distinct resize state carried by levitated panes in the supplied values. */
export function getLevitatedResizeStates(
  ...values: readonly ThreePaneScaffoldValue[]
): readonly DragToResizeState[] {
  const states = new Set<DragToResizeState>();
  for (const value of values) {
    for (const role of roles) {
      const paneValue = getPaneAdaptedValue(value, role);
      if (paneValue.type === 'levitated' && paneValue.dragToResizeState !== undefined) {
        states.add(paneValue.dragToResizeState);
      }
    }
  }
  return [...states];
}

/** Primitive snapshot suitable for React useSyncExternalStore. */
export function getLevitatedResizeStatesSnapshot(
  states: readonly DragToResizeState[],
): string {
  return states.map((state) => state.getSnapshot()).join(':');
}

export function subscribeLevitatedResizeStates(
  states: readonly DragToResizeState[],
  listener: () => void,
): () => void {
  const unsubscribes = states.map((state) => state.subscribe(listener));
  return () => {
    for (const unsubscribe of unsubscribes) unsubscribe();
  };
}
