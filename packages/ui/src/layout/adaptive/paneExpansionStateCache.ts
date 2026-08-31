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
  anchors: readonly PaneExpansionAnchor[];
  animation: PaneExpansionAnimation;
}

const identityConsumeDragDelta = (delta: number) => delta;

export function paneExpansionStateKeyId(key: PaneExpansionStateKey): string {
  return key.type === 'default'
    ? 'default'
    : `${key.firstExpandedPane}:${key.secondExpandedPane}`;
}

/** Legacy structural diagnostic id; cache change detection uses AndroidX equality below. */
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

export function paneExpansionAnchorEquals(
  a: PaneExpansionAnchor,
  b: PaneExpansionAnchor,
): boolean {
  if (a === b) return true;
  if (a.type !== b.type) return false;
  if (a.type === 'proportion' && b.type === 'proportion') {
    // AndroidX Proportion.equals uses Float == after its identity fast path.
    return a.proportion === b.proportion;
  }
  return (
    a.type === 'offset' &&
    b.type === 'offset' &&
    a.direction === b.direction &&
    a.offset === b.offset
  );
}

export function paneExpansionAnchorsEqual(
  a: readonly PaneExpansionAnchor[],
  b: readonly PaneExpansionAnchor[],
): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  return a.every((anchor, index) => paneExpansionAnchorEquals(anchor, b[index]!));
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
      anchors,
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

    const anchorsChanged = !paneExpansionAnchorsEqual(entry.anchors, anchors);
    const animationChanged = entry.animation !== animation;
    if (anchorsChanged) {
      // AndroidX only lets the latest initialAnchoredIndex become the fallback
      // when the anchors themselves change.
      state.setAnchors(anchors, initialAnchoredIndex);
      entry.anchors = anchors;
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
