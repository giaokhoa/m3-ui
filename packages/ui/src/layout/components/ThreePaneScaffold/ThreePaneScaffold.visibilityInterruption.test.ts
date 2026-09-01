import { describe, expect, it } from 'vitest';
import { PaneMotion } from '../../adaptive/paneMotion';
import type { PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import {
  PaneAdaptedValue,
  ThreePaneScaffoldRole,
  type ThreePaneScaffoldHorizontalOrder,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';
import {
  retargetPaneTransitionTrack,
  samplePaneTransitionTrack,
  type PaneTransitionTrack,
} from './ThreePaneScaffold.interruption';
import {
  calculateThreePaneScaffoldTransitionFrame,
  type ThreePaneScaffoldTransitionFrame,
  type ThreePaneScaffoldTransitionLayoutOptions,
} from './ThreePaneScaffold.transition';
import {
  calculateThreePaneScaffoldVisibilityInterruptionDurationMs,
  sampleThreePaneScaffoldVisibilityInterruption,
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

function value(primary: boolean, secondary: boolean, tertiary: boolean): ThreePaneScaffoldValue {
  return {
    primary: primary ? PaneAdaptedValue.Expanded : PaneAdaptedValue.Hidden,
    secondary: secondary ? PaneAdaptedValue.Expanded : PaneAdaptedValue.Hidden,
    tertiary: tertiary ? PaneAdaptedValue.Expanded : PaneAdaptedValue.Hidden,
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
    paneOrder: order,
  };
}

function layoutFrame(
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

function frame(translateX: number): ThreePaneScaffoldTransitionFrame {
  return {
    primary: {
      placement: { left: 0, top: 0, width: 600, height: 800 },
      translateX,
      opacity: 1,
      inlineClipFraction: 1,
      motion: PaneMotion.EnterFromLeft,
      levitated: false,
    },
    scrimOpacity: 0,
  };
}

function interruptionWithTrack(
  track: PaneTransitionTrack,
  originTranslateX: number,
  targetTranslateX: number,
): ThreePaneScaffoldVisibilityInterruption {
  return {
    originFrame: frame(originTranslateX),
    targetFrame: frame(targetTranslateX),
    durationMs: 200,
    panes: {
      primary: { translateX: track },
    },
  };
}

describe('ThreePaneScaffold visibility interruption clocks', () => {
  it('uses seek progress independently from retained-animation wall time', () => {
    const oldTrack = offsetTrack(1000, 0, 80);
    const oldNow = samplePaneTransitionTrack(oldTrack);
    const retargeted = retargetPaneTransitionTrack({
      fromValue: oldNow.value,
      toValue: -1000,
      fromTrack: oldTrack,
      toTrack: offsetTrack(0, -1000, 0),
      fallbackVisibilityThreshold: 1,
      fallbackQuantizationStep: 1,
    })!;
    const interruption = interruptionWithTrack(retargeted, oldNow.value, -1000);

    const elapsedMs = 100;
    const explicitSeek = sampleThreePaneScaffoldVisibilityInterruption(
      interruption,
      elapsedMs,
      0,
    );
    const fallbackLinearSeek = sampleThreePaneScaffoldVisibilityInterruption(
      interruption,
      elapsedMs,
    );

    expect(explicitSeek.primary?.translateX).toBe(
      samplePaneTransitionTrack(retargeted, 0, elapsedMs).value,
    );
    expect(fallbackLinearSeek.primary?.translateX).not.toBe(
      explicitSeek.primary?.translateX,
    );
  });

  it('rounds Float seek progress through nanoseconds before child sampling', () => {
    const opacity: PaneTransitionTrack = {
      initialValue: 0,
      targetValue: 1,
      initialVelocity: 0,
      playTimeMs: 0,
      visibilityThreshold: 0.01,
      spec: 'material',
    };
    const interruption: ThreePaneScaffoldVisibilityInterruption = {
      originFrame: {
        primary: {
          placement: { left: 0, top: 0, width: 600, height: 800 },
          translateX: 0,
          opacity: 0,
          inlineClipFraction: 1,
          motion: PaneMotion.EnterAsModal,
          levitated: true,
        },
        scrimOpacity: 0,
      },
      targetFrame: {
        primary: {
          placement: { left: 0, top: 0, width: 600, height: 800 },
          translateX: 0,
          opacity: 1,
          inlineClipFraction: 1,
          motion: PaneMotion.EnterAsModal,
          levitated: true,
        },
        scrimOpacity: 0,
      },
      durationMs: 328,
      panes: { primary: { opacity } },
    };
    const progress = Math.fround(0.0030487799);
    expect(calculateThreePaneScaffoldVisibilityInterruptionDurationMs(interruption)).toBe(328);

    const sampled = sampleThreePaneScaffoldVisibilityInterruption(interruption, 0, progress);
    expect(sampled.primary?.opacity).toBe(samplePaneTransitionTrack(opacity, 1).value);
    expect(sampled.primary?.opacity).not.toBe(samplePaneTransitionTrack(opacity, 0).value);
  });

  it('recomputes active child duration as the retained initial value moves', () => {
    const oldTrack = offsetTrack(1000, 0, 80);
    const oldNow = samplePaneTransitionTrack(oldTrack);
    const retargeted = retargetPaneTransitionTrack({
      fromValue: oldNow.value,
      toValue: -1000,
      fromTrack: oldTrack,
      toTrack: offsetTrack(0, -1000, 0),
      fallbackVisibilityThreshold: 1,
      fallbackQuantizationStep: 1,
    })!;
    const interruption = interruptionWithTrack(retargeted, oldNow.value, -1000);

    const boundaryDuration =
      calculateThreePaneScaffoldVisibilityInterruptionDurationMs(interruption, 0);
    const laterDuration =
      calculateThreePaneScaffoldVisibilityInterruptionDurationMs(interruption, 100);

    expect(boundaryDuration).toBeGreaterThan(0);
    expect(laterDuration).toBeGreaterThan(0);
    expect(laterDuration).not.toBe(boundaryDuration);
  });

  it('advances a retained initial-value animation while seek progress is parked', () => {
    const oldTrack = offsetTrack(1000, 0, 80);
    const oldNow = samplePaneTransitionTrack(oldTrack);
    const continued = retargetPaneTransitionTrack({
      fromValue: oldNow.value,
      toValue: 0,
      fromTrack: oldTrack,
      fallbackVisibilityThreshold: 1,
      fallbackQuantizationStep: 1,
    })!;
    const interruption = interruptionWithTrack(continued, oldNow.value, 0);

    const early = sampleThreePaneScaffoldVisibilityInterruption(interruption, 20, 0);
    const later = sampleThreePaneScaffoldVisibilityInterruption(interruption, 100, 0);

    expect(continued.useOnlyInitialValue).toBe(true);
    expect(early.primary?.translateX).toBe(
      samplePaneTransitionTrack(continued, 0, 20).value,
    );
    expect(later.primary?.translateX).toBe(
      samplePaneTransitionTrack(continued, 0, 100).value,
    );
    expect(later.primary?.translateX).not.toBe(early.primary?.translateX);
  });

  it('retains untouched properties of a slide-only exiting pane', () => {
    const oldTrack = offsetTrack(0, -1000, 80);
    const oldNow = samplePaneTransitionTrack(oldTrack);
    const continued = retargetPaneTransitionTrack({
      fromValue: oldNow.value,
      toValue: -1000,
      fromTrack: oldTrack,
      fallbackVisibilityThreshold: 1,
      fallbackQuantizationStep: 1,
    })!;
    const originFrame = frame(oldNow.value);
    const interruption: ThreePaneScaffoldVisibilityInterruption = {
      originFrame,
      targetFrame: { scrimOpacity: 0 },
      durationMs: 200,
      panes: {
        primary: {
          translateX: continued,
          retainOriginPane: true,
        },
      },
    };

    const sampled = sampleThreePaneScaffoldVisibilityInterruption(interruption, 60, 1);

    expect(sampled.primary).toBeDefined();
    expect(sampled.primary?.opacity).toBe(1);
    expect(sampled.primary?.inlineClipFraction).toBe(1);
    expect(sampled.primary?.translateX).toBe(
      samplePaneTransitionTrack(continued, 200, 60).value,
    );
  });

  it('keeps inline-size continuity when the next pane width changes', () => {
    const inlineSize = offsetTrack(300, 800, 0);
    const originFrame: ThreePaneScaffoldTransitionFrame = {
      primary: {
        placement: { left: 0, top: 0, width: 600, height: 800 },
        translateX: 0,
        opacity: 1,
        inlineClipFraction: 0.5,
        motion: PaneMotion.EnterWithExpand,
        levitated: false,
      },
      scrimOpacity: 0,
    };
    const targetFrame: ThreePaneScaffoldTransitionFrame = {
      primary: {
        placement: { left: 0, top: 0, width: 800, height: 800 },
        translateX: 0,
        opacity: 1,
        inlineClipFraction: 1,
        motion: PaneMotion.EnterWithExpand,
        levitated: false,
      },
      scrimOpacity: 0,
    };
    const interruption: ThreePaneScaffoldVisibilityInterruption = {
      originFrame,
      targetFrame,
      durationMs: 200,
      panes: {
        primary: {
          inlineSize,
          inlineSizeReferenceWidth: 800,
        },
      },
    };

    const boundary = sampleThreePaneScaffoldVisibilityInterruption(interruption, 0, 0);

    expect(boundary.primary?.placement.width).toBe(600);
    expect(boundary.primary?.inlineClipFraction).toBe(0.5);
  });

  it('retargets AnimateBounds to remeasured lookahead bounds', () => {
    const current = value(true, true, false);
    const target = value(true, true, true);
    const oldLayout = transitionLayout(current, target, 1000);
    const nextLayout = transitionLayout(current, target, 1200);
    const oldStart = layoutFrame(oldLayout, 0);
    const oldEnd = layoutFrame(oldLayout, 1);
    const rendered = layoutFrame(oldLayout, 0.5);
    const nextEnd = layoutFrame(nextLayout, 1);
    const interruption: ThreePaneScaffoldVisibilityInterruption = {
      originFrame: oldStart,
      destinationStartFrame: oldStart,
      targetFrame: oldEnd,
      durationMs: 0,
      panes: {},
    };

    const updated = updateThreePaneScaffoldVisibilityInterruptionLayout({
      interruption,
      renderedFrame: rendered,
      destinationLayout: nextLayout,
      elapsedMs: 0,
      progressFraction: 0.5,
    });

    expect(nextEnd.primary?.motion).toBe(PaneMotion.AnimateBounds);
    expect(updated.targetFrame.primary?.placement).toEqual(nextEnd.primary?.placement);
    expect(updated.originFrame.primary?.placement).toEqual(rendered.primary?.placement);
    expect(updated.targetFrame.primary?.placement).not.toEqual(oldEnd.primary?.placement);
  });

  it('delays a remeasured seek child from the current global play time', () => {
    const current = value(true, false, false);
    const target = value(false, true, false);
    const oldLayout = transitionLayout(current, target, 1000);
    const nextLayout = transitionLayout(current, target, 1200);
    const oldStart = layoutFrame(oldLayout, 0);
    const oldEnd = layoutFrame(oldLayout, 1);
    const nextStart = layoutFrame(nextLayout, 0);
    const nextEnd = layoutFrame(nextLayout, 1);
    const oldTrack = offsetTrack(
      oldStart.primary!.translateX,
      oldEnd.primary!.translateX,
      0,
    );
    const interruption: ThreePaneScaffoldVisibilityInterruption = {
      originFrame: oldStart,
      destinationStartFrame: oldStart,
      targetFrame: oldEnd,
      durationMs: 200,
      panes: {
        primary: { translateX: oldTrack },
      },
    };

    const updated = updateThreePaneScaffoldVisibilityInterruptionLayout({
      interruption,
      renderedFrame: layoutFrame(oldLayout, 0.5),
      destinationLayout: nextLayout,
      elapsedMs: 0,
      progressFraction: 0.5,
    });
    const updatedTrack = updated.panes.primary!.translateX!;

    expect(updatedTrack.targetValue).toBe(nextEnd.primary?.translateX);
    expect(updatedTrack.seekStartPlayTimeMs).toBeGreaterThan(0);
    expect(updatedTrack.initialValueAnimation).toBeUndefined();
    expect(
      samplePaneTransitionTrack(updatedTrack, updatedTrack.seekStartPlayTimeMs).value,
    ).toBe(nextStart.primary?.translateX);
  });

  it('updates interrupted inline-size targets to the remeasured pane width', () => {
    const current = value(true, false, true);
    const target = value(true, true, true);
    const oldLayout = transitionLayout(current, target, 1000);
    const nextLayout = transitionLayout(current, target, 1200);
    const oldStart = layoutFrame(oldLayout, 0);
    const oldEnd = layoutFrame(oldLayout, 1);
    const nextEnd = layoutFrame(nextLayout, 1);
    const oldReferenceWidth = oldEnd.secondary!.placement.width;
    const inlineSize = offsetTrack(
      oldStart.secondary!.inlineClipFraction * oldReferenceWidth,
      oldEnd.secondary!.inlineClipFraction * oldReferenceWidth,
      0,
    );
    const interruption: ThreePaneScaffoldVisibilityInterruption = {
      originFrame: oldStart,
      destinationStartFrame: oldStart,
      targetFrame: oldEnd,
      durationMs: 200,
      panes: {
        secondary: {
          inlineSize,
          inlineSizeReferenceWidth: oldReferenceWidth,
        },
      },
    };

    const updated = updateThreePaneScaffoldVisibilityInterruptionLayout({
      interruption,
      renderedFrame: layoutFrame(oldLayout, 0.5),
      destinationLayout: nextLayout,
      elapsedMs: 0,
      progressFraction: 0.5,
    });
    const nextReferenceWidth = nextEnd.secondary!.placement.width;

    expect(updated.panes.secondary?.inlineSizeReferenceWidth).toBe(nextReferenceWidth);
    expect(updated.panes.secondary?.inlineSize?.targetValue).toBe(nextReferenceWidth);
    expect(updated.panes.secondary?.inlineSize?.seekStartPlayTimeMs).toBeGreaterThan(0);
  });
});
