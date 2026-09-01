import { describe, expect, it } from 'vitest';
import { getChipRootStyle, getChipStyle } from './Chip.defaults';
import { chipElevationLevels } from './Chip.elevation';
import {
  assistChipTokens,
  elevatedAssistChipTokens,
  elevatedFilterChipTokens,
  filterChipTokens,
  inputChipTokens,
} from './Chip.tokens';

describe('Material 3 chip defaults', () => {
  it('keeps visual geometry separate from the minimum interactive target', () => {
    expect(assistChipTokens.height).toBe(32);
    expect(assistChipTokens.minimumInteractiveSize).toBe(48);
    expect(assistChipTokens.containerRadius).toBe(8);
    expect(assistChipTokens.iconSize).toBe(18);
    expect(inputChipTokens.avatarSize).toBe(24);
    expect(inputChipTokens.disabledAvatarOpacity).toBe(0.38);
    expect(getChipRootStyle('assist')['--_chip-hit-size']).toBe('48px');
  });

  it('keeps action-chip semantic elevations available to shared Elevation', () => {
    expect(assistChipTokens.hoveredElevation).toBe('level0');
    expect(elevatedAssistChipTokens.defaultElevation).toBe('level1');
    expect(chipElevationLevels.elevatedAssist.hovered).toBe('level2');
  });

  it('keeps selectable semantic elevations available to shared Elevation', () => {
    expect(filterChipTokens.hoveredElevation).toBe('level1');
    expect(elevatedFilterChipTokens.defaultElevation).toBe('level1');
    expect(chipElevationLevels.filter.hovered).toBe('level1');
  });

  it('uses InputChip avatar/icon padding and avatar opacity exactly like InputChipDefaults', () => {
    const plain = getChipStyle('input', { isDisabled: false, isSelected: false });
    expect(plain['--_chip-padding-inline-start']).toBe('4px');
    expect(plain['--_chip-padding-inline-end']).toBe('4px');
    expect(plain['--_chip-avatar-opacity']).toBe(1);

    const leading = getChipStyle(
      'input',
      { isDisabled: false, isSelected: false },
      { hasLeadingIcon: true },
    );
    expect(leading['--_chip-padding-inline-start']).toBe('8px');
    expect(leading['--_chip-padding-inline-end']).toBe('4px');

    const avatarAndTrailing = getChipStyle(
      'input',
      { isDisabled: false, isSelected: false },
      { hasAvatar: true, hasTrailingIcon: true },
    );
    expect(avatarAndTrailing['--_chip-padding-inline-start']).toBe('4px');
    expect(avatarAndTrailing['--_chip-padding-inline-end']).toBe('8px');

    const disabledAvatar = getChipStyle(
      'input',
      { isDisabled: true, isSelected: true },
      { hasAvatar: true },
    );
    expect(disabledAvatar['--_chip-avatar-opacity']).toBe(0.38);
  });

  it('ports expressive shapes and compact spacing without projecting static colors', () => {
    const unselected = getChipStyle(
      'filter',
      { isDisabled: false, isSelected: false },
      { shapes: {}, hasLeadingIcon: true, hasTrailingIcon: true },
    );
    expect(unselected['--_chip-container-radius']).toBe('12px');
    expect(unselected['--_chip-leading-gap']).toBe('4px');
    expect(unselected['--_chip-trailing-gap']).toBe('4px');
    expect(unselected['--_chip-shape-transition']).toContain('137ms');
    expect(unselected['--_chip-container-color']).toBeUndefined();
    expect(unselected['--_chip-label-color']).toBeUndefined();

    const selected = getChipStyle(
      'filter',
      { isDisabled: false, isSelected: true },
      { shapes: {} },
    );
    expect(selected['--_chip-container-radius']).toBe('9999px');

    const pressed = getChipStyle(
      'filter',
      { isDisabled: false, isSelected: true, isPressed: true },
      { shapes: {} },
    );
    expect(pressed['--_chip-container-radius']).toBe('8px');
  });
});
