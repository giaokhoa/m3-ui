import { describe, expect, it } from 'vitest';
import type { PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import {
  PaneAdaptedValue,
  listDetailPaneScaffoldOrder,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';
import { calculateThreePaneScaffoldLayout } from './ThreePaneScaffold.layout';

const directive: PaneScaffoldDirective = {
  maxHorizontalPartitions: 2,
  horizontalPartitionSpacerSize: '24px',
  maxVerticalPartitions: 1,
  verticalPartitionSpacerSize: '0px',
  defaultPanePreferredWidth: '360px',
  defaultPanePreferredHeight: '420px',
  excludedBounds: [],
  shouldAutoFocusCurrentDestination: true,
};

const twoPaneValue: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Expanded,
  secondary: PaneAdaptedValue.Expanded,
  tertiary: PaneAdaptedValue.Hidden,
};

describe('ThreePaneScaffold excluded bounds parity', () => {
  it('preserves caller order instead of sorting custom excluded bounds', () => {
    const layout = calculateThreePaneScaffoldLayout({
      width: 1000,
      height: 800,
      directive,
      value: twoPaneValue,
      paneOrder: listDetailPaneScaffoldOrder,
      excludedBounds: [
        { left: 700, top: 0, right: 720, bottom: 800 },
        { left: 300, top: 0, right: 320, bottom: 800 },
      ],
    });

    expect(layout.secondary).toEqual({ left: 0, top: 0, width: 700, height: 800 });
    expect(layout.primary).toEqual({ left: 724, top: 0, width: 276, height: 800 });
  });

  it('uses left and right hinge bounds even when their vertical span is outside the scaffold', () => {
    const layout = calculateThreePaneScaffoldLayout({
      width: 1000,
      height: 800,
      directive,
      value: twoPaneValue,
      paneOrder: listDetailPaneScaffoldOrder,
      excludedBounds: [{ left: 490, top: 900, right: 510, bottom: 1000 }],
    });

    expect(layout.secondary).toEqual({ left: 0, top: 0, width: 490, height: 800 });
    expect(layout.primary).toEqual({ left: 514, top: 0, width: 486, height: 800 });
  });
});
