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
  calculateThreePaneScaffoldTransitionDuration,
  calculateThreePaneScaffoldTransitionFrame,
} from './ThreePaneScaffold.transition';
import {
  calculateThreePaneScaffoldTransitionDurationWithSpecs,
  calculateThreePaneScaffoldTransitionFrameWithSpecs,
  type PaneTransitionSpecs,
} from './paneTransitions';

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

function layout(
  currentValue: ThreePaneScaffoldValue,
  targetValue: ThreePaneScaffoldValue,
  direction: 'ltr' | 'rtl' = 'ltr',
) {
  return {
    width: 1000,
    height: 800,
    directive,
    currentValue,
    targetValue,
    paneOrder: order,
    direction,
  } as const;
}

describe('pane transition customization', () => {
  it('keeps the no-override path exactly Material', () => {
    const options = layout(value(true, false, false), value(false, true, false));
    expect(calculateThreePaneScaffoldTransitionDurationWithSpecs(options)).toBe(
      calculateThreePaneScaffoldTransitionDuration(options),
    );
    expect(calculateThreePaneScaffoldTransitionFrameWithSpecs(options, 0.371)).toEqual(
      calculateThreePaneScaffoldTransitionFrame({
        ...options,
        progressFraction: 0.371,
      }),
    );
  });

  it('replaces enter and exit visual channels per role', () => {
    const options = layout(value(true, false, false), value(false, true, false));
    const specs: PaneTransitionSpecs = {
      primary: {
        exit: {
          durationMs: 200,
          from: { opacity: 1, translateInline: 0 },
          to: { opacity: 0, translateInline: -40 },
        },
      },
      secondary: {
        enter: {
          durationMs: 400,
          from: { opacity: 0, translateInline: 80 },
          to: { opacity: 1, translateInline: 0 },
        },
      },
    };

    expect(calculateThreePaneScaffoldTransitionDurationWithSpecs(options, specs)).toBe(400);
    const halfway = calculateThreePaneScaffoldTransitionFrameWithSpecs(options, 0.5, specs);
    expect(halfway.primary?.opacity).toBe(0);
    expect(halfway.primary?.translateX).toBe(-40);
    expect(halfway.secondary?.opacity).toBeCloseTo(0.5);
    expect(halfway.secondary?.translateX).toBeCloseTo(40);
  });

  it('mirrors logical inline translation in RTL', () => {
    const options = layout(value(false, true, false), value(true, false, false), 'rtl');
    const specs: PaneTransitionSpecs = {
      primary: {
        enter: {
          durationMs: 300,
          from: { translateInline: 120 },
          to: { translateInline: 0 },
        },
      },
    };

    const start = calculateThreePaneScaffoldTransitionFrameWithSpecs(options, 0, specs);
    expect(start.primary?.translateX).toBe(-120);
  });

  it('lets a custom curve retain Material enter/exit endpoints', () => {
    const options = layout(value(true, false, false), value(false, true, false));
    const specs: PaneTransitionSpecs = {
      secondary: {
        enter: {
          durationMs: 300,
          easing: (progress) => progress * progress,
          from: ({ materialFrom }) => materialFrom,
          to: ({ materialTo }) => materialTo,
        },
      },
    };

    const start = calculateThreePaneScaffoldTransitionFrameWithSpecs(options, 0, specs);
    const materialStart = calculateThreePaneScaffoldTransitionFrame({
      ...options,
      progressFraction: 0,
    });
    expect(start.secondary?.translateX).toBe(materialStart.secondary?.translateX);
  });

  it('customizes AnimateBounds without changing the Material motion decision', () => {
    const options = layout(value(true, true, false), value(true, true, true));
    const specs: PaneTransitionSpecs = {
      primary: { bounds: { durationMs: 600, easing: (progress) => progress } },
    };

    expect(calculateThreePaneScaffoldTransitionDurationWithSpecs(options, specs)).toBeGreaterThanOrEqual(600);
    const halfway = calculateThreePaneScaffoldTransitionFrameWithSpecs(options, 0.5, specs);
    const start = calculateThreePaneScaffoldTransitionFrameWithSpecs(options, 0, specs);
    const end = calculateThreePaneScaffoldTransitionFrameWithSpecs(options, 1, specs);
    expect(halfway.primary?.motion).toBe(PaneMotion.AnimateBounds);
    expect(halfway.primary?.placement.width).toBeCloseTo(
      ((start.primary?.placement.width ?? 0) + (end.primary?.placement.width ?? 0)) / 2,
    );
  });

  it('supports an application reduced-motion override with zero-duration visibility', () => {
    const options = layout(value(true, false, false), value(false, true, false));
    const specs: PaneTransitionSpecs = {
      primary: { exit: { durationMs: 0 } },
      secondary: { enter: { durationMs: 0 } },
    };
    expect(calculateThreePaneScaffoldTransitionDurationWithSpecs(options, specs)).toBe(0);
    const frame = calculateThreePaneScaffoldTransitionFrameWithSpecs(options, 0, specs);
    expect(frame.primary?.opacity).toBe(1);
    expect(frame.secondary?.opacity).toBe(1);
    expect(frame.primary?.translateX).toBe(0);
    expect(frame.secondary?.translateX).toBe(0);
  });

  it('rejects invalid durations and easing results', () => {
    const options = layout(value(false, true, false), value(true, false, false));
    expect(() =>
      calculateThreePaneScaffoldTransitionDurationWithSpecs(options, {
        primary: { enter: { durationMs: -1 } },
      }),
    ).toThrow(RangeError);
    expect(() =>
      calculateThreePaneScaffoldTransitionFrameWithSpecs(options, 0.5, {
        primary: { enter: { durationMs: 100, easing: () => Number.NaN } },
      }),
    ).toThrow(RangeError);
  });
});
