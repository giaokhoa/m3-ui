import { useRef } from 'react';
import { PaneExpansionState } from '../../adaptive/paneExpansionState';
import {
  getPaneAdaptedValue,
  ThreePaneScaffoldRole,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';
import { KeyedPaneExpansionStateCache } from './keyedPaneExpansionState';

const rolesByPriority = [
  ThreePaneScaffoldRole.Primary,
  ThreePaneScaffoldRole.Secondary,
  ThreePaneScaffoldRole.Tertiary,
] as const;

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
 * Without a drag handle the state is a cheap immutable-by-convention stub.
 * Once the default state is mutable, one stable PaneExpansionState facade
 * switches among independently retained values for each scaffold pane-pair
 * key. Explicit paneExpansionState remains caller-owned and bypasses this
 * default cache in ThreePaneScaffold.
 */
export function useDefaultPaneExpansionState(
  targetValue: ThreePaneScaffoldValue,
  mutable: boolean,
): PaneExpansionState {
  const stubStateRef = useRef<PaneExpansionState | null>(null);
  const keyedStateCacheRef = useRef<KeyedPaneExpansionStateCache | null>(null);

  if (!mutable) {
    stubStateRef.current ??= new PaneExpansionState();
    return stubStateRef.current;
  }

  keyedStateCacheRef.current ??= new KeyedPaneExpansionStateCache();
  return keyedStateCacheRef.current.select(getPaneExpansionStateCacheKey(targetValue));
}
