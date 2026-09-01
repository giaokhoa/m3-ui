import { describe, expect, it } from 'vitest';
import type { PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import {
  PaneAdaptedValue,
  ThreePaneScaffoldRole,
  type ThreePaneScaffoldHorizontalOrder,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';
import {
  calculateThreePaneScaffoldTransitionFrameWithSpecs,
  type PaneTransitionSpecs,
} from './paneTransitions';
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

function layout(currentValue: ThreePaneScaffoldValue, targetValue: ThreePaneScaffoldValue) {
  return {
    width: 480,
    height: 640,
    directive,
    currentValue,
    targetValue,
    paneOrder,
    direction: 'ltr' as const,
  };
}

describe('custom pane transition interruption handoff', () => {
  it('captures the exact custom rendered frame as the interruption origin', () => {
    const detail = value(true, false);
    const list = value(false, true);
    const sourceLayout = layout(detail, list);
    const specs: PaneTransitionSpecs = {
      primary: {
        exit: {
          durationMs: 500,
          from: { opacity: 1, translateInline: 0 },
          to: { opacity: 0, translateInline: -64 },
        },
      },
      secondary: {
        enter: {
          durationMs: 500,
          from: { opacity: 0, translateInline: 64 },
          to: { opacity: 1, translateInline: 0 },
        },
      },
    };
    const progressFraction = 0.4;
    const renderedFrame = calculateThreePaneScaffoldTransitionFrameWithSpecs(
      sourceLayout,
      progressFraction,
      specs,
    );

    const interruption = createThreePaneScaffoldVisibilityInterruption({
      renderedFrame,
      previousSnapshot: {
        layout: sourceLayout,
        progressFraction,
      },
      destinationLayout: layout(list, detail),
    });

    expect(interruption.originFrame.primary?.translateX).toBe(
      renderedFrame.primary?.translateX,
    );
    expect(interruption.originFrame.primary?.opacity).toBe(renderedFrame.primary?.opacity);
    expect(interruption.originFrame.secondary?.translateX).toBe(
      renderedFrame.secondary?.translateX,
    );
    expect(interruption.originFrame.secondary?.opacity).toBe(renderedFrame.secondary?.opacity);
  });

  it('recomputes custom bounds from the latest measured geometry', () => {
    const current = value(true, true);
    const target: ThreePaneScaffoldValue = {
      ...current,
      tertiary: PaneAdaptedValue.Expanded,
    };
    const specs: PaneTransitionSpecs = {
      primary: { bounds: { durationMs: 600, easing: (progress) => progress } },
    };
    const narrow = {
      ...layout(current, target),
      width: 900,
    };
    const wide = {
      ...layout(current, target),
      width: 1200,
    };

    const narrowFrame = calculateThreePaneScaffoldTransitionFrameWithSpecs(
      narrow,
      0.5,
      specs,
    );
    const wideFrame = calculateThreePaneScaffoldTransitionFrameWithSpecs(wide, 0.5, specs);

    expect(wideFrame.primary?.placement.width).not.toBe(narrowFrame.primary?.placement.width);
    expect(Number.isFinite(wideFrame.primary?.placement.width ?? Number.NaN)).toBe(true);
  });
});
