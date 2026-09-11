import { describe, expect, it, vi } from 'vitest';
import { PaneExpansionState } from './paneExpansionState';

describe('PaneExpansionState unmeasured drag range parity', () => {
  it('throws when a measured handle offset is dragged before scaffold width exists', () => {
    const consumeDragDelta = vi.fn((delta: number) => delta);
    const state = new PaneExpansionState({ consumeDragDelta });

    state.onExpansionOffsetMeasured(100);

    // AndroidX dispatchRawDelta checks only currentMeasuredDraggingOffset. It
    // then assigns currentDraggingOffset, whose coerceIn(0, maxExpansionWidth)
    // receives the still-unmeasured max width sentinel -1 and rejects the empty
    // [0, -1] range.
    expect(() => state.dispatchRawDelta(1)).toThrow(RangeError);
    expect(consumeDragDelta).toHaveBeenCalledWith(1);
  });
});
