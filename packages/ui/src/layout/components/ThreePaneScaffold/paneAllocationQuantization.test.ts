import { describe, expect, it } from 'vitest';
import type { PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import {
  PaneAdaptedValue,
  listDetailPaneScaffoldOrder,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';
import {
  calculateThreePaneScaffoldLayout,
  calculateThreePaneScaffoldLayoutPass,
} from './ThreePaneScaffold.layout';

const directive: PaneScaffoldDirective = {
  maxHorizontalPartitions: 2,
  horizontalPartitionSpacerSize: '24px',
  maxVerticalPartitions: 1,
  verticalPartitionSpacerSize: '0px',
  defaultPanePreferredWidth: '360px',
  defaultPanePreferredHeight: '420px',
  excludedBounds: [],
  shouldAutoFocusCurrentDestination: true,
};

const twoPaneValue: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Expanded,
  secondary: PaneAdaptedValue.Expanded,
  tertiary: PaneAdaptedValue.Hidden,
};

describe('ThreePaneScaffold constrained width quantization', () => {
  it('truncates each scaled pane independently without redistributing the remainder', () => {
    const layout = calculateThreePaneScaffoldLayout({
      width: 601,
      height: 800,
      directive,
      value: twoPaneValue,
      paneOrder: listDetailPaneScaffoldOrder,
    });

    // 601 - 24 = 577 allocatable pixels. Scaling 360/360 preferred widths
    // produces 288.5px each; AndroidX applies toInt() to each result, so both
    // become 288px and one trailing pixel remains unused.
    expect(layout.secondary).toEqual({ left: 0, top: 0, width: 288, height: 800 });
    expect(layout.primary).toEqual({ left: 312, top: 0, width: 288, height: 800 });
    expect(layout.primary!.left + layout.primary!.width).toBe(600);
  });

  it('keeps negative allocatable width for AndroidX position progression', () => {
    const pass = calculateThreePaneScaffoldLayoutPass({
      width: 10,
      height: 800,
      directive,
      value: twoPaneValue,
      paneOrder: listDetailPaneScaffoldOrder,
    });

    // 10 - 24 = -14. AndroidX scales both preferred widths to -7 and records
    // those raw IntRect widths into PaneMotionData before actual measurement.
    expect(pass.raw.secondary).toEqual({ left: 0, top: 0, width: -7, height: 800 });
    expect(pass.raw.primary).toEqual({ left: 17, top: 0, width: -7, height: 800 });

    // PaneMeasurable.measuredWidth clamps only the child Constraints size.
    expect(pass.placed.secondary).toEqual({ left: 0, top: 0, width: 0, height: 800 });
    expect(pass.placed.primary).toEqual({ left: 17, top: 0, width: 0, height: 800 });
    expect(calculateThreePaneScaffoldLayout({
      width: 10,
      height: 800,
      directive,
      value: twoPaneValue,
      paneOrder: listDetailPaneScaffoldOrder,
    })).toEqual(pass.placed);
  });
});
