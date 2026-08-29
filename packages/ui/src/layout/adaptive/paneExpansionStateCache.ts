import {
  PaneExpansionState,
  defaultPaneExpansionAnimation,
  type PaneExpansionAnchor,
  type PaneExpansionAnimation,
} from './paneExpansionState';
import type { PaneExpansionStateKey } from './paneExpansionStateKey';

export interface PaneExpansionStateCacheOptions {
  anchors?: readonly PaneExpansionAnchor[];
  initialAnchoredIndex?: number;
  consumeDragDelta?: (delta: number) => number;
  animation?: PaneExpansionAnimation;
}

interface PaneExpansionStateCacheEntry {
  readonly state: PaneExpansionState;
  anchorsId: string;
  animation: PaneExpansionAnimation;
}

const identityConsumeDragDelta = (delta: number) => delta;

export function paneExpansionStateKeyId(key: PaneExpansionStateKey): string {
  return key.type === 'default'
    ? 'default'
    : `${key.firstExpandedPane}:${key.secondExpandedPane}`;
}

export function paneExpansionAnchorsId(
  anchors: readonly PaneExpansionAnchor[],
): string {
  return anchors
    .map((anchor) =>
      anchor.type === 'proportion'
        ? `p:${anchor.proportion}`
        : `o:${anchor.direction}:${anchor.offset}`,
    )
    .join('|');
}

/**
 * Hook-lifetime browser analogue of AndroidX rememberPersistentlyWithKey.
 * Entries are indexed structurally so newly-created equivalent key objects
 * restore the same remembered PaneExpansionState.
 */
export class PaneExpansionStateCache {
  private readonly entries = new Map<string, PaneExpansionStateCacheEntry>();

  getOrCreate(
    key: PaneExpansionStateKey,
    {
      anchors = [],
      initialAnchoredIndex = -1,
      consumeDragDelta = identityConsumeDragDelta,
      animation = defaultPaneExpansionAnimation,
    }: PaneExpansionStateCacheOptions = {},
  ): PaneExpansionState {
    const id = paneExpansionStateKeyId(key);
    const existing = this.entries.get(id);
    if (existing !== undefined) return existing.state;

    const state = new PaneExpansionState({
      anchors,
      initialAnchoredIndex,
      consumeDragDelta,
      animation,
    });
    this.entries.set(id, {
      state,
      anchorsId: paneExpansionAnchorsId(anchors),
      animation,
    });
    return state;
  }

  update(
    key: PaneExpansionStateKey,
    {
      anchors = [],
      initialAnchoredIndex = -1,
      consumeDragDelta = identityConsumeDragDelta,
      animation = defaultPaneExpansionAnimation,
    }: PaneExpansionStateCacheOptions = {},
  ): PaneExpansionState {
    const id = paneExpansionStateKeyId(key);
    const state = this.getOrCreate(key, {
      anchors,
      initialAnchoredIndex,
      consumeDragDelta,
      animation,
    });
    const entry = this.entries.get(id)!;

    state.setConsumeDragDelta(consumeDragDelta);

    const nextAnchorsId = paneExpansionAnchorsId(anchors);
    const anchorsChanged = entry.anchorsId !== nextAnchorsId;
    const animationChanged = entry.animation !== animation;
    if (anchorsChanged) {
      // AndroidX only lets the latest initialAnchoredIndex become the fallback
      // when the anchors themselves change.
      state.setAnchors(anchors, initialAnchoredIndex);
      entry.anchorsId = nextAnchorsId;
    } else if (animationChanged) {
      // Changing anchoringAnimationSpec re-runs AndroidX restore() under the
      // PreventUserInput mutex. Re-applying the same anchors here interrupts a
      // settle-owned animation while preserving the fallback index associated
      // with the current anchors.
      state.setAnchors(anchors);
    }

    state.setAnimation(animation);
    entry.animation = animation;
    return state;
  }
}
