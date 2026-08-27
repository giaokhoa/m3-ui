import {
  resolveAppBarLayout,
  type AppBarLayout,
} from '../../internal/appBar/appBarLayout';

export interface AppBarColumnLayoutInput {
  availableHeight: number;
  itemHeights: readonly number[];
  overflowHeight: number;
  maxItemCount?: number;
}

export type AppBarColumnLayout = AppBarLayout;

/** Vertical adapter over the shared AppBar main-axis resolver. */
export function resolveAppBarColumnLayout({
  availableHeight,
  itemHeights,
  overflowHeight,
  maxItemCount,
}: AppBarColumnLayoutInput): AppBarColumnLayout {
  return resolveAppBarLayout({
    availableSize: availableHeight,
    itemSizes: itemHeights,
    overflowSize: overflowHeight,
    maxItemCount,
  });
}
