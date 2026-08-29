import { describe, expect, it } from 'vitest';
import type { PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import {
  PaneAdaptedValue,
  ThreePaneScaffoldRole,
  type ThreePaneScaffoldHorizontalOrder,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';
import { calculateThreePaneScaffoldTransitionFrame } from './ThreePaneScaffold.transition';

const directive: PaneScaffoldDirective = {
  maxHorizontalPartitions: 1,
  horizontalPartitionSpacerSize: '0px',
  maxVerticalPartitions: 1,
  verticalPartitionSpacerSize: '0px',
  defaultPanePreferredWidth: '360px',
  defaultPanePreferredHeight: '420px',
  excludedBounds: [],
  shouldAutoFocusCurrentDestination: true,
};

const order: ThreePaneScaffoldHorizontalOrder = [
  ThreePaneScaffoldRole.Primary,
  ThreePaneScaffoldRole.Secondary,
  ThreePaneScaffoldRole.Tertiary,
];

const expanded: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Expanded,
  secondary: PaneAdaptedValue.Hidden,
  tertiary: PaneAdaptedValue.Hidden,
};

const levitated: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Levitated('center'),
  secondary: PaneAdaptedValue.Hidden,
  tertiary: PaneAdaptedValue.Hidden,
};

function frame(progressFraction: number) {
  return calculateThreePaneScaffoldTransitionFrame({
    width: 1000,
    height: 800,
    directive,
    currentValue: expanded,
    targetValue: levitated,
    progressFraction,
    paneOrder: order,
    paneMargins: {
      primary: { inlineStart: 400, blockStart: 250 },
    },
  });
}

describe('pane margins in scaffold transitions', () => {
  it('uses margin-clamped expanded geometry as the motion origin', () => {
    expect(frame(0).primary?.placement).toEqual({
      left: 400,
      top: 250,
      width: 600,
      height: 550,
    });
  });

  it('uses margin-clamped levitated geometry as the motion target', () => {
    expect(frame(1).primary?.placement).toEqual({
      left: 400,
      top: 250,
      width: 280,
      height: 360,
    });
  });
});
