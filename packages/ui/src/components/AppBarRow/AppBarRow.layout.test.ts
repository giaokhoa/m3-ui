import { describe, expect, it } from 'vitest';
import {
  normalizeMaxItemCount,
  resolveAppBarRowLayout,
} from './AppBarRow.layout';

describe('AppBarRow overflow layout', () => {
  it('keeps every item inline and reserves no trigger when all items fit', () => {
    expect(
      resolveAppBarRowLayout({
        availableWidth: 120,
        itemWidths: [40, 40, 40],
        overflowWidth: 40,
      }),
    ).toEqual({ inlineCount: 3, overflowCount: 0, hasOverflow: false });
  });

  it('moves a source-order suffix to overflow when width is constrained', () => {
    expect(
      resolveAppBarRowLayout({
        availableWidth: 119,
        itemWidths: [40, 40, 40],
        overflowWidth: 40,
      }),
    ).toEqual({ inlineCount: 1, overflowCount: 2, hasOverflow: true });
  });

  it('reserves one maxItemCount slot for the overflow trigger', () => {
    expect(
      resolveAppBarRowLayout({
        availableWidth: 400,
        itemWidths: [40, 40, 40, 40, 40],
        overflowWidth: 40,
        maxItemCount: 4,
      }),
    ).toEqual({ inlineCount: 3, overflowCount: 2, hasOverflow: true });
  });

  it('supports trigger-only overflow when maxItemCount is one', () => {
    expect(
      resolveAppBarRowLayout({
        availableWidth: 400,
        itemWidths: [40, 40],
        overflowWidth: 40,
        maxItemCount: 1,
      }),
    ).toEqual({ inlineCount: 0, overflowCount: 2, hasOverflow: true });
  });

  it('normalizes invalid finite count limits without changing the unbounded default', () => {
    expect(normalizeMaxItemCount()).toBe(Number.POSITIVE_INFINITY);
    expect(normalizeMaxItemCount(Number.POSITIVE_INFINITY)).toBe(
      Number.POSITIVE_INFINITY,
    );
    expect(normalizeMaxItemCount(0)).toBe(1);
    expect(normalizeMaxItemCount(3.9)).toBe(3);
  });
});
