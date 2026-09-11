import { describe, expect, it } from 'vitest';
import { PaneAlignment } from '../../adaptive/threePaneScaffold';
import { calculateLevitatedPaneResizePlacement } from './LevitatedPane.resizeLayout';

const ComposeIntMax = 2147483647;

describe('levitated alignment fastRoundToInt parity', () => {
  it('saturates a Float-rounded end coordinate to Int.MAX_VALUE', () => {
    const placement = calculateLevitatedPaneResizePlacement({
      rawWidth: -2147482624,
      rawHeight: 100,
      scaffoldWidth: 1023,
      scaffoldHeight: 800,
      alignment: PaneAlignment.CenterEnd,
    });

    // Int subtraction is exactly Int.MAX_VALUE. Converting that remaining
    // space to Float produces 2147483648f, and BiasAlignment.End reconstructs
    // that Float coordinate. Compose fastRoundToInt saturates it back to Int.MAX_VALUE.
    expect(placement.left).toBe(ComposeIntMax);
  });
});
