import { describe, expect, it } from 'vitest';
import type { PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import {
  PaneAdaptedValue,
  listDetailPaneScaffoldOrder,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';
import { calculateThreePaneScaffoldLayoutPass } from './ThreePaneScaffold.layout';

const allExpanded: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Expanded,
  secondary: PaneAdaptedValue.Expanded,
  tertiary: PaneAdaptedValue.Expanded,
};

const overflowSpacerDirective: PaneScaffoldDirective = {
  maxHorizontalPartitions: 3,
  horizontalPartitionSpacerSize: '2147483647px',
  maxVerticalPartitions: 1,
  verticalPartitionSpacerSize: '0px',
  defaultPanePreferredWidth: '360px',
  defaultPanePreferredHeight: '420px',
  excludedBounds: [],
  shouldAutoFocusCurrentDestination: true,
};

describe('ThreePaneScaffold Int overflow parity', () => {
  it('wraps partition allocation and placement arithmetic like Kotlin Int', () => {
    const layout = calculateThreePaneScaffoldLayoutPass({
      width: 1000,
      height: 800,
      directive: overflowSpacerDirective,
      value: allExpanded,
      paneOrder: listDetailPaneScaffoldOrder,
    });

    // AndroidX Int arithmetic:
    // 2 * Int.MAX_VALUE == -2, so allocatableWidth = 1000 - (-2) = 1002.
    // 360 * (1002f / 1080f) truncates to 334 for every pane.
    expect(layout.raw.secondary).toEqual({ left: 0, top: 0, width: 334, height: 800 });
    expect(layout.raw.primary).toEqual({
      left: -2147483315,
      top: 0,
      width: 334,
      height: 800,
    });
    expect(layout.raw.tertiary).toEqual({ left: 666, top: 0, width: 334, height: 800 });

    expect(layout.placed).toEqual(layout.raw);
  });
});
