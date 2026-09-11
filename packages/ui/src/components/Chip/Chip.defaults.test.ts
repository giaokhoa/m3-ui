import { describe, expect, it } from 'vitest';
import { getChipStyle } from './Chip.defaults';
import { chipElevationLevels } from './Chip.elevation';

describe('Material 3 chip defaults', () => {
  it('keeps semantic elevations available to shared Elevation', () => {
    expect(chipElevationLevels.assist.hovered).toBe('level0');
    expect(chipElevationLevels.elevatedAssist.default).toBe('level1');
    expect(chipElevationLevels.elevatedAssist.hovered).toBe('level2');
    expect(chipElevationLevels.filter.hovered).toBe('level1');
    expect(chipElevationLevels.elevatedFilter.default).toBe('level1');
  });

  it('does not project immutable defaults through runtime style bags', () => {
    expect(getChipStyle('assist', { isDisabled: false, isSelected: false })).toEqual({});
    expect(
      getChipStyle(
        'input',
        { isDisabled: true, isSelected: true },
        { hasAvatar: true, hasTrailingIcon: true },
      ),
    ).toEqual({});
    expect(
      getChipStyle(
        'filter',
        { isDisabled: false, isSelected: true, isPressed: true },
        { shapes: {}, hasLeadingIcon: true, hasTrailingIcon: true },
      ),
    ).toEqual({});
  });

  it('serializes only explicit instance shape overrides', () => {
    expect(
      getChipStyle('assist', { isDisabled: false }, { shape: 16 }),
    ).toEqual({ '--_chip-container-radius': '16px' });

    expect(
      getChipStyle(
        'filter',
        { isDisabled: false, isSelected: false },
        { shapes: { shape: '20%' } },
      ),
    ).toEqual({ '--_chip-container-radius': '20%' });

    expect(
      getChipStyle(
        'filter',
        { isDisabled: false, isSelected: true },
        { shapes: { selectedShape: 24 } },
      ),
    ).toEqual({ '--_chip-container-radius': '24px' });

    expect(
      getChipStyle(
        'filter',
        { isDisabled: false, isSelected: true, isPressed: true },
        { shapes: { pressedShape: 6 } },
      ),
    ).toEqual({ '--_chip-container-radius': '6px' });
  });
});
