import { describe, expect, it } from 'vitest';
import {
  PaneExpansionAnchor,
  PaneExpansionState,
  type PaneExpansionAnimation,
} from './paneExpansionState';

describe('PaneExpansionState public animation parity', () => {
  it('keeps independent public animateTo calls running concurrently', async () => {
    const anchors = [
      PaneExpansionAnchor.proportion(0.25),
      PaneExpansionAnchor.proportion(0.5),
      PaneExpansionAnchor.proportion(0.75),
    ];
    const animations: Array<{
      signal: AbortSignal;
      update: (offset: number) => void;
      finish: () => void;
    }> = [];
    const animation: PaneExpansionAnimation = ({ signal, update }) =>
      new Promise<void>((resolve) => {
        animations.push({ signal, update, finish: resolve });
      });
    const state = new PaneExpansionState({
      anchors,
      initialAnchoredIndex: 0,
      animation,
    });
    state.onMeasured(1000);

    const first = state.animateTo(anchors[2]!);
    const second = state.animateTo(anchors[1]!);

    expect(animations).toHaveLength(2);
    expect(animations[0]!.signal.aborted).toBe(false);
    expect(animations[1]!.signal.aborted).toBe(false);
    expect(state.currentAnchor).toBe(anchors[1]);

    animations[0]!.update(600);
    animations[1]!.update(450);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(450);

    animations[0]!.finish();
    await first;
    expect(animations[1]!.signal.aborted).toBe(false);
    expect(state.currentAnchor).toBe(anchors[1]);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(750);

    animations[1]!.update(475);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(475);

    animations[1]!.finish();
    await second;
    expect(state.currentAnchor).toBe(anchors[1]);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(500);
  });

  it('stores the exact equal anchor argument passed to public animateTo', async () => {
    const listedAnchor = PaneExpansionAnchor.proportion(0.5);
    const equalArgument = PaneExpansionAnchor.proportion(0.5);
    const state = new PaneExpansionState({
      anchors: [listedAnchor],
      animation: async ({ to, update }) => update(to),
    });
    state.onMeasured(1000);

    await state.animateTo(equalArgument);

    expect(equalArgument).not.toBe(listedAnchor);
    expect(state.currentAnchor).toBe(equalArgument);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(500);
  });
});
