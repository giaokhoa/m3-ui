import { describe, expect, it } from 'vitest';
import {
  PaneExpansionAnchor,
  PaneExpansionState,
  type PaneExpansionAnimation,
} from './paneExpansionState';

const instantAnimation: PaneExpansionAnimation = async ({ to, update }) => {
  update(to);
};

describe('PaneExpansionState physical anchor ordering', () => {
  it('uses physical position rather than input order for nextAnchor in LTR', () => {
    const anchors = [
      PaneExpansionAnchor.proportion(0.75),
      PaneExpansionAnchor.proportion(0.25),
      PaneExpansionAnchor.proportion(0.5),
    ];
    const state = new PaneExpansionState({ anchors, animation: instantAnimation });
    state.onMeasured(1000, 'ltr');
    state.onExpansionOffsetMeasured(300);

    expect(state.nextAnchor).toBe(anchors[2]);
  });

  it('sorts by mirrored physical position before choosing nextAnchor in RTL', () => {
    const anchors = [
      PaneExpansionAnchor.proportion(0.75),
      PaneExpansionAnchor.proportion(0.25),
      PaneExpansionAnchor.proportion(0.5),
    ];
    const state = new PaneExpansionState({ anchors, animation: instantAnimation });
    state.onMeasured(1000, 'rtl');
    state.onExpansionOffsetMeasured(300);

    expect(state.nextAnchor).toBe(anchors[2]);
  });

  it('uses sorted physical order to break equidistant settling ties', async () => {
    const anchors = [
      PaneExpansionAnchor.proportion(0.75),
      PaneExpansionAnchor.proportion(0.25),
    ];
    const state = new PaneExpansionState({ anchors, animation: instantAnimation });
    state.onMeasured(1000);
    state.onExpansionOffsetMeasured(500);

    await state.settleToAnchorIfNeeded(0);

    expect(state.currentAnchor).toBe(anchors[1]);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(250);
  });

  it('preserves the original index as the tie-breaker for equal physical positions', async () => {
    const anchors = [
      PaneExpansionAnchor.fromStart(250),
      PaneExpansionAnchor.proportion(0.25),
    ];
    const state = new PaneExpansionState({ anchors, animation: instantAnimation });
    state.onMeasured(1000);
    state.onExpansionOffsetMeasured(500);

    await state.settleToAnchorIfNeeded(0);

    expect(state.currentAnchor).toBe(anchors[0]);
  });

  it('matches AndroidX directional settling when every anchor is behind the fling', async () => {
    const anchors = [
      PaneExpansionAnchor.proportion(0.75),
      PaneExpansionAnchor.proportion(0.25),
    ];
    const state = new PaneExpansionState({ anchors, animation: instantAnimation });
    state.onMeasured(1000);
    state.onExpansionOffsetMeasured(900);

    await state.settleToAnchorIfNeeded(250);

    expect(state.currentAnchor).toBe(anchors[1]);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(250);
  });
});
