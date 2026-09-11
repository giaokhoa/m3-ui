import { describe, expect, it } from 'vitest';
import type { PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import { PaneAlignment } from '../../adaptive/threePaneScaffold';
import { calculateLevitatedPanePlacement } from './LevitatedPane.layout';

const directive: PaneScaffoldDirective = {
  maxHorizontalPartitions: 2,
  horizontalPartitionSpacerSize: '24px',
  maxVerticalPartitions: 1,
  verticalPartitionSpacerSize: '0px',
  defaultPanePreferredWidth: '360px',
  defaultPanePreferredHeight: '420px',
  excludedBounds: [{ left: 490, top: 0, right: 510, bottom: 800 }],
  shouldAutoFocusCurrentDestination: true,
};

describe('calculateLevitatedPanePlacement', () => {
  it('centers the default preferred size in the whole scaffold', () => {
    expect(
      calculateLevitatedPanePlacement({
        width: 1000,
        height: 800,
        directive,
        alignment: PaneAlignment.Center,
      }),
    ).toEqual({ left: 320, top: 190, width: 360, height: 420 });
  });

  it('places bottom-center sheets using preferred size', () => {
    expect(
      calculateLevitatedPanePlacement({
        width: 1000,
        height: 800,
        directive,
        alignment: PaneAlignment.BottomCenter,
        preferredWidth: 1000,
        preferredHeight: 400,
      }),
    ).toEqual({ left: 0, top: 400, width: 1000, height: 400 });
  });

  it('mirrors logical start and end alignment in RTL', () => {
    expect(
      calculateLevitatedPanePlacement({
        width: 1000,
        height: 800,
        directive,
        alignment: PaneAlignment.TopStart,
        direction: 'rtl',
      }),
    ).toEqual({ left: 640, top: 0, width: 360, height: 420 });

    expect(
      calculateLevitatedPanePlacement({
        width: 1000,
        height: 800,
        directive,
        alignment: PaneAlignment.BottomEnd,
        direction: 'rtl',
      }),
    ).toEqual({ left: 0, top: 380, width: 360, height: 420 });
  });

  it('clamps preferred size to scaffold bounds', () => {
    expect(
      calculateLevitatedPanePlacement({
        width: 320,
        height: 240,
        directive,
        alignment: PaneAlignment.Center,
        preferredWidth: 500,
        preferredHeight: 500,
      }),
    ).toEqual({ left: 0, top: 0, width: 320, height: 240 });
  });

  it('uses Compose Float arithmetic for preset alignments', () => {
    expect(
      calculateLevitatedPanePlacement({
        width: 16777218,
        height: 100,
        directive,
        alignment: PaneAlignment.Center,
        preferredWidth: 1,
        preferredHeight: 1,
      }),
    ).toEqual({ left: 8388608, top: 50, width: 1, height: 1 });

    expect(
      calculateLevitatedPanePlacement({
        width: 16777218,
        height: 100,
        directive,
        alignment: PaneAlignment.TopEnd,
        preferredWidth: 1,
        preferredHeight: 1,
      }),
    ).toEqual({ left: 16777216, top: 0, width: 1, height: 1 });
  });

  it('accepts custom AndroidX-style alignment implementations', () => {
    expect(
      calculateLevitatedPanePlacement({
        width: 1000,
        height: 800,
        directive,
        direction: 'rtl',
        alignment: {
          align(paneSize, scaffoldSize, direction) {
            return {
              x: direction === 'rtl' ? 41 : 17,
              y: scaffoldSize.height - paneSize.height - 11,
            };
          },
        },
      }),
    ).toEqual({ left: 41, top: 369, width: 360, height: 420 });
  });
});