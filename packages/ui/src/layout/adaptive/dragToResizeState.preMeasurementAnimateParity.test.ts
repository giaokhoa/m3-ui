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

describe('DragToResizeState pre-measure animation parity', () => {
  it('applies Default -> Expanded against the initial 0f..0f range', async () => {
    let animationCalled = false;
    const state = new DragToResizeState({
      dockedEdge: DockedEdge.Bottom,
      animation: async () => {
        animationCalled = true;
      },
    });

    await state.animateTo(DragToResizeValue.Expanded);

    // AndroidX handles State.Default synchronously before animation-core. The
    // unmeasured vertical range is initially 0f..0f, so the click target snaps
    // to zero and the semantic target is then assigned to Expanded.
    expect(animationCalled).toBe(false);
    expect(state.value).toBe(DragToResizeValue.Expanded);
    expect(state.size).toBe(0);

    // The first real measurement replaces the range with 48f..800f and the
    // existing zero size is re-coerced by the setter, which changes state to
    // Collapsed exactly like getAndUpdateDraggedSize upstream.
    expect(state.measure(measurement)).toEqual({ width: 360, height: 48 });
    expect(state.value).toBe(DragToResizeValue.Collapsed);
    expect(state.size).toBe(48);
  });
});
