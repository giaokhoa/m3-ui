import { describe, expect, it } from 'vitest';
import {
  buttonGroupOverflowMenuElevation,
  defaultButtonGroupExpandedRatio,
  distributePressedWidths,
  visiblePrefixCount,
} from './ButtonGroup.defaults';

describe('ButtonGroup runtime defaults', () => {
  it('keeps only runtime ratio and semantic overflow elevation beside the consumer', () => {
    expect(defaultButtonGroupExpandedRatio).toBe(0.15);
    expect(buttonGroupOverflowMenuElevation).toBe('level2');
  });

  it('expands a middle item by borrowing half from each neighbor', () => {
    expect(distributePressedWidths({
      widths: [100, 120, 80],
      maxCompression: [24, 24, 24],
      pressedIndex: 1,
      expandedRatio: 0.15,
    })).toEqual([91, 138, 71]);
  });

  it('expands edge items from one side and clamps at compression limit', () => {
    expect(distributePressedWidths({
      widths: [100, 70, 80],
      maxCompression: [24, 8, 24],
      pressedIndex: 0,
      expandedRatio: 0.15,
    })).toEqual([108, 62, 80]);
    expect(distributePressedWidths({
      widths: [70, 80, 100],
      maxCompression: [6, 24, 24],
      pressedIndex: 2,
      expandedRatio: 0.15,
    })).toEqual([70, 65, 115]);
  });

  it('keeps total geometry constant while pressed', () => {
    const before = [88, 104, 96, 110];
    const after = distributePressedWidths({
      widths: before,
      maxCompression: [24, 24, 24, 24],
      pressedIndex: 2,
      expandedRatio: 0.15,
    });
    expect(after.reduce((sum, width) => sum + width, 0)).toBeCloseTo(
      before.reduce((sum, width) => sum + width, 0),
      8,
    );
  });

  it('computes an ordered visible prefix while reserving overflow indicator space', () => {
    expect(visiblePrefixCount([70, 80, 90], 300, 12, 40)).toBe(3);
    expect(visiblePrefixCount([70, 80, 90], 230, 12, 40)).toBe(2);
    expect(visiblePrefixCount([70, 80, 90], 100, 12, 40)).toBe(0);
  });
});
