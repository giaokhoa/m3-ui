import { describe, expect, it } from 'vitest';
import { PaneMotion } from '../../adaptive/paneMotion';
import { samplePaneMotionVectorSpringAtPlayTime } from '../../adaptive/paneMotionSpring';
import type { PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import {
  PaneAdaptedValue,
  ThreePaneScaffoldRole,
  type ThreePaneScaffoldHorizontalOrder,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';
import {
  calculateThreePaneScaffoldTransitionDuration,
  calculateThreePaneScaffoldTransitionFrame,
  calculateThreePaneScaffoldTransitionTiming,
  captureThreePaneScaffoldTransitionOrigin,
  interpolateThreePaneScaffoldTransitionFrames,
} from './ThreePaneScaffold.transition';

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

function options(currentValue: ThreePaneScaffoldValue, targetValue: ThreePaneScaffoldValue) {
  return {
    width: 1000,
    height: 800,
    directive,
    currentValue,
    targetValue,
    paneOrder: order,
  } as const;
}

function frame(
  currentValue: ThreePaneScaffoldValue,
  targetValue: ThreePaneScaffoldValue,
  progressFraction: number,
) {
  return calculateThreePaneScaffoldTransitionFrame({
    ...options(currentValue, targetValue),
    progressFraction,
  });
}

describe('calculateThreePaneScaffoldTransitionFrame', () => {
  it('samples edge slide springs at the global transition playtime', () => {
    const current = value(true, false, false);
    const target = value(false, true, false);
    const duration = calculateThreePaneScaffoldTransitionDuration(options(current, target));
    const result = frame(current, target, 0.5);
    const playTime = duration * 0.5;

    expect(duration).toBe(475);
    expect(result.primary?.motion).toBe(PaneMotion.ExitToLeft);
    expect(result.primary?.translateX).toBeCloseTo(
      samplePaneMotionVectorSpringAtPlayTime([0, 0], [-1000, 0], playTime)[0]!,
    );
    expect(result.secondary?.motion).toBe(PaneMotion.EnterFromRight);
    expect(result.secondary?.translateX).toBeCloseTo(
      samplePaneMotionVectorSpringAtPlayTime([1000, 0], [0, 0], playTime)[0]!,
    );
    expect(Math.abs(result.primary?.translateX ?? 0)).toBeGreaterThan(900);
  });

  it('samples AnimateBounds on its own TargetBasedAnimation progress', () => {
    const result = frame(value(true, true, false), value(true, true, true), 0.5);

    expect(result.primary?.motion).toBe(PaneMotion.AnimateBounds);
    expect(result.primary?.placement.left).toBeCloseTo(0);
    // A spring at half of its own duration is already much closer to target
    // than a linear midpoint between 616 and 317.33.
    expect(result.primary?.placement.width ?? Infinity).toBeLessThan(400);
    expect(result.secondary?.placement.left ?? Infinity).toBeLessThan(450);
  });

  it('keeps bounds duration private instead of extending the state timeline', () => {
    const current = value(true, false, false);
    const target: ThreePaneScaffoldValue = {
      ...current,
      primary: PaneAdaptedValue.Levitated('center'),
    };
    const timing = calculateThreePaneScaffoldTransitionTiming(options(current, target));
    const halfway = frame(current, target, 0.5);

    expect(halfway.primary?.motion).toBe(PaneMotion.AnimateBounds);
    expect(timing.visibilityDurationMs).toBe(0);
    expect(timing.boundsDurationMs).toBeGreaterThan(0);
    expect(timing.durationMs).toBe(0);
    expect(calculateThreePaneScaffoldTransitionDuration(options(current, target))).toBe(0);
    expect(halfway.primary?.placement.width ?? 1000).toBeLessThan(1000);
  });

  it('uses spring-sampled size and offset for expand/shrink', () => {
    const entering = frame(value(true, false, true), value(true, true, true), 0.5);
    expect(entering.secondary?.motion).toBe(PaneMotion.EnterWithExpand);
    expect(entering.secondary?.inlineClipFraction ?? 0).toBeGreaterThan(0.8);

    const exiting = frame(value(true, true, true), value(true, false, true), 0.5);
    expect(exiting.secondary?.motion).toBe(PaneMotion.ExitWithShrink);
    expect(exiting.secondary?.inlineClipFraction ?? 1).toBeLessThan(0.2);
  });

  it('uses the Float visibility spring for modal pane and scrim', () => {
    const current = value(true, false, false);
    const target: ThreePaneScaffoldValue = {
      ...current,
      tertiary: PaneAdaptedValue.Levitated('center', 'scrim'),
    };

    const timing = calculateThreePaneScaffoldTransitionTiming(options(current, target));
    expect(timing.visibilityDurationMs).toBe(328);

    const entering = frame(current, target, 0.4);
    expect(entering.tertiary?.motion).toBe(PaneMotion.EnterAsModal);
    expect(entering.tertiary?.opacity).toBeCloseTo(0.82226083, 5);
    expect(entering.scrim).toBe('scrim');
    expect(entering.scrimOpacity).toBeCloseTo(entering.tertiary?.opacity ?? 0, 7);

    const exiting = frame(target, current, 0.4);
    expect(exiting.tertiary?.motion).toBe(PaneMotion.ExitAsModal);
    expect(exiting.tertiary?.opacity).toBeCloseTo(0.17773917, 5);
    expect(exiting.scrimOpacity).toBeCloseTo(exiting.tertiary?.opacity ?? 0, 7);
  });

  it('holds delayed enters for 10% of the original spring duration', () => {
    const current = value(false, true, false);
    const target = value(true, false, true);

    const early = frame(current, target, 0.05);
    const later = frame(current, target, 0.55);
    expect(early.tertiary?.motion).toBe(PaneMotion.EnterFromRightDelayed);
    expect(early.tertiary?.translateX).toBeGreaterThan(later.tertiary?.translateX ?? 0);
  });

  it('reverses physical motion direction in RTL', () => {
    const result = calculateThreePaneScaffoldTransitionFrame({
      ...options(value(true, false, false), value(false, true, false)),
      progressFraction: 0.5,
      direction: 'rtl',
    });

    expect(result.primary?.motion).toBe(PaneMotion.ExitToRight);
    expect(result.secondary?.motion).toBe(PaneMotion.EnterFromLeft);
  });

  it('preserves the rendered frame when a transition is retargeted', () => {
    const primary = value(true, false, false);
    const secondary = value(false, true, false);
    const tertiary = value(false, false, true);
    const rendered = frame(primary, secondary, 0.4);
    const nextInitial = frame(secondary, tertiary, 0);
    const nextEnd = frame(secondary, tertiary, 1);
    const origin = captureThreePaneScaffoldTransitionOrigin(rendered, nextInitial);

    const retargetStart = interpolateThreePaneScaffoldTransitionFrames(origin, nextEnd, 0);
    expect(retargetStart.primary?.translateX).toBe(rendered.primary?.translateX);
    expect(retargetStart.secondary?.translateX).toBe(rendered.secondary?.translateX);
    expect(retargetStart.tertiary?.translateX).toBe(nextInitial.tertiary?.translateX);

    const retargetHalf = interpolateThreePaneScaffoldTransitionFrames(origin, nextEnd, 0.5);
    expect(retargetHalf.primary?.opacity).toBeCloseTo(0.5);
    expect(retargetHalf.tertiary?.translateX).not.toBe(nextInitial.tertiary?.translateX);
  });

  it('validates progress fractions', () => {
    expect(() => frame(value(true, false, false), value(false, true, false), -0.01)).toThrow(
      RangeError,
    );
    expect(() => frame(value(true, false, false), value(false, true, false), 1.01)).toThrow(
      RangeError,
    );
  });
});
