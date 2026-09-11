export interface AppBarLayoutInput {
  availableSize: number;
  itemSizes: readonly number[];
  overflowSize: number;
  maxItemCount?: number;
}

export interface AppBarLayout {
  inlineCount: number;
  overflowCount: number;
  hasOverflow: boolean;
}

const sizeTolerance = 0.5;

export function normalizeAppBarMaxItemCount(maxItemCount?: number) {
  if (maxItemCount === undefined || !Number.isFinite(maxItemCount)) {
    return Number.POSITIVE_INFINITY;
  }
  return Math.max(1, Math.floor(maxItemCount));
}

/** Resolves the visible source-order prefix and overflow suffix on either main axis. */
export function resolveAppBarLayout({
  availableSize,
  itemSizes,
  overflowSize,
  maxItemCount,
}: AppBarLayoutInput): AppBarLayout {
  const itemCount = itemSizes.length;
  if (itemCount === 0) {
    return { inlineCount: 0, overflowCount: 0, hasOverflow: false };
  }

  // Preserve the numeric behavior of the original AppBarRow resolver while
  // generalizing width/height into a single main-axis size.
  const safeAvailableSize = Math.max(0, availableSize);
  const safeOverflowSize = Math.max(0, overflowSize);
  const maxCount = normalizeAppBarMaxItemCount(maxItemCount);
  const totalItemSize = itemSizes.reduce(
    (total, size) => total + Math.max(0, size),
    0,
  );
  const countOverflows = itemCount > maxCount;
  const sizeOverflows = totalItemSize > safeAvailableSize + sizeTolerance;

  if (!countOverflows && !sizeOverflows) {
    return { inlineCount: itemCount, overflowCount: 0, hasOverflow: false };
  }

  const inlineCountLimit = Number.isFinite(maxCount)
    ? Math.max(0, maxCount - 1)
    : itemCount;
  const inlineSizeLimit = Math.max(0, safeAvailableSize - safeOverflowSize);
  let inlineCount = 0;
  let usedSize = 0;

  while (inlineCount < itemCount && inlineCount < inlineCountLimit) {
    const nextSize = Math.max(0, itemSizes[inlineCount] ?? 0);
    if (usedSize + nextSize > inlineSizeLimit + sizeTolerance) break;
    usedSize += nextSize;
    inlineCount += 1;
  }

  return {
    inlineCount,
    overflowCount: itemCount - inlineCount,
    hasOverflow: true,
  };
}
