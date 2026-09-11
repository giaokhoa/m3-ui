import { describe, expect, it } from 'vitest';
import { PaneAdaptedValue, type ThreePaneScaffoldValue } from '../../adaptive/threePaneScaffold';
import { getPaneExpansionStateCacheKey } from './useDefaultPaneExpansionState';

function value(
  primary: ThreePaneScaffoldValue['primary'],
  secondary: ThreePaneScaffoldValue['secondary'],
  tertiary: ThreePaneScaffoldValue['tertiary'],
): ThreePaneScaffoldValue {
  return { primary, secondary, tertiary };
}

describe('getPaneExpansionStateCacheKey', () => {
  it('keys each two-expanded-pane combination independently in role-priority order', () => {
    expect(
      getPaneExpansionStateCacheKey(
        value(PaneAdaptedValue.Expanded, PaneAdaptedValue.Expanded, PaneAdaptedValue.Hidden),
      ),
    ).toBe('primary:secondary');
    expect(
      getPaneExpansionStateCacheKey(
        value(PaneAdaptedValue.Expanded, PaneAdaptedValue.Hidden, PaneAdaptedValue.Expanded),
      ),
    ).toBe('primary:tertiary');
    expect(
      getPaneExpansionStateCacheKey(
        value(PaneAdaptedValue.Hidden, PaneAdaptedValue.Expanded, PaneAdaptedValue.Expanded),
      ),
    ).toBe('secondary:tertiary');
  });

  it('uses the default key when the scaffold does not have exactly two expanded panes', () => {
    expect(
      getPaneExpansionStateCacheKey(
        value(PaneAdaptedValue.Expanded, PaneAdaptedValue.Hidden, PaneAdaptedValue.Hidden),
      ),
    ).toBe('default');
    expect(
      getPaneExpansionStateCacheKey(
        value(PaneAdaptedValue.Expanded, PaneAdaptedValue.Expanded, PaneAdaptedValue.Expanded),
      ),
    ).toBe('default');
  });
});
