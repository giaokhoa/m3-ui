import { describe, expect, it, vi } from 'vitest';
import {
  PaneExpansionAnchor,
  PaneExpansionState,
  PaneExpansionUnspecified,
  type PaneExpansionAnimation,
} from './paneExpansionState';

const scaffoldWidth = 2000;
const instantAnimation: PaneExpansionAnimation = async ({ to, update }) => {
  update(to);
};

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

  it('animates to an anchor, updates semantics immediately and truncates animation frames', async () => {
    const anchors = [
      PaneExpansionAnchor.proportion(0.25),
      PaneExpansionAnchor.proportion(0.75),
    ];
    let updateAnimation: ((offset: number) => void) | undefined;
    let finishAnimation: (() => void) | undefined;
    let receivedVelocity = Number.NaN;
    const animation: PaneExpansionAnimation = ({ initialVelocity, update }) => {
      receivedVelocity = initialVelocity;
      updateAnimation = update;
      return new Promise<void>((resolve) => {
        finishAnimation = resolve;
      });
    };
    const state = new PaneExpansionState({
      anchors,
      initialAnchoredIndex: 0,
      animation,
    });
    state.onMeasured(1000);

    const transition = state.animateTo(anchors[1]!, 125);

    expect(state.currentAnchor).toBe(anchors[1]);
    expect(state.isSettling).toBe(true);
    expect(receivedVelocity).toBe(125);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(250);

    updateAnimation!(600.9);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(600);

    finishAnimation!();
    await transition;
    expect(state.isSettling).toBe(false);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(750);
  });

  it('settles toward the release direction and forwards leftover velocity to the anchor spring', async () => {
    const anchors = [
      PaneExpansionAnchor.proportion(0.25),
      PaneExpansionAnchor.proportion(0.5),
      PaneExpansionAnchor.proportion(0.75),
    ];
    let receivedVelocity = Number.NaN;
    const animation: PaneExpansionAnimation = async ({ initialVelocity, to, update }) => {
      receivedVelocity = initialVelocity;
      update(to);
    };
    const state = new PaneExpansionState({ anchors, animation });
    state.onMeasured(1000);
    state.onExpansionOffsetMeasured(500);
    state.dispatchRawDelta(10);

    await state.settleToAnchorIfNeeded(250);

    expect(state.currentAnchor).toBe(anchors[2]);
    expect(receivedVelocity).toBe(250);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(750);
  });

  it('uses animated anchor changes for semantic next-anchor activation', async () => {
    const anchors = [
      PaneExpansionAnchor.proportion(0.25),
      PaneExpansionAnchor.proportion(0.75),
    ];
    const animation = vi.fn(instantAnimation);
    const state = new PaneExpansionState({
      anchors,
      initialAnchoredIndex: 0,
      animation,
    });
    state.onMeasured(1000);

    state.moveToNextAnchor();
    await Promise.resolve();

    expect(animation).toHaveBeenCalledTimes(1);
    expect(state.currentAnchor).toBe(anchors[1]);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(750);
  });

  it('cancels active anchor settling when direct dragging resumes', async () => {
    const anchors = [
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
      anchors,
      initialAnchoredIndex: 0,
      animation,
    });
    state.onMeasured(1000);

    const transition = state.animateTo(anchors[1]!);
    updateAnimation!(500);
    expect(state.isSettling).toBe(true);

    state.beginDrag();
    await transition;
    expect(state.isSettling).toBe(false);
    expect(state.isDragging).toBe(true);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(500);

    updateAnimation!(700);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(500);
  });
});
