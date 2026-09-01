import { describe, expect, it } from 'vitest';
import type { PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import {
  PaneAdaptedValue,
  ThreePaneScaffoldRole,
  type ThreePaneScaffoldHorizontalOrder,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';
import type { PaneTransitionTrack } from './ThreePaneScaffold.interruption';
import {
  calculateThreePaneScaffoldTransitionDuration,
  calculateThreePaneScaffoldTransitionFrame,
  type ThreePaneScaffoldTransitionFrame,
  type ThreePaneScaffoldTransitionLayoutOptions,
} from './ThreePaneScaffold.transition';
import {
  createThreePaneScaffoldVisibilityInterruption,
  updateThreePaneScaffoldVisibilityInterruptionLayout,
  type ThreePaneScaffoldVisibilityInterruption,
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

const primary: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Expanded,
  secondary: PaneAdaptedValue.Hidden,
  tertiary: PaneAdaptedValue.Hidden,
};

const primarySecondary: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Expanded,
  secondary: PaneAdaptedValue.Expanded,
  tertiary: PaneAdaptedValue.Hidden,
};

function transitionLayout(
  currentValue: ThreePaneScaffoldValue,
  targetValue: ThreePaneScaffoldValue,
  width = 900,
): ThreePaneScaffoldTransitionLayoutOptions {
  return {
    width,
    height: 800,
    directive,
    currentValue,
    targetValue,
    paneOrder: order,
  };
}

function transitionFrame(
  layout: ThreePaneScaffoldTransitionLayoutOptions,
  progressFraction: number,
) {
  return calculateThreePaneScaffoldTransitionFrame({ ...layout, progressFraction });
}

function offsetTrack(
  initialValue: number,
  targetValue: number,
  playTimeMs: number,
): PaneTransitionTrack {
  return {
    initialValue,
    targetValue,
    initialVelocity: 0,
    playTimeMs,
    visibilityThreshold: 1,
    quantizationStep: 1,
    spec: 'material',
  };
}

describe('ThreePaneScaffold retained initial-value integration', () => {
  it('stamps retained children with the source Transition total duration', () => {
    const sourceLayout = transitionLayout(hidden, primary);
    const sourceDurationMs = calculateThreePaneScaffoldTransitionDuration(sourceLayout);
    const sourceProgress = 0.5;
    const renderedFrame = transitionFrame(sourceLayout, sourceProgress);
    const destinationLayout = transitionLayout(primary, primarySecondary);

    const interruption = createThreePaneScaffoldVisibilityInterruption({
      renderedFrame,
      previousSnapshot: {
        layout: sourceLayout,
        progressFraction: sourceProgress,
      },
      destinationLayout,
    });

    const retained = interruption.panes.primary?.translateX?.initialValueAnimation;
    expect(retained).toBeDefined();
    expect(retained?.retainedCompletionPlayTimeMs).toBe(sourceDurationMs);
  });

  it('does not resurrect a completed retained pointer during same-target remeasure', () => {
    const destinationLayout = transitionLayout(hidden, primary, 900);
    const destinationStart = transitionFrame(destinationLayout, 0);
    const destinationEnd = transitionFrame(destinationLayout, 1);
    const destinationTrackTarget = destinationEnd.primary?.translateX ?? 0;
    const retained: PaneTransitionTrack = {
      ...offsetTrack(600, destinationTrackTarget, 100),
      retainedCompletionPlayTimeMs: 120,
    };
    const active: PaneTransitionTrack = {
      ...offsetTrack(300, destinationTrackTarget, 0),
      initialValueAnimation: retained,
      useOnlyInitialValue: true,
    };
    const staleStart: ThreePaneScaffoldTransitionFrame = {
      ...destinationStart,
      primary:
        destinationStart.primary === undefined
          ? undefined
          : { ...destinationStart.primary, translateX: destinationStart.primary.translateX + 50 },
    };
    const staleEnd: ThreePaneScaffoldTransitionFrame = {
      ...destinationEnd,
      primary:
        destinationEnd.primary === undefined
          ? undefined
          : { ...destinationEnd.primary, translateX: destinationEnd.primary.translateX + 50 },
    };
    const interruption: ThreePaneScaffoldVisibilityInterruption = {
      originFrame: staleStart,
      destinationStartFrame: staleStart,
      targetFrame: staleEnd,
      durationMs: 200,
      panes: {
        primary: { translateX: active },
      },
    };

    const updated = updateThreePaneScaffoldVisibilityInterruptionLayout({
      interruption,
      renderedFrame: staleStart,
      destinationLayout,
      elapsedMs: 30,
      progressFraction: 0.25,
    });
    const refreshed = updated.panes.primary?.translateX;

    expect(refreshed).toBeDefined();
    expect(refreshed?.initialValueAnimation).toBeUndefined();
    expect(refreshed?.useOnlyInitialValue).toBeUndefined();
  });
});
