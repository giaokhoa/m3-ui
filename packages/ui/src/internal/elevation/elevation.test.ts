import { describe, expect, it } from 'vitest';
import { elevationLevels } from './tokens';
import { getElevationBoxShadow } from './shadow';

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
});
