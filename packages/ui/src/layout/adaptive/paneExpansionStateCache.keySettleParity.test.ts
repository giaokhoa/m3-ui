import { describe, expect, it } from 'vitest';
import {
  PaneExpansionAnchor,
  type PaneExpansionAnimation,
} from './paneExpansionState';
import { PaneExpansionStateCache } from './paneExpansionStateCache';
import { getPaneExpansionStateKey } from './paneExpansionStateKey';
import { PaneAdaptedValue, type ThreePaneScaffoldValue } from './threePaneScaffold';

function value(primary: boolean, secondary: boolean, tertiary: boolean): ThreePaneScaffoldValue {
  return {
    primary: primary ? PaneAdaptedValue.Expanded : PaneAdaptedValue.Hidden,
    secondary: secondary ? PaneAdaptedValue.Expanded : PaneAdaptedValue.Hidden,
    tertiary: tertiary ? PaneAdaptedValue.Expanded : PaneAdaptedValue.Hidden,
  };
}

describe('PaneExpansionStateCache settle restore parity', () => {
  it('persists the canceled settle target in the old key before restoring the new key', async () => {
    const anchors = [
      PaneExpansionAnchor.proportion(0),
      PaneExpansionAnchor.proportion(1),
    ] as const;
    const animation: PaneExpansionAnimation = ({ signal }) =>
      new Promise<void>((resolve) => {
        signal.addEventListener('abort', resolve, { once: true });
      });
    const firstKey = getPaneExpansionStateKey(value(true, true, false));
    const secondKey = getPaneExpansionStateKey(value(false, true, true));
    const cache = new PaneExpansionStateCache();
    const state = cache.getOrCreate(firstKey, {
      anchors,
      initialAnchoredIndex: 0,
      animation,
    });
    cache.update(firstKey, { anchors, initialAnchoredIndex: 0, animation });
    state.onMeasured(1000);
    state.onExpansionOffsetMeasured(600);

    const settling = state.settleToAnchorIfNeeded(0);
    expect(state.currentAnchor).toBe(anchors[1]);
    expect(state.isSettling).toBe(true);

    expect(
      cache.getOrCreate(secondKey, {
        anchors,
        initialAnchoredIndex: 0,
        animation,
      }),
    ).toBe(state);
    cache.update(secondKey, { anchors, initialAnchoredIndex: 0, animation });

    expect(state.currentAnchor).toBe(anchors[0]);
    expect(state.isSettling).toBe(false);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(0);

    await settling;
    // The old settle's suspended finally must not write its 1000px target into
    // the newly-restored key after the abort promise resumes.
    expect(state.currentAnchor).toBe(anchors[0]);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(0);

    cache.update(firstKey, { anchors, initialAnchoredIndex: 0, animation });
    expect(state.currentAnchor).toBe(anchors[1]);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(1000);
  });
});
