import { describe, expect, it } from 'vitest';
import { PaneExpansionUnspecified } from '../../adaptive/paneExpansionState';
import type { PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import {
  PaneAdaptedValue,
  listDetailPaneScaffoldOrder,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';
import { calculateThreePaneScaffoldLayout } from './ThreePaneScaffold.layout';
import { calculatePaneExpansionSpacerMiddleOffset } from './paneExpansionDragHandle.layout';

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

describe('pane expansion handle missing measurable parity', () => {
  it('stays unspecified unless two expanded panes have actual measurables', () => {
    const layoutOptions = {
      width: 1000,
      height: 800,
      directive,
      value: twoPaneValue,
      paneOrder: listDetailPaneScaffoldOrder,
      paneAvailability: {
        primary: true,
        secondary: false,
        tertiary: false,
      },
    } as const;
    const layout = calculateThreePaneScaffoldLayout(layoutOptions);

    expect(layout.primary).toEqual({ left: 0, top: 0, width: 1000, height: 800 });
    expect(layout.secondary).toBeUndefined();
    expect(
      calculatePaneExpansionSpacerMiddleOffset({ layout, layoutOptions }),
    ).toBe(PaneExpansionUnspecified);
  });
});
