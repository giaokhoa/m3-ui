import type { ThreePaneScaffoldHorizontalOrder } from './threePaneScaffold';

/**
 * AndroidX ThreePaneScaffoldHorizontalOrder requires all three pane roles to be
 * unique. Keep that constructor invariant at the browser calculator boundary
 * without restricting callers to the two canonical orders currently exposed by
 * AndroidX.
 */
export function assertThreePaneScaffoldHorizontalOrder(
  paneOrder: ThreePaneScaffoldHorizontalOrder,
): void {
  const [first, second, third] = paneOrder;
  if (first === second || second === third || first === third) {
    throw new RangeError(
      `invalid ThreePaneScaffoldHorizontalOrder(${first}, ${second}, ${third}) - panes must be unique`,
    );
  }
}
