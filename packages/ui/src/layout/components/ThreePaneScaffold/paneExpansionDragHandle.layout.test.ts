import { describe, expect, it } from 'vitest';
import { PaneExpansionUnspecified } from '../../adaptive/paneExpansionState';
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

const base = {
  contentWidth: 1000,
  partitionSpacerSize: '24px',
  minTouchTargetSize: 48,
} as const;

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

describe('pane expansion drag-handle placement', () => {
  it('keeps the split-centered minimum target away from outer edges', () => {
    expect(
      calculatePaneExpansionDragHandlePlacement({ ...base, offsetX: 500 }),
    ).toEqual({ centerX: 500, minWidth: 48 });
    expect(
      calculatePaneExpansionDragHandlePlacement({ ...base, offsetX: 24 }),
    ).toEqual({ centerX: 24, minWidth: 48 });
  });

  it('matches AndroidX edge clamping and width expansion at the start edge', () => {
    const placement = calculatePaneExpansionDragHandlePlacement({
      ...base,
      offsetX: 0,
    });

    expect(placement).toEqual({ centerX: 12, minWidth: 72 });
    // The 72px box spans -24..48 and is clipped by the scaffold at x=0,
    // leaving the full 48px minimum interactive target inside the scaffold.
    expect(placement.centerX + placement.minWidth / 2).toBe(48);
  });

  it('mirrors the same target preservation at the end edge', () => {
    const placement = calculatePaneExpansionDragHandlePlacement({
      ...base,
      offsetX: 1000,
    });

    expect(placement).toEqual({ centerX: 988, minWidth: 72 });
    expect(
      base.contentWidth - (placement.centerX - placement.minWidth / 2),
    ).toBe(48);
  });

  it('preserves the minimum target with no partition spacer', () => {
    const placement = calculatePaneExpansionDragHandlePlacement({
      ...base,
      offsetX: 0,
      partitionSpacerSize: '0px',
    });

    expect(placement).toEqual({ centerX: 0, minWidth: 96 });
    expect(placement.centerX + placement.minWidth / 2).toBe(48);
  });

  it('uses a caller-provided minimum target size in the same edge formula', () => {
    const placement = calculatePaneExpansionDragHandlePlacement({
      ...base,
      offsetX: 0,
      minTouchTargetSize: 64,
    });

    expect(placement).toEqual({ centerX: 12, minWidth: 104 });
    expect(placement.centerX + placement.minWidth / 2).toBe(64);
  });

  it('preserves a valid clamp when the scaffold is narrower than its spacer', () => {
    expect(
      calculatePaneExpansionDragHandlePlacement({
        offsetX: 0,
        contentWidth: 16,
        partitionSpacerSize: '24px',
        minTouchTargetSize: 48,
      }),
    ).toEqual({ centerX: 8, minWidth: 80 });
  });

  it('measures the spacer midpoint before pane ruler margins clip an internal edge', () => {
    const layoutOptions = {
      width: 1000,
      height: 800,
      directive,
      value: twoPaneValue,
      paneOrder: listDetailPaneScaffoldOrder,
      paneMargins: {
        secondary: { insetBounds: [{ right: 300 }] },
      },
    } as const;
    const layout = calculateThreePaneScaffoldLayout(layoutOptions);

    expect(layout.secondary).toEqual({ left: 0, top: 0, width: 300, height: 800 });
    expect(layout.primary).toEqual({ left: 384, top: 0, width: 616, height: 800 });
    expect(
      (layout.secondary!.left + layout.secondary!.width + layout.primary!.left) / 2,
    ).toBe(342);

    // AndroidX calls getSpacerMiddleOffsetX while measuredBounds are still the
    // original 0..360 and 384..1000 partitions, then applies PaneMargins in
    // doMeasureAndPlace. The expansion handle therefore remains at x=372.
    expect(
      calculatePaneExpansionSpacerMiddleOffset({ layout, layoutOptions }),
    ).toBe(372);
  });
});

describe('pane expansion drag-handle fading', () => {
  it('tracks the previous lookahead target instead of recomputing current layout geometry', () => {
    const empty = {
      originalOffsetX: PaneExpansionUnspecified,
      targetOffsetX: PaneExpansionUnspecified,
    };
    const firstTarget = updatePaneExpansionDragHandleFadeOffsets(empty, 688);
    expect(firstTarget).toEqual({
      originalOffsetX: PaneExpansionUnspecified,
      targetOffsetX: 688,
    });

    expect(updatePaneExpansionDragHandleFadeOffsets(firstTarget, 688)).toBe(firstTarget);
    expect(updatePaneExpansionDragHandleFadeOffsets(firstTarget, 588)).toEqual({
      originalOffsetX: 688,
      targetOffsetX: 588,
    });
  });

  it('records disappearance as a new unspecified lookahead target', () => {
    expect(
      updatePaneExpansionDragHandleFadeOffsets(
        { originalOffsetX: 688, targetOffsetX: 588 },
        PaneExpansionUnspecified,
      ),
    ).toEqual({ originalOffsetX: 588, targetOffsetX: PaneExpansionUnspecified });
  });

  it('stays fully opaque when the lookahead offset does not move', () => {
    expect(
      calculatePaneExpansionDragHandleFadeFrame({
        currentOffsetX: 688,
        targetOffsetX: 688,
        progressFraction: 0.5,
      }),
    ).toEqual({ offsetX: 688, opacity: 1 });
  });

  it('fades out at the original offset using Compose FastOutSlowIn easing', () => {
    expect(
      calculatePaneExpansionDragHandleFadeFrame({
        currentOffsetX: 688,
        targetOffsetX: 588,
        progressFraction: 0,
      }),
    ).toEqual({ offsetX: 688, opacity: 1 });

    const quarter = calculatePaneExpansionDragHandleFadeFrame({
      currentOffsetX: 688,
      targetOffsetX: 588,
      progressFraction: 0.25,
    });
    expect(quarter.offsetX).toBe(688);
    expect(quarter.opacity).toBeCloseTo(0.52682528, 7);
  });

  it('switches offsets at the tween zero crossing and then fades back in', () => {
    // FastOutSlowInEasing(0.35) == 0.5, so the -1..1 animation reaches zero
    // at progress 0.35. AndroidX uses `value > 0`, therefore the zero frame
    // still occupies the original offset at alpha 0.
    expect(
      calculatePaneExpansionDragHandleFadeFrame({
        currentOffsetX: 688,
        targetOffsetX: 588,
        progressFraction: 0.35,
      }),
    ).toEqual({ offsetX: 688, opacity: 0 });

    const halfway = calculatePaneExpansionDragHandleFadeFrame({
      currentOffsetX: 688,
      targetOffsetX: 588,
      progressFraction: 0.5,
    });
    expect(halfway.offsetX).toBe(588);
    expect(halfway.opacity).toBeCloseTo(0.55112262, 7);

    expect(
      calculatePaneExpansionDragHandleFadeFrame({
        currentOffsetX: 688,
        targetOffsetX: 588,
        progressFraction: 1,
      }),
    ).toEqual({ offsetX: 588, opacity: 1 });
  });

  it('validates transition progress', () => {
    expect(() =>
      calculatePaneExpansionDragHandleFadeFrame({
        currentOffsetX: 688,
        targetOffsetX: 588,
        progressFraction: -0.01,
      }),
    ).toThrow(RangeError);
  });
});
