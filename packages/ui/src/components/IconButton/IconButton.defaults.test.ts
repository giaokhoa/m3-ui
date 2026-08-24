import * as token from '@m3/tokens';
import { describe, expect, it } from 'vitest';
import {
  getIconButtonStyle,
  iconButtonShapesForSize,
  iconButtonSizeTokens,
  iconToggleButtonShapesForSize,
} from './IconButton.defaults';

function style(
  variant: 'standard' | 'filled' | 'filledTonal' | 'outlined',
  state: { isDisabled: boolean; isPressed: boolean; isSelected?: boolean },
  options = {},
) {
  return getIconButtonStyle(variant, state, options) as Record<string, string | number>;
}

describe('IconButton defaults', () => {
  it('maps the current five Material 3 size families', () => {
    expect(Object.fromEntries(
      Object.entries(iconButtonSizeTokens).map(([key, value]) => [key, [value.height, value.iconSize]]),
    )).toEqual({
      extraSmall: [32, 20],
      small: [40, 24],
      medium: [56, 24],
      large: [96, 32],
      extraLarge: [136, 40],
    });
  });

  it('keeps the default small visual container inside a 48px interactive target', () => {
    const value = style('standard', { isDisabled: false, isPressed: false });
    expect(value['--_icon-button-target-size']).toBe('48px');
    expect(value['--_icon-button-container-height']).toBe('40px');
    expect(value['--_icon-button-container-width']).toBe('40px');
    expect(value['--_icon-button-icon-size']).toBe('24px');
    expect(value['--_icon-button-content-color']).toBe('var(--on-surface-variant)');
    expect(value['--_icon-button-container-color']).toBe('transparent');
  });

  it('maps expressive width options from leading/trailing space tokens', () => {
    expect(style('standard', { isDisabled: false, isPressed: false }, { size: 'small', width: 'narrow' })['--_icon-button-container-width']).toBe('32px');
    expect(style('standard', { isDisabled: false, isPressed: false }, { size: 'small', width: 'wide' })['--_icon-button-container-width']).toBe('52px');
    expect(style('standard', { isDisabled: false, isPressed: false }, { size: 'large' })['--_icon-button-container-width']).toBe('96px');
  });

  it('uses canonical round/square, pressed, and selected shape families', () => {
    const action = iconButtonShapesForSize('small', 'round');
    const toggle = iconToggleButtonShapesForSize('small', 'round');
    expect(action.shape).toBe(token.ShapeFull);
    expect(action.pressedShape).toBe(token.ShapeSmall);
    expect(toggle.selectedShape).toBe(token.ShapeMedium);
    expect(iconToggleButtonShapesForSize('small', 'square').shape).toBe(token.ShapeMedium);
    expect(iconToggleButtonShapesForSize('small', 'square').selectedShape).toBe(token.ShapeFull);
  });

  it('keeps baseline shapes static unless the expressive shapes overload is requested', () => {
    const pressedAction = style('standard', { isDisabled: false, isPressed: true });
    const selectedToggle = style('standard', { isDisabled: false, isPressed: false, isSelected: true });
    const selectedSquareToggle = style(
      'standard',
      { isDisabled: false, isPressed: false, isSelected: true },
      { shape: 'square' },
    );

    expect(pressedAction['--_icon-button-container-radius']).toBe(token.ShapeFull);
    expect(selectedToggle['--_icon-button-container-radius']).toBe(token.ShapeFull);
    expect(selectedSquareToggle['--_icon-button-container-radius']).toBe(token.ShapeMedium);
  });

  it('applies expressive selected shape while pressed shape takes interaction precedence', () => {
    const shapes = iconToggleButtonShapesForSize('small', 'round');
    const selected = style(
      'standard',
      { isDisabled: false, isPressed: false, isSelected: true },
      { shapes },
    );
    const pressedSelected = style(
      'standard',
      { isDisabled: false, isPressed: true, isSelected: true },
      { shapes },
    );

    expect(selected['--_icon-button-container-radius']).toBe(token.ShapeMedium);
    expect(pressedSelected['--_icon-button-container-radius']).toBe(token.ShapeSmall);
  });

  it('switches standard toggle content color without inventing a container', () => {
    const unselected = style('standard', { isDisabled: false, isPressed: false, isSelected: false });
    const selected = style('standard', { isDisabled: false, isPressed: false, isSelected: true });
    expect(unselected['--_icon-button-content-color']).toBe('var(--on-surface-variant)');
    expect(selected['--_icon-button-content-color']).toBe('var(--primary)');
    expect(selected['--_icon-button-container-color']).toBe('transparent');
  });

  it('maps filled and tonal action/toggle colors independently', () => {
    expect(style('filled', { isDisabled: false, isPressed: false })['--_icon-button-container-color']).toBe('var(--primary)');
    expect(style('filled', { isDisabled: false, isPressed: false, isSelected: false })['--_icon-button-container-color']).toBe('var(--surface-container)');
    expect(style('filledTonal', { isDisabled: false, isPressed: false, isSelected: true })['--_icon-button-container-color']).toBe('var(--secondary)');
  });

  it('maps outlined selection and disabled colors from canonical roles', () => {
    const unselected = style('outlined', { isDisabled: false, isPressed: false, isSelected: false });
    const selected = style('outlined', { isDisabled: false, isPressed: false, isSelected: true });
    const disabled = style('outlined', { isDisabled: true, isPressed: false, isSelected: false });
    expect(unselected['--_icon-button-outline-color']).toBe('var(--outline-variant)');
    expect(selected['--_icon-button-container-color']).toBe('var(--inverse-surface)');
    expect(selected['--_icon-button-content-color']).toBe('var(--inverse-on-surface)');
    expect(selected['--_icon-button-outline-color']).toBe('transparent');
    expect(disabled['--_icon-button-content-color']).toContain('var(--on-surface) 38%');
  });

  it('uses the canonical FastSpatial CSS spring approximation for shape morphing', () => {
    const value = style('standard', { isDisabled: false, isPressed: true }, { shapes: iconButtonShapesForSize('small') });
    expect(value['--_icon-button-container-radius']).toBe(token.ShapeSmall);
    expect(value['--_icon-button-shape-duration']).toBe(token.MotionSpringFastSpatialDuration);
    expect(value['--_icon-button-shape-easing']).toBe(token.MotionSpringFastSpatialEasing);
  });
});
