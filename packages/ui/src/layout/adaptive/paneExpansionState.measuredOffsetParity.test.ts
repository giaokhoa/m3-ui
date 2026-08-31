import { describe, expect, it } from 'vitest';
import { PaneExpansionAnchor, PaneExpansionState } from './paneExpansionState';

describe('PaneExpansionState measured offset parity', () => {
  it('preserves the measured handle offset when anchor coercion is a no-op', () => {
    const anchor = PaneExpansionAnchor.proportion(0.5);
    const state = new PaneExpansionState({
      anchors: [anchor],
      initialAnchoredIndex: 0,
    });
    state.onMeasured(1000, 'ltr');

    // Layout can report a measured handle position that differs from the saved
    // dragging Int. AndroidX only updates currentMeasuredDraggingOffset from
    // the currentDraggingOffset setter when the coerced saved Int changes.
    state.onExpansionOffsetMeasured(520);
    state.onMeasured(1000, 'rtl');

    // The 50% anchor is still 500 in RTL, so assigning it is a no-op and the
    // measured 520 must survive. The next raw delta therefore starts at 520.
    state.dispatchRawDelta(10);
    expect(state.getLayoutState(1000, 'rtl').currentDraggingOffset).toBe(530);
  });
});
