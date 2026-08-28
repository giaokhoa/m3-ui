import { describe, expect, it, vi } from 'vitest';
import {
  PaneExpansionAnchor,
  PaneExpansionState,
  PaneExpansionUnspecified,
} from './paneExpansionState';

const scaffoldWidth = 2000;

describe('PaneExpansionState', () => {
  it('drags positively within bounds', () => {
    const state = new PaneExpansionState();
    state.onMeasured(scaffoldWidth);
    state.onExpansionOffsetMeasured(1000);
    state.dispatchRawDelta(500);
    expect(state.getLayoutState(scaffoldWidth).currentDraggingOffset).toBe(1500);
  });

  it('drags negatively within bounds', () => {
    const state = new PaneExpansionState();
    state.onMeasured(scaffoldWidth);
    state.onExpansionOffsetMeasured(1000);
    state.dispatchRawDelta(-500);
    expect(state.getLayoutState(scaffoldWidth).currentDraggingOffset).toBe(500);
  });

  it('bounds dragging at both scaffold edges', () => {
    const state = new PaneExpansionState();
    state.onMeasured(scaffoldWidth);
    state.onExpansionOffsetMeasured(1000);
    state.dispatchRawDelta(1500);
    expect(state.getLayoutState(scaffoldWidth).currentDraggingOffset).toBe(scaffoldWidth);
    state.onExpansionOffsetMeasured(1000);
    state.dispatchRawDelta(-1500);
    expect(state.getLayoutState(scaffoldWidth).currentDraggingOffset).toBe(0);
  });

  it('applies consumeDragDelta before changing pane sizes', () => {
    const consumeDragDelta = vi.fn((delta: number) => delta - 200);
    const state = new PaneExpansionState({ consumeDragDelta });
    state.onMeasured(scaffoldWidth);
    state.onExpansionOffsetMeasured(1000);
    state.dispatchRawDelta(500);
    expect(consumeDragDelta).toHaveBeenCalledWith(500);
    expect(state.getLayoutState(scaffoldWidth).currentDraggingOffset).toBe(1300);
  });

  it('allows consumeDragDelta to consume the entire delta', () => {
    const state = new PaneExpansionState({ consumeDragDelta: () => 0 });
    state.onMeasured(scaffoldWidth);
    state.onExpansionOffsetMeasured(1000);
    state.dispatchRawDelta(500);
    expect(state.getLayoutState(scaffoldWidth).currentDraggingOffset).toBe(1000);
  });

  it('width and proportion settings reset each other and clear anchors', () => {
    const anchor = PaneExpansionAnchor.proportion(0.5);
    const state = new PaneExpansionState({ anchors: [anchor], initialAnchoredIndex: 0 });
    state.onMeasured(scaffoldWidth);

    state.setFirstPaneWidth(600);
    let snapshot = state.getLayoutState(scaffoldWidth);
    expect(snapshot.firstPaneWidth).toBe(600);
    expect(snapshot.firstPaneProportion).toBeNaN();
    expect(snapshot.currentDraggingOffset).toBe(PaneExpansionUnspecified);
    expect(state.currentAnchor).toBeNull();

    state.setFirstPaneProportion(0.25);
    snapshot = state.getLayoutState(scaffoldWidth);
    expect(snapshot.firstPaneWidth).toBe(PaneExpansionUnspecified);
    expect(snapshot.firstPaneProportion).toBe(0.25);
  });

  it('rejects proportions outside [0, 1]', () => {
    const state = new PaneExpansionState();
    expect(() => state.setFirstPaneProportion(-0.1)).toThrow(RangeError);
    expect(() => state.setFirstPaneProportion(1.1)).toThrow(RangeError);
    expect(() => PaneExpansionAnchor.proportion(2)).toThrow(RangeError);
  });

  it('mirrors anchor positions in RTL', () => {
    const state = new PaneExpansionState({
      anchors: [PaneExpansionAnchor.fromStart(300)],
      initialAnchoredIndex: 0,
    });
    expect(state.getLayoutState(1000, 'ltr').currentDraggingOffset).toBe(300);
    expect(state.getLayoutState(1000, 'rtl').currentDraggingOffset).toBe(700);
  });

  it('settles toward the fling direction when velocity crosses the AndroidX threshold', () => {
    const anchors = [
      PaneExpansionAnchor.proportion(0.25),
      PaneExpansionAnchor.proportion(0.5),
      PaneExpansionAnchor.proportion(0.75),
    ];
    const state = new PaneExpansionState({ anchors });
    state.onMeasured(1000);
    state.onExpansionOffsetMeasured(500);
    state.dispatchRawDelta(10);
    state.settleToAnchorIfNeeded(250);
    expect(state.currentAnchor).toEqual(anchors[2]);
  });
});
