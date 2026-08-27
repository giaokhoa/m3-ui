import { describe, expect, it } from 'vitest';
import { resolveAppBarColumnLayout } from './AppBarColumn.layout';

describe('AppBarColumn overflow layout', () => {
  it('maps height metrics to the shared main-axis resolver', () => {
    expect(
      resolveAppBarColumnLayout({
        availableHeight: 119,
        itemHeights: [40, 40, 40],
        overflowHeight: 40,
      }),
    ).toEqual({ inlineCount: 1, overflowCount: 2, hasOverflow: true });
  });

  it('keeps all items inline when their heights fit', () => {
    expect(
      resolveAppBarColumnLayout({
        availableHeight: 120,
        itemHeights: [40, 40, 40],
        overflowHeight: 40,
      }),
    ).toEqual({ inlineCount: 3, overflowCount: 0, hasOverflow: false });
  });

  it('reserves an overflow slot for maxItemCount', () => {
    expect(
      resolveAppBarColumnLayout({
        availableHeight: 400,
        itemHeights: [40, 40, 40, 40],
        overflowHeight: 40,
        maxItemCount: 3,
      }),
    ).toEqual({ inlineCount: 2, overflowCount: 2, hasOverflow: true });
  });
});
