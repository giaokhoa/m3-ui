import { describe, expect, it } from 'vitest';
import { PaneExpansionState } from '../../adaptive/paneExpansionState';
import type { PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import {
  PaneAdaptedValue,
  listDetailPaneScaffoldOrder,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';
import { calculateThreePaneScaffoldLayout } from './ThreePaneScaffold.layout';

const directive: PaneScaffoldDirective = {
  maxHorizontalPartitions: 2,
  horizontalPartitionSpacerSize: '0px',
  maxVerticalPartitions: 1,
  verticalPartitionSpacerSize: '0px',
  defaultPanePreferredWidth: '20px',
  defaultPanePreferredHeight: '20px',
  excludedBounds: [],
  shouldAutoFocusCurrentDestination: true,
};

const twoPaneValue: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Expanded,
  secondary: PaneAdaptedValue.Expanded,
  tertiary: PaneAdaptedValue.Hidden,
};

describe('ThreePaneScaffold Compose Float pane proportions', () => {
  it('uses Float multiplication before toInt for explicit proportions', () => {
    const paneExpansionState = new PaneExpansionState();
    paneExpansionState.setFirstPaneProportion(0.58);

    const layout = calculateThreePaneScaffoldLayout({
      width: 50,
      height: 20,
      directive,
      value: twoPaneValue,
      paneOrder: listDetailPaneScaffoldOrder,
      paneExpansionState,
    });

    // AndroidX computes 50 * 0.58f as 29f before toInt(). Raw JS double
    // multiplication is 28.999999999999996 and would truncate to 28.
    expect(layout.secondary).toEqual({ left: 0, top: 0, width: 29, height: 20 });
    expect(layout.primary).toEqual({ left: 29, top: 0, width: 21, height: 20 });
  });
});
