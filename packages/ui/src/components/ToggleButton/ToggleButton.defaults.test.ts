import { describe, expect, it } from 'vitest';
import {
  getToggleButtonStyle,
  toggleButtonShapesForSize,
  type ToggleButtonState,
} from './ToggleButton.defaults';

const idle = {
  isDisabled: false,
  isSelected: false,
  isPressed: false,
  isHovered: false,
  isFocused: false,
} as const satisfies ToggleButtonState;

describe('ToggleButton parity', () => {
  it('maps all expressive size shape buckets', () => {
    expect(toggleButtonShapesForSize('extraSmall')).toEqual({
      shape: '9999px', pressedShape: '8px', selectedShape: '12px',
    });
    expect(toggleButtonShapesForSize('small')).toEqual({
      shape: '9999px', pressedShape: '8px', selectedShape: '12px',
    });
    expect(toggleButtonShapesForSize('medium')).toEqual({
      shape: '9999px', pressedShape: '12px', selectedShape: '16px',
    });
    expect(toggleButtonShapesForSize('large')).toEqual({
      shape: '9999px', pressedShape: '16px', selectedShape: '28px',
    });
    expect(toggleButtonShapesForSize('extraLarge')).toEqual({
      shape: '9999px', pressedShape: '16px', selectedShape: '28px',
    });
  });

  it('uses selected colors for every public variant', () => {
    expect(getToggleButtonStyle('filled', { ...idle, isSelected: true })).toMatchObject({
      '--_button-container-color': 'var(--primary)',
      '--_button-content-color': 'var(--on-primary)',
    });
    expect(getToggleButtonStyle('elevated', { ...idle, isSelected: true })).toMatchObject({
      '--_button-container-color': 'var(--primary)',
      '--_button-content-color': 'var(--on-primary)',
    });
    expect(getToggleButtonStyle('filledTonal', { ...idle, isSelected: true })).toMatchObject({
      '--_button-container-color': 'var(--secondary)',
      '--_button-content-color': 'var(--on-secondary)',
    });
    expect(getToggleButtonStyle('outlined', { ...idle, isSelected: true })).toMatchObject({
      '--_button-container-color': 'var(--inverse-surface)',
      '--_button-content-color': 'var(--inverse-on-surface)',
      '--_button-outline-width': '0px',
    });
  });

  it('keeps unselected colors and outlined widths aligned with AndroidX', () => {
    expect(getToggleButtonStyle('filled', idle)).toMatchObject({
      '--_button-container-color': 'var(--surface-container)',
      '--_button-content-color': 'var(--on-surface-variant)',
    });
    expect(getToggleButtonStyle('filledTonal', idle)).toMatchObject({
      '--_button-container-color': 'var(--secondary-container)',
      '--_button-content-color': 'var(--on-secondary-container)',
    });
    expect(getToggleButtonStyle('outlined', idle, 'small')['--_button-outline-width']).toBe('1px');
    expect(getToggleButtonStyle('outlined', idle, 'large')['--_button-outline-width']).toBe('2px');
    expect(getToggleButtonStyle('outlined', idle, 'extraLarge')['--_button-outline-width']).toBe('3px');
  });

  it('gives pressed shape priority over selected shape', () => {
    const selected = getToggleButtonStyle('filled', { ...idle, isSelected: true }, 'medium');
    const pressed = getToggleButtonStyle(
      'filled',
      { ...idle, isSelected: true, isPressed: true },
      'medium',
    );
    expect(selected['--_button-container-radius']).toBe('16px');
    expect(pressed['--_button-container-radius']).toBe('12px');
  });

  it('projects disabled state and the x-small AndroidX spacing adaptation', () => {
    const disabled = getToggleButtonStyle('outlined', { ...idle, isDisabled: true }, 'extraSmall');
    expect(disabled).toMatchObject({
      '--_button-disabled-container-color': 'var(--outline-variant)',
      '--_button-disabled-container-opacity': '10%',
      '--_button-disabled-content-opacity': '38%',
      '--_button-icon-spacing': '8px',
      transition: 'none',
    });
  });
});
