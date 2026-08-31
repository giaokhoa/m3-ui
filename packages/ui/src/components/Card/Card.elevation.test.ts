import { describe, expect, it } from 'vitest';
import {
  cardElevationTokens,
  getCardElevationLevel,
  getCardElevationMotion,
} from './Card.elevation';

describe('Card elevation runtime', () => {
  it('resolves elevation from enabled state and latest interaction like CardElevation', () => {
    expect(getCardElevationLevel('filled', false, null)).toBe('level0');
    expect(getCardElevationLevel('filled', false, 'hover')).toBe('level1');
    expect(getCardElevationLevel('filled', false, 'press')).toBe('level0');
    expect(getCardElevationLevel('filled', true, 'hover')).toBe('level0');

    expect(getCardElevationLevel('elevated', false, null)).toBe('level1');
    expect(getCardElevationLevel('elevated', false, 'hover')).toBe('level2');
    expect(getCardElevationLevel('elevated', false, 'focus')).toBe('level1');
    expect(getCardElevationLevel('elevated', true, 'hover')).toBe('level1');

    expect(getCardElevationLevel('outlined', false, 'hover')).toBe('level1');
    expect(getCardElevationLevel('outlined', false, 'press')).toBe('level0');
    expect(cardElevationTokens.outlined.dragged).toBe('level3');
  });

  it('maps pinned incoming/outgoing elevation tween selection', () => {
    expect(getCardElevationMotion(false, 'hover', null)).toEqual({
      durationMs: 120,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    });
    expect(getCardElevationMotion(false, null, 'hover')).toEqual({
      durationMs: 120,
      easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
    });
    expect(getCardElevationMotion(false, null, 'press')).toEqual({
      durationMs: 150,
      easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
    });
    expect(getCardElevationMotion(true, 'hover', null).durationMs).toBe(0);
  });
});
