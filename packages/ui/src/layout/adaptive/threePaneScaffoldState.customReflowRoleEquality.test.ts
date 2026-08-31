import { describe, expect, it } from 'vitest';
import type { PaneScaffoldRole, PaneScaffoldRoleObject } from './paneScaffoldRole';
import {
  PaneAdaptedValue,
  type ThreePaneScaffoldValue,
} from './threePaneScaffold';
import { threePaneScaffoldValuesEqual } from './threePaneScaffoldState';

interface KeyedRole extends PaneScaffoldRoleObject {
  key: string;
}

function keyedRole(key: string): KeyedRole {
  return {
    key,
    equals(other: PaneScaffoldRole) {
      return typeof other !== 'string' && (other as Partial<KeyedRole>).key === key;
    },
  };
}

function value(role: PaneScaffoldRole): ThreePaneScaffoldValue {
  return {
    primary: PaneAdaptedValue.Expanded,
    secondary: PaneAdaptedValue.Reflowed(role),
    tertiary: PaneAdaptedValue.Hidden,
  };
}

describe('ThreePaneScaffoldValue custom reflow role equality', () => {
  it('uses PaneScaffoldRole value equality like AndroidX Reflowed.equals', () => {
    expect(threePaneScaffoldValuesEqual(value(keyedRole('same')), value(keyedRole('same')))).toBe(
      true,
    );
    expect(threePaneScaffoldValuesEqual(value(keyedRole('first')), value(keyedRole('second')))).toBe(
      false,
    );
  });

  it('falls back to object identity without an equality override', () => {
    const first: PaneScaffoldRoleObject = {};
    const second: PaneScaffoldRoleObject = {};

    expect(threePaneScaffoldValuesEqual(value(first), value(first))).toBe(true);
    expect(threePaneScaffoldValuesEqual(value(first), value(second))).toBe(false);
  });
});
