import { describe, expect, it } from 'vitest';
import { resolveElevationLevel } from '../../internal/elevation';
import { cardElevationTokens } from './Card.elevation';

describe('Card elevation semantics', () => {
  it('keeps the pinned semantic level sets available to shared Elevation', () => {
    expect(cardElevationTokens.filled.default).toBe('level0');
    expect(cardElevationTokens.filled.hovered).toBe('level1');
    expect(cardElevationTokens.filled.pressed).toBe('level0');
    expect(cardElevationTokens.filled.disabled).toBe('level0');

    expect(cardElevationTokens.elevated.default).toBe('level1');
    expect(cardElevationTokens.elevated.hovered).toBe('level2');
    expect(cardElevationTokens.elevated.focused).toBe('level1');
    expect(cardElevationTokens.elevated.disabled).toBe('level1');

    expect(cardElevationTokens.outlined.hovered).toBe('level1');
    expect(cardElevationTokens.outlined.pressed).toBe('level0');
    expect(cardElevationTokens.outlined.dragged).toBe('level3');
  });

  it('uses the shared current-state precedence instead of interaction history', () => {
    expect(
      resolveElevationLevel(cardElevationTokens.filled, {
        isFocused: true,
        isHovered: true,
      }),
    ).toBe('level1');

    expect(
      resolveElevationLevel(cardElevationTokens.elevated, {
        isPressed: true,
        isHovered: true,
        isFocused: true,
      }),
    ).toBe('level1');

    expect(
      resolveElevationLevel(cardElevationTokens.elevated, {
        isDisabled: true,
        isPressed: true,
        isHovered: true,
      }),
    ).toBe('level1');
  });
});
