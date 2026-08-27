export interface AppBarRowLayoutInput {
  availableWidth: number;
  itemWidths: readonly number[];
  overflowWidth: number;
  maxItemCount?: number;
}

export interface AppBarRowLayout {
  inlineCount: number;
  overflowCount: number;
  hasOverflow: boolean;
}

const widthTolerance = 0.5;

export function normalizeMaxItemCount(maxItemCount?: number) {
  if (maxItemCount === undefined || !Number.isFinite(maxItemCount)) {
    return Number.POSITIVE_INFINITY;
  }
  return Math.max(1, Math.floor(maxItemCount));
}

/** Resolves the visible source-order prefix and overflow suffix. */
export function resolveAppBarRowLayout({
  availableWidth,
  itemWidths,
  overflowWidth,
  maxItemCount,
}: AppBarRowLayoutInput): AppBarRowLayout {
  const itemCount = itemWidths.length;
  if (itemCount === 0) {
    return { inlineCount: 0, overflowCount: 0, hasOverflow: false };
  }

  const safeAvailableWidth = Math.max(0, availableWidth);
  const safeOverflowWidth = Math.max(0, overflowWidth);
  const maxCount = normalizeMaxItemCount(maxItemCount);
  const totalItemWidth = itemWidths.reduce(
    (total, width) => total + Math.max(0, width),
    0,
  );
  const countOverflows = itemCount > maxCount;
  const widthOverflows = totalItemWidth > safeAvailableWidth + widthTolerance;

  if (!countOverflows && !widthOverflows) {
    return {
      inlineCount: itemCount,
      overflowCount: 0,
      hasOverflow: false,
    };
  }

  const inlineCountLimit = Number.isFinite(maxCount)
    ? Math.max(0, maxCount - 1)
    : itemCount;
  const inlineWidthLimit = Math.max(0, safeAvailableWidth - safeOverflowWidth);
  let inlineCount = 0;
  let usedWidth = 0;

  while (inlineCount < itemCount && inlineCount < inlineCountLimit) {
    const nextWidth = Math.max(0, itemWidths[inlineCount] ?? 0);
    if (usedWidth + nextWidth > inlineWidthLimit + widthTolerance) break;
    usedWidth += nextWidth;
    inlineCount += 1;
  }

  return {
    inlineCount,
    overflowCount: itemCount - inlineCount,
    hasOverflow: true,
  };
}
