import { describe, expect, it } from 'vitest';
import {
  DockedEdge,
  DragToResizeState,
  DragToResizeValue,
  type DragToResizeAnimation,
} from './dragToResizeState';

const measurement = {
  measuringWidth: 360,
  measuringHeight: 420,
  scaffoldWidth: 1000,
  scaffoldHeight: 800,
} as const;

const instantAnimation: DragToResizeAnimation = async ({ to, update }) => {
  update(to);
};

describe('DragToResizeState', () => {
  it('starts from the measured default size and uses the 48px AndroidX minimum', () => {
    const state = new DragToResizeState({ dockedEdge: DockedEdge.Bottom });

    expect(state.measure(measurement)).toEqual({ width: 360, height: 420 });
    state.snapTo(DragToResizeValue.Collapsed);
    expect(state.measure(measurement)).toEqual({ width: 360, height: 48 });
  });

  it('rounds explicit min and max constraints like AndroidX roundToPx()', () => {
    const state = new DragToResizeState({
      dockedEdge: DockedEdge.Bottom,
      minSize: 48.5,
      maxSize: 600.5,
    });
    state.measure(measurement);

    state.snapTo(DragToResizeValue.Collapsed);
    expect(state.measure(measurement)?.height).toBe(49);

    state.snapTo(DragToResizeValue.Expanded);
    expect(state.measure(measurement)?.height).toBe(601);
  });

  it('preserves AndroidX negative, infinity, and unspecified resize bounds', () => {
    const negativeMin = new DragToResizeState({
      dockedEdge: DockedEdge.Bottom,
      minSize: -20,
    });
    negativeMin.measure(measurement);
    negativeMin.snapTo(DragToResizeValue.Collapsed);
    expect(negativeMin.size).toBe(-20);
    expect(negativeMin.measure(measurement)?.height).toBe(-20);

    const infiniteMax = new DragToResizeState({
      dockedEdge: DockedEdge.Bottom,
      maxSize: Number.POSITIVE_INFINITY,
    });
    infiniteMax.measure(measurement);
    infiniteMax.snapTo(DragToResizeValue.Expanded);
    expect(infiniteMax.measure(measurement)?.height).toBe(800);

    const unspecifiedMin = new DragToResizeState({
      dockedEdge: DockedEdge.Bottom,
      minSize: Number.NaN,
    });
    unspecifiedMin.measure(measurement);
    unspecifiedMin.snapTo(DragToResizeValue.Collapsed);
    expect(unspecifiedMin.measure(measurement)?.height).toBe(48);
  });

  it('keeps raw target size when explicit bounds produce an empty range', () => {
    const state = new DragToResizeState({
      dockedEdge: DockedEdge.Bottom,
      maxSize: -10,
    });
    state.measure(measurement);

    state.snapTo(DragToResizeValue.Expanded);

    // AndroidX keeps an empty Float range and its size setter therefore does
    // not coerce the raw click target. Pane measurement clamps only later.
    expect(state.size).toBe(-10);
    expect(state.measure(measurement)?.height).toBe(-10);
  });

  it('ignores transient zero-size scaffold measurements before real layout', () => {
    const state = new DragToResizeState({ dockedEdge: DockedEdge.Bottom });

    expect(
      state.measure({
        measuringWidth: 0,
        measuringHeight: 0,
        scaffoldWidth: 0,
        scaffoldHeight: 0,
      }),
    ).toBeUndefined();
    expect(state.value).toBe(DragToResizeValue.Default);
    expect(Number.isNaN(state.size)).toBe(true);

    expect(state.measure(measurement)).toEqual({ width: 360, height: 420 });
    expect(state.value).toBe(DragToResizeValue.Default);
    expect(state.size).toBe(420);
  });

  it('clamps expanded size to the scaffold and explicit max size', () => {
    const state = new DragToResizeState({
      dockedEdge: DockedEdge.Bottom,
      maxSize: 600,
    });
    state.measure(measurement);
    state.snapTo(DragToResizeValue.Expanded);

    expect(state.measure(measurement)?.height).toBe(600);
  });

  it('reverses drag delta for bottom and right physical edges', () => {
    const bottom = new DragToResizeState({ dockedEdge: DockedEdge.Bottom });
    bottom.measure(measurement);
    bottom.dispatchRawDelta(100);
    expect(bottom.measure(measurement)?.height).toBe(320);

    const end = new DragToResizeState({ dockedEdge: DockedEdge.End });
    end.measure(measurement);
    end.dispatchRawDelta(100, 'ltr');
    expect(end.measure(measurement)?.width).toBe(260);
  });

  it('lets the AndroidX range setter handle non-finite raw deltas', () => {
    const state = new DragToResizeState({ dockedEdge: DockedEdge.Top });
    state.measure(measurement);

    state.dispatchRawDelta(Number.POSITIVE_INFINITY);
    expect(state.value).toBe(DragToResizeValue.Expanded);
    expect(state.size).toBe(800);

    state.dispatchRawDelta(Number.NEGATIVE_INFINITY);
    expect(state.value).toBe(DragToResizeValue.Collapsed);
    expect(state.size).toBe(48);

    state.dispatchRawDelta(Number.NaN);
    expect(state.value).toBe(DragToResizeValue.Dragged);
    expect(Number.isNaN(state.size)).toBe(true);
    expect(state.measure(measurement)?.height).toBe(0);
  });

  it('keeps subpixel physics internally but truncates the measured pane size', () => {
    const state = new DragToResizeState({ dockedEdge: DockedEdge.Bottom });
    state.measure(measurement);

    state.dispatchRawDelta(0.75);

    expect(state.size).toBe(419.25);
    expect(state.measure(measurement)?.height).toBe(419);
  });

  it('mirrors logical start and end drag direction in RTL', () => {
    const start = new DragToResizeState({ dockedEdge: DockedEdge.Start });
    start.measure({ ...measurement, direction: 'rtl' });
    start.dispatchRawDelta(100, 'rtl');
    expect(start.measure({ ...measurement, direction: 'rtl' })?.width).toBe(260);

    const end = new DragToResizeState({ dockedEdge: DockedEdge.End });
    end.measure({ ...measurement, direction: 'rtl' });
    end.dispatchRawDelta(100, 'rtl');
    expect(end.measure({ ...measurement, direction: 'rtl' })?.width).toBe(460);
  });

  it('keeps the remembered physical edge when layout direction later changes', () => {
    const start = new DragToResizeState({ dockedEdge: DockedEdge.Start });
    start.measure({ ...measurement, direction: 'ltr' });

    // AndroidX remembers a concrete Left state for Start in LTR. A later
    // layout-direction change does not replace that state with Right.
    start.measure({ ...measurement, direction: 'rtl' });
    start.dispatchRawDelta(100, 'rtl');

    expect(start.measure({ ...measurement, direction: 'rtl' })?.width).toBe(460);
  });

  it('snaps Default -> Expanded without invoking the spring driver', async () => {
    let animationCalled = false;
    const state = new DragToResizeState({
      dockedEdge: DockedEdge.Bottom,
      animation: async () => {
        animationCalled = true;
      },
    });
    state.measure(measurement);

    await state.animateTo(DragToResizeValue.Expanded);

    expect(animationCalled).toBe(false);
    expect(state.value).toBe(DragToResizeValue.Expanded);
    expect(state.size).toBe(800);
  });

  it('animates non-default state changes while exposing the semantic target immediately', async () => {
    let updateAnimation: ((size: number) => void) | undefined;
    let finishAnimation: (() => void) | undefined;
    const animation: DragToResizeAnimation = ({ update }) => {
      updateAnimation = update;
      return new Promise<void>((resolve) => {
        finishAnimation = resolve;
      });
    };
    const state = new DragToResizeState({
      dockedEdge: DockedEdge.Bottom,
      animation,
    });
    state.measure(measurement);
    state.snapTo(DragToResizeValue.Expanded);

    const transition = state.animateTo(DragToResizeValue.Collapsed);
    expect(state.value).toBe(DragToResizeValue.Collapsed);
    expect(state.size).toBe(800);
    expect(state.measure(measurement)?.height).toBe(800);
    expect(state.value).toBe(DragToResizeValue.Collapsed);

    updateAnimation!(424.75);
    expect(state.value).toBe(DragToResizeValue.Collapsed);
    expect(state.size).toBe(424.75);
    expect(state.measure(measurement)?.height).toBe(424);
    expect(state.value).toBe(DragToResizeValue.Collapsed);

    finishAnimation!();
    await transition;
    expect(state.value).toBe(DragToResizeValue.Collapsed);
    expect(state.size).toBe(48);
  });

  it('cycles Dragged -> Expanded -> Collapsed -> Default and restores the dragged default size', async () => {
    const state = new DragToResizeState({
      dockedEdge: DockedEdge.Bottom,
      animation: instantAnimation,
    });
    state.measure(measurement);
    state.dispatchRawDelta(-80);
    expect(state.value).toBe(DragToResizeValue.Dragged);
    expect(state.size).toBe(500);

    await state.animateTo(state.nextValue);
    expect(state.value).toBe(DragToResizeValue.Expanded);
    expect(state.size).toBe(800);

    await state.animateTo(state.nextValue);
    expect(state.value).toBe(DragToResizeValue.Collapsed);
    expect(state.size).toBe(48);

    await state.animateTo(state.nextValue);
    expect(state.value).toBe(DragToResizeValue.Default);
    expect(state.size).toBe(500);
  });

  it('keeps an active click-to-resize spring running when direct dragging resumes', async () => {
    let updateAnimation: ((size: number) => void) | undefined;
    let finishAnimation: (() => void) | undefined;
    let animationSignal: AbortSignal | undefined;
    const animation: DragToResizeAnimation = ({ signal, update }) => {
      animationSignal = signal;
      updateAnimation = update;
      return new Promise<void>((resolve) => {
        finishAnimation = resolve;
      });
    };
    const state = new DragToResizeState({
      dockedEdge: DockedEdge.Bottom,
      animation,
    });
    state.measure(measurement);
    state.snapTo(DragToResizeValue.Expanded);

    const transition = state.animateTo(DragToResizeValue.Collapsed);
    updateAnimation!(700);
    expect(state.size).toBe(700);

    state.dispatchRawDelta(20);
    expect(animationSignal?.aborted).toBe(false);
    expect(state.value).toBe(DragToResizeValue.Dragged);
    expect(state.size).toBe(680);

    updateAnimation!(500);
    expect(state.value).toBe(DragToResizeValue.Dragged);
    expect(state.size).toBe(500);

    finishAnimation!();
    await transition;
    expect(state.value).toBe(DragToResizeValue.Collapsed);
    expect(state.size).toBe(48);
  });

  it('keeps prior click-to-resize springs running when another target starts', async () => {
    const animations: Array<{
      signal: AbortSignal;
      update: (size: number) => void;
      finish: () => void;
    }> = [];
    const animation: DragToResizeAnimation = ({ signal, update }) =>
      new Promise<void>((resolve) => {
        animations.push({ signal, update, finish: resolve });
      });
    const state = new DragToResizeState({
      dockedEdge: DockedEdge.Bottom,
      animation,
    });
    state.measure(measurement);
    state.snapTo(DragToResizeValue.Expanded);

    const first = state.animateTo(DragToResizeValue.Collapsed);
    const second = state.animateTo(DragToResizeValue.Default);

    expect(animations).toHaveLength(2);
    expect(animations[0]!.signal.aborted).toBe(false);
    expect(animations[1]!.signal.aborted).toBe(false);

    animations[0]!.update(700);
    animations[1]!.update(500);
    expect(state.size).toBe(500);

    animations[0]!.finish();
    await first;
    expect(animations[1]!.signal.aborted).toBe(false);

    animations[1]!.finish();
    await second;
    expect(state.size).toBe(420);
  });
});
