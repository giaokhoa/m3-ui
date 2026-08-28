import { describe, expect, it } from 'vitest';
import {
  PaneAdaptedValue,
  ThreePaneScaffoldRole,
  type ThreePaneScaffoldHorizontalOrder,
  type ThreePaneScaffoldValue,
} from './threePaneScaffold';
import {
  PaneMotion,
  calculatePaneMotionType,
  calculateThreePaneMotion,
} from './paneMotion';

const order: ThreePaneScaffoldHorizontalOrder = [
  ThreePaneScaffoldRole.Primary,
  ThreePaneScaffoldRole.Secondary,
  ThreePaneScaffoldRole.Tertiary,
];

function value(
  primary: 'H' | 'V',
  secondary: 'H' | 'V',
  tertiary: 'H' | 'V',
): ThreePaneScaffoldValue {
  return {
    primary: primary === 'V' ? PaneAdaptedValue.Expanded : PaneAdaptedValue.Hidden,
    secondary: secondary === 'V' ? PaneAdaptedValue.Expanded : PaneAdaptedValue.Hidden,
    tertiary: tertiary === 'V' ? PaneAdaptedValue.Expanded : PaneAdaptedValue.Hidden,
  };
}

describe('calculateThreePaneMotion', () => {
  it('enters from the open physical edge when starting hidden', () => {
    expect(calculateThreePaneMotion(value('H', 'H', 'H'), value('V', 'H', 'H'), order)).toEqual({
      primary: PaneMotion.EnterFromRight,
      secondary: PaneMotion.NoMotion,
      tertiary: PaneMotion.NoMotion,
    });
  });

  it('matches AndroidX enter/exit direction for a one-pane swap', () => {
    expect(calculateThreePaneMotion(value('H', 'V', 'H'), value('V', 'H', 'H'), order)).toEqual({
      primary: PaneMotion.EnterFromLeft,
      secondary: PaneMotion.ExitToRight,
      tertiary: PaneMotion.NoMotion,
    });
  });

  it('delays an entering pane when the same edge is occupied by an exiting pane', () => {
    expect(calculateThreePaneMotion(value('H', 'V', 'H'), value('V', 'H', 'V'), order)).toEqual({
      primary: PaneMotion.EnterFromLeft,
      secondary: PaneMotion.ExitToRight,
      tertiary: PaneMotion.EnterFromRightDelayed,
    });
  });

  it('expands an entering middle pane when both physical sides stay shown', () => {
    expect(calculateThreePaneMotion(value('V', 'H', 'V'), value('V', 'V', 'V'), order)).toEqual({
      primary: PaneMotion.AnimateBounds,
      secondary: PaneMotion.EnterWithExpand,
      tertiary: PaneMotion.AnimateBounds,
    });
  });

  it('shrinks an exiting middle pane when both physical sides stay shown', () => {
    expect(calculateThreePaneMotion(value('V', 'V', 'V'), value('V', 'H', 'V'), order)).toEqual({
      primary: PaneMotion.AnimateBounds,
      secondary: PaneMotion.ExitWithShrink,
      tertiary: PaneMotion.AnimateBounds,
    });
  });

  it('uses modal enter/exit for hidden-to-levitated transitions', () => {
    const hidden = value('V', 'H', 'H');
    const levitated: ThreePaneScaffoldValue = {
      ...hidden,
      tertiary: PaneAdaptedValue.Levitated('center'),
    };

    expect(calculateThreePaneMotion(hidden, levitated, order).tertiary).toBe(
      PaneMotion.EnterAsModal,
    );
    expect(calculateThreePaneMotion(levitated, hidden, order).tertiary).toBe(
      PaneMotion.ExitAsModal,
    );
  });

  it('treats expanded-to-levitated as shown and animates bounds', () => {
    expect(
      calculatePaneMotionType(
        PaneAdaptedValue.Expanded,
        PaneAdaptedValue.Levitated('bottom-center'),
      ),
    ).toBe('shown');
  });

  it('uses physical left-to-right order, allowing RTL callers to reverse direction', () => {
    const rtlOrder: ThreePaneScaffoldHorizontalOrder = [
      ThreePaneScaffoldRole.Tertiary,
      ThreePaneScaffoldRole.Secondary,
      ThreePaneScaffoldRole.Primary,
    ];
    const from = value('H', 'V', 'H');
    const to = value('V', 'H', 'H');

    expect(calculateThreePaneMotion(from, to, rtlOrder)).toMatchObject({
      primary: PaneMotion.EnterFromRight,
      secondary: PaneMotion.ExitToLeft,
    });
  });
});
