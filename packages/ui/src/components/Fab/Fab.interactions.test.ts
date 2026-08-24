import { describe, expect, it } from 'vitest';
import {
  endFabInteraction,
  getFabElevationMotion,
  getFabInteractionElevationLevel,
  latestFabInteraction,
  latestFabStateLayerInteraction,
  startFabInteraction,
  type FabInteraction,
} from './Fab.interactions';

describe('FAB interactions', () => {
  it('mirrors Compose active interaction ordering and restoration', () => {
    let active: FabInteraction[] = [];
    active = startFabInteraction(active, 'hover');
    expect(latestFabInteraction(active)).toBe('hover');

    active = startFabInteraction(active, 'focus');
    expect(latestFabInteraction(active)).toBe('focus');

    active = startFabInteraction(active, 'press');
    expect(latestFabInteraction(active)).toBe('press');

    active = endFabInteraction(active, 'press');
    expect(latestFabInteraction(active)).toBe('focus');

    active = endFabInteraction(active, 'focus');
    expect(latestFabInteraction(active)).toBe('hover');

    active = endFabInteraction(active, 'hover');
    expect(latestFabInteraction(active)).toBeNull();
  });

  it('keeps state-layer focus visibility separate from elevation focus state', () => {
    const active: FabInteraction[] = ['hover', 'focus'];
    expect(latestFabStateLayerInteraction(active, true)).toBe('focus');
    expect(latestFabStateLayerInteraction(active, false)).toBe('hover');
  });

  it('maps latest interaction to normal and lowered elevation levels', () => {
    expect(getFabInteractionElevationLevel('default', null)).toBe('level3');
    expect(getFabInteractionElevationLevel('default', 'hover')).toBe('level4');
    expect(getFabInteractionElevationLevel('default', 'focus')).toBe('level3');
    expect(getFabInteractionElevationLevel('default', 'press')).toBe('level3');

    expect(getFabInteractionElevationLevel('lowered', null)).toBe('level1');
    expect(getFabInteractionElevationLevel('lowered', 'hover')).toBe('level2');
    expect(getFabInteractionElevationLevel('lowered', 'focus')).toBe('level1');
    expect(getFabInteractionElevationLevel('lowered', 'press')).toBe('level1');
  });

  it('selects Compose incoming and interaction-specific outgoing elevation tweens', () => {
    expect(getFabElevationMotion(null, null)).toBeNull();
    expect(getFabElevationMotion('hover', null)).toEqual({
      durationMs: 120,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    });
    expect(getFabElevationMotion('press', 'hover')).toEqual({
      durationMs: 120,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    });
    expect(getFabElevationMotion(null, 'hover')).toEqual({
      durationMs: 120,
      easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
    });
    expect(getFabElevationMotion(null, 'press')).toEqual({
      durationMs: 150,
      easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
    });
    expect(getFabElevationMotion(null, 'focus')).toEqual({
      durationMs: 150,
      easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
    });
  });
});
