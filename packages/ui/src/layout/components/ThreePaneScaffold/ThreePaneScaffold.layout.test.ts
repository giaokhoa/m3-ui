import { describe, expect, it } from 'vitest';
import { PaneExpansionState } from '../../adaptive/paneExpansionState';
import type { PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import {
  PaneAdaptedValue,
  ThreePaneScaffoldRole,
  listDetailPaneScaffoldOrder,
  supportingPaneScaffoldOrder,
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

describe('calculateThreePaneScaffoldLayout', () => {
  it('allocates surplus width to the highest-priority expanded pane', () => {
    const layout = calculateThreePaneScaffoldLayout({
      width: 1000,
      height: 800,
      directive,
      value: twoPaneValue,
      paneOrder: listDetailPaneScaffoldOrder,
    });

    expect(layout.secondary).toEqual({ left: 0, top: 0, width: 360, height: 800 });
    expect(layout.primary).toEqual({ left: 384, top: 0, width: 616, height: 800 });
  });

  it('scales all preferred widths proportionally when space is constrained', () => {
    const layout = calculateThreePaneScaffoldLayout({
      width: 600,
      height: 800,
      directive,
      value: twoPaneValue,
      paneOrder: listDetailPaneScaffoldOrder,
    });

    expect(layout.secondary?.width).toBeCloseTo(288);
    expect(layout.primary?.width).toBeCloseTo(288);
    expect(layout.primary?.left).toBeCloseTo(312);
  });

  it('reverses logical pane order for RTL before physical placement', () => {
    const layout = calculateThreePaneScaffoldLayout({
      width: 1000,
      height: 800,
      directive,
      value: twoPaneValue,
      paneOrder: listDetailPaneScaffoldOrder,
      direction: 'rtl',
    });

    expect(layout.primary).toEqual({ left: 0, top: 0, width: 616, height: 800 });
    expect(layout.secondary).toEqual({ left: 640, top: 0, width: 360, height: 800 });
  });

  it('applies outer pane margins after allocation without changing the partition gap', () => {
    const layout = calculateThreePaneScaffoldLayout({
      width: 1000,
      height: 800,
      directive,
      value: twoPaneValue,
      paneOrder: listDetailPaneScaffoldOrder,
      paneMargins: {
        secondary: { inlineStart: 32, blockStart: 16, blockEnd: 20 },
        primary: { inlineEnd: 40, blockStart: 16, blockEnd: 20 },
      },
    });

    expect(layout.secondary).toEqual({ left: 32, top: 16, width: 328, height: 764 });
    expect(layout.primary).toEqual({ left: 384, top: 16, width: 576, height: 764 });
    expect(layout.primary!.left - (layout.secondary!.left + layout.secondary!.width)).toBe(24);
  });

  it('reflows a pane below its expanded anchor with AndroidX height allocation', () => {
    const reflowDirective: PaneScaffoldDirective = {
      ...directive,
      maxHorizontalPartitions: 1,
      maxVerticalPartitions: 2,
      horizontalPartitionSpacerSize: '0px',
      verticalPartitionSpacerSize: '24px',
    };
    const value: ThreePaneScaffoldValue = {
      primary: PaneAdaptedValue.Expanded,
      secondary: PaneAdaptedValue.Reflowed(ThreePaneScaffoldRole.Primary),
      tertiary: PaneAdaptedValue.Hidden,
    };

    const layout = calculateThreePaneScaffoldLayout({
      width: 600,
      height: 1000,
      directive: reflowDirective,
      value,
      paneOrder: supportingPaneScaffoldOrder,
    });

    expect(layout.primary).toEqual({ left: 0, top: 0, width: 600, height: 556 });
    expect(layout.secondary).toEqual({ left: 0, top: 580, width: 600, height: 420 });
  });

  it('applies pane margins after reflow measurement', () => {
    const reflowDirective: PaneScaffoldDirective = {
      ...directive,
      maxHorizontalPartitions: 1,
      maxVerticalPartitions: 2,
      horizontalPartitionSpacerSize: '0px',
      verticalPartitionSpacerSize: '24px',
    };
    const value: ThreePaneScaffoldValue = {
      primary: PaneAdaptedValue.Expanded,
      secondary: PaneAdaptedValue.Reflowed(ThreePaneScaffoldRole.Primary),
      tertiary: PaneAdaptedValue.Hidden,
    };

    const layout = calculateThreePaneScaffoldLayout({
      width: 600,
      height: 1000,
      directive: reflowDirective,
      value,
      paneOrder: supportingPaneScaffoldOrder,
      paneMargins: {
        primary: { blockStart: 20 },
        secondary: { blockEnd: 30 },
      },
    });

    expect(layout.primary).toEqual({ left: 0, top: 20, width: 600, height: 536 });
    expect(layout.secondary).toEqual({ left: 0, top: 580, width: 600, height: 390 });
  });

  it('uses physical hinge partitions before preferred-width allocation', () => {
    const layout = calculateThreePaneScaffoldLayout({
      width: 1000,
      height: 800,
      directive,
      value: twoPaneValue,
      paneOrder: listDetailPaneScaffoldOrder,
      excludedBounds: [{ left: 490, top: 0, right: 510, bottom: 800 }],
    });

    expect(layout.secondary).toEqual({ left: 0, top: 0, width: 490, height: 800 });
    expect(layout.primary).toEqual({ left: 514, top: 0, width: 486, height: 800 });
  });

  it('lets an explicit first-pane width override preferred widths', () => {
    const paneExpansionState = new PaneExpansionState();
    paneExpansionState.setFirstPaneWidth(300);
    const layout = calculateThreePaneScaffoldLayout({
      width: 1000,
      height: 800,
      directive,
      value: twoPaneValue,
      paneOrder: listDetailPaneScaffoldOrder,
      paneExpansionState,
    });

    expect(layout.secondary).toEqual({ left: 0, top: 0, width: 300, height: 800 });
    expect(layout.primary).toEqual({ left: 324, top: 0, width: 676, height: 800 });
  });

  it('calculates proportions from width excluding the partition spacer', () => {
    const paneExpansionState = new PaneExpansionState();
    paneExpansionState.setFirstPaneProportion(0.4);
    const layout = calculateThreePaneScaffoldLayout({
      width: 1000,
      height: 800,
      directive,
      value: twoPaneValue,
      paneOrder: listDetailPaneScaffoldOrder,
      paneExpansionState,
    });

    expect(layout.secondary).toEqual({ left: 0, top: 0, width: 390, height: 800 });
    expect(layout.primary).toEqual({ left: 414, top: 0, width: 586, height: 800 });
  });

  it('treats drag offset as the center of the partition spacer', () => {
    const paneExpansionState = new PaneExpansionState();
    paneExpansionState.onMeasured(1000);
    paneExpansionState.onExpansionOffsetMeasured(500);
    paneExpansionState.dispatchRawDelta(-100);
    const layout = calculateThreePaneScaffoldLayout({
      width: 1000,
      height: 800,
      directive,
      value: twoPaneValue,
      paneOrder: listDetailPaneScaffoldOrder,
      paneExpansionState,
    });

    expect(layout.secondary).toEqual({ left: 0, top: 0, width: 388, height: 800 });
    expect(layout.primary).toEqual({ left: 412, top: 0, width: 588, height: 800 });
  });

  it('pane expansion overrides physical hinge partitioning like AndroidX', () => {
    const paneExpansionState = new PaneExpansionState();
    paneExpansionState.setFirstPaneWidth(300);
    const layout = calculateThreePaneScaffoldLayout({
      width: 1000,
      height: 800,
      directive,
      value: twoPaneValue,
      paneOrder: listDetailPaneScaffoldOrder,
      excludedBounds: [{ left: 490, top: 0, right: 510, bottom: 800 }],
      paneExpansionState,
    });

    expect(layout.secondary).toEqual({ left: 0, top: 0, width: 300, height: 800 });
    expect(layout.primary).toEqual({ left: 324, top: 0, width: 676, height: 800 });
  });
});
