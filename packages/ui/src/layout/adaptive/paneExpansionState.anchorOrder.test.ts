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

  it('wraps nextAnchor to the first input anchor after the last physical anchor', () => {
    const anchors = [
      PaneExpansionAnchor.proportion(0.75),
      PaneExpansionAnchor.proportion(0.25),
      PaneExpansionAnchor.proportion(0.5),
    ];
    const state = new PaneExpansionState({ anchors, animation: instantAnimation });
    state.onMeasured(1000);
    state.onExpansionOffsetMeasured(900);

    expect(state.nextAnchor).toBe(anchors[0]);
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

  it('preserves AndroidX Int overflow while scoring opposite-direction anchors', async () => {
    const overflowAnchor = PaneExpansionAnchor.fromEnd(Number.POSITIVE_INFINITY);
    const currentAnchor = PaneExpansionAnchor.proportion(1);
    const anchors = [overflowAnchor, currentAnchor];
    const state = new PaneExpansionState({
      anchors,
      initialAnchoredIndex: 1,
      animation: instantAnimation,
    });
    state.onMeasured(1000);

    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(1000);

    await state.settleToAnchorIfNeeded(200);

    // Offset.fromEnd(+Infinity) resolves to 1000 - Int.MAX_VALUE. For positive
    // velocity AndroidX computes maxExpansionWidth - delta with Int arithmetic;
    // that score overflows negative and therefore wins minBy against the anchor
    // at the current position. The selected raw target is then clamped to zero.
    expect(state.currentAnchor).toBe(overflowAnchor);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(0);
  });
});
