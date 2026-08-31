import { describe, expect, it } from 'vitest';
import type { LevitatedPaneCustomAlignment } from './levitatedPaneAlignment';
import {
  PaneAdaptedValue,
  type ThreePaneScaffoldValue,
} from './threePaneScaffold';
import { threePaneScaffoldValuesEqual } from './threePaneScaffoldState';

interface KeyedAlignment extends LevitatedPaneCustomAlignment {
  key: string;
}

function keyedAlignment(key: string): KeyedAlignment {
  return {
    key,
    align: () => ({ x: 0, y: 0 }),
    equals(other) {
      return (other as Partial<KeyedAlignment>).key === key;
    },
  };
}

function value(alignment: LevitatedPaneCustomAlignment): ThreePaneScaffoldValue {
  return {
    primary: PaneAdaptedValue.Levitated(alignment),
    secondary: PaneAdaptedValue.Hidden,
    tertiary: PaneAdaptedValue.Hidden,
  };
}

describe('ThreePaneScaffoldValue custom alignment equality', () => {
  it('uses custom Alignment value equality like AndroidX', () => {
    expect(
      threePaneScaffoldValuesEqual(value(keyedAlignment('same')), value(keyedAlignment('same'))),
    ).toBe(true);
    expect(
      threePaneScaffoldValuesEqual(value(keyedAlignment('first')), value(keyedAlignment('second'))),
    ).toBe(false);
  });

  it('keeps normal object identity when custom Alignment has no equality override', () => {
    const first: LevitatedPaneCustomAlignment = {
      align: () => ({ x: 0, y: 0 }),
    };
    const second: LevitatedPaneCustomAlignment = {
      align: () => ({ x: 0, y: 0 }),
    };

    expect(threePaneScaffoldValuesEqual(value(first), value(first))).toBe(true);
    expect(threePaneScaffoldValuesEqual(value(first), value(second))).toBe(false);
  });
});
