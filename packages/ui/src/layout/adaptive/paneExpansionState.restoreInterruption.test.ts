import { describe, expect, it } from 'vitest';
import {
  PaneExpansionAnchor,
  PaneExpansionState,
  type PaneExpansionAnimation,
} from './paneExpansionState';

describe('PaneExpansionState restore interruption', () => {
  it('interrupts settling and finishes at its old target before restoring anchors', async () => {
    const oldAnchors = [
      PaneExpansionAnchor.proportion(0.25),
      PaneExpansionAnchor.proportion(0.75),
    ];
    let updateAnimation: ((offset: number) => void) | undefined;
    const animation: PaneExpansionAnimation = ({ signal, update }) => {
      updateAnimation = update;
      return new Promise<void>((resolve) => {
        signal.addEventListener('abort', () => resolve(), { once: true });
      });
    };
    const state = new PaneExpansionState({
      anchors: oldAnchors,
      initialAnchoredIndex: 0,
      animation,
    });
    state.onMeasured(1000);
    state.onExpansionOffsetMeasured(500);

    const transition = state.settleToAnchorIfNeeded(250);
    updateAnimation!(600);
    expect(state.isSettling).toBe(true);

    const nextAnchors = [
      PaneExpansionAnchor.proportion(0.2),
      PaneExpansionAnchor.proportion(0.6),
    ];
    state.setAnchors(nextAnchors, 1);

    expect(state.isSettling).toBe(false);
    expect(state.currentAnchor).toBe(nextAnchors[1]);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(750);

    updateAnimation!(700);
    await transition;

    expect(state.currentAnchor).toBe(nextAnchors[1]);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(750);
  });

  it('does not interrupt a direct animateTo when restoring anchors', async () => {
    const oldAnchors = [
      PaneExpansionAnchor.proportion(0.25),
      PaneExpansionAnchor.proportion(0.75),
    ];
    let updateAnimation: ((offset: number) => void) | undefined;
    let finishAnimation: (() => void) | undefined;
    const animation: PaneExpansionAnimation = ({ update }) => {
      updateAnimation = update;
      return new Promise<void>((resolve) => {
        finishAnimation = resolve;
      });
    };
    const state = new PaneExpansionState({
      anchors: oldAnchors,
      initialAnchoredIndex: 0,
      animation,
    });
    state.onMeasured(1000);

    const transition = state.animateTo(oldAnchors[1]!);
    updateAnimation!(500);

    const nextAnchors = [
      PaneExpansionAnchor.proportion(0.2),
      PaneExpansionAnchor.proportion(0.6),
    ];
    state.setAnchors(nextAnchors, 1);

    expect(state.isSettling).toBe(true);
    expect(state.currentAnchor).toBe(nextAnchors[1]);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(500);

    updateAnimation!(700);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(700);
    finishAnimation!();
    await transition;

    expect(state.isSettling).toBe(false);
    expect(state.currentAnchor).toBe(nextAnchors[1]);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(750);
  });
});
