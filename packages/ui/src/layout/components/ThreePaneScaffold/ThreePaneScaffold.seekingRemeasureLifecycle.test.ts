import { describe, expect, it } from 'vitest';
import type { PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import {
  PaneAdaptedValue,
  ThreePaneScaffoldRole,
  type ThreePaneScaffoldHorizontalOrder,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';
import { samplePaneTransitionTrack } from './ThreePaneScaffold.interruption';
import { createThreePaneScaffoldSeekingRemeasureSource } from './ThreePaneScaffold.seekingRemeasure';
import {
  calculateThreePaneScaffoldTransitionFrame,
  type ThreePaneScaffoldTransitionLayoutOptions,
} from './ThreePaneScaffold.transition';
import {
  calculateThreePaneScaffoldVisibilityInterruptionDurationMs,
  createThreePaneScaffoldVisibilityInterruption,
  sampleThreePaneScaffoldVisibilityInterruption,
  updateThreePaneScaffoldVisibilityInterruptionLayout,
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

function value(primary: boolean, secondary: boolean): ThreePaneScaffoldValue {
  return {
    primary: primary ? PaneAdaptedValue.Expanded : PaneAdaptedValue.Hidden,
    secondary: secondary ? PaneAdaptedValue.Expanded : PaneAdaptedValue.Hidden,
    tertiary: PaneAdaptedValue.Hidden,
  };
}

function transitionLayout(
  currentValue: ThreePaneScaffoldValue,
  targetValue: ThreePaneScaffoldValue,
  width: number,
): ThreePaneScaffoldTransitionLayoutOptions {
  return {
    width,
    height: 800,
    directive,
    currentValue,
    targetValue,
    paneOrder,
  };
}

function frame(layout: ThreePaneScaffoldTransitionLayoutOptions, progressFraction: number) {
  return calculateThreePaneScaffoldTransitionFrame({ ...layout, progressFraction });
}

describe('ThreePaneScaffold repeated seeking remeasure lifecycle', () => {
  it('updates repeated remeasure from the current delayed child velocity', () => {
    const currentValue = value(true, false);
    const targetValue = value(false, true);
    const oldLayout = transitionLayout(currentValue, targetValue, 1000);
    const firstLayout = transitionLayout(currentValue, targetValue, 1200);
    const secondLayout = transitionLayout(currentValue, targetValue, 1400);
    const firstProgressFraction = Math.fround(0.4);
    const secondProgressFraction = Math.fround(0.65);
    const source = createThreePaneScaffoldSeekingRemeasureSource({
      layout: oldLayout,
      progressFraction: firstProgressFraction,
    });
    const first = updateThreePaneScaffoldVisibilityInterruptionLayout({
      interruption: source,
      renderedFrame: frame(oldLayout, firstProgressFraction),
      destinationLayout: firstLayout,
      elapsedMs: 0,
      progressFraction: firstProgressFraction,
    });
    const firstTrack = first.panes.primary?.translateX;
    expect(firstTrack).toBeDefined();

    const firstDurationMs = calculateThreePaneScaffoldVisibilityInterruptionDurationMs(first, 0);
    const secondSeekPlayTimeMs =
      Math.round(secondProgressFraction * Math.round(firstDurationMs * 1_000_000)) /
      1_000_000;
    const expectedVelocity = samplePaneTransitionTrack(
      firstTrack!,
      secondSeekPlayTimeMs,
      0,
    ).velocity;
    const second = updateThreePaneScaffoldVisibilityInterruptionLayout({
      interruption: first,
      renderedFrame: sampleThreePaneScaffoldVisibilityInterruption(
        first,
        0,
        secondProgressFraction,
      ),
      destinationLayout: secondLayout,
      elapsedMs: 0,
      progressFraction: secondProgressFraction,
    });
    const secondTrack = second.panes.primary?.translateX;

    expect(secondTrack).toBeDefined();
    expect(secondTrack?.targetValue).not.toBe(firstTrack?.targetValue);
    expect(secondTrack?.seekStartPlayTimeMs).toBe(secondSeekPlayTimeMs);
    expect(secondTrack?.initialVelocity).toBeCloseTo(expectedVelocity, 10);
    expect(secondTrack?.initialValueAnimation).toBeUndefined();
  });

  it('localizes a remeasure seek delay before the next target replacement', () => {
    const initialValue = value(true, false);
    const middleValue = value(false, true);
    const finalValue = initialValue;
    const oldLayout = transitionLayout(initialValue, middleValue, 1000);
    const resizedLayout = transitionLayout(initialValue, middleValue, 1200);
    const progressFraction = Math.fround(0.5);
    const source = createThreePaneScaffoldSeekingRemeasureSource({
      layout: oldLayout,
      progressFraction,
    });
    const remeasured = updateThreePaneScaffoldVisibilityInterruptionLayout({
      interruption: source,
      renderedFrame: frame(oldLayout, progressFraction),
      destinationLayout: resizedLayout,
      elapsedMs: 0,
      progressFraction,
    });
    const remeasuredTrack = remeasured.panes.primary?.translateX;
    const remeasuredDurationMs =
      calculateThreePaneScaffoldVisibilityInterruptionDurationMs(remeasured, 0);
    const seekPlayTimeMs =
      Math.round(progressFraction * Math.round(remeasuredDurationMs * 1_000_000)) /
      1_000_000;
    const expectedLocalPlayTimeMs = Math.max(
      0,
      seekPlayTimeMs - Math.max(0, remeasuredTrack?.seekStartPlayTimeMs ?? 0),
    );
    const renderedFrame = sampleThreePaneScaffoldVisibilityInterruption(
      remeasured,
      0,
      progressFraction,
    );

    const interrupted = createThreePaneScaffoldVisibilityInterruption({
      renderedFrame,
      previousSnapshot: {
        layout: resizedLayout,
        progressFraction,
      },
      destinationLayout: transitionLayout(middleValue, finalValue, 1200),
      previousInterruption: {
        interruption: remeasured,
        elapsedMs: 0,
      },
    });
    const retained = interrupted.panes.primary?.translateX?.initialValueAnimation;

    expect(remeasuredTrack?.seekStartPlayTimeMs).toBeGreaterThan(0);
    expect(retained).toBeDefined();
    expect(retained?.seekStartPlayTimeMs).toBeUndefined();
    expect(retained?.playTimeMs).toBeCloseTo(expectedLocalPlayTimeMs, 10);
  });
});
