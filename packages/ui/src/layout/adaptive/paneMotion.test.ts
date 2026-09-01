import { describe, expect, it } from 'vitest';
import {
  PaneAdaptedValue,
  ThreePaneScaffoldRole,
  type ThreePaneScaffoldHorizontalOrder,
  type ThreePaneScaffoldValue,
} from './threePaneScaffold';
import {
  PaneMotion,
  PaneMotionDefaults,
  calculateHiddenPaneCurrentLeft,
  calculateHidingPaneTargetLeft,
  calculatePaneMotionType,
  calculateSlideInFromLeftOffset,
  calculateSlideInFromRightOffset,
  calculateSlideOutToLeftOffset,
  calculateSlideOutToRightOffset,
  calculateThreePaneMotion,
  type PaneMotionData,
  type ThreePaneMotion,
} from './paneMotion';

const order: ThreePaneScaffoldHorizontalOrder = [
  ThreePaneScaffoldRole.Primary,
  ThreePaneScaffoldRole.Secondary,
  ThreePaneScaffoldRole.Tertiary,
];

const N = PaneMotion.NoMotion;
const B = PaneMotion.AnimateBounds;
const EL = PaneMotion.EnterFromLeft;
const ER = PaneMotion.EnterFromRight;
const ELD = PaneMotion.EnterFromLeftDelayed;
const ERD = PaneMotion.EnterFromRightDelayed;
const XL = PaneMotion.ExitToLeft;
const XR = PaneMotion.ExitToRight;
const EE = PaneMotion.EnterWithExpand;
const XS = PaneMotion.ExitWithShrink;

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

const scaffoldValues = [
  value('H', 'H', 'H'),
  value('V', 'H', 'H'),
  value('H', 'V', 'H'),
  value('H', 'H', 'V'),
  value('V', 'V', 'H'),
  value('V', 'H', 'V'),
  value('H', 'V', 'V'),
  value('V', 'V', 'V'),
] as const;

function motion(
  primary: ThreePaneMotion['primary'],
  secondary: ThreePaneMotion['secondary'],
  tertiary: ThreePaneMotion['tertiary'],
): ThreePaneMotion {
  return { primary, secondary, tertiary };
}

// Exact 8 x 8 matrix from AndroidX PaneMotionTest.ExpectedThreePaneMotions.
const expectedMotions: readonly (readonly ThreePaneMotion[])[] = [
  [
    motion(N, N, N),
    motion(ER, N, N),
    motion(N, ER, N),
    motion(N, N, ER),
    motion(ER, ER, N),
    motion(ER, N, ER),
    motion(N, ER, ER),
    motion(ER, ER, ER),
  ],
  [
    motion(XR, N, N),
    motion(B, N, N),
    motion(XL, ER, N),
    motion(XL, N, ER),
    motion(B, ER, N),
    motion(B, N, ER),
    motion(XL, ER, ER),
    motion(B, ER, ER),
  ],
  [
    motion(N, XR, N),
    motion(EL, XR, N),
    motion(N, B, N),
    motion(N, XL, ER),
    motion(EL, B, N),
    motion(EL, XR, ERD),
    motion(N, B, ER),
    motion(EL, B, ER),
  ],
  [
    motion(N, N, XR),
    motion(EL, N, XR),
    motion(N, EL, XR),
    motion(N, N, B),
    motion(EL, EL, XR),
    motion(EL, N, B),
    motion(N, EL, B),
    motion(EL, EL, B),
  ],
  [
    motion(XR, XR, N),
    motion(B, XR, N),
    motion(XL, B, N),
    motion(XL, XL, ER),
    motion(B, B, N),
    motion(B, XR, ERD),
    motion(XL, B, ER),
    motion(B, B, ER),
  ],
  [
    motion(XR, N, XR),
    motion(B, N, XR),
    motion(XL, ERD, XR),
    motion(XL, N, B),
    motion(B, ERD, XR),
    motion(B, N, B),
    motion(XL, ELD, B),
    motion(B, EE, B),
  ],
  [
    motion(N, XR, XR),
    motion(EL, XR, XR),
    motion(N, B, XR),
    motion(N, XL, B),
    motion(EL, B, XR),
    motion(ELD, XL, B),
    motion(N, B, B),
    motion(EL, B, B),
  ],
  [
    motion(XR, XR, XR),
    motion(B, XR, XR),
    motion(XL, B, XR),
    motion(XL, XL, B),
    motion(B, B, XR),
    motion(B, XS, B),
    motion(XL, B, B),
    motion(B, B, B),
  ],
];

