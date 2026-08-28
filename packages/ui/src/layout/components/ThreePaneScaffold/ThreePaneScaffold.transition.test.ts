import { describe, expect, it } from 'vitest';
import type { PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import { PaneMotion } from '../../adaptive/paneMotion';
import {
  PaneAdaptedValue,
  ThreePaneScaffoldRole,
  type ThreePaneScaffoldHorizontalOrder,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';
import {
  calculateThreePaneScaffoldTransitionFrame,
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

function frame(
  currentValue: ThreePaneScaffoldValue,
  targetValue: ThreePaneScaffoldValue,
  progressFraction: number,
) {
  return calculateThreePaneScaffoldTransitionFrame({
    width: 1000,
    height: 800,
    directive,
    currentValue,
    targetValue,
    progressFraction,
    paneOrder: order,
  });
}

describe('calculateThreePaneScaffoldTransitionFrame', () => {
  it('slides edge panes out and in using AndroidX motion offsets', () => {
    const result = frame(value(true, false, false), value(false, true, false), 0.5);

    expect(result.primary?.motion).toBe(PaneMotion.ExitToLeft);
    expect(result.primary?.translateX).toBe(-500);
    expect(result.secondary?.motion).toBe(PaneMotion.EnterFromRight);
    expect(result.secondary?.translateX).toBe(500);
  });

  it('interpolates bounds for panes that remain shown', () => {
    const result = frame(value(true, true, false), value(true, true, true), 0.5);

    expect(result.primary?.motion).toBe(PaneMotion.AnimateBounds);
    expect(result.primary?.placement.left).toBeCloseTo(0);
    expect(result.primary?.placement.width).toBeCloseTo((616 + 317.3333333333) / 2);
    expect(result.secondary?.placement.left).toBeCloseTo((640 + 341.3333333333) / 2);
  });

  it('uses center clipping for EnterWithExpand and ExitWithShrink', () => {
    const entering = frame(value(true, false, true), value(true, true, true), 0.5);
    expect(entering.secondary?.motion).toBe(PaneMotion.EnterWithExpand);
    expect(entering.secondary?.inlineClipFraction).toBe(0.5);

    const exiting = frame(value(true, true, true), value(true, false, true), 0.5);
    expect(exiting.secondary?.motion).toBe(PaneMotion.ExitWithShrink);
    expect(exiting.secondary?.inlineClipFraction).toBe(0.5);
  });

  it('fades levitated panes and scrims for modal enter/exit', () => {
    const current = value(true, false, false);
    const target: ThreePaneScaffoldValue = {
      ...current,
      tertiary: PaneAdaptedValue.Levitated('center', 'scrim'),
    };

    const entering = frame(current, target, 0.4);
    expect(entering.tertiary?.motion).toBe(PaneMotion.EnterAsModal);
    expect(entering.tertiary?.opacity).toBe(0.4);
    expect(entering.scrim).toBe('scrim');
    expect(entering.scrimOpacity).toBe(0.4);

    const exiting = frame(target, current, 0.4);
    expect(exiting.tertiary?.motion).toBe(PaneMotion.ExitAsModal);
    expect(exiting.tertiary?.opacity).toBe(0.6);
    expect(exiting.scrimOpacity).toBe(0.6);
  });

  it('holds delayed enters during the configured delayed ratio', () => {
    const current = value(false, true, false);
    const target = value(true, false, true);

    const early = frame(current, target, 0.05);
    const later = frame(current, target, 0.55);
    expect(early.tertiary?.motion).toBe(PaneMotion.EnterFromRightDelayed);
    expect(early.tertiary?.translateX).toBeGreaterThan(later.tertiary?.translateX ?? 0);
  });

  it('reverses physical motion direction in RTL', () => {
    const result = calculateThreePaneScaffoldTransitionFrame({
      width: 1000,
      height: 800,
      directive,
      currentValue: value(true, false, false),
      targetValue: value(false, true, false),
      progressFraction: 0.5,
      paneOrder: order,
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
