import { describe, expect, it } from 'vitest';
import { PaneExpansionState } from '../../adaptive/paneExpansionState';
import type { PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import {
  PaneAdaptedValue,
  PaneAlignment,
  ThreePaneScaffoldRole,
  listDetailPaneScaffoldOrder,
  supportingPaneScaffoldOrder,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';
import { calculateLevitatedPanePlacement } from './LevitatedPane.layout';
import {
  calculatePaneExpansionDragHandlePlacement,
  calculatePaneExpansionSpacerMiddleOffset,
} from './paneExpansionDragHandle.layout';
import { applyPaneMargins } from './paneMargins';
import { calculateThreePaneScaffoldLayout } from './ThreePaneScaffold.layout';

const oddSpacerDirective: PaneScaffoldDirective = {
  maxHorizontalPartitions: 2,
  horizontalPartitionSpacerSize: '25px',
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

describe('AndroidX integer geometry quantization', () => {
  it('rounds directive Dp values before pane allocation', () => {
    const fractionalDirective: PaneScaffoldDirective = {
      ...oddSpacerDirective,
      horizontalPartitionSpacerSize: '24.5px',
      defaultPanePreferredWidth: '360.5px',
      defaultPanePreferredHeight: '420.5px',
    };
    const layout = calculateThreePaneScaffoldLayout({
      width: 1000,
      height: 800,
      directive: fractionalDirective,
      value: twoPaneValue,
      paneOrder: listDetailPaneScaffoldOrder,
    });

    // AndroidX roundToPx(): 24.5dp -> 25px and 360.5dp -> 361px.
    expect(layout.secondary).toEqual({ left: 0, top: 0, width: 361, height: 800 });
    expect(layout.primary).toEqual({ left: 386, top: 0, width: 614, height: 800 });

    expect(
      calculateLevitatedPanePlacement({
        width: 1001,
        height: 801,
        directive: fractionalDirective,
        alignment: PaneAlignment.Center,
      }),
    ).toEqual({ left: 320, top: 190, width: 361, height: 421 });
  });

  it('rounds drag-handle Dp values before Int edge geometry', () => {
    expect(
      calculatePaneExpansionDragHandlePlacement({
        offsetX: 0,
        contentWidth: 1000,
        partitionSpacerSize: '24.5px',
        minTouchTargetSize: 48.5,
      }),
    ).toEqual({ centerX: 12, minWidth: 74 });
  });

  it('uses Int division for an odd pane-expansion spacer while dragging', () => {
    const paneExpansionState = new PaneExpansionState();
    paneExpansionState.onMeasured(1000);
    paneExpansionState.onExpansionOffsetMeasured(400);
    paneExpansionState.dispatchRawDelta(0);

    const layout = calculateThreePaneScaffoldLayout({
      width: 1000,
      height: 800,
      directive: oddSpacerDirective,
      value: twoPaneValue,
      paneOrder: listDetailPaneScaffoldOrder,
      paneExpansionState,
    });

    // AndroidX: halfSpacerSize = 25 / 2 = 12 (Int division).
    expect(layout.secondary).toEqual({ left: 0, top: 0, width: 388, height: 800 });
    expect(layout.primary).toEqual({ left: 412, top: 0, width: 588, height: 800 });
  });

  it('truncates an odd measured spacer midpoint like Int division', () => {
    const layoutOptions = {
      width: 1000,
      height: 800,
      directive: oddSpacerDirective,
      value: twoPaneValue,
      paneOrder: listDetailPaneScaffoldOrder,
    } as const;
    const layout = calculateThreePaneScaffoldLayout(layoutOptions);

    expect(layout.secondary).toEqual({ left: 0, top: 0, width: 360, height: 800 });
    expect(layout.primary).toEqual({ left: 385, top: 0, width: 615, height: 800 });
    // AndroidX: (0 + 360 + 385) / 2 = 372 as Int.
    expect(calculatePaneExpansionSpacerMiddleOffset({ layout, layoutOptions })).toBe(372);
  });

  it('uses Int halves for drag-handle edge geometry', () => {
    expect(
      calculatePaneExpansionDragHandlePlacement({
        offsetX: 0,
        contentWidth: 1000,
        partitionSpacerSize: '25px',
        minTouchTargetSize: 49,
      }),
    ).toEqual({ centerX: 12, minWidth: 74 });

    // AndroidX 49 / 2 = 24. At exactly 24px of available margin the target
    // therefore does not enter the expansion branch.
    expect(
      calculatePaneExpansionDragHandlePlacement({
        offsetX: 24,
        contentWidth: 1000,
        partitionSpacerSize: '25px',
        minTouchTargetSize: 49,
      }),
    ).toEqual({ centerX: 24, minWidth: 49 });
  });

  it('uses Int division when reflow must reserve at least half an odd height', () => {
    const directive: PaneScaffoldDirective = {
      ...oddSpacerDirective,
      maxHorizontalPartitions: 1,
      maxVerticalPartitions: 2,
      horizontalPartitionSpacerSize: '0px',
      verticalPartitionSpacerSize: '25px',
    };
    const value: ThreePaneScaffoldValue = {
      primary: PaneAdaptedValue.Expanded,
      secondary: PaneAdaptedValue.Reflowed(ThreePaneScaffoldRole.Primary),
      tertiary: PaneAdaptedValue.Hidden,
    };

    const layout = calculateThreePaneScaffoldLayout({
      width: 600,
      height: 600,
      directive,
      value,
      paneOrder: supportingPaneScaffoldOrder,
    });

    // availableHeight = 575; AndroidX 575 / 2 = 287 as Int.
    expect(layout.primary).toEqual({ left: 0, top: 0, width: 600, height: 287 });
    expect(layout.secondary).toEqual({ left: 0, top: 312, width: 600, height: 288 });
  });

  it('rounds scaffold-local hinge bounds before physical partitioning', () => {
    const layout = calculateThreePaneScaffoldLayout({
      width: 1000,
      height: 800,
      directive: oddSpacerDirective,
      value: twoPaneValue,
      paneOrder: listDetailPaneScaffoldOrder,
      excludedBounds: [{ left: 489.5, top: 0, right: 510.5, bottom: 800 }],
    });

    // AndroidX getLocalBounds(...).roundToIntRect() produces 490..511 before
    // applying the 25px minimum partition spacing.
    expect(layout.secondary).toEqual({ left: 0, top: 0, width: 490, height: 800 });
    expect(layout.primary).toEqual({ left: 515, top: 0, width: 485, height: 800 });
  });

  it('rounds fixed pane margins and ruler edges before clamping', () => {
    expect(
      applyPaneMargins(
        { left: 0, top: 0, width: 1000, height: 800 },
        {
          inlineStart: 10.5,
          blockStart: 20.5,
          inlineEnd: 30.5,
          blockEnd: 40.5,
          insetBounds: [{ left: 100.5, top: 50.5, right: 900.5, bottom: 700.5 }],
        },
        1000,
        800,
      ),
    ).toEqual({ left: 101, top: 51, width: 800, height: 650 });
  });

  it('rounds centered levitated placement to Compose IntOffset coordinates', () => {
    expect(
      calculateLevitatedPanePlacement({
        width: 1001,
        height: 801,
        directive: oddSpacerDirective,
        alignment: PaneAlignment.Center,
      }),
    ).toEqual({ left: 321, top: 191, width: 360, height: 420 });
  });
});
