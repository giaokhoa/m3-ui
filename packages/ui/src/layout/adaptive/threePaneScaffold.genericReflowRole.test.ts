import { describe, expect, it } from 'vitest';
import type { PaneScaffoldRole } from './paneScaffoldRole';
import {
  PaneAdaptStrategy,
  PaneAdaptedValue,
  calculateThreePaneScaffoldValue,
} from './threePaneScaffold';

describe('generic PaneScaffoldRole reflow contract', () => {
  it('preserves custom roles in Reflow strategy and adapted values', () => {
    const customRole: PaneScaffoldRole = { name: 'custom' };
    const strategy = PaneAdaptStrategy.Reflow(customRole);
    const adapted = PaneAdaptedValue.Reflowed(customRole);

    expect(strategy.reflowUnder).toBe(customRole);
    expect(adapted.type).toBe('reflowed');
    if (adapted.type === 'reflowed') {
      expect(adapted.reflowUnder).toBe(customRole);
    }
  });

  it('only treats a reflow target as an anchor when it is a ThreePaneScaffoldRole', () => {
    const customRole: PaneScaffoldRole = { name: 'custom' };
    const result = calculateThreePaneScaffoldValue({
      maxHorizontalPartitions: 1,
      maxVerticalPartitions: 2,
      adaptStrategies: {
        primary: PaneAdaptStrategy.Hide,
        secondary: PaneAdaptStrategy.Reflow(customRole),
        tertiary: PaneAdaptStrategy.Hide,
      },
    });

    expect(result.primary).toBe(PaneAdaptedValue.Expanded);
    expect(result.secondary).toBe(PaneAdaptedValue.Hidden);
    expect(result.tertiary).toBe(PaneAdaptedValue.Hidden);
  });
});
