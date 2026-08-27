import { describe, expect, it } from 'vitest';
import {
  getCenteredOccupancy,
  getShortNavigationBarItemStyle,
  getShortNavigationBarStyle,
} from './ShortNavigationBar.defaults';

describe('ShortNavigationBar defaults', () => {
  it('projects the 64px short bar container token', () => {
    expect(getShortNavigationBarStyle()['--_short-navigation-bar-min-height']).toBe('64px');
  });

  it.each([
    [3, 0.6],
    [4, 0.7],
    [5, 0.8],
    [6, 0.9],
    [7, 1],
  ])('uses AndroidX centered occupancy for %i items', (count, occupancy) => {
    expect(getCenteredOccupancy(count)).toBe(occupancy);
  });

  it('uses top icon indicator geometry', () => {
    const style = getShortNavigationBarItemStyle(true, 'top');
    expect(style['--_short-navigation-bar-indicator-width']).toBe('56px');
    expect(style['--_short-navigation-bar-indicator-height']).toBe('32px');
    expect(style['--_short-navigation-bar-icon-size']).toBe('24px');
  });

  it('uses start icon indicator geometry and selected icon color for its label', () => {
    const style = getShortNavigationBarItemStyle(true, 'start');
    expect(style['--_short-navigation-bar-indicator-height']).toBe('40px');
    expect(style['--_short-navigation-bar-indicator-horizontal-padding']).toBe('16px');
    expect(style['--_short-navigation-bar-label-color']).toBe(
      style['--_short-navigation-bar-icon-color'],
    );
  });

  it('applies disabled alpha', () => {
    const style = getShortNavigationBarItemStyle(false, 'top', { isDisabled: true });
    expect(style['--_short-navigation-bar-content-opacity']).toBe(0.38);
  });
});
