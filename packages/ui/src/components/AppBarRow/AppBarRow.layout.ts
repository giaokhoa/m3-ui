import {
  normalizeAppBarMaxItemCount,
  resolveAppBarLayout,
  type AppBarLayout,
} from '../../internal/appBar/appBarLayout';

export interface AppBarRowLayoutInput {
  availableWidth: number;
  itemWidths: readonly number[];
  overflowWidth: number;
  maxItemCount?: number;
}

export type AppBarRowLayout = AppBarLayout;

export const normalizeMaxItemCount = normalizeAppBarMaxItemCount;

/** Horizontal adapter kept for AppBarRow API/test clarity. */
export function resolveAppBarRowLayout({
  availableWidth,
  itemWidths,
  overflowWidth,
  maxItemCount,
}: AppBarRowLayoutInput): AppBarRowLayout {
  return resolveAppBarLayout({
    availableSize: availableWidth,
    itemSizes: itemWidths,
    overflowSize: overflowWidth,
    maxItemCount,
  });
}
