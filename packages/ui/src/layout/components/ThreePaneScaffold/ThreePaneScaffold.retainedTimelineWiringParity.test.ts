import { describe, expect, it } from 'vitest';
import type { PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import {
  PaneAdaptedValue,
  ThreePaneScaffoldRole,
  type ThreePaneScaffoldHorizontalOrder,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';
import {
  calculateThreePaneScaffoldTransitionFrame,
  type ThreePaneScaffoldTransitionLayoutOptions,
} from './ThreePaneScaffold.transition';
import { createThreePaneScaffoldVisibilityInterruption } from './ThreePaneScaffold.visibilityInterruption';

const directive: PaneScaffoldDirective = {
  maxHorizontalPartitions: 3,
  horizontalPartitionSpacerSize: '24px',
  maxVerticalPartitions: 1,
  verticalPartitionSpacerSize: '0px',
  defaultPanePreferredWidth: '360px',
  defaultPanePreferredHeight: '420px',
  excludedBounds: [],
  shouldAutoFocusCurrentDestination: true,
};

const paneOrder: ThreePaneScaffoldHorizontalOrder = [
  ThreePaneScaffoldRole.Primary,
  ThreePaneScaffoldRole.Secondary,
  ThreePaneScaffoldRole.Tertiary,
];

function value(primary: boolean, secondary: boolean): ThreePaneScaffoldValue {
  return {
    primary: primary ? PaneAdaptedValue.Expanded : PaneAdaptedValue.Hidden,
    secondary: secondary ? PaneAdaptedValue.Expanded : PaneAdaptedValue.Hidden,
    tertiary: PaneAdaptedValue.Hidden,
  };
}

function layout(
  currentValue: ThreePaneScaffoldValue,
  targetValue: ThreePaneScaffoldValue,
): ThreePaneScaffoldTransitionLayoutOptions {
  return {
    width: 1000,
    height: 800,
    directive,
    currentValue,
    targetValue,
    paneOrder,
  };
}

describe('ThreePaneScaffold retained timeline wiring parity', () => {
  it('carries the source Float fraction into retained child tracks', () => {
    const initial = value(true, false);
    const middle = value(false, true);
    const final = value(true, false);
    const sourceLayout = layout(initial, middle);
    const destinationLayout = layout(middle, final);
    const sourceProgressFraction = Math.fround(0.371234567);
    const renderedFrame = calculateThreePaneScaffoldTransitionFrame({
      ...sourceLayout,
      progressFraction: sourceProgressFraction,
    });

    const interruption = createThreePaneScaffoldVisibilityInterruption({
      renderedFrame,
      previousSnapshot: {
        layout: sourceLayout,
        progressFraction: sourceProgressFraction,
      },
      destinationLayout,
    });

    const retained = [
      interruption.panes.primary?.translateX?.initialValueAnimation,
      interruption.panes.primary?.opacity?.initialValueAnimation,
      interruption.panes.primary?.inlineSize?.initialValueAnimation,
      interruption.panes.secondary?.translateX?.initialValueAnimation,
      interruption.panes.secondary?.opacity?.initialValueAnimation,
      interruption.panes.secondary?.inlineSize?.initialValueAnimation,
      interruption.scrimOpacity?.initialValueAnimation,
    ].filter((track) => track !== undefined);

    expect(retained.length).toBeGreaterThan(0);
    for (const track of retained) {
      expect(track?.retainedTimelineStartFraction).toBe(sourceProgressFraction);
      expect(track?.retainedTimelineDurationMs).toBeGreaterThan(0);
    }
  });
});
