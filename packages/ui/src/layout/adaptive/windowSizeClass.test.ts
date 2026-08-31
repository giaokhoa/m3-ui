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
