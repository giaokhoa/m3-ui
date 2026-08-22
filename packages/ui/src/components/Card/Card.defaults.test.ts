import { describe, expect, it } from 'vitest';
import {
  getCardElevationLevel,
  getCardElevationMotion,
  getCardStyle,
} from './Card.defaults';
import { cardTokens } from './Card.tokens';

const filled = getCardStyle('filled') as Record<string, string | number>;
const elevated = getCardStyle('elevated') as Record<string, string | number>;
const outlined = getCardStyle('outlined') as Record<string, string | number>;

describe('Card defaults', () => {
  it('matches the pinned Compose shape and interaction minimum', () => {
    expect(cardTokens.shapeRadius).toBe(12);
    expect(cardTokens.minimumInteractiveSize).toBe(48);
    expect(cardTokens.disabledContentOpacity).toBe(0.38);
    expect(filled['--_card-container-radius']).toBe('12px');
    expect(filled['--_card-min-interactive-size']).toBe('48px');
  });

  it('maps filled card colors and disabled compositing through theme roles', () => {
    expect(filled['--_card-container-color']).toBe('var(--surface-container-highest)');
    expect(filled['--_card-content-color']).toBe('var(--on-surface)');
    expect(filled['--_card-disabled-container-color']).toBe(
      'color-mix(in srgb, var(--surface-variant) 38%, var(--surface-container-highest))',
    );
    expect(filled['--_card-disabled-content-color']).toBe(
      'color-mix(in srgb, var(--on-surface) 38%, transparent)',
    );
  });

  it('maps elevated card colors without introducing interaction colors', () => {
    expect(elevated['--_card-container-color']).toBe('var(--surface-container-low)');
    expect(elevated['--_card-disabled-container-color']).toBe(
      'color-mix(in srgb, var(--surface) 38%, var(--surface))',
    );
    expect(elevated['--_card-outline-width']).toBe('0px');
  });

  it('matches outlined border defaults including pinned disabled composite target', () => {
    expect(outlined['--_card-container-color']).toBe('var(--surface)');
    expect(outlined['--_card-outline-width']).toBe('1px');
    expect(outlined['--_card-outline-color']).toBe('var(--outline-variant)');
    expect(outlined['--_card-disabled-outline-color']).toBe(
      'color-mix(in srgb, var(--outline) 12%, var(--surface-container-low))',
    );
    expect(outlined['--_card-hover-outline-color']).toBeUndefined();
    expect(outlined['--_card-focus-outline-color']).toBeUndefined();
    expect(outlined['--_card-pressed-outline-color']).toBeUndefined();
  });

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
    expect(cardTokens.outlined.elevation.dragged).toBe('level3');
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
