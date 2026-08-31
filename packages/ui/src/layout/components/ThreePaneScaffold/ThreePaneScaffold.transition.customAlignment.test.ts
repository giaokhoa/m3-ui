import { describe, expect, it } from 'vitest';
import type { PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import {
  PaneAdaptedValue,
  ThreePaneScaffoldRole,
  type LevitatedPaneCustomAlignment,
  type ThreePaneScaffoldHorizontalOrder,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';
import { calculateThreePaneScaffoldTransitionFrame } from './ThreePaneScaffold.transition';

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
});