describe('calculateThreePaneMotion', () => {
  it('matches the complete AndroidX 8 x 8 visibility matrix', () => {
    scaffoldValues.forEach((fromValue, fromIndex) => {
      scaffoldValues.forEach((toValue, toIndex) => {
        expect(
          calculateThreePaneMotion(fromValue, toValue, order),
          `from=${fromIndex} to=${toIndex}`,
        ).toEqual(expectedMotions[fromIndex]![toIndex]);
      });
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

  it('keeps the pinned AndroidX default spring constants', () => {
    expect(PaneMotionDefaults).toEqual({
      dampingRatio: 0.8,
      stiffness: 380,
      delayedRatio: 0.1,
    });
  });
});

function motionData(motions: readonly [string, string, string]): PaneMotionData[] {
  const geometry = [
    {
      originSize: { width: 1, height: 2 },
      originPosition: { x: 3, y: 4 },
      targetSize: { width: 3, height: 4 },
      targetPosition: { x: 5, y: 6 },
    },
    {
      originSize: { width: 3, height: 4 },
      originPosition: { x: 5, y: 6 },
      targetSize: { width: 5, height: 6 },
      targetPosition: { x: 7, y: 8 },
    },
    {
      originSize: { width: 5, height: 6 },
      originPosition: { x: 7, y: 8 },
      targetSize: { width: 7, height: 8 },
      targetPosition: { x: 9, y: 0 },
    },
  ] as const;

  return geometry.map((item, index) => ({
    ...item,
    motion: motions[index] as PaneMotionData['motion'],
  }));
}

describe('pane motion geometry', () => {
  it('matches AndroidX slide-in-from-left offsets', () => {
    expect(calculateSlideInFromLeftOffset(motionData([ER, ER, ER]))).toBe(0);
    expect(calculateSlideInFromLeftOffset(motionData([EL, EL, ER]))).toBe(-9);
    expect(calculateSlideInFromLeftOffset(motionData([EL, B, B]))).toBe(-7);
    expect(calculateSlideInFromLeftOffset(motionData([EL, EL, XR]))).toBe(-12);
    expect(calculateSlideInFromLeftOffset(motionData([EL, ELD, ER]))).toBe(-9);
  });

  it('matches AndroidX slide-in-from-right offsets', () => {
    expect(calculateSlideInFromRightOffset(motionData([EL, EL, EL]), 1000)).toBe(0);
    expect(calculateSlideInFromRightOffset(motionData([EL, ER, ER]), 1000)).toBe(992);
    expect(calculateSlideInFromRightOffset(motionData([B, B, ER]), 1000)).toBe(988);
    expect(calculateSlideInFromRightOffset(motionData([XL, XL, ER]), 1000)).toBe(991);
    expect(calculateSlideInFromRightOffset(motionData([EL, ERD, ER]), 1000)).toBe(992);
  });

  it('matches AndroidX slide-out-to-left offsets', () => {
    expect(calculateSlideOutToLeftOffset(motionData([ER, ER, ER]))).toBe(0);
    expect(calculateSlideOutToLeftOffset(motionData([XL, XL, XR]))).toBe(-7);
    expect(calculateSlideOutToLeftOffset(motionData([XL, B, B]))).toBe(-5);
    expect(calculateSlideOutToLeftOffset(motionData([XL, XL, ER]))).toBe(-8);
  });

  it('matches AndroidX slide-out-to-right offsets', () => {
    expect(calculateSlideOutToRightOffset(motionData([ER, ER, ER]), 1000)).toBe(0);
    expect(calculateSlideOutToRightOffset(motionData([XL, XR, XR]), 1000)).toBe(996);
    expect(calculateSlideOutToRightOffset(motionData([B, B, XR]), 1000)).toBe(992);
    expect(calculateSlideOutToRightOffset(motionData([EL, XR, XR]), 1000)).toBe(995);
  });

  it('preserves Kotlin Int overflow in pane edge calculations', () => {
    const overflow: PaneMotionData = {
      motion: PaneMotion.ExitToLeft,
      originPosition: { x: 2147483640, y: 0 },
      originSize: { width: 20, height: 1 },
      targetPosition: { x: 2147483640, y: 0 },
      targetSize: { width: 20, height: 1 },
    };

    // currentRight = 2,147,483,640 + 20 wraps to -2,147,483,636 as Int;
    // ExitToLeft then negates that wrapped edge.
    expect(calculateSlideOutToLeftOffset([overflow])).toBe(2147483636);

    const shown: PaneMotionData = { ...overflow, motion: PaneMotion.AnimateBounds };
    expect(calculateHidingPaneTargetLeft([shown, overflow], 1)).toBe(-2147483636);
  });

  it('matches AndroidX hidden and hiding pane anchor edges', () => {
    expect(calculateHiddenPaneCurrentLeft(motionData([XL, ER, EE]), 2)).toBe(4);
    expect(calculateHidingPaneTargetLeft(motionData([EL, XR, XS]), 2)).toBe(8);
  });
});