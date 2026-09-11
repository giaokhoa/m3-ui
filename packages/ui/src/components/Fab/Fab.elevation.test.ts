import { describe, expect, it } from 'vitest';
import { fabElevationTokens } from './Fab.defaults';

describe('FAB shared elevation inputs', () => {
  it('exposes canonical normal and lowered semantic levels to shared Elevation', () => {
    expect(fabElevationTokens.default).toEqual({
      default: 'level3',
      focused: 'level3',
      hovered: 'level4',
      pressed: 'level3',
    });
    expect(fabElevationTokens.lowered).toEqual({
      default: 'level1',
      focused: 'level1',
      hovered: 'level2',
      pressed: 'level1',
    });
  });
});
