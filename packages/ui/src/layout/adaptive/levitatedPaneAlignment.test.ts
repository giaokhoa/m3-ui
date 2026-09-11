import { describe, expect, it } from 'vitest';
import {
  PaneAdaptStrategy,
  PaneAdaptedValue,
  ThreePaneScaffoldRole,
  calculateThreePaneScaffoldValue,
  type LevitatedPaneCustomAlignment,
} from './threePaneScaffold';

describe('custom levitated alignment', () => {
  it('preserves the custom alignment object through strategy and adapted value', () => {
    const alignment: LevitatedPaneCustomAlignment = {
      align() {
        return { x: 17, y: 23 };
      },
    };
    const strategy = PaneAdaptStrategy.Levitate({ alignment });
    const directValue = PaneAdaptedValue.Levitated(alignment);

    expect(strategy.alignment).toBe(alignment);
    expect(directValue.type).toBe('levitated');
    if (directValue.type === 'levitated') {
      expect(directValue.alignment).toBe(alignment);
    }

    const scaffoldValue = calculateThreePaneScaffoldValue({
      maxHorizontalPartitions: 1,
      adaptStrategies: {
        primary: PaneAdaptStrategy.Hide,
        secondary: PaneAdaptStrategy.Hide,
        tertiary: strategy,
      },
      destinationHistory: [{ pane: ThreePaneScaffoldRole.Tertiary }],
    });

    expect(scaffoldValue.tertiary.type).toBe('levitated');
    if (scaffoldValue.tertiary.type === 'levitated') {
      expect(scaffoldValue.tertiary.alignment).toBe(alignment);
    }
  });
});
