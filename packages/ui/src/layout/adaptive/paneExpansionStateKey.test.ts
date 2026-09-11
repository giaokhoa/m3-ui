import { describe, expect, it } from 'vitest';
import { PaneAdaptedValue, type ThreePaneScaffoldValue } from './threePaneScaffold';
import {
  PaneExpansionStateKey,
  getPaneExpansionStateKey,
  paneExpansionStateKeyEquals,
} from './paneExpansionStateKey';

function value(primary: boolean, secondary: boolean, tertiary: boolean): ThreePaneScaffoldValue {
  return {
    primary: primary ? PaneAdaptedValue.Expanded : PaneAdaptedValue.Hidden,
    secondary: secondary ? PaneAdaptedValue.Expanded : PaneAdaptedValue.Hidden,
    tertiary: tertiary ? PaneAdaptedValue.Expanded : PaneAdaptedValue.Hidden,
  };
}

describe('PaneExpansionStateKey', () => {
  it('derives ordered keys for exactly two expanded panes', () => {
    expect(getPaneExpansionStateKey(value(true, true, false))).toEqual({
      type: 'two-pane',
      firstExpandedPane: 'primary',
      secondExpandedPane: 'secondary',
    });
    expect(getPaneExpansionStateKey(value(true, false, true))).toEqual({
      type: 'two-pane',
      firstExpandedPane: 'primary',
      secondExpandedPane: 'tertiary',
    });
    expect(getPaneExpansionStateKey(value(false, true, true))).toEqual({
      type: 'two-pane',
      firstExpandedPane: 'secondary',
      secondExpandedPane: 'tertiary',
    });
  });

  it('uses the default key unless exactly two panes are expanded', () => {
    expect(getPaneExpansionStateKey(value(true, false, false))).toBe(PaneExpansionStateKey.Default);
    expect(getPaneExpansionStateKey(value(true, true, true))).toBe(PaneExpansionStateKey.Default);
    expect(getPaneExpansionStateKey(value(false, false, false))).toBe(PaneExpansionStateKey.Default);
  });

  it('compares separately-created two-pane keys structurally', () => {
    const first = getPaneExpansionStateKey(value(true, true, false));
    const second = getPaneExpansionStateKey(value(true, true, false));
    const other = getPaneExpansionStateKey(value(false, true, true));

    expect(first).not.toBe(second);
    expect(paneExpansionStateKeyEquals(first, second)).toBe(true);
    expect(paneExpansionStateKeyEquals(first, other)).toBe(false);
  });
});
