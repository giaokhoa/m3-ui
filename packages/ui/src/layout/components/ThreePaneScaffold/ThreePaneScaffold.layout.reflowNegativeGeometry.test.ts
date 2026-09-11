import { describe, expect, it } from 'vitest';
import type { PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import {
  PaneAdaptedValue,
  ThreePaneScaffoldRole,
  supportingPaneScaffoldOrder,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';
import { calculateThreePaneScaffoldLayout } from './ThreePaneScaffold.layout';

const directive: PaneScaffoldDirective = {
  maxHorizontalPartitions: 1,
  horizontalPartitionSpacerSize: '0px',
  maxVerticalPartitions: 2,
  verticalPartitionSpacerSize: '24px',
  defaultPanePreferredWidth: '360px',
  defaultPanePreferredHeight: '420px',
  excludedBounds: [],
  shouldAutoFocusCurrentDestination: true,
};

const value: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Expanded,
  secondary: PaneAdaptedValue.Reflowed(ThreePaneScaffoldRole.Primary),
  tertiary: PaneAdaptedValue.Hidden,
};

describe('ThreePaneScaffold negative reflow geometry', () => {
  it('keeps raw negative height for offset progression while measuring panes at zero height', () => {
    const layout = calculateThreePaneScaffoldLayout({
      width: 600,
      height: 10,
      directive,
      value,
      paneOrder: supportingPaneScaffoldOrder,
    });

    // 10 - 24 = -14 available height. AndroidX Int math chooses -7 for
    // both raw pane heights, so the reflowed pane starts at -7 + 24 = 17.
    // PaneMeasurable.measuredHeight then clamps each actual measurement to 0.
    expect(layout.primary).toEqual({ left: 0, top: 0, width: 600, height: 0 });
    expect(layout.secondary).toEqual({ left: 0, top: 17, width: 600, height: 0 });
  });
});
