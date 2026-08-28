import { useState } from 'react';
import { PaneExpansionState } from '../../adaptive/paneExpansionState';
import {
  getPaneAdaptedValue,
  ThreePaneScaffoldRole,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';

const rolesByPriority = [
  ThreePaneScaffoldRole.Primary,
  ThreePaneScaffoldRole.Secondary,
  ThreePaneScaffoldRole.Tertiary,
] as const;

const StubKey = 'stub';
const DefaultKey = 'default';

export function getPaneExpansionStateCacheKey(value: ThreePaneScaffoldValue): string {
  const expandedRoles = rolesByPriority.filter(
    (role) => getPaneAdaptedValue(value, role).type === 'expanded',
  );
  return expandedRoles.length === 2 ? expandedRoles.join(':') : DefaultKey;
}

/**
 * Browser equivalent of AndroidX rememberDefaultPaneExpansionState.
 *
 * A scaffold without a drag handle uses one cheap stub state. Once a default
 * drag handle is present, each two-pane combination gets an independent state
 * so a user-adjusted split is restored when that pane pair becomes active
 * again. Explicit paneExpansionState remains owned by the caller and bypasses
 * this cache in ThreePaneScaffold.
 */
export function useDefaultPaneExpansionState(
  targetValue: ThreePaneScaffoldValue,
  mutable: boolean,
): PaneExpansionState {
  const [states] = useState(() => new Map<string, PaneExpansionState>());
  const key = mutable ? getPaneExpansionStateCacheKey(targetValue) : StubKey;
  let state = states.get(key);
  if (state === undefined) {
    state = new PaneExpansionState();
    states.set(key, state);
  }
  return state;
}
