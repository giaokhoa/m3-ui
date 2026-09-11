import { describe, expect, it } from 'vitest';
import type { PaneScaffoldRole } from '../../adaptive/paneScaffoldRole';
import type { PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import {
  PaneAdaptedValue,
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

describe('ThreePaneScaffold custom reflow role equality', () => {
  it('uses PaneScaffoldRole equality when matching the expanded anchor pane', () => {
    const primaryAlias: PaneScaffoldRole = {
      equals(other: PaneScaffoldRole) {
        return other === 'primary';
      },
    };
    const value: ThreePaneScaffoldValue = {
      primary: PaneAdaptedValue.Expanded,
      secondary: PaneAdaptedValue.Reflowed(primaryAlias),
      tertiary: PaneAdaptedValue.Hidden,
    };

    const layout = calculateThreePaneScaffoldLayout({
      width: 600,
      height: 600,
      directive,
      value,
      paneOrder: supportingPaneScaffoldOrder,
    });

    expect(layout.primary).toEqual({ left: 0, top: 0, width: 600, height: 288 });
    expect(layout.secondary).toEqual({ left: 0, top: 312, width: 600, height: 288 });
  });
});
