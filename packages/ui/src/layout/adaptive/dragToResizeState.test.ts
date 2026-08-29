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

describe('DragToResizeState', () => {
  it('starts from the measured default size and uses the 48px AndroidX minimum', () => {
    const state = new DragToResizeState({ dockedEdge: DockedEdge.Bottom });

    expect(state.measure(measurement)).toEqual({ width: 360, height: 420 });
    state.snapTo(DragToResizeValue.Collapsed);
    expect(state.measure(measurement)).toEqual({ width: 360, height: 48 });
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
    ).toEqual({ width: 0, height: 0 });
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

    expect(state.measure(measurement).height).toBe(600);
  });

  it('reverses drag delta for bottom and right physical edges', () => {
    const bottom = new DragToResizeState({ dockedEdge: DockedEdge.Bottom });
    bottom.measure(measurement);
    bottom.dispatchRawDelta(100);
    expect(bottom.measure(measurement).height).toBe(320);

    const end = new DragToResizeState({ dockedEdge: DockedEdge.End });
    end.measure(measurement);
    end.dispatchRawDelta(100, 'ltr');
    expect(end.measure(measurement).width).toBe(260);
  });

  it('mirrors logical start and end drag direction in RTL', () => {
    const start = new DragToResizeState({ dockedEdge: DockedEdge.Start });
    start.measure({ ...measurement, direction: 'rtl' });
    start.dispatchRawDelta(100, 'rtl');
    expect(start.measure({ ...measurement, direction: 'rtl' }).width).toBe(260);

    const end = new DragToResizeState({ dockedEdge: DockedEdge.End });
    end.measure({ ...measurement, direction: 'rtl' });
    end.dispatchRawDelta(100, 'rtl');
    expect(end.measure({ ...measurement, direction: 'rtl' }).width).toBe(460);
  });

  it('cycles Default/Dragged -> Expanded -> Collapsed -> Default', () => {
    const state = new DragToResizeState({ dockedEdge: DockedEdge.Bottom });
    state.measure(measurement);
    state.dispatchRawDelta(-80);
    expect(state.value).toBe(DragToResizeValue.Dragged);
    expect(state.size).toBe(500);

    state.moveToNextState();
    expect(state.value).toBe(DragToResizeValue.Expanded);
    expect(state.size).toBe(800);

    state.moveToNextState();
    expect(state.value).toBe(DragToResizeValue.Collapsed);
    expect(state.size).toBe(48);

    state.moveToNextState();
    expect(state.value).toBe(DragToResizeValue.Default);
    expect(state.size).toBe(500);
  });
});
