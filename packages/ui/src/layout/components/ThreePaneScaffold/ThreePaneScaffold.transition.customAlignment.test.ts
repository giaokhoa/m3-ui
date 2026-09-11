import { describe, expect, it } from 'vitest';
import type { PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import {
  PaneAdaptedValue,
  ThreePaneScaffoldRole,
  listDetailPaneScaffoldOrder,
  type LevitatedPaneCustomAlignment,
  type ThreePaneScaffoldHorizontalOrder,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';
import {
  calculateThreePaneScaffoldTransitionFrame,
  calculateThreePaneScaffoldTransitionTiming,
} from './ThreePaneScaffold.transition';

const directive: PaneScaffoldDirective = {
  maxHorizontalPartitions: 1,
  horizontalPartitionSpacerSize: '0px',
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

describe('ThreePaneScaffold custom levitated alignment transition', () => {
  it('uses the custom alignment at animated target geometry', () => {
    const alignment: LevitatedPaneCustomAlignment = {
      align(paneSize, scaffoldSize, direction) {
        return {
          x: direction === 'rtl' ? 73 : 31,
          y: scaffoldSize.height - paneSize.height - 19,
        };
      },
    };
    const currentValue: ThreePaneScaffoldValue = {
      primary: PaneAdaptedValue.Expanded,
      secondary: PaneAdaptedValue.Hidden,
      tertiary: PaneAdaptedValue.Hidden,
    };
    const targetValue: ThreePaneScaffoldValue = {
      primary: PaneAdaptedValue.Levitated(alignment),
      secondary: PaneAdaptedValue.Hidden,
      tertiary: PaneAdaptedValue.Hidden,
    };

    const result = calculateThreePaneScaffoldTransitionFrame({
      width: 1000,
      height: 800,
      directive,
      currentValue,
      targetValue,
      progressFraction: 1,
      paneOrder,
      direction: 'rtl',
    });

    expect(result.primary?.placement).toEqual({
      left: 73,
      top: 361,
      width: 360,
      height: 420,
    });
  });

  it('wraps EnterWithExpand Int offset subtraction before spring timing and sampling', () => {
    const extremeAlignment: LevitatedPaneCustomAlignment = {
      align() {
        return { x: 2147483287, y: 0 };
      },
    };
    const overflowDirective: PaneScaffoldDirective = {
      ...directive,
      maxHorizontalPartitions: 3,
      horizontalPartitionSpacerSize: '2147483647px',
    };
    const currentValue: ThreePaneScaffoldValue = {
      primary: PaneAdaptedValue.Hidden,
      secondary: PaneAdaptedValue.Levitated(extremeAlignment),
      tertiary: PaneAdaptedValue.Expanded,
    };
    const targetValue: ThreePaneScaffoldValue = {
      primary: PaneAdaptedValue.Expanded,
      secondary: PaneAdaptedValue.Expanded,
      tertiary: PaneAdaptedValue.Expanded,
    };
    const layoutOptions = {
      width: 1000,
      height: 800,
      directive: overflowDirective,
      currentValue,
      targetValue,
      paneOrder: listDetailPaneScaffoldOrder,
    };

    // AndroidX Int subtraction: Int.MAX_VALUE - (-2147483315) wraps to -334.
    // The old JS-double path used 4294966962 and stretched this spring to 1455ms.
    expect(calculateThreePaneScaffoldTransitionTiming(layoutOptions).visibilityDurationMs).toBe(405);

    const frame = calculateThreePaneScaffoldTransitionFrame({
      ...layoutOptions,
      progressFraction: 0.5,
    });
    expect(frame.primary?.motion).toBe('enter-with-expand');
    expect(frame.primary?.translateX).toBe(-3);
  });
});
