import { describe, expect, it } from 'vitest';
import {
  DockedEdge,
  DragToResizeState,
  DragToResizeValue,
} from './dragToResizeState';

const measurement = {
  measuringWidth: 360,
  measuringHeight: 420,
  scaffoldWidth: 1000,
  scaffoldHeight: 800,
} as const;

describe('DragToResizeState NaN animation parity', () => {
  it('recovers a NaN dragged size by animating to the target', async () => {
    const state = new DragToResizeState({ dockedEdge: DockedEdge.Top });
    state.measure(measurement);
    state.dispatchRawDelta(Number.NaN);

    expect(state.value).toBe(DragToResizeValue.Dragged);
    expect(Number.isNaN(state.size)).toBe(true);

    await state.animateTo(DragToResizeValue.Expanded);

    // FloatSpringSpec estimates a NaN displacement as a zero-duration spring
    // because the final Double NaN converts to 0L. TargetBasedAnimation sees
    // playTime 0 as finished and returns the target directly.
    expect(state.value).toBe(DragToResizeValue.Expanded);
    expect(state.size).toBe(800);
    expect(state.measure(measurement)?.height).toBe(800);
  });

  it('passes NaN through to a custom animation driver instead of suppressing it', async () => {
    let observedFrom = 0;
    const state = new DragToResizeState({
      dockedEdge: DockedEdge.Top,
      animation: async ({ from, to, update }) => {
        observedFrom = from;
        update(to);
      },
    });
    state.measure(measurement);
    state.dispatchRawDelta(Number.NaN);

    await state.animateTo(DragToResizeValue.Collapsed);

    expect(Number.isNaN(observedFrom)).toBe(true);
    expect(state.value).toBe(DragToResizeValue.Collapsed);
    expect(state.size).toBe(48);
  });
});
