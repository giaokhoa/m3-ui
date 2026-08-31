import { describe, expect, it, vi } from 'vitest';
import {
  PaneExpansionAnchor,
  type PaneExpansionAnimation,
} from './paneExpansionState';
import {
  PaneExpansionStateCache,
  paneExpansionAnchorsEqual,
} from './paneExpansionStateCache';
import { getPaneExpansionStateKey, PaneExpansionStateKey } from './paneExpansionStateKey';
import { PaneAdaptedValue, type ThreePaneScaffoldValue } from './threePaneScaffold';

const anchors = [
  PaneExpansionAnchor.proportion(0),
  PaneExpansionAnchor.proportion(0.25),
  PaneExpansionAnchor.proportion(0.5),
  PaneExpansionAnchor.proportion(0.75),
  PaneExpansionAnchor.proportion(1),
] as const;

function value(primary: boolean, secondary: boolean, tertiary: boolean): ThreePaneScaffoldValue {
  return {
    primary: primary ? PaneAdaptedValue.Expanded : PaneAdaptedValue.Hidden,
    secondary: secondary ? PaneAdaptedValue.Expanded : PaneAdaptedValue.Hidden,
    tertiary: tertiary ? PaneAdaptedValue.Expanded : PaneAdaptedValue.Hidden,
  };
}

