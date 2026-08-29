import { describe, expect, it } from 'vitest';
import { PaneExpansionAnchor, PaneExpansionState } from './paneExpansionState';

describe('PaneExpansionState Compose Float proportions', () => {
  it('canonicalizes proportion anchors before restore equality checks', () => {
    const current = PaneExpansionAnchor.proportion(0.1 + 0.2);
    const equivalent = PaneExpansionAnchor.proportion(0.3);
    if (current.type !== 'proportion' || equivalent.type !== 'proportion') {
      throw new Error('Expected proportion anchors');
    }

    expect(current.proportion).toBe(Math.fround(0.3));
    expect(equivalent.proportion).toBe(Math.fround(0.3));

    const state = new PaneExpansionState({
      anchors: [current],
      initialAnchoredIndex: 0,
    });
    state.onMeasured(1000);
    state.setAnchors([equivalent], -1);

    expect(state.currentAnchor).toBe(equivalent);
  });

  it('uses Float multiplication before roundToInt for anchor positions', () => {
    const anchor = PaneExpansionAnchor.proportion(0.7);
    const state = new PaneExpansionState({
      anchors: [anchor],
      initialAnchoredIndex: 0,
    });

    state.onMeasured(45);

    // AndroidX computes (45 * 0.7f) as Float = 31.5f, then roundToInt() = 32.
    expect(state.getLayoutState(45).currentDraggingOffset).toBe(32);
  });

  it('stores explicit first-pane proportions at Compose Float precision', () => {
    const state = new PaneExpansionState();
    state.setFirstPaneProportion(0.1 + 0.2);

    expect(state.getLayoutState(1000).firstPaneProportion).toBe(Math.fround(0.3));
  });
});
