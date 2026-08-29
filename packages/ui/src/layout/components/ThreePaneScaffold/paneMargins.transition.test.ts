import { describe, expect, it } from 'vitest';
import { PaneMotion } from '../../adaptive/paneMotion';
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

const threePaneDirective: PaneScaffoldDirective = {
  ...directive,
  maxHorizontalPartitions: 3,
  horizontalPartitionSpacerSize: '24px',
};

const order: ThreePaneScaffoldHorizontalOrder = [
  ThreePaneScaffoldRole.Primary,
  ThreePaneScaffoldRole.Secondary,
  ThreePaneScaffoldRole.Tertiary,
];

const hidden: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Hidden,
  secondary: PaneAdaptedValue.Hidden,
  tertiary: PaneAdaptedValue.Hidden,
};

const expanded: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Expanded,
  secondary: PaneAdaptedValue.Hidden,
  tertiary: PaneAdaptedValue.Hidden,
};

const splitExpanded: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Expanded,
  secondary: PaneAdaptedValue.Hidden,
  tertiary: PaneAdaptedValue.Expanded,
};

const allExpanded: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Expanded,
  secondary: PaneAdaptedValue.Expanded,
  tertiary: PaneAdaptedValue.Expanded,
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

  it('uses pre-margin pane geometry for edge slide displacement', () => {
    const entering = calculateThreePaneScaffoldTransitionFrame({
      width: 1000,
      height: 800,
      directive,
      currentValue: hidden,
      targetValue: expanded,
      progressFraction: 0,
      paneOrder: order,
      paneMargins: {
        primary: { inlineStart: 400 },
      },
    });

    expect(entering.primary?.motion).toBe(PaneMotion.EnterFromRight);
    expect(entering.primary?.placement).toEqual({
      left: 400,
      top: 0,
      width: 600,
      height: 800,
    });
    // AndroidX records PaneMotionData before PaneMargins are applied. The
    // target pane therefore starts at the scaffold's unmargined left edge and
    // slideInFromRightOffset spans the full 1000px scaffold width, even though
    // the rendered pane is later clipped to start at x=400.
    expect(entering.primary?.translateX).toBe(1000);
  });

  it('uses pre-margin targetLeft for enter-with-expand while keeping the placed width', () => {
    const entering = calculateThreePaneScaffoldTransitionFrame({
      width: 1000,
      height: 800,
      directive: threePaneDirective,
      currentValue: splitExpanded,
      targetValue: allExpanded,
      progressFraction: 0,
      paneOrder: order,
      paneMargins: {
        secondary: { inlineStart: 500 },
      },
    });

    expect(entering.secondary?.motion).toBe(PaneMotion.EnterWithExpand);
    expect(entering.secondary?.placement).toEqual({
      left: 500,
      top: 0,
      width: 158,
      height: 800,
    });
    // Current primary ends at x=616. The incoming secondary's measured target
    // starts at x=341 before margins, so AndroidX slides it by 616 - 341 = 275.
    // Its rendered width still reflects the margin-clipped 500..658 bounds.
    expect(entering.secondary?.translateX).toBe(275);
  });

  it('uses pre-margin currentLeft for exit-with-shrink while keeping the placed width', () => {
    const exiting = calculateThreePaneScaffoldTransitionFrame({
      width: 1000,
      height: 800,
      directive: threePaneDirective,
      currentValue: allExpanded,
      targetValue: splitExpanded,
      progressFraction: 1,
      paneOrder: order,
      paneMargins: {
        secondary: { inlineStart: 500 },
      },
    });

    expect(exiting.secondary?.motion).toBe(PaneMotion.ExitWithShrink);
    expect(exiting.secondary?.placement).toEqual({
      left: 500,
      top: 0,
      width: 158,
      height: 800,
    });
    // The remaining primary targets x=0..616. The exiting secondary's measured
    // current left is x=341, so the shrink motion targets 616 - 341 = 275.
    expect(exiting.secondary?.translateX).toBeCloseTo(275, 5);
  });
});
