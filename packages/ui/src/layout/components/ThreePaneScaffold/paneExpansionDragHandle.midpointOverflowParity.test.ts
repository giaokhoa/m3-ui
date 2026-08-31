import { describe, expect, it } from 'vitest';
import type { PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import {
  PaneAdaptedValue,
  listDetailPaneScaffoldOrder,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';
import { calculateThreePaneScaffoldLayout } from './ThreePaneScaffold.layout';
import {
  calculatePaneExpansionDragHandlePlacement,
  calculatePaneExpansionSpacerMiddleOffset,
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

describe('pane-expansion spacer midpoint Int overflow parity', () => {
  it('wraps pane-position additions before Int division', () => {
    const layoutOptions = {
      width: 2147483647,
      height: 800,
      directive,
      value: twoExpanded,
      paneOrder: listDetailPaneScaffoldOrder,
      excludedBounds: [
        { left: 2147483547, top: 0, right: 2147483597, bottom: 800 },
      ],
    } as const;
    const layout = calculateThreePaneScaffoldLayout(layoutOptions);

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
    expect(calculatePaneExpansionSpacerMiddleOffset({ layout, layoutOptions })).toBe(-76);
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
});
