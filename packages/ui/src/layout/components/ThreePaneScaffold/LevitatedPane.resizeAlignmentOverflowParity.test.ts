import { describe, expect, it } from 'vitest';
import { PaneAlignment } from '../../adaptive/threePaneScaffold';
import { calculateLevitatedPaneResizePlacement } from './LevitatedPane.resizeLayout';

const ComposeIntMin = -2147483648;

describe('levitated resize alignment Int overflow parity', () => {
  it('subtracts raw IntSize from scaffold space before Float bias math', () => {
    const placement = calculateLevitatedPaneResizePlacement({
      rawWidth: ComposeIntMin,
      rawHeight: ComposeIntMin,
      scaffoldWidth: 1000,
      scaffoldHeight: 800,
      alignment: PaneAlignment.Center,
    });

    // Compose BiasAlignment performs Int subtraction first:
    // 1000 - Int.MIN_VALUE wraps to -2147482648, which Float32 rounds to
    // -2147482624 before division by 2. The child size is clamped only after
    // Alignment receives this raw IntSize.
    expect(placement).toEqual({
      left: -1073741312,
      top: -1073741440,
      width: 0,
      height: 0,
    });
  });
});
