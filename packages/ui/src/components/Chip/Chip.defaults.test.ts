import { describe, expect, it } from 'vitest';
import {
  getChipElevationMotion,
  getChipRootStyle,
  getChipStyle,
  resolveChipElevation,
} from './Chip.defaults';
import {
  assistChipTokens,
  elevatedAssistChipTokens,
  elevatedFilterChipTokens,
  filterChipTokens,
  inputChipTokens,
  suggestionChipTokens,
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

  it('maps flat and elevated action-chip colors/elevations from runtime defaults', () => {
    expect(assistChipTokens.containerColor).toBe('transparent');
    expect(assistChipTokens.outlineColor).toBe('outlineVariant');
    expect(assistChipTokens.outlineWidth).toBe(1);
    expect(assistChipTokens.hoveredElevation).toBe('level0');
    expect(elevatedAssistChipTokens.containerColor).toBe('surfaceContainerLow');
    expect(elevatedAssistChipTokens.disabledContainerColor).toBe('onSurface');
    expect(elevatedAssistChipTokens.disabledContainerOpacity).toBe(0.12);
    expect(elevatedAssistChipTokens.defaultElevation).toBe('level1');
    expect(elevatedAssistChipTokens.hoveredElevation).toBe('level2');
    expect(suggestionChipTokens.labelColor).toBe('onSurfaceVariant');
    expect(suggestionChipTokens.leadingIconColor).toBe('primary');
  });

  it('maps selectable state colors and borders without generated interaction colors', () => {
    expect(filterChipTokens.unselectedContainerColor).toBe('transparent');
    expect(filterChipTokens.selectedContainerColor).toBe('secondaryContainer');
    expect(filterChipTokens.unselectedOutlineWidth).toBe(1);
    expect(filterChipTokens.selectedOutlineWidth).toBe(0);
    expect(filterChipTokens.hoveredElevation).toBe('level1');
    const selected = getChipStyle('filter', { isDisabled: false, isSelected: true, interaction: null });
    expect(selected['--_chip-container-color']).toBe('var(--secondary-container)');
    expect(selected['--_chip-label-color']).toBe('var(--on-secondary-container)');
    expect(selected['--_chip-outline-width']).toBe('0px');
    const disabledElevated = getChipStyle('elevatedFilter', { isDisabled: true, isSelected: false, interaction: null });
    expect(elevatedFilterChipTokens.disabledUnselectedContainerColor).toBe('onSurface');
    expect(disabledElevated['--_chip-container-color']).toBe('color-mix(in srgb, var(--on-surface) 12%, transparent)');
  });

  it('uses InputChip avatar/icon padding and avatar opacity exactly like InputChipDefaults', () => {
    const plain = getChipStyle('input', { isDisabled: false, isSelected: false, interaction: null });
    expect(plain['--_chip-padding-inline-start']).toBe('4px');
    expect(plain['--_chip-padding-inline-end']).toBe('4px');
    expect(plain['--_chip-avatar-opacity']).toBe(1);
    const leading = getChipStyle('input', { isDisabled: false, isSelected: false, interaction: null }, { hasLeadingIcon: true });
    expect(leading['--_chip-padding-inline-start']).toBe('8px');
    expect(leading['--_chip-padding-inline-end']).toBe('4px');
    const avatarAndTrailing = getChipStyle('input', { isDisabled: false, isSelected: false, interaction: null }, { hasAvatar: true, hasTrailingIcon: true });
    expect(avatarAndTrailing['--_chip-padding-inline-start']).toBe('4px');
    expect(avatarAndTrailing['--_chip-padding-inline-end']).toBe('8px');
    const disabledAvatar = getChipStyle('input', { isDisabled: true, isSelected: true, interaction: null }, { hasAvatar: true });
    expect(disabledAvatar['--_chip-avatar-opacity']).toBe(0.38);
  });

  it('ports expressive shapes, tonal leading color and compact spacing', () => {
    const unselected = getChipStyle('filter', { isDisabled: false, isSelected: false, interaction: null }, { shapes: {}, hasLeadingIcon: true, hasTrailingIcon: true });
    expect(unselected['--_chip-container-radius']).toBe('12px');
    expect(unselected['--_chip-leading-icon-color']).toBe('var(--on-surface-variant)');
    expect(unselected['--_chip-leading-gap']).toBe('4px');
    expect(unselected['--_chip-trailing-gap']).toBe('4px');
    expect(unselected['--_chip-shape-transition']).toContain('137ms');
    const selected = getChipStyle('filter', { isDisabled: false, isSelected: true, interaction: null }, { shapes: {} });
    expect(selected['--_chip-container-radius']).toBe('9999px');
    const pressed = getChipStyle('filter', { isDisabled: false, isSelected: true, interaction: 'press' }, { shapes: {} });
    expect(pressed['--_chip-container-radius']).toBe('8px');
  });

  it('uses Material elevation transition selection', () => {
    expect(resolveChipElevation('elevatedAssist', { isDisabled: false, interaction: 'hover' })).toBe('level2');
    expect(resolveChipElevation('filter', { isDisabled: false, isSelected: false, interaction: 'hover' })).toBe('level1');
    expect(getChipElevationMotion({ isDisabled: false, interaction: null, previousInteraction: 'hover' }).durationMs).toBe(120);
    expect(getChipElevationMotion({ isDisabled: false, interaction: null, previousInteraction: 'press' }).durationMs).toBe(150);
  });
});
