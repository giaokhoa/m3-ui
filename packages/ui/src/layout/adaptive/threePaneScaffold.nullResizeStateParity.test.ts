import { describe, expect, it } from 'vitest';
import {
  PaneAdaptStrategy,
  PaneAdaptedValue,
  PaneAlignment,
  ThreePaneScaffoldRole,
  getPaneAdaptedValue,
  type ThreePaneScaffoldValue,
} from './threePaneScaffold';

describe('nullable levitated resize state parity', () => {
  it('normalizes AndroidX null resize state to the web absent form', () => {
    const strategy = PaneAdaptStrategy.Levitate({ dragToResizeState: null });
    const value = PaneAdaptedValue.Levitated(PaneAlignment.Center, undefined, null);
    const structural = {
      primary: {
        type: 'levitated',
        alignment: PaneAlignment.Center,
        dragToResizeState: null,
      },
      secondary: PaneAdaptedValue.Expanded,
      tertiary: PaneAdaptedValue.Hidden,
    } as unknown as ThreePaneScaffoldValue;

    expect('dragToResizeState' in strategy).toBe(false);
    expect('dragToResizeState' in value).toBe(false);
    expect(getPaneAdaptedValue(structural, ThreePaneScaffoldRole.Primary)).not.toHaveProperty(
      'dragToResizeState',
    );
  });
});