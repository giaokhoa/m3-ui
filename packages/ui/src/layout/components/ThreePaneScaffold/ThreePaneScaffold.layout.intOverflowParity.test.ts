import { describe, expect, it } from 'vitest';
import { PaneExpansionState } from '../../adaptive/paneExpansionState';
import type { PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import {
  PaneAdaptedValue,
  listDetailPaneScaffoldOrder,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';
import { calculateThreePaneScaffoldLayoutPass } from './ThreePaneScaffold.layout';

const allExpanded: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Expanded,
  secondary: PaneAdaptedValue.Expanded,
  tertiary: PaneAdaptedValue.Expanded,
};

const twoExpanded: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Expanded,
  secondary: PaneAdaptedValue.Expanded,
  tertiary: PaneAdaptedValue.Hidden,
};

const overflowSpacerDirective: PaneScaffoldDirective = {
  maxHorizontalPartitions: 3,
  horizontalPartitionSpacerSize: '2147483647px',
  maxVerticalPartitions: 1,
  verticalPartitionSpacerSize: '0px',
  defaultPanePreferredWidth: '360px',
  defaultPanePreferredHeight: '420px',
  excludedBounds: [],
  shouldAutoFocusCurrentDestination: true,
};

describe('ThreePaneScaffold Int overflow parity', () => {
  it('wraps partition allocation and placement arithmetic like Kotlin Int', () => {
    const layout = calculateThreePaneScaffoldLayoutPass({
      width: 1000,
      height: 800,
      directive: overflowSpacerDirective,
      value: allExpanded,
      paneOrder: listDetailPaneScaffoldOrder,
    });

    // AndroidX Int arithmetic:
    // 2 * Int.MAX_VALUE == -2, so allocatableWidth = 1000 - (-2) = 1002.
    // 360 * (1002f / 1080f) truncates to 334 for every pane.
    expect(layout.raw.secondary).toEqual({ left: 0, top: 0, width: 334, height: 800 });
    expect(layout.raw.primary).toEqual({
      left: -2147483315,
      top: 0,
      width: 334,
      height: 800,
    });
    expect(layout.raw.tertiary).toEqual({ left: 666, top: 0, width: 334, height: 800 });

    expect(layout.placed).toEqual(layout.raw);
  });

  it('wraps the pane-expansion width threshold before choosing the visible pane', () => {
    const expansionState = new PaneExpansionState();
    expansionState.setFirstPaneWidth(100);
    const directive = {
      ...overflowSpacerDirective,
      maxHorizontalPartitions: 2,
      horizontalPartitionSpacerSize: '-1px',
    };

    const layout = calculateThreePaneScaffoldLayoutPass({
      width: 2147483647,
      height: 800,
      directive,
      value: twoExpanded,
      paneOrder: listDetailPaneScaffoldOrder,
      paneExpansionState: expansionState,
    });

    // AndroidX: Int.MAX_VALUE - (-1) wraps to Int.MIN_VALUE. The explicit
    // 100px first-pane width therefore satisfies the full-first-pane branch.
    expect(layout.raw.secondary).toEqual({
      left: 0,
      top: 0,
      width: 2147483647,
      height: 800,
    });
    expect(layout.raw.primary).toBeUndefined();
  });

  it('wraps the dragging threshold before choosing the edge pane', () => {
    const expansionState = new PaneExpansionState();
    expansionState.onMeasured(2147483647);
    expansionState.onExpansionOffsetMeasured(100);
    expansionState.beginDrag();
    expansionState.dispatchRawDelta(0);
    const directive = {
      ...overflowSpacerDirective,
      maxHorizontalPartitions: 2,
      horizontalPartitionSpacerSize: '-2px',
    };

    const layout = calculateThreePaneScaffoldLayoutPass({
      width: 2147483647,
      height: 800,
      directive,
      value: twoExpanded,
      paneOrder: listDetailPaneScaffoldOrder,
      paneExpansionState: expansionState,
    });

    // halfSpacerSize is -1. AndroidX Int.MAX_VALUE - (-1) wraps to Int.MIN,
    // so offset 100 takes the right-edge branch instead of the middle split.
    expect(layout.raw.secondary).toEqual({
      left: 0,
      top: 0,
      width: -2147483447,
      height: 800,
    });
    expect(layout.placed.secondary).toEqual({ left: 0, top: 0, width: 0, height: 800 });
    expect(layout.raw.primary).toBeUndefined();
  });
});
