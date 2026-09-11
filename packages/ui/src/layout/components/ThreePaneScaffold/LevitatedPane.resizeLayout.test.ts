import { describe, expect, it } from 'vitest';
import { PaneAlignment } from '../../adaptive/threePaneScaffold';
import { calculateLevitatedPaneResizePlacement } from './LevitatedPane.resizeLayout';

describe('calculateLevitatedPaneResizePlacement', () => {
  it('uses raw negative size for alignment before clamping measured size', () => {
    expect(
      calculateLevitatedPaneResizePlacement({
        rawWidth: 360,
        rawHeight: -20,
        scaffoldWidth: 1000,
        scaffoldHeight: 800,
        alignment: PaneAlignment.BottomCenter,
      }),
    ).toEqual({ left: 320, top: 820, width: 360, height: 0 });
  });

  it('allows raw oversized resize bounds instead of re-clamping to scaffold size', () => {
    expect(
      calculateLevitatedPaneResizePlacement({
        rawWidth: 1200,
        rawHeight: 900,
        scaffoldWidth: 1000,
        scaffoldHeight: 800,
        alignment: PaneAlignment.Center,
      }),
    ).toEqual({ left: -100, top: -50, width: 1200, height: 900 });
  });

  it('resolves logical end after raw-size alignment in RTL', () => {
    expect(
      calculateLevitatedPaneResizePlacement({
        rawWidth: -20,
        rawHeight: 420,
        scaffoldWidth: 1000,
        scaffoldHeight: 800,
        alignment: PaneAlignment.CenterEnd,
        direction: 'rtl',
      }),
    ).toEqual({ left: 0, top: 190, width: 0, height: 420 });
  });

  it('passes raw resize size to custom alignment before measurement clamp', () => {
    expect(
      calculateLevitatedPaneResizePlacement({
        rawWidth: 360,
        rawHeight: -20,
        scaffoldWidth: 1000,
        scaffoldHeight: 800,
        alignment: {
          align(paneSize, scaffoldSize) {
            return {
              x: scaffoldSize.width - paneSize.width,
              y: scaffoldSize.height - paneSize.height,
            };
          },
        },
      }),
    ).toEqual({ left: 640, top: 820, width: 360, height: 0 });
  });
});
