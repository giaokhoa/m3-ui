import { describe, expect, it } from 'vitest';
import { calculateThreePaneMotion } from '../../adaptive/paneMotion';
import type { PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import {
  PaneAdaptedValue,
  ThreePaneScaffoldRole,
  type ThreePaneScaffoldHorizontalOrder,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';
import { calculateThreePaneScaffoldLayout } from './ThreePaneScaffold.layout';

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

const value: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Expanded,
  secondary: PaneAdaptedValue.Expanded,
  tertiary: PaneAdaptedValue.Hidden,
};

const duplicateOrder = [
  ThreePaneScaffoldRole.Primary,
  ThreePaneScaffoldRole.Primary,
  ThreePaneScaffoldRole.Tertiary,
] as ThreePaneScaffoldHorizontalOrder;

describe('ThreePaneScaffoldHorizontalOrder invariant', () => {
  it('rejects duplicate pane roles in static layout like AndroidX constructor require', () => {
    expect(() =>
      calculateThreePaneScaffoldLayout({
        width: 1000,
        height: 800,
        directive,
        value,
        paneOrder: duplicateOrder,
      }),
    ).toThrow(/panes must be unique/);
  });

  it('rejects duplicate pane roles in motion calculation', () => {
    expect(() => calculateThreePaneMotion(value, value, duplicateOrder)).toThrow(
      /panes must be unique/,
    );
  });
});
