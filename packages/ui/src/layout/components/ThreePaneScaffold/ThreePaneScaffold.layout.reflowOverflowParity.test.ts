import { describe, expect, it } from 'vitest';
import type { PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import {
  PaneAdaptedValue,
  ThreePaneScaffoldRole,
  supportingPaneScaffoldOrder,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';
import { calculateThreePaneScaffoldLayoutPass } from './ThreePaneScaffold.layout';

const reflowedValue: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Expanded,
  secondary: PaneAdaptedValue.Reflowed(ThreePaneScaffoldRole.Primary),
  tertiary: PaneAdaptedValue.Hidden,
};

const overflowVerticalDirective: PaneScaffoldDirective = {
  maxHorizontalPartitions: 1,
  horizontalPartitionSpacerSize: '0px',
  maxVerticalPartitions: 2,
  verticalPartitionSpacerSize: '2147483647px',
  defaultPanePreferredWidth: '360px',
  defaultPanePreferredHeight: '420px',
  excludedBounds: [],
  shouldAutoFocusCurrentDestination: true,
};

describe('ThreePaneScaffold reflow Int overflow parity', () => {
  it('wraps reflow subtraction and vertical placement like Kotlin Int', () => {
    const layout = calculateThreePaneScaffoldLayoutPass({
      width: 600,
      height: 1000,
      directive: overflowVerticalDirective,
      value: reflowedValue,
      paneOrder: supportingPaneScaffoldOrder,
      preferredHeights: { secondary: 2147483647 },
    });

    // availableHeight = 1000 - Int.MAX_VALUE = -2147482647.
    // Subtracting the preferred height wraps to 1002, which wins max(..., / 2).
    expect(layout.raw.primary).toEqual({ left: 0, top: 0, width: 600, height: 1002 });
    expect(layout.raw.secondary).toEqual({
      left: 0,
      top: -2147482647,
      width: 600,
      height: 2147483647,
    });
    expect(layout.placed).toEqual(layout.raw);
  });
});
