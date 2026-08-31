import { describe, expect, it } from 'vitest';
import { DockedEdge, DragToResizeState } from './dragToResizeState';

describe('DragToResizeState zero-measurement direction parity', () => {
  it('does not lock logical Start to placeholder LTR before real RTL geometry', () => {
    const state = new DragToResizeState({ dockedEdge: DockedEdge.Start });

    expect(
      state.measure({
        measuringWidth: 0,
        measuringHeight: 0,
        scaffoldWidth: 0,
        scaffoldHeight: 0,
        direction: 'ltr',
      }),
    ).toBeUndefined();

    expect(
      state.measure({
        measuringWidth: 360,
        measuringHeight: 420,
        scaffoldWidth: 1000,
        scaffoldHeight: 800,
        direction: 'rtl',
      }),
    ).toEqual({ width: 360, height: 420 });

    state.dispatchRawDelta(100, 'rtl');
    expect(
      state.measure({
        measuringWidth: 360,
        measuringHeight: 420,
        scaffoldWidth: 1000,
        scaffoldHeight: 800,
        direction: 'rtl',
      })?.width,
    ).toBe(260);
  });
});
