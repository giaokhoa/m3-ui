import { describe, expect, it } from 'vitest';
import type { PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import {
  PaneAdaptedValue,
  listDetailPaneScaffoldOrder,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';
import { calculateThreePaneScaffoldLayout } from './ThreePaneScaffold.layout';
import {
  calculatePaneExpansionDragHandleFadeFrame,
  calculatePaneExpansionDragHandlePlacement,
  calculatePaneExpansionSpacerMiddleOffset,
  updatePaneExpansionDragHandleFadeOffsets,
} from './paneExpansionDragHandle.layout';

const twoExpanded: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Expanded,
  secondary: PaneAdaptedValue.Expanded,
  tertiary: PaneAdaptedValue.Hidden,
};

const directive: PaneScaffoldDirective = {
  maxHorizontalPartitions: 2,
  horizontalPartitionSpacerSize: '0px',
  maxVerticalPartitions: 1,
  verticalPartitionSpacerSize: '0px',
  defaultPanePreferredWidth: '360px',
  defaultPanePreferredHeight: '420px',
  excludedBounds: [],
  shouldAutoFocusCurrentDestination: true,
};

const overflowLayoutOptions = {
  width: 2147483647,
  height: 800,
  directive,
  value: twoExpanded,
  paneOrder: listDetailPaneScaffoldOrder,
  excludedBounds: [
    { left: 2147483547, top: 0, right: 2147483597, bottom: 800 },
  ],
} as const;

describe('pane-expansion spacer midpoint Int overflow parity', () => {
  it('wraps pane-position additions before Int division', () => {
    const layout = calculateThreePaneScaffoldLayout(overflowLayoutOptions);

    expect(layout.secondary).toEqual({
      left: 0,
      top: 0,
      width: 2147483547,
      height: 800,
    });
    expect(layout.primary).toEqual({
      left: 2147483597,
      top: 0,
      width: 50,
      height: 800,
    });

    // AndroidX: (0 + 2147483547 + 2147483597) wraps to -152, then Int / 2 = -76.
    expect(
      calculatePaneExpansionSpacerMiddleOffset({
        layout,
        layoutOptions: overflowLayoutOptions,
      }),
    ).toBe(-76);
  });

  it('coerces a negative overflowed midpoint into the handle placement bounds', () => {
    expect(
      calculatePaneExpansionDragHandlePlacement({
        offsetX: -76,
        contentWidth: 2147483647,
        partitionSpacerSize: '0px',
        minTouchTargetSize: 48,
      }),
    ).toEqual({ centerX: 0, minWidth: 96 });
  });

  it('preserves a negative midpoint when a custom negative spacer allows it', () => {
    const negativeSpacerDirective: PaneScaffoldDirective = {
      ...directive,
      horizontalPartitionSpacerSize: '-200px',
    };
    const layoutOptions = {
      ...overflowLayoutOptions,
      directive: negativeSpacerDirective,
    };
    const layout = calculateThreePaneScaffoldLayout(layoutOptions);
    const midpoint = calculatePaneExpansionSpacerMiddleOffset({ layout, layoutOptions });

    expect(midpoint).toBe(-76);
    expect(
      calculatePaneExpansionDragHandlePlacement({
        offsetX: midpoint,
        contentWidth: 2147483647,
        partitionSpacerSize: negativeSpacerDirective.horizontalPartitionSpacerSize,
        minTouchTargetSize: 48,
      }),
    ).toEqual({ centerX: -76, minWidth: 248 });

    const tracked = updatePaneExpansionDragHandleFadeOffsets(
      { originalOffsetX: 0, targetOffsetX: -76 },
      -50,
    );
    expect(tracked).toEqual({ originalOffsetX: -76, targetOffsetX: -50 });
    expect(
      calculatePaneExpansionDragHandleFadeFrame({
        currentOffsetX: tracked.originalOffsetX,
        targetOffsetX: tracked.targetOffsetX,
        progressFraction: 0,
      }),
    ).toEqual({ offsetX: -76, opacity: 1 });
    expect(
      calculatePaneExpansionDragHandleFadeFrame({
        currentOffsetX: tracked.originalOffsetX,
        targetOffsetX: tracked.targetOffsetX,
        progressFraction: 1,
      }),
    ).toEqual({ offsetX: -50, opacity: 1 });
  });
});
