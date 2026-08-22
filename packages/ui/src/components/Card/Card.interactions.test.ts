import { describe, expect, it } from 'vitest';
import {
  endCardInteraction,
  latestCardInteraction,
  latestCardStateLayerInteraction,
  startCardInteraction,
} from './Card.interactions';

describe('Card interaction ordering', () => {
  it('uses the latest still-active interaction like Compose CardElevation', () => {
    let interactions = startCardInteraction([], 'focus');
    interactions = startCardInteraction(interactions, 'hover');
    expect(latestCardInteraction(interactions)).toBe('hover');

    interactions = startCardInteraction(interactions, 'press');
    expect(latestCardInteraction(interactions)).toBe('press');

    interactions = endCardInteraction(interactions, 'press');
    expect(latestCardInteraction(interactions)).toBe('hover');

    interactions = endCardInteraction(interactions, 'hover');
    expect(latestCardInteraction(interactions)).toBe('focus');
  });

  it('keeps focus state-layer visibility separate from elevation focus', () => {
    const interactions = ['hover', 'focus'] as const;
    expect(latestCardStateLayerInteraction(interactions, true)).toBe('focus');
    expect(latestCardStateLayerInteraction(interactions, false)).toBe('hover');
  });
});
