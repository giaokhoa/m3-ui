import { describe, expect, it } from 'vitest';
import type { PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import {
  PaneAdaptedValue,
  PaneAlignment,
  listDetailPaneScaffoldOrder,
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

const currentValue: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Hidden,
  secondary: PaneAdaptedValue.Expanded,
  tertiary: PaneAdaptedValue.Hidden,
};

function frame(targetValue: ThreePaneScaffoldValue) {
  return calculateThreePaneScaffoldTransitionFrame({
    width: 800,
    height: 600,
    directive,
    currentValue,
    targetValue,
    progressFraction: 0.5,
    paneOrder: listDetailPaneScaffoldOrder,
  });
}

describe('ThreePaneScaffold transition scrim presence', () => {
  it('does not carry an empty structural React node as transition scrim metadata', () => {
    const targetValue: ThreePaneScaffoldValue = {
      primary: {
        type: 'levitated',
        alignment: PaneAlignment.Center,
        scrim: false,
      },
      secondary: PaneAdaptedValue.Expanded,
      tertiary: PaneAdaptedValue.Hidden,
    };

    const result = frame(targetValue);
    expect(result.scrim).toBeUndefined();
    expect(result.scrimOpacity).toBe(0);
  });

  it('keeps concrete scrim content on modal transition frames', () => {
    const targetValue: ThreePaneScaffoldValue = {
      primary: PaneAdaptedValue.Levitated(PaneAlignment.Center, 'scrim'),
      secondary: PaneAdaptedValue.Expanded,
      tertiary: PaneAdaptedValue.Hidden,
    };

    const result = frame(targetValue);
    expect(result.scrim).toBe('scrim');
    expect(result.scrimOpacity).toBeGreaterThan(0);
  });
});
