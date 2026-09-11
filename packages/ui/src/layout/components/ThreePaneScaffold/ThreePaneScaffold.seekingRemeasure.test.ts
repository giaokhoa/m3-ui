import { describe, expect, it } from 'vitest';
import type { PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import {
  PaneAdaptedValue,
  ThreePaneScaffoldRole,
  type ThreePaneScaffoldHorizontalOrder,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';
import { createThreePaneScaffoldSeekingRemeasureSource } from './ThreePaneScaffold.seekingRemeasure';
import {
  calculateThreePaneScaffoldTransitionDuration,
  calculateThreePaneScaffoldTransitionFrame,
  type ThreePaneScaffoldTransitionLayoutOptions,
} from './ThreePaneScaffold.transition';
import { updateThreePaneScaffoldVisibilityInterruptionLayout } from './ThreePaneScaffold.visibilityInterruption';

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

describe('ThreePaneScaffold seeking remeasure source', () => {
  it('captures raw seek children at Compose Float/nanosecond play time', () => {
    const layout = transitionLayout(value(true, false), value(false, true), 1000);
    const progressFraction = 0.123456789;
    const durationMs = calculateThreePaneScaffoldTransitionDuration(layout);
    const expectedPlayTimeMs =
      Math.round(Math.fround(progressFraction) * Math.round(durationMs * 1_000_000)) /
      1_000_000;

    const source = createThreePaneScaffoldSeekingRemeasureSource({
      layout,
      progressFraction,
    });
    const track = source.panes.primary?.translateX;

    expect(source.destinationStartFrame).toEqual(frame(layout, 0));
    expect(source.targetFrame).toEqual(frame(layout, 1));
    expect(track).toBeDefined();
    expect(track?.playTimeMs).toBe(expectedPlayTimeMs);
    expect(track?.playTimeMs).not.toBe(durationMs * progressFraction);
    expect(track?.initialValueAnimation).toBeUndefined();
    expect(track?.useOnlyInitialValue).toBeUndefined();
  });

  it('does not interrupt children when remeasurement leaves values unchanged', () => {
    const layout = transitionLayout(value(true, false), value(false, true), 1000);
    const progressFraction = 0.5;
    const source = createThreePaneScaffoldSeekingRemeasureSource({
      layout,
      progressFraction,
    });

    const updated = updateThreePaneScaffoldVisibilityInterruptionLayout({
      interruption: source,
      renderedFrame: frame(layout, progressFraction),
      destinationLayout: layout,
      elapsedMs: 0,
      progressFraction,
    });

    expect(updated).toBe(source);
  });

  it('delays only a child replaced by changed measurement geometry', () => {
    const currentValue = value(true, false);
    const targetValue = value(false, true);
    const oldLayout = transitionLayout(currentValue, targetValue, 1000);
    const nextLayout = transitionLayout(currentValue, targetValue, 1200);
    const progressFraction = 0.5;
    const source = createThreePaneScaffoldSeekingRemeasureSource({
      layout: oldLayout,
      progressFraction,
    });
    const oldTrack = source.panes.primary?.translateX;

    const updated = updateThreePaneScaffoldVisibilityInterruptionLayout({
      interruption: source,
      renderedFrame: frame(oldLayout, progressFraction),
      destinationLayout: nextLayout,
      elapsedMs: 0,
      progressFraction,
    });
    const updatedTrack = updated.panes.primary?.translateX;

    expect(updated).not.toBe(source);
    expect(updatedTrack).toBeDefined();
    expect(updatedTrack?.targetValue).not.toBe(oldTrack?.targetValue);
    expect(updatedTrack?.seekStartPlayTimeMs).toBeGreaterThan(0);
    expect(updatedTrack?.initialValueAnimation).toBeUndefined();
  });
});
