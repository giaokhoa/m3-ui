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

describe('PaneExpansionStateCache simultaneous key and anchor restore parity', () => {
  it('preserves the old key anchor when restore cancels a settle before installing new anchors', async () => {
    const firstKey = getPaneExpansionStateKey(value(true, true, false));
    const secondKey = getPaneExpansionStateKey(value(false, true, true));
    const firstAnchors = [
      PaneExpansionAnchor.proportion(0),
      PaneExpansionAnchor.proportion(1),
    ] as const;
    const secondAnchors = [
      PaneExpansionAnchor.proportion(0.25),
      PaneExpansionAnchor.proportion(0.5),
    ] as const;
    const hangingAnimation: PaneExpansionAnimation = ({ signal }) =>
      new Promise<void>((resolve) => {
        signal.addEventListener('abort', () => resolve(), { once: true });
      });

    const cache = new PaneExpansionStateCache();
    const state = cache.getOrCreate(firstKey, {
      anchors: firstAnchors,
      initialAnchoredIndex: 0,
      animation: hangingAnimation,
    });
    cache.update(firstKey, {
      anchors: firstAnchors,
      initialAnchoredIndex: 0,
      animation: hangingAnimation,
    });
    state.onMeasured(1000);
    state.onExpansionOffsetMeasured(600);

    const settling = state.settleToAnchorIfNeeded(0);
    expect(state.currentAnchor).toBe(firstAnchors[1]);
    expect(state.isSettling).toBe(true);

    cache.update(secondKey, {
      anchors: secondAnchors,
      initialAnchoredIndex: 0,
      animation: hangingAnimation,
    });
    await settling;

    expect(state.currentAnchor).toBe(secondAnchors[0]);

    cache.update(firstKey, {
      anchors: firstAnchors,
      initialAnchoredIndex: 0,
      animation: hangingAnimation,
    });

    // AndroidX cancels the old settle while PaneExpansionState still points at
    // the first key's data object. The snapped target and its anchor therefore
    // stay in that bucket even though the same composition installs new anchors
    // for the second key immediately afterwards.
    expect(state.currentAnchor).toBe(firstAnchors[1]);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(1000);
  });
});
