import {
  PaneExpansionState,
  PaneExpansionUnspecified,
  defaultPaneExpansionAnimation,
  type PaneExpansionAnchor,
  type PaneExpansionAnimation,
  type PaneExpansionPersistentData,
} from './paneExpansionState';
import type { PaneExpansionStateKey } from './paneExpansionStateKey';

export interface PaneExpansionStateCacheOptions {
  anchors?: readonly PaneExpansionAnchor[];
  initialAnchoredIndex?: number;
  consumeDragDelta?: (delta: number) => number;
  animation?: PaneExpansionAnimation;
}

interface PaneExpansionStateCacheEntry {
  data: PaneExpansionPersistentData;
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

function initialPersistentData(
  anchors: readonly PaneExpansionAnchor[],
  initialAnchoredIndex: number,
): PaneExpansionPersistentData {
  if (initialAnchoredIndex < -1 || initialAnchoredIndex >= anchors.length) {
    throw new RangeError('initialAnchoredIndex must be -1 or a valid anchor index');
  }
  return {
    firstPaneWidth: PaneExpansionUnspecified,
    firstPaneProportion: Number.NaN,
    currentDraggingOffset: PaneExpansionUnspecified,
    currentAnchor:
      initialAnchoredIndex === -1 ? null : anchors[initialAnchoredIndex] ?? null,
  };
}

/**
 * Hook-lifetime browser analogue of AndroidX rememberPersistentlyWithKey.
 *
 * AndroidX persists only PaneExpansionStateData per key. PaneExpansionState
 * itself is created by remember once and stays stable while restore swaps the
 * active data bucket. Keep that split here so measurement, direction,
 * subscriptions and drag runtime are not accidentally cached per key.
 */
export class PaneExpansionStateCache {
  private readonly entries = new Map<string, PaneExpansionStateCacheEntry>();
  private state: PaneExpansionState | null = null;
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

    if (!this.entries.has(id)) {
      this.entries.set(id, {
        data: initialPersistentData(anchors, initialAnchoredIndex),
      });
    }

    if (this.state === null) {
      this.state = new PaneExpansionState({
        anchors,
        initialAnchoredIndex,
        consumeDragDelta,
        animation,
      });
      this.entries.get(id)!.data = this.state.capturePersistentData();
      this.activeKeyId = id;
      this.rememberedAnchors = anchors;
      this.fallbackInitialAnchoredIndex = initialAnchoredIndex;
      this.rememberedAnimation = animation;
    }

    // Like remember { PaneExpansionState(...) }, the object identity does not
    // change when rememberPersistentlyWithKey selects another data bucket.
    // The effect-driven update() below performs the actual restore.
    return this.state;
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

    if (keyChanged && this.activeKeyId !== null) {
      const previousEntry = this.entries.get(this.activeKeyId);
      if (previousEntry !== undefined) {
        if (state.isSettling && this.rememberedAnchors !== null) {
          // restore() acquires the same PreventUserInput MutatorMutex as
          // settleToAnchorIfNeeded. A mutex-owned settle is canceled first and
          // animateToInternal.finally snaps the old data bucket to its target.
          // Public animateTo also reports isSettling, but setAnchors only owns a
          // controller for mutex settling, so public animation remains running.
          state.setAnchors(
            this.rememberedAnchors,
            this.fallbackInitialAnchoredIndex,
          );
        }
        previousEntry.data = state.capturePersistentData();
      }
    }

    if (keyChanged || anchorsChanged || animationChanged) {
      const data = keyChanged
        ? this.entries.get(id)!.data
        : state.capturePersistentData();
      // LaunchedEffect(key, anchors, anchoringAnimationSpec, flingBehavior)
      // always calls restore when any key changes. The fallback index belongs
      // to the call-site remember(anchors), not to each persistent data key.
      state.restorePersistentData(data, anchors, this.fallbackInitialAnchoredIndex);
    }

    state.setAnimation(animation);
    this.activeKeyId = id;
    this.rememberedAnimation = animation;
    return state;
  }
}
