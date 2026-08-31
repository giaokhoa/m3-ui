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

function retainedTracks(
  interruption: ReturnType<typeof createThreePaneScaffoldVisibilityInterruption>,
) {
  return [
    interruption.panes.primary?.translateX?.initialValueAnimation,
    interruption.panes.primary?.opacity?.initialValueAnimation,
    interruption.panes.primary?.inlineSize?.initialValueAnimation,
    interruption.panes.secondary?.translateX?.initialValueAnimation,
    interruption.panes.secondary?.opacity?.initialValueAnimation,
    interruption.panes.secondary?.inlineSize?.initialValueAnimation,
    interruption.scrimOpacity?.initialValueAnimation,
  ].filter((track) => track !== undefined);
}

describe('ThreePaneScaffold retained timeline wiring parity', () => {
  it('carries the source Float fraction into retained child tracks for parked seeking', () => {
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

    const retained = retainedTracks(interruption);
    expect(retained.length).toBeGreaterThan(0);
    for (const track of retained) {
      expect(track?.retainedTimelineStartFraction).toBe(sourceProgressFraction);
      expect(track?.retainedTimelineProgressMs).toBe(0);
      expect(track?.retainedTimelineDurationMs).toBeGreaterThan(0);
    }
  });

  it('carries the original start and accumulated progress for a running null-spec animation', () => {
    const initial = value(true, false);
    const middle = value(false, true);
    const final = value(true, false);
    const sourceLayout = layout(initial, middle);
    const destinationLayout = layout(middle, final);
    const sourceProgressFraction = Math.fround(0.58698570728302);
    const runningTimeline = {
      durationMs: 344,
      startFraction: Math.fround(0.4611676335334778),
      progressMs: 43.281411,
    };
    const renderedFrame = calculateThreePaneScaffoldTransitionFrame({
      ...sourceLayout,
      progressFraction: sourceProgressFraction,
    });

    const interruption = createThreePaneScaffoldVisibilityInterruption({
      renderedFrame,
      previousSnapshot: {
        layout: sourceLayout,
        progressFraction: sourceProgressFraction,
        runningTimeline,
      },
      destinationLayout,
    });

    const retained = retainedTracks(interruption);
    expect(retained.length).toBeGreaterThan(0);
    for (const track of retained) {
      expect(track?.retainedTimelineDurationMs).toBe(runningTimeline.durationMs);
      expect(track?.retainedTimelineStartFraction).toBe(runningTimeline.startFraction);
      expect(track?.retainedTimelineProgressMs).toBe(runningTimeline.progressMs);
    }
  });
});