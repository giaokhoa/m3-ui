import { describe, expect, it } from 'vitest';
import {
  resolveElevationInteraction,
  resolveElevationLevel,
  resolveElevationTransition,
  type ElevationLevels,
} from './interaction';
import { getElevationBoxShadow } from './shadow';
import { elevationLevels, elevationMotionTokens } from './tokens';

const levels: ElevationLevels = {
  default: 'level1',
  hovered: 'level2',
  focused: 'level3',
  pressed: 'level4',
  disabled: 'level0',
};

describe('elevation', () => {
  it('matches Compose elevation levels', () => {
    expect(elevationLevels).toEqual({
      level0: 0,
      level1: 1,
      level2: 3,
      level3: 6,
      level4: 8,
      level5: 12,
    });
  });

  it('uses the theme shadow role instead of a hardcoded color', () => {
    const shadow = getElevationBoxShadow('level1');

    expect(shadow).toContain('var(--shadow)');
    expect(shadow).not.toMatch(/#[0-9a-f]{3,8}/i);
    expect(shadow.match(/color-mix\(/g)).toHaveLength(3);
  });

  it('uses the locked RAC simultaneous-state precedence', () => {
    expect(resolveElevationInteraction({ isFocused: true })).toBe('focused');
    expect(resolveElevationInteraction({ isFocused: true, isHovered: true })).toBe('hovered');
    expect(resolveElevationInteraction({ isFocused: true, isHovered: true, isPressed: true })).toBe('pressed');
    expect(resolveElevationInteraction({ isDisabled: true, isPressed: true })).toBeNull();

    expect(resolveElevationLevel(levels, { isFocused: true })).toBe('level3');
    expect(resolveElevationLevel(levels, { isFocused: true, isHovered: true })).toBe('level2');
    expect(resolveElevationLevel(levels, { isHovered: true, isPressed: true })).toBe('level4');
    expect(resolveElevationLevel(levels, { isDisabled: true, isPressed: true })).toBe('level0');
  });

  it('keeps incoming/outgoing motion selection inside the shared effect boundary', () => {
    expect(elevationMotionTokens).toEqual({
      incoming: { durationMs: 120, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
      outgoing: { durationMs: 150, easing: 'cubic-bezier(0.4, 0, 0.6, 1)' },
      hoveredOutgoing: { durationMs: 120, easing: 'cubic-bezier(0.4, 0, 0.6, 1)' },
    });
    expect(resolveElevationTransition({}, 'hovered', null)).toBe(
      'box-shadow 120ms cubic-bezier(0.4, 0, 0.2, 1)',
    );
    expect(resolveElevationTransition({}, null, 'hovered')).toBe(
      'box-shadow 120ms cubic-bezier(0.4, 0, 0.6, 1)',
    );
    expect(resolveElevationTransition({}, null, 'pressed')).toBe(
      'box-shadow 150ms cubic-bezier(0.4, 0, 0.6, 1)',
    );
    expect(resolveElevationTransition({ isDisabled: true }, 'pressed', 'hovered')).toBe('none');
  });
});
