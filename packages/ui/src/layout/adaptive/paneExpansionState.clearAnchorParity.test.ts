import { describe, expect, it } from 'vitest';
import {
  PaneExpansionAnchor,
  PaneExpansionState,
  PaneExpansionUnspecified,
} from './paneExpansionState';

describe('PaneExpansionState clear anchor parity', () => {
  it('does not revive a retained anchor after clear without a new measurement', () => {
    const anchor = PaneExpansionAnchor.proportion(0.5);
    const state = new PaneExpansionState({ anchors: [anchor], initialAnchoredIndex: 0 });

    state.onMeasured(1000);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(500);

    state.clear();

    // AndroidX clear() leaves currentAnchor intact, but onMeasured() returns
    // early while geometry is unchanged. The cleared drag offset therefore
    // stays Unspecified until a real measurement change reapplies the anchor.
    expect(state.currentAnchor).toBe(anchor);
    expect(state.isUnspecified()).toBe(true);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(
      PaneExpansionUnspecified,
    );

    state.onMeasured(1200);
    expect(state.getLayoutState(1200).currentDraggingOffset).toBe(600);
  });
});
