import { describe, expect, it } from 'vitest';
import { fabElevationTokens, getFabOverrideStyle } from './Fab.defaults';

describe('FAB runtime defaults', () => {
  it('keeps semantic elevation levels required by shared Elevation', () => {
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

  it('serializes only explicit caller overrides', () => {
    expect(getFabOverrideStyle()).toEqual({});
    expect(getFabOverrideStyle({
      containerColor: 'rebeccapurple',
      contentColor: 'white',
      shape: 18,
    })).toEqual({
      '--_fab-container-color': 'rebeccapurple',
      '--_fab-content-color': 'white',
      '--_fab-state-layer-color': 'white',
      '--_fab-label-color': 'white',
      '--_fab-container-radius': '18px',
    });
  });
});
