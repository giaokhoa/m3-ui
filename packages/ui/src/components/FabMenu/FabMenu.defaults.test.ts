import { describe, expect, it } from 'vitest';
import {
  fabMenuRuntime,
  getFabMenuRuntimeStyle,
  getToggleFabOverrideStyle,
} from './FabMenu.defaults';

describe('FloatingActionButtonMenu runtime defaults', () => {
  it('keeps only stagger cadence and semantic elevation as runtime values', () => {
    expect(fabMenuRuntime.staggerStepMs).toBe(50);
    expect(fabMenuRuntime.listItemElevation).toBe('level3');
  });

  it('keeps viewport-dependent max height in the runtime positioning bridge', () => {
    expect(getFabMenuRuntimeStyle(180)).toEqual({
      '--_fab-menu-max-height': '180px',
    });
    expect(getFabMenuRuntimeStyle()).toEqual({
      '--_fab-menu-max-height': 'calc(100dvh - 96px)',
    });
  });

  it('serializes only caller color overrides for toggle states', () => {
    expect(getToggleFabOverrideStyle(false)).toEqual({});
    expect(getToggleFabOverrideStyle(false, {
      containerColor: 'red',
      contentColor: 'white',
    })).toEqual({
      '--_fab-container-color': 'red',
      '--_fab-content-color': 'white',
      '--_fab-state-layer-color': 'white',
    });
    expect(getToggleFabOverrideStyle(true, {
      checkedContainerColor: 'blue',
      checkedContentColor: 'yellow',
    })).toEqual({
      '--_fab-container-color': 'blue',
      '--_fab-content-color': 'yellow',
      '--_fab-state-layer-color': 'yellow',
    });
  });
});
