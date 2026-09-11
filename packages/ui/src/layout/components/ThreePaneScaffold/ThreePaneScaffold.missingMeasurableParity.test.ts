import { describe, expect, it } from 'vitest';
import type { PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import {
  PaneAdaptedValue,
  supportingPaneScaffoldOrder,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';
import { calculateThreePaneScaffoldLayout } from './ThreePaneScaffold.layout';
import {
  calculateThreePaneScaffoldTransitionDuration,
  calculateThreePaneScaffoldTransitionFrame,
} from './ThreePaneScaffold.transition';

const directive: PaneScaffoldDirective = {
  maxHorizontalPartitions: 3,
  horizontalPartitionSpacerSize: '0px',
  maxVerticalPartitions: 1,
  verticalPartitionSpacerSize: '0px',
  defaultPanePreferredWidth: '360px',
  defaultPanePreferredHeight: '420px',
  excludedBounds: [],
  shouldAutoFocusCurrentDestination: true,
};

const allExpanded: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Expanded,
  secondary: PaneAdaptedValue.Expanded,
  tertiary: PaneAdaptedValue.Expanded,
};

const allHidden: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Hidden,
  secondary: PaneAdaptedValue.Hidden,
  tertiary: PaneAdaptedValue.Hidden,
};

describe('ThreePaneScaffold missing measurable parity', () => {
  it('does not allocate space to an adapted pane without a measurable', () => {
    const layout = calculateThreePaneScaffoldLayout({
      width: 1080,
      height: 600,
      directive,
      value: allExpanded,
      paneOrder: supportingPaneScaffoldOrder,
      paneAvailability: {
        primary: true,
        secondary: true,
        tertiary: false,
      },
    });

    // AndroidX getPanesMeasurables() only adds roles whose Measurable is
    // non-null. The missing tertiary therefore cannot consume a partition.
    expect(layout.primary).toEqual({ left: 0, top: 0, width: 720, height: 600 });
    expect(layout.secondary).toEqual({ left: 720, top: 0, width: 360, height: 600 });
    expect(layout.tertiary).toBeUndefined();
  });

  it('does not create transition child geometry or duration for a missing pane', () => {
    const target: ThreePaneScaffoldValue = {
      ...allHidden,
      tertiary: PaneAdaptedValue.Expanded,
    };
    const options = {
      width: 1080,
      height: 600,
      directive,
      currentValue: allHidden,
      targetValue: target,
      paneOrder: supportingPaneScaffoldOrder,
      paneAvailability: {
        primary: true,
        secondary: true,
        tertiary: false,
      },
    } as const;

    expect(calculateThreePaneScaffoldTransitionDuration(options)).toBe(0);
    const frame = calculateThreePaneScaffoldTransitionFrame({
      ...options,
      progressFraction: 0.5,
    });
    expect(frame.tertiary).toBeUndefined();
  });
});
