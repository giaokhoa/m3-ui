import { describe, expect, it } from 'vitest';
import type { PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import {
  PaneAdaptedValue,
  listDetailPaneScaffoldOrder,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';
import { calculateThreePaneScaffoldLayout } from './ThreePaneScaffold.layout';

const twoExpanded: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Expanded,
  secondary: PaneAdaptedValue.Expanded,
  tertiary: PaneAdaptedValue.Hidden,
};

const overflowSpacerDirective: PaneScaffoldDirective = {
  maxHorizontalPartitions: 2,
  horizontalPartitionSpacerSize: '2147483647px',
  maxVerticalPartitions: 1,
  verticalPartitionSpacerSize: '0px',
  defaultPanePreferredWidth: '360px',
  defaultPanePreferredHeight: '420px',
  excludedBounds: [],
  shouldAutoFocusCurrentDestination: true,
};

describe('ThreePaneScaffold excluded-bound Int overflow parity', () => {
  it('keeps the partition after a hinge when left + spacer wraps', () => {
    const layout = calculateThreePaneScaffoldLayout({
      width: 1000,
      height: 800,
      directive: overflowSpacerDirective,
      value: twoExpanded,
      paneOrder: listDetailPaneScaffoldOrder,
      excludedBounds: [{ left: 500, top: 0, right: 501, bottom: 800 }],
    });

    // AndroidX: 500 + Int.MAX_VALUE wraps negative, so max(501, wrapped) == 501.
    // Both physical partitions survive and are assigned directly to the two panes.
    expect(layout.secondary).toEqual({ left: 0, top: 0, width: 500, height: 800 });
    expect(layout.primary).toEqual({ left: 501, top: 0, width: 499, height: 800 });
  });
});
