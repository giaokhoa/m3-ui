import { useLayoutEffect, useRef } from 'react';
import {
  defaultPaneExpansionAnimation,
  type PaneExpansionAnchor,
  type PaneExpansionAnimation,
  type PaneExpansionState,
} from './paneExpansionState';
import {
  PaneExpansionStateCache,
  paneExpansionAnchorsId,
  paneExpansionStateKeyId,
} from './paneExpansionStateCache';
import {
  PaneExpansionStateKey,
  type PaneExpansionStateKey as PaneExpansionStateKeyType,
  type PaneExpansionStateKeyProvider,
} from './paneExpansionStateKey';

const identityConsumeDragDelta = (delta: number) => delta;

export interface UsePaneExpansionStateOptions {
  /** Explicit state key. Mutually exclusive with keyProvider. */
  key?: PaneExpansionStateKeyType;
  /** AndroidX PaneExpansionStateKeyProvider analogue. Mutually exclusive with key. */
  keyProvider?: PaneExpansionStateKeyProvider;
  anchors?: readonly PaneExpansionAnchor[];
  initialAnchoredIndex?: number;
  consumeDragDelta?: (delta: number) => number;
  /** Web animation driver for AndroidX anchoringAnimationSpec. */
  animation?: PaneExpansionAnimation;
}

/**
 * React analogue of AndroidX rememberPaneExpansionState.
 *
 * State is remembered independently for every structural PaneExpansionStateKey
 * for the lifetime of this hook instance. Switching back to a previously-used
 * key restores that key's width/proportion/anchor state.
 */
export function usePaneExpansionState({
  key,
  keyProvider,
  anchors = [],
  initialAnchoredIndex = -1,
  consumeDragDelta = identityConsumeDragDelta,
  animation = defaultPaneExpansionAnimation,
}: UsePaneExpansionStateOptions = {}): PaneExpansionState {
  if (key !== undefined && keyProvider !== undefined) {
    throw new Error('usePaneExpansionState accepts either key or keyProvider, not both');
  }
  if (initialAnchoredIndex < -1 || initialAnchoredIndex >= anchors.length) {
    throw new RangeError('initialAnchoredIndex must be -1 or a valid anchor index');
  }

  const resolvedKey = keyProvider?.paneExpansionStateKey ?? key ?? PaneExpansionStateKey.Default;
  const keyId = paneExpansionStateKeyId(resolvedKey);
  const anchorsId = paneExpansionAnchorsId(anchors);
  const cacheRef = useRef<PaneExpansionStateCache | null>(null);
  cacheRef.current ??= new PaneExpansionStateCache();
  const cache = cacheRef.current;
  const state = cache.getOrCreate(resolvedKey, {
    anchors,
    initialAnchoredIndex,
    consumeDragDelta,
    animation,
  });

  useLayoutEffect(() => {
    cache.update(resolvedKey, {
      anchors,
      initialAnchoredIndex,
      consumeDragDelta,
      animation,
    });
    // keyId/anchorsId intentionally provide structural dependencies. AndroidX
    // List/PaneExpansionStateKey equality is structural as well.
  }, [cache, state, keyId, anchorsId, consumeDragDelta, animation]);

  return state;
}
