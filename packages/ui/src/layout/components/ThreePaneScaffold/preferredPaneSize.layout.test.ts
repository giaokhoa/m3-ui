import { describe, expect, it } from 'vitest';
import type { PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import {
  PaneAdaptedValue,
  PaneAlignment,
  ThreePaneScaffoldRole,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';
import { calculateLevitatedPanePlacement } from './LevitatedPane.layout';
import { preferredPaneSizeProportion } from './preferredPaneSize';
import { calculateThreePaneScaffoldLayout } from './ThreePaneScaffold.layout';
import { calculateThreePaneScaffoldTransitionFrame } from './ThreePaneScaffold.transition';

const directive: PaneScaffoldDirective = {
  maxHorizontalPartitions: 2,
  horizontalPartitionSpacerSize: '24px',
  maxVerticalPartitions: 1,
  verticalPartitionSpacerSize: '24px',
  defaultPanePreferredWidth: '360px',
  defaultPanePreferredHeight: '420px',
  excludedBounds: [],
  shouldAutoFocusCurrentDestination: true,
};

const order = [
  ThreePaneScaffoldRole.Primary,
  ThreePaneScaffoldRole.Secondary,
  ThreePaneScaffoldRole.Tertiary,
] as const;

const twoExpanded: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Expanded,
  secondary: PaneAdaptedValue.Expanded,
  tertiary: PaneAdaptedValue.Hidden,
};

describe('preferred pane size proportions in scaffold geometry', () => {
  it('resolves width proportions against the full scaffold before spacer allocation', () => {
    const layout = calculateThreePaneScaffoldLayout({
      width: 1000,
      height: 800,
      directive,
      value: twoExpanded,
      paneOrder: order,
      preferredWidths: {
        primary: 300,
        secondary: preferredPaneSizeProportion(0.4),
      },
    });

    // 0.4 * 1000 = 400. The 24px spacer is removed only after preferred
    // sizes are resolved; the 276px surplus then goes to Primary priority.
    expect(layout.secondary?.width).toBe(400);
    expect(layout.primary?.width).toBe(576);
    expect(layout.secondary?.left).toBe(600);
  });

  it('keeps zero available only through the proportion overload', () => {
    expect(() =>
      calculateThreePaneScaffoldLayout({
        width: 1000,
        height: 800,
        directive,
        value: twoExpanded,
        paneOrder: order,
        preferredWidths: { secondary: 0 },
      }),
    ).toThrow(RangeError);

    const layout = calculateThreePaneScaffoldLayout({
      width: 1000,
      height: 800,
      directive,
      value: twoExpanded,
      paneOrder: order,
      preferredWidths: { secondary: preferredPaneSizeProportion(0) },
    });

    expect(layout.primary).toEqual({ left: 0, top: 0, width: 976, height: 800 });
    expect(layout.secondary).toEqual({ left: 1000, top: 0, width: 0, height: 800 });
  });

  it('truncates each scaled proportional width when the scaffold is constrained', () => {
    const layout = calculateThreePaneScaffoldLayout({
      width: 1000,
      height: 800,
      directive,
      value: twoExpanded,
      paneOrder: order,
      preferredWidths: {
        primary: preferredPaneSizeProportion(0.7),
        secondary: preferredPaneSizeProportion(0.6),
      },
    });

    // AndroidX scales the already-resolved 700/600px preferred widths against
    // 976px, then calls toInt() for each pane independently. The dropped
    // fractions are not redistributed, so the trailing edge ends at 999px.
    expect(layout.primary).toEqual({ left: 0, top: 0, width: 525, height: 800 });
    expect(layout.secondary).toEqual({ left: 549, top: 0, width: 450, height: 800 });
  });

  it('uses scaffold-height proportions for reflowed pane preferred height', () => {
    const value: ThreePaneScaffoldValue = {
      primary: PaneAdaptedValue.Expanded,
      secondary: PaneAdaptedValue.Reflowed(ThreePaneScaffoldRole.Primary),
      tertiary: PaneAdaptedValue.Hidden,
    };
    const layout = calculateThreePaneScaffoldLayout({
      width: 1000,
      height: 800,
      directive,
      value,
      paneOrder: order,
      preferredHeights: {
        secondary: preferredPaneSizeProportion(0.25),
      },
    });

    expect(layout.primary?.height).toBe(576);
    expect(layout.secondary?.top).toBe(600);
    expect(layout.secondary?.height).toBe(200);
  });

  it('uses proportions for levitated pane width and height', () => {
    expect(
      calculateLevitatedPanePlacement({
        width: 1000,
        height: 800,
        directive,
        alignment: PaneAlignment.Center,
        preferredWidth: preferredPaneSizeProportion(0.4),
        preferredHeight: preferredPaneSizeProportion(0.25),
      }),
    ).toEqual({ left: 300, top: 300, width: 400, height: 200 });
  });

  it('carries proportional levitated geometry through transition endpoints', () => {
    const currentValue: ThreePaneScaffoldValue = {
      primary: PaneAdaptedValue.Expanded,
      secondary: PaneAdaptedValue.Hidden,
      tertiary: PaneAdaptedValue.Hidden,
    };
    const targetValue: ThreePaneScaffoldValue = {
      primary: PaneAdaptedValue.Expanded,
      secondary: PaneAdaptedValue.Levitated(PaneAlignment.Center),
      tertiary: PaneAdaptedValue.Hidden,
    };
    const frame = calculateThreePaneScaffoldTransitionFrame({
      width: 1000,
      height: 800,
      directive,
      currentValue,
      targetValue,
      progressFraction: 1,
      paneOrder: order,
      preferredWidths: {
        secondary: preferredPaneSizeProportion(0.4),
      },
      preferredHeights: {
        secondary: preferredPaneSizeProportion(0.25),
      },
    });

    expect(frame.secondary?.placement).toEqual({
      left: 300,
      top: 300,
      width: 400,
      height: 200,
    });
  });
});
