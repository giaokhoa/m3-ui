import { describe, expect, it } from 'vitest';
import {
  normalizeAppBarMaxItemCount,
  resolveAppBarLayout,
} from './appBarLayout';

describe('shared AppBar main-axis overflow layout', () => {
  it('handles empty and one-item layouts', () => {
    expect(
      resolveAppBarLayout({ availableSize: 0, itemSizes: [], overflowSize: 48 }),
    ).toEqual({ inlineCount: 0, overflowCount: 0, hasOverflow: false });
    expect(
      resolveAppBarLayout({ availableSize: 48, itemSizes: [48], overflowSize: 48 }),
    ).toEqual({ inlineCount: 1, overflowCount: 0, hasOverflow: false });
  });

  it('keeps every item inline when all fit', () => {
    expect(
      resolveAppBarLayout({
        availableSize: 144,
        itemSizes: [48, 48, 48],
        overflowSize: 48,
      }),
    ).toEqual({ inlineCount: 3, overflowCount: 0, hasOverflow: false });
  });

  it('keeps a source-order prefix for mixed sizes', () => {
    expect(
      resolveAppBarLayout({
        availableSize: 140,
        itemSizes: [32, 56, 24, 40],
        overflowSize: 48,
      }),
    ).toEqual({ inlineCount: 2, overflowCount: 2, hasOverflow: true });
  });

  it('supports an overflow trigger larger than the available size', () => {
    expect(
      resolveAppBarLayout({
        availableSize: 32,
        itemSizes: [24, 24],
        overflowSize: 48,
      }),
    ).toEqual({ inlineCount: 0, overflowCount: 2, hasOverflow: true });
  });

  it('reserves one maxItemCount slot for overflow', () => {
    expect(
      resolveAppBarLayout({
        availableSize: 500,
        itemSizes: [40, 40, 40, 40],
        overflowSize: 40,
        maxItemCount: 3,
      }),
    ).toEqual({ inlineCount: 2, overflowCount: 2, hasOverflow: true });
  });

  it('normalizes negative and non-finite inputs consistently', () => {
    expect(normalizeAppBarMaxItemCount(0)).toBe(1);
    expect(normalizeAppBarMaxItemCount(-5)).toBe(1);
    expect(normalizeAppBarMaxItemCount(Number.POSITIVE_INFINITY)).toBe(
      Number.POSITIVE_INFINITY,
    );
    expect(
      resolveAppBarLayout({
        availableSize: -10,
        itemSizes: [-4, Number.NaN],
        overflowSize: Number.NaN,
      }),
    ).toEqual({ inlineCount: 2, overflowCount: 0, hasOverflow: false });
  });
});
