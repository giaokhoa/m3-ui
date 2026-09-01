import { describe, expect, it } from 'vitest';
import {
  PaneExpansionAnchor,
  PaneExpansionState,
  type PaneExpansionAnimation,
} from './paneExpansionState';

describe('PaneExpansionState stale settle finalizers', () => {
  it('does not let a canceled settle clear or overwrite its replacement', async () => {
    const anchors = [
      PaneExpansionAnchor.proportion(0),
      PaneExpansionAnchor.proportion(1),
    ] as const;
    const animations: Array<{
      signal: AbortSignal;
      finish: () => void;
    }> = [];
    const animation: PaneExpansionAnimation = ({ signal }) =>
      new Promise<void>((resolve) => {
        animations.push({ signal, finish: resolve });
        signal.addEventListener('abort', () => resolve(), { once: true });
      });
    const state = new PaneExpansionState({
      anchors,
      initialAnchoredIndex: 0,
      animation,
    });
    state.onMeasured(1000);
    state.onExpansionOffsetMeasured(600);

    const first = state.settleToAnchorIfNeeded(0);
    expect(animations).toHaveLength(1);
    expect(state.currentAnchor).toBe(anchors[1]);

    const second = state.settleToAnchorIfNeeded(-250);
    expect(animations).toHaveLength(2);
    expect(animations[0]!.signal.aborted).toBe(true);
    expect(state.currentAnchor).toBe(anchors[0]);
    expect(state.isSettling).toBe(true);

    // Let the canceled first animation resume into its finally block. AndroidX
    // has already transferred MutatorMutex ownership to the second settle, so
    // that stale completion cannot clear or snap the replacement operation.
    await Promise.resolve();
    await first;
    expect(state.isSettling).toBe(true);
    expect(state.currentAnchor).toBe(anchors[0]);

    animations[1]!.finish();
    await second;
    expect(state.isSettling).toBe(false);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(0);
  });
});
