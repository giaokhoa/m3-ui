import { describe, expect, it } from 'vitest';
import {
  PaneExpansionAnchor,
  PaneExpansionState,
  PaneExpansionUnspecified,
} from './paneExpansionState';

describe('PaneExpansionState anchor-list fallback', () => {
  it('uses the new initial anchor when the current anchor is removed without moving the split', () => {
    const anchors = [
      PaneExpansionAnchor.proportion(0),
      PaneExpansionAnchor.proportion(0.25),
      PaneExpansionAnchor.proportion(0.5),
      PaneExpansionAnchor.proportion(0.75),
      PaneExpansionAnchor.proportion(1),
    ];
    const state = new PaneExpansionState({ anchors, initialAnchoredIndex: 3 });
    state.onMeasured(1000);

    const nextAnchors = [anchors[0]!, anchors[1]!, anchors[2]!, anchors[4]!];
    state.setAnchors(nextAnchors);

    expect(state.currentAnchor).toBe(nextAnchors[3]);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(750);
  });

  it('uses the updated initial index when the anchor list is replaced without moving the split', () => {
    const state = new PaneExpansionState({
      anchors: [
        PaneExpansionAnchor.proportion(0.2),
        PaneExpansionAnchor.proportion(0.5),
        PaneExpansionAnchor.proportion(0.8),
      ],
      initialAnchoredIndex: 2,
    });
    state.onMeasured(1000);

    const nextAnchors = [
      PaneExpansionAnchor.proportion(0.3),
      PaneExpansionAnchor.proportion(0.7),
    ];
    state.setAnchors(nextAnchors, 1);

    expect(state.currentAnchor).toBe(nextAnchors[1]);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(800);
  });

  it('keeps the current anchor when it is still in the updated list', () => {
    const anchor0 = PaneExpansionAnchor.proportion(0.25);
    const current = PaneExpansionAnchor.proportion(0.75);
    const state = new PaneExpansionState({
      anchors: [anchor0, current],
      initialAnchoredIndex: 1,
    });
    state.onMeasured(1000);

    const nextAnchors = [current, anchor0, PaneExpansionAnchor.proportion(0.5)];
    state.setAnchors(nextAnchors, 2);

    expect(state.currentAnchor).toBe(nextAnchors[0]);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(750);
  });

  it('falls back to no anchor when the updated initial index is -1 without moving the split', () => {
    const current = PaneExpansionAnchor.proportion(0.75);
    const state = new PaneExpansionState({
      anchors: [PaneExpansionAnchor.proportion(0.25), current],
      initialAnchoredIndex: 1,
    });
    state.onMeasured(1000);

    state.setAnchors([PaneExpansionAnchor.proportion(0.5)], -1);

    expect(state.currentAnchor).toBeNull();
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(750);
  });

  it('uses the new initial anchor when the previous state had no current anchor', () => {
    const state = new PaneExpansionState({
      anchors: [PaneExpansionAnchor.proportion(0.25)],
      initialAnchoredIndex: -1,
    });
    state.onMeasured(1000);
    expect(state.currentAnchor).toBeNull();

    const nextAnchors = [PaneExpansionAnchor.proportion(0.6)];
    state.setAnchors(nextAnchors, 0);

    expect(state.currentAnchor).toBe(nextAnchors[0]);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(
      PaneExpansionUnspecified,
    );

    // AndroidX restore() updates currentAnchor immediately but onMeasured()
    // reapplies that anchor only when measurement inputs actually change.
    state.onMeasured(1200);
    expect(state.getLayoutState(1200).currentDraggingOffset).toBe(720);
  });

  it('rejects an invalid updated initial index without mutating state', () => {
    const current = PaneExpansionAnchor.proportion(0.75);
    const state = new PaneExpansionState({
      anchors: [PaneExpansionAnchor.proportion(0.25), current],
      initialAnchoredIndex: 1,
    });
    state.onMeasured(1000);

    expect(() => state.setAnchors([PaneExpansionAnchor.proportion(0.5)], 1)).toThrow(
      RangeError,
    );
    expect(state.currentAnchor).toBe(current);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(750);
  });
});
