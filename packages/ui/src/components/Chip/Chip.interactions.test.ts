import { describe, expect, it } from 'vitest';
import {
  endChipInteraction,
  latestChipInteraction,
  latestChipStateLayerInteraction,
  startChipInteraction,
} from './Chip.interactions';

describe('chip interaction ordering', () => {
  it('uses the latest still-active interaction for elevation', () => {
    let active = startChipInteraction([], 'hover');
    active = startChipInteraction(active, 'focus');
    active = startChipInteraction(active, 'press');
    expect(latestChipInteraction(active)).toBe('press');

    active = endChipInteraction(active, 'press');
    expect(latestChipInteraction(active)).toBe('focus');

    active = endChipInteraction(active, 'focus');
    expect(latestChipInteraction(active)).toBe('hover');
  });

  it('only exposes visible focus and hover to the state layer', () => {
    const active = startChipInteraction(startChipInteraction([], 'hover'), 'focus');
    expect(latestChipStateLayerInteraction(active, true)).toBe('focus');
    expect(latestChipStateLayerInteraction(active, false)).toBe('hover');
  });
});
