import { describe, expect, it } from 'vitest';
import { DockedEdge, DragToResizeState } from './dragToResizeState';

describe('DragToResizeState Float precision', () => {
  it('stores measured size through the Compose Float boundary', () => {
    const state = new DragToResizeState({ dockedEdge: DockedEdge.Top });

    const measured = state.measure({
      measuringWidth: 360,
      measuringHeight: 16777216.6,
      scaffoldWidth: 1000,
      scaffoldHeight: 20000000,
    });

    expect(state.size).toBe(16777216);
    expect(measured).toEqual({ width: 360, height: 16777216 });
  });

  it('performs raw drag addition at Float precision', () => {
    const state = new DragToResizeState({ dockedEdge: DockedEdge.Top });
    state.measure({
      measuringWidth: 360,
      measuringHeight: 16777216,
      scaffoldWidth: 1000,
      scaffoldHeight: 20000000,
    });

    state.dispatchRawDelta(1);

    // 16,777,216 + 1 rounds back to 16,777,216 in Float32. A JS-double
    // implementation would incorrectly retain 16,777,217 here.
    expect(state.size).toBe(16777216);
  });
});
