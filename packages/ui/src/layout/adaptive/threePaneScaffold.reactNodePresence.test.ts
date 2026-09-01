import { describe, expect, it } from 'vitest';
import {
  PaneAdaptStrategy,
  PaneAdaptedValue,
  PaneAlignment,
} from './threePaneScaffold';

describe('ThreePaneScaffold ReactNode presence parity', () => {
  it('treats direct empty ReactNode scrims as no scrim', () => {
    const strategy = PaneAdaptStrategy.Levitate({ scrim: false });
    const value = PaneAdaptedValue.Levitated(PaneAlignment.Center, false);

    expect('scrim' in strategy).toBe(false);
    expect('scrim' in value).toBe(false);
  });

  it('retains a supplied scrim render function even when it may render nothing', () => {
    const scrim = () => null;
    const strategy = PaneAdaptStrategy.Levitate({ scrim });

    // AndroidX distinguishes a non-null composable scrim lambda by identity.
    // Whether that lambda emits content later does not change the adapted value.
    expect(strategy.scrim).toBeDefined();
  });
});
