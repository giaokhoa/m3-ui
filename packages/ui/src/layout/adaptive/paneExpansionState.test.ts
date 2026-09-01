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

  it('uses AndroidX Float.toInt semantics for non-finite raw drag deltas', () => {
    const positiveInfinity = new PaneExpansionState();
    positiveInfinity.onMeasured(scaffoldWidth);
    positiveInfinity.onExpansionOffsetMeasured(1000);
    positiveInfinity.dispatchRawDelta(Number.POSITIVE_INFINITY);
    expect(positiveInfinity.getLayoutState(scaffoldWidth).currentDraggingOffset).toBe(
      scaffoldWidth,
    );

    const negativeInfinity = new PaneExpansionState();
    negativeInfinity.onMeasured(scaffoldWidth);
    negativeInfinity.onExpansionOffsetMeasured(1000);
    negativeInfinity.dispatchRawDelta(Number.NEGATIVE_INFINITY);
    expect(negativeInfinity.getLayoutState(scaffoldWidth).currentDraggingOffset).toBe(0);

    const nan = new PaneExpansionState();
    nan.onMeasured(scaffoldWidth);
    nan.onExpansionOffsetMeasured(1000);
    nan.dispatchRawDelta(Number.NaN);
    expect(nan.getLayoutState(scaffoldWidth).currentDraggingOffset).toBe(0);
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

  it('calls consumeDragDelta before ignoring an unmeasured drag', () => {
    const consumeDragDelta = vi.fn((delta: number) => delta);
    const state = new PaneExpansionState({ consumeDragDelta });

    state.dispatchRawDelta(0.1);

    expect(consumeDragDelta).toHaveBeenCalledWith(Math.fround(0.1));
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(PaneExpansionUnspecified);
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

  it('validates direct pane proportions but keeps anchor construction annotation-only', () => {
    const state = new PaneExpansionState();
    expect(() => state.setFirstPaneProportion(-0.1)).toThrow(RangeError);
    expect(() => state.setFirstPaneProportion(1.1)).toThrow(RangeError);

    const below = PaneExpansionAnchor.proportion(-0.5);
    const above = PaneExpansionAnchor.proportion(2);
    expect(below).toEqual({ type: 'proportion', proportion: Math.fround(-0.5) });
    expect(above).toEqual({ type: 'proportion', proportion: Math.fround(2) });
    expect(
      new PaneExpansionState({ anchors: [below], initialAnchoredIndex: 0 }).getLayoutState(1000)
        .currentDraggingOffset,
    ).toBe(0);
    expect(
      new PaneExpansionState({ anchors: [above], initialAnchoredIndex: 0 }).getLayoutState(1000)
        .currentDraggingOffset,
    ).toBe(1000);
  });

  it('keeps out-of-bounds offset anchors distinct for ordering and settling', async () => {
    const anchors = [
      PaneExpansionAnchor.fromStart(2000),
      PaneExpansionAnchor.fromStart(1500),
    ];
    const state = new PaneExpansionState({ anchors, animation: instantAnimation });
    state.onMeasured(1000);
    state.onExpansionOffsetMeasured(1000);

    expect(state.nextAnchor).toBe(anchors[1]);
    await state.settleToAnchorIfNeeded(0);
    expect(state.currentAnchor).toBe(anchors[1]);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(1000);
  });

  it('compares the unspecified measured offset against out-of-bounds anchor positions', () => {
    const anchors = [
      PaneExpansionAnchor.fromEnd(2000),
      PaneExpansionAnchor.fromStart(100),
    ];
    const state = new PaneExpansionState({ anchors });
    state.onMeasured(1000);

    expect(state.nextAnchor).toBe(anchors[1]);
  });

  it('animates from the unspecified measured offset after scaffold measurement', async () => {
    const anchor = PaneExpansionAnchor.fromStart(300);
    let observedFrom = Number.NaN;
    const animation: PaneExpansionAnimation = async ({ from, to, update }) => {
      observedFrom = from;
      update(to);
    };
    const state = new PaneExpansionState({ anchors: [anchor], animation });
    state.onMeasured(1000);

    await state.animateTo(anchor);

    expect(observedFrom).toBe(PaneExpansionUnspecified);
    expect(state.currentAnchor).toBe(anchor);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(300);
  });

  it('settles from the unspecified measured offset using AndroidX anchor scoring', async () => {
    const anchors = [
      PaneExpansionAnchor.fromEnd(2000),
      PaneExpansionAnchor.fromStart(100),
    ];
    let observedFrom = Number.NaN;
    const animation: PaneExpansionAnimation = async ({ from, to, update }) => {
      observedFrom = from;
      update(to);
    };
    const state = new PaneExpansionState({ anchors, animation });
    state.onMeasured(1000);

    await state.settleToAnchorIfNeeded(0);

    expect(observedFrom).toBe(PaneExpansionUnspecified);
    expect(state.currentAnchor).toBe(anchors[1]);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(100);
  });

  it('accepts the positive-infinite Dp analogue for offset anchors', () => {
    const anchor = PaneExpansionAnchor.fromStart(Number.POSITIVE_INFINITY);
    const state = new PaneExpansionState({ anchors: [anchor], initialAnchoredIndex: 0 });
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(1000);
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

  it('uses AndroidX Float.toInt semantics for non-finite animation frames', async () => {
    const anchors = [
      PaneExpansionAnchor.proportion(0.25),
      PaneExpansionAnchor.proportion(0.75),
    ];
    const frames: number[] = [];
    let state!: PaneExpansionState;
    const animation: PaneExpansionAnimation = async ({ update }) => {
      update(Number.POSITIVE_INFINITY);
      frames.push(state.getLayoutState(1000).currentDraggingOffset);
      update(Number.NEGATIVE_INFINITY);
      frames.push(state.getLayoutState(1000).currentDraggingOffset);
      update(Number.NaN);
      frames.push(state.getLayoutState(1000).currentDraggingOffset);
    };
    state = new PaneExpansionState({
      anchors,
      initialAnchoredIndex: 0,
      animation,
    });
    state.onMeasured(1000);

    await state.animateTo(anchors[1]!);

    expect(frames).toEqual([1000, 0, 0]);
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

  it('rounds release velocity to Float before threshold scoring and anchor animation', async () => {
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
    state.onExpansionOffsetMeasured(520);

    const jsVelocity = 199.999999;
    expect(jsVelocity).toBeLessThan(200);
    expect(Math.fround(jsVelocity)).toBe(200);
    await state.settleToAnchorIfNeeded(jsVelocity);

    // The nearest anchor is 500, but AndroidX receives velocity as Float=200f,
    // so the threshold is active and the next anchor in the release direction wins.
    expect(state.currentAnchor).toBe(anchors[2]);
    expect(receivedVelocity).toBe(200);
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

  it('does not cancel a public anchor animation from raw delta alone', async () => {
    const anchors = [
      PaneExpansionAnchor.proportion(0.25),
      PaneExpansionAnchor.proportion(0.75),
    ];
    let updateAnimation: ((offset: number) => void) | undefined;
    let finishAnimation: (() => void) | undefined;
    let animationSignal: AbortSignal | undefined;
    const animation: PaneExpansionAnimation = ({ signal, update }) => {
      animationSignal = signal;
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

    const transition = state.animateTo(anchors[1]!);
    updateAnimation!(500);
    state.dispatchRawDelta(50);

    expect(animationSignal?.aborted).toBe(false);
    expect(state.isSettling).toBe(true);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(550);

    updateAnimation!(600);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(600);

    finishAnimation!();
    await transition;
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(750);
  });

  it('does not cancel a public anchor animation when direct dragging resumes', async () => {
    const anchors = [
      PaneExpansionAnchor.proportion(0.25),
      PaneExpansionAnchor.proportion(0.75),
    ];
    let updateAnimation: ((offset: number) => void) | undefined;
    let finishAnimation: (() => void) | undefined;
    let animationSignal: AbortSignal | undefined;
    const animation: PaneExpansionAnimation = ({ signal, update }) => {
      animationSignal = signal;
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

    const transition = state.animateTo(anchors[1]!);
    updateAnimation!(500);

    state.beginDrag();
    expect(animationSignal?.aborted).toBe(false);
    expect(state.isSettling).toBe(true);
    expect(state.isDragging).toBe(true);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(500);

    updateAnimation!(700);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(700);

    finishAnimation!();
    await transition;
    expect(state.isSettling).toBe(false);
    expect(state.isDragging).toBe(true);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(750);
  });

  it('cancels a mutex-owned settle when direct dragging resumes and snaps its target', async () => {
    const anchors = [
      PaneExpansionAnchor.proportion(0.25),
      PaneExpansionAnchor.proportion(0.75),
    ];
    let updateAnimation: ((offset: number) => void) | undefined;
    let animationSignal: AbortSignal | undefined;
    const animation: PaneExpansionAnimation = ({ signal, update }) => {
      animationSignal = signal;
      updateAnimation = update;
      return new Promise<void>((resolve) => {
        signal.addEventListener('abort', () => resolve(), { once: true });
      });
    };
    const state = new PaneExpansionState({ anchors, animation });
    state.onMeasured(1000);
    state.onExpansionOffsetMeasured(500);

    const transition = state.settleToAnchorIfNeeded(250);
    updateAnimation!(600);
    expect(state.currentAnchor).toBe(anchors[1]);
    expect(state.isSettling).toBe(true);

    state.beginDrag();
    await transition;

    expect(animationSignal?.aborted).toBe(true);
    expect(state.isSettling).toBe(false);
    expect(state.isDragging).toBe(true);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(750);

    updateAnimation!(650);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(750);
  });
});
