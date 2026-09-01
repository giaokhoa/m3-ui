import { describe, expect, it } from 'vitest';
import {
  PaneAdaptStrategy,
  PaneAdaptedValue,
  PaneAlignment,
  ThreePaneScaffoldRole,
  hasLevitatedPaneWithScrim,
  isPaneInteractable,
  type ThreePaneScaffoldValue,
} from './threePaneScaffold';

describe('ThreePaneScaffold ReactNode presence parity', () => {
  it('treats direct empty ReactNode scrims as no scrim', () => {
    const strategy = PaneAdaptStrategy.Levitate({ scrim: false });
    const value = PaneAdaptedValue.Levitated(PaneAlignment.Center, false);

    expect('scrim' in strategy).toBe(false);
    expect('scrim' in value).toBe(false);
  });

  it('does not let an empty structural scrim block underlying panes', () => {
    const value: ThreePaneScaffoldValue = {
      primary: {
        type: 'levitated',
        alignment: PaneAlignment.Center,
        scrim: false,
      },
      secondary: PaneAdaptedValue.Expanded,
      tertiary: PaneAdaptedValue.Hidden,
    };

    expect(hasLevitatedPaneWithScrim(value)).toBe(false);
    expect(isPaneInteractable(value, ThreePaneScaffoldRole.Secondary)).toBe(true);
  });

  it('retains a supplied scrim render function even when it may render nothing', () => {
    const scrim = () => null;
    const strategy = PaneAdaptStrategy.Levitate({ scrim });
    const value: ThreePaneScaffoldValue = {
      primary: PaneAdaptedValue.Levitated(PaneAlignment.Center, scrim),
      secondary: PaneAdaptedValue.Expanded,
      tertiary: PaneAdaptedValue.Hidden,
    };

    // AndroidX distinguishes a non-null composable scrim lambda by identity.
    // Whether that lambda emits content later does not change the adapted value.
    expect(strategy.scrim).toBeDefined();
    expect(hasLevitatedPaneWithScrim(value)).toBe(true);
    expect(isPaneInteractable(value, ThreePaneScaffoldRole.Secondary)).toBe(false);
  });
});
