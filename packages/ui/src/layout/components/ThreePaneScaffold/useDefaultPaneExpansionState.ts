import { useLayoutEffect, useState } from 'react';
import { PaneExpansionState } from '../../adaptive/paneExpansionState';
import {
  PaneExpansionStateCache,
  paneExpansionStateKeyId,
} from '../../adaptive/paneExpansionStateCache';
import { getPaneExpansionStateKey } from '../../adaptive/paneExpansionStateKey';
import type { ThreePaneScaffoldValue } from '../../adaptive/threePaneScaffold';

export function getPaneExpansionStateCacheKey(value: ThreePaneScaffoldValue): string {
  return paneExpansionStateKeyId(getPaneExpansionStateKey(value));
}

/**
 * Browser equivalent of AndroidX rememberDefaultPaneExpansionState.
 *
 * Without a drag handle AndroidX uses one cheap stub state. With a handle it
 * delegates to rememberPaneExpansionState(keyProvider()), which keeps one live
 * PaneExpansionState while rememberPersistentlyWithKey swaps only its saved
 * data bucket for each two-pane combination.
 */
export function useDefaultPaneExpansionState(
  targetValue: ThreePaneScaffoldValue,
  mutable: boolean,
): PaneExpansionState {
  const [stubState] = useState(() => new PaneExpansionState());
  const [cache] = useState(() => new PaneExpansionStateCache());
  const key = getPaneExpansionStateKey(targetValue);
  const keyId = paneExpansionStateKeyId(key);
  const mutableState = mutable ? cache.getOrCreate(key) : stubState;

  useLayoutEffect(() => {
    if (!mutable) return;
    cache.update(key);
  }, [cache, keyId, mutable]);

  return mutableState;
}
