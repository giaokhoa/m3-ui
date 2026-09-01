import { describe, expect, it } from 'vitest';
import { sampleDragToResizeSpring } from './dragToResizeSpring';

describe('drag-to-resize spring Float boundary parity', () => {
  it('quantizes zero-time and equal-Float fast paths before returning', () => {
    const roundsToOne = 1 + Number.EPSILON;
    expect(Math.fround(roundsToOne)).toBe(1);
    expect(sampleDragToResizeSpring(roundsToOne, 1, 0)).toBe(1);
    expect(sampleDragToResizeSpring(roundsToOne, 1, 50)).toBe(1);
  });
});