describe('PaneExpansionStateCache', () => {
  it('remembers independent state for each structural two-pane key', async () => {
    const cache = new PaneExpansionStateCache();
    const firstKey = getPaneExpansionStateKey(value(true, true, false));
    const secondKey = getPaneExpansionStateKey(value(false, true, true));

    const first = cache.getOrCreate(firstKey, { anchors, initialAnchoredIndex: 3 });
    const second = cache.getOrCreate(secondKey, { anchors, initialAnchoredIndex: 1 });

    expect(first).not.toBe(second);
    expect(first.currentAnchor).toEqual(anchors[3]);
    expect(second.currentAnchor).toEqual(anchors[1]);

    await first.animateTo(anchors[4]);
    const structurallyEqualFirstKey = getPaneExpansionStateKey(value(true, true, false));
    expect(cache.getOrCreate(structurallyEqualFirstKey)).toBe(first);
    expect(first.currentAnchor).toEqual(anchors[4]);
  });

  it('reruns restore when the persistent key changes and keeps the call-site fallback', () => {
    const cache = new PaneExpansionStateCache();
    const firstKey = getPaneExpansionStateKey(value(true, true, false));
    const secondKey = getPaneExpansionStateKey(value(false, true, true));
    const twoAnchors = [anchors[1], anchors[3]] as const;

    const first = cache.getOrCreate(firstKey, {
      anchors: twoAnchors,
      initialAnchoredIndex: 0,
    });
    cache.update(firstKey, { anchors: twoAnchors, initialAnchoredIndex: 0 });
    first.setFirstPaneWidth(320);
    expect(first.currentAnchor).toBeNull();

    const second = cache.getOrCreate(secondKey, {
      anchors: twoAnchors,
      initialAnchoredIndex: 1,
    });
    cache.update(secondKey, { anchors: twoAnchors, initialAnchoredIndex: 1 });
    expect(second.currentAnchor).toBe(twoAnchors[1]);

    // initialAnchoredIndex changed while the structurally-equal anchor list did
    // not, so remember(anchors) still owns index 0 as the restore fallback.
    cache.update(firstKey, { anchors: [...twoAnchors], initialAnchoredIndex: 1 });
    expect(first.currentAnchor).toBe(twoAnchors[0]);
  });

  it('matches AndroidX identity-aware equality for NaN proportion anchors', () => {
    const nanAnchor = PaneExpansionAnchor.proportion(Number.NaN);
    const otherNanAnchor = PaneExpansionAnchor.proportion(Number.NaN);

    expect(paneExpansionAnchorsEqual([nanAnchor], [nanAnchor])).toBe(true);
    expect(paneExpansionAnchorsEqual([nanAnchor], [otherNanAnchor])).toBe(false);
  });

  it('reruns anchor restore for a distinct NaN anchor but not the same NaN object', () => {
    const cache = new PaneExpansionStateCache();
    const nanAnchor = PaneExpansionAnchor.proportion(Number.NaN);
    const fallback = PaneExpansionAnchor.proportion(0.5);
    const state = cache.getOrCreate(PaneExpansionStateKey.Default, {
      anchors: [nanAnchor, fallback],
      initialAnchoredIndex: 0,
    });

    cache.update(PaneExpansionStateKey.Default, {
      anchors: [nanAnchor, fallback],
      initialAnchoredIndex: 1,
    });
    expect(state.currentAnchor).toBe(nanAnchor);

    const distinctNanAnchor = PaneExpansionAnchor.proportion(Number.NaN);
    cache.update(PaneExpansionStateKey.Default, {
      anchors: [distinctNanAnchor, fallback],
      initialAnchoredIndex: 1,
    });
    expect(state.currentAnchor).toBe(fallback);
  });

  it('ignores an initial index change until the anchors change', () => {
    const cache = new PaneExpansionStateCache();
    const state = cache.getOrCreate(PaneExpansionStateKey.Default, {
      anchors,
      initialAnchoredIndex: 3,
    });

    cache.update(PaneExpansionStateKey.Default, {
      anchors: [...anchors],
      initialAnchoredIndex: 1,
    });
    expect(state.currentAnchor).toEqual(anchors[3]);

    const nextAnchors = anchors.slice(0, 3);
    cache.update(PaneExpansionStateKey.Default, {
      anchors: nextAnchors,
      initialAnchoredIndex: 1,
    });
    expect(state.currentAnchor).toEqual(nextAnchors[1]);
  });

  it('updates the animation driver for an already remembered key', async () => {
    const cache = new PaneExpansionStateCache();
    const oldAnimation: PaneExpansionAnimation = async () => {
      throw new Error('stale animation should not run');
    };
    const updatedAnimation = vi.fn<PaneExpansionAnimation>(async ({ to, update }) => {
      update(to);
    });
    const state = cache.getOrCreate(PaneExpansionStateKey.Default, {
      anchors: [anchors[0], anchors[4]],
      initialAnchoredIndex: 0,
      animation: oldAnimation,
    });

    cache.update(PaneExpansionStateKey.Default, {
      anchors: [anchors[0], anchors[4]],
      initialAnchoredIndex: 0,
      animation: updatedAnimation,
    });
    state.onMeasured(1000);
    await state.animateTo(anchors[4]);

    expect(updatedAnimation).toHaveBeenCalledOnce();
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(1000);
  });

  it('interrupts settle-owned animation when the animation driver changes', async () => {
    const cache = new PaneExpansionStateCache();
    const aborted = vi.fn();
    const oldAnimation: PaneExpansionAnimation = ({ signal }) =>
      new Promise<void>((resolve) => {
        signal.addEventListener(
          'abort',
          () => {
            aborted();
            resolve();
          },
          { once: true },
        );
      });
    const updatedAnimation = vi.fn<PaneExpansionAnimation>(async ({ to, update }) => {
      update(to);
    });
    const twoAnchors = [anchors[0], anchors[4]] as const;
    const state = cache.getOrCreate(PaneExpansionStateKey.Default, {
      anchors: twoAnchors,
      initialAnchoredIndex: 0,
      animation: oldAnimation,
    });
    state.onMeasured(1000);
    state.onExpansionOffsetMeasured(600);

    const settling = state.settleToAnchorIfNeeded(0);
    expect(state.isSettling).toBe(true);

    cache.update(PaneExpansionStateKey.Default, {
      anchors: twoAnchors,
      initialAnchoredIndex: 0,
      animation: updatedAnimation,
    });
    await settling;

    expect(aborted).toHaveBeenCalledOnce();
    expect(state.isSettling).toBe(false);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(1000);
  });
});
