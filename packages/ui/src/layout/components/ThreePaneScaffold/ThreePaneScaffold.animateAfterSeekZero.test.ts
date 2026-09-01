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
import {
  createThreePaneScaffoldVisibilityInterruption,
  sampleThreePaneScaffoldVisibilityInterruption,
} from './ThreePaneScaffold.visibilityInterruption';

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

const hidden: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Hidden,
  secondary: PaneAdaptedValue.Hidden,
  tertiary: PaneAdaptedValue.Hidden,
};

const primary: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Expanded,
  secondary: PaneAdaptedValue.Hidden,
  tertiary: PaneAdaptedValue.Hidden,
};

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

describe('ThreePaneScaffold animate after seek-to-zero', () => {
  it('retains the parked old visibility animation when the target reverses', () => {
    const oldLayout = layout(primary, hidden);
    const renderedFrame = calculateThreePaneScaffoldTransitionFrame({
      ...oldLayout,
      progressFraction: 0,
    });
    const reversed = createThreePaneScaffoldVisibilityInterruption({
      renderedFrame,
      previousSnapshot: { layout: oldLayout, progressFraction: 0 },
      destinationLayout: layout(hidden, primary),
    });
    const primaryTracks = reversed.panes.primary;
    const tracked =
      primaryTracks?.translateX ?? primaryTracks?.opacity ?? primaryTracks?.inlineSize;

    expect(renderedFrame.primary).toBeDefined();
    expect(reversed.originFrame.primary).toBeDefined();
    expect(reversed.targetFrame.primary).toBeDefined();
    expect(tracked?.initialValueAnimation).toBeDefined();

    const boundary = sampleThreePaneScaffoldVisibilityInterruption(reversed, 0, 0);
    const carried = sampleThreePaneScaffoldVisibilityInterruption(reversed, 80, 0);

    expect(boundary.primary?.placement).toEqual(renderedFrame.primary?.placement);
    expect(boundary.primary?.translateX).toBe(renderedFrame.primary?.translateX);
    expect(boundary.primary?.opacity).toBe(renderedFrame.primary?.opacity);
    expect(boundary.primary?.inlineClipFraction).toBe(
      renderedFrame.primary?.inlineClipFraction,
    );
    expect(carried.primary?.translateX).not.toBe(boundary.primary?.translateX);
  });

  it('keeps retained motion independent from the parked new fraction', () => {
    const oldLayout = layout(primary, hidden);
    const renderedFrame = calculateThreePaneScaffoldTransitionFrame({
      ...oldLayout,
      progressFraction: 0,
    });
    const reversed = createThreePaneScaffoldVisibilityInterruption({
      renderedFrame,
      previousSnapshot: { layout: oldLayout, progressFraction: 0 },
      destinationLayout: layout(hidden, primary),
    });

    const atZeroEarly = sampleThreePaneScaffoldVisibilityInterruption(reversed, 16, 0);
    const atZeroLater = sampleThreePaneScaffoldVisibilityInterruption(reversed, 96, 0);
    const newSegmentAdvanced = sampleThreePaneScaffoldVisibilityInterruption(
      reversed,
      96,
      0.5,
    );

    expect(atZeroLater.primary?.translateX).not.toBe(atZeroEarly.primary?.translateX);
    expect(newSegmentAdvanced.primary?.translateX).not.toBe(atZeroLater.primary?.translateX);
  });

  it('does not retain a completed old animation when reversing from fraction one', () => {
    const oldLayout = layout(primary, hidden);
    const renderedFrame = calculateThreePaneScaffoldTransitionFrame({
      ...oldLayout,
      progressFraction: 1,
    });
    const reversed = createThreePaneScaffoldVisibilityInterruption({
      renderedFrame,
      previousSnapshot: { layout: oldLayout, progressFraction: 1 },
      destinationLayout: layout(hidden, primary),
    });
    const primaryTracks = reversed.panes.primary;
    const tracked =
      primaryTracks?.translateX ?? primaryTracks?.opacity ?? primaryTracks?.inlineSize;

    expect(tracked).toBeDefined();
    expect(tracked?.initialValueAnimation).toBeUndefined();
    expect(
      sampleThreePaneScaffoldVisibilityInterruption(reversed, 0, 0).primary?.translateX,
    ).toBe(renderedFrame.primary?.translateX);
  });
});
