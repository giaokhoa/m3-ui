import { describe, expect, it } from 'vitest';
import {
  PaneAdaptedValue,
  PaneAlignment,
  type ThreePaneScaffoldValue,
} from './threePaneScaffold';
import { threePaneScaffoldValuesEqual } from './threePaneScaffoldState';

const noScrim: ThreePaneScaffoldValue = {
  primary: {
    type: 'levitated',
    alignment: PaneAlignment.Center,
  },
  secondary: PaneAdaptedValue.Expanded,
  tertiary: PaneAdaptedValue.Hidden,
};

describe('ThreePaneScaffold structural scrim equality', () => {
  it('treats empty structural React nodes as the no-scrim value', () => {
    const falseScrim: ThreePaneScaffoldValue = {
      ...noScrim,
      primary: {
        type: 'levitated',
        alignment: PaneAlignment.Center,
        scrim: false,
      },
    };

    expect(threePaneScaffoldValuesEqual(noScrim, falseScrim)).toBe(true);
  });

  it('keeps real scrim identity significant', () => {
    const firstScrim = () => null;
    const secondScrim = () => null;
    const first: ThreePaneScaffoldValue = {
      ...noScrim,
      primary: PaneAdaptedValue.Levitated(PaneAlignment.Center, firstScrim),
    };
    const same: ThreePaneScaffoldValue = {
      ...noScrim,
      primary: PaneAdaptedValue.Levitated(PaneAlignment.Center, firstScrim),
    };
    const second: ThreePaneScaffoldValue = {
      ...noScrim,
      primary: PaneAdaptedValue.Levitated(PaneAlignment.Center, secondScrim),
    };

    expect(threePaneScaffoldValuesEqual(first, same)).toBe(true);
    expect(threePaneScaffoldValuesEqual(first, second)).toBe(false);
  });
});
