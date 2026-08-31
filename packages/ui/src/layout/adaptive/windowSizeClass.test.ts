import { describe, expect, it } from 'vitest';
import {
  calculateWindowHeightSizeClass,
  calculateWindowSizeClass,
  calculateWindowWidthSizeClass,
  windowSizeClassBreakpoints,
} from './windowSizeClass';

describe('Material 3 window size classes', () => {
  it('projects the V2 width and height breakpoints from canonical tokens', () => {
    expect(windowSizeClassBreakpoints).toEqual({
      width: {
        medium: 600,
        expanded: 840,
        large: 1200,
        extraLarge: 1600,
      },
      height: {
        medium: 480,
        expanded: 900,
      },
    });
  });

  it.each([
    [0, 'compact'],
    [599.999, 'compact'],
    [600, 'medium'],
    [839.999, 'medium'],
    [840, 'expanded'],
    [1199.999, 'expanded'],
    [1200, 'large'],
    [1599.999, 'large'],
    [1600, 'extra-large'],
    [2400, 'extra-large'],
  ] as const)('classifies width %s as %s', (width, expected) => {
    expect(calculateWindowWidthSizeClass(width)).toBe(expected);
  });

  it.each([
    [0, 'compact'],
    [479.999, 'compact'],
    [480, 'medium'],
    [899.999, 'medium'],
    [900, 'expanded'],
    [1400, 'expanded'],
  ] as const)('classifies height %s as %s', (height, expected) => {
    expect(calculateWindowHeightSizeClass(height)).toBe(expected);
  });

  it('converts the public Float dimensions before truncating to Int breakpoints', () => {
    // AndroidX's Float overload first receives these as Float values, where
    // they round to the exact breakpoint, and only then calls Float.toInt().
    expect(Math.fround(599.99999)).toBe(600);
    expect(calculateWindowWidthSizeClass(599.99999)).toBe('medium');

    expect(Math.fround(839.99999)).toBe(840);
    expect(calculateWindowWidthSizeClass(839.99999)).toBe('expanded');

    expect(Math.fround(479.99999)).toBe(480);
    expect(calculateWindowHeightSizeClass(479.99999)).toBe('medium');

    expect(Math.fround(899.99999)).toBe(900);
    expect(calculateWindowHeightSizeClass(899.99999)).toBe('expanded');
  });

  it('calculates width and height independently', () => {
    expect(calculateWindowSizeClass({ width: 1280, height: 720 })).toEqual({
      width: 'large',
      height: 'medium',
    });
  });

  it('falls back to compact for non-matching dimensions like the AndroidX selector', () => {
    expect(calculateWindowWidthSizeClass(-1)).toBe('compact');
    expect(calculateWindowHeightSizeClass(-1)).toBe('compact');
    expect(calculateWindowWidthSizeClass(Number.NaN)).toBe('compact');
    expect(calculateWindowHeightSizeClass(Number.NaN)).toBe('compact');
  });

  it('classifies positive infinity in the largest bucket', () => {
    expect(calculateWindowWidthSizeClass(Number.POSITIVE_INFINITY)).toBe('extra-large');
    expect(calculateWindowHeightSizeClass(Number.POSITIVE_INFINITY)).toBe('expanded');
  });
});
