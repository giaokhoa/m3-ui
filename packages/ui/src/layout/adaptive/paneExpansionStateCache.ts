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
 *
 * The individual data buckets are currently represented by PaneExpansionState
 * instances, but restore scheduling follows rememberPaneExpansionState itself:
 * key changes always rerun restore, while initialAnchoredIndex only replaces
 * the fallback anchor when the structurally-compared anchor list changes.
 */
export class PaneExpansionStateCache {
  private readonly entries = new Map<string, PaneExpansionStateCacheEntry>();
  private activeKeyId: string | null = null;
  private rememberedAnchors: readonly PaneExpansionAnchor[] | null = null;
  private fallbackInitialAnchoredIndex = -1;
  private rememberedAnimation: PaneExpansionAnimation | null = null;

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
    this.entries.set(id, { state });
    if (this.activeKeyId === null) {
      this.activeKeyId = id;
      this.rememberedAnchors = anchors;
      this.fallbackInitialAnchoredIndex = initialAnchoredIndex;
      this.rememberedAnimation = animation;
    }
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

    state.setConsumeDragDelta(consumeDragDelta);

    const keyChanged = this.activeKeyId !== id;
    const anchorsChanged =
      this.rememberedAnchors === null ||
      !paneExpansionAnchorsEqual(this.rememberedAnchors, anchors);
    const animationChanged = this.rememberedAnimation !== animation;

    if (anchorsChanged) {
      // Mirrors:
      // val initialAnchorForCurrentAnchors = remember(anchors) { initialAnchor }
      this.rememberedAnchors = anchors;
      this.fallbackInitialAnchoredIndex = initialAnchoredIndex;
    }

    if (keyChanged || anchorsChanged || animationChanged) {
      // LaunchedEffect(key, anchors, anchoringAnimationSpec, flingBehavior)
      // always calls restore when any of those keys changes. The fallback index
      // is associated with the latest structurally-distinct anchors, not with
      // each persistent PaneExpansionStateKey entry.
      state.setAnchors(anchors, this.fallbackInitialAnchoredIndex);
    }

    state.setAnimation(animation);
    this.activeKeyId = id;
    this.rememberedAnimation = animation;
    return state;
  }
}
