import { describe, expect, it } from 'vitest';
import { buttonElevationLevels } from './Button.elevation';
import {
  buttonShapesForSize,
  getButtonStyle,
} from './Button.runtime';

const idleState = { isDisabled: false, isPressed: false } as const;

describe('Button runtime integration', () => {
  it('keeps expressive shape resolution in runtime because shapes may be supplied by props', () => {
    expect(buttonShapesForSize('extraSmall')).toEqual({ shape: '9999px', pressedShape: '8px' });
    expect(buttonShapesForSize('medium')).toEqual({ shape: '9999px', pressedShape: '12px' });
    expect(buttonShapesForSize('extraLarge')).toEqual({ shape: '9999px', pressedShape: '16px' });
  });

  it('only emits runtime shape overrides when shapes are supplied', () => {
    const baseline = getButtonStyle(idleState);
    expect(baseline['--_button-container-radius']).toBeUndefined();
    expect(baseline['--_button-container-color']).toBeUndefined();
    expect(baseline['--_button-min-height']).toBeUndefined();
    expect(baseline.boxShadow).toBeUndefined();

    const shapes = buttonShapesForSize('medium');
    const idle = getButtonStyle(idleState, { shapes });
    const pressed = getButtonStyle({ ...idleState, isPressed: true }, { shapes });
    expect(idle['--_button-container-radius']).toBe('9999px');
    expect(pressed['--_button-container-radius']).toBe('12px');
    expect(pressed.transition).toContain('border-radius 166ms linear(');
    expect(pressed.transition).not.toContain('box-shadow');
  });

  it('supplies semantic elevation level sets without resolving RAC interaction state locally', () => {
    expect(buttonElevationLevels.elevated).toEqual({
      default: 'level1',
      hovered: 'level2',
      focused: 'level1',
      pressed: 'level1',
      disabled: 'level0',
    });
    expect(buttonElevationLevels.filled.hovered).toBe('level1');
    expect(buttonElevationLevels.outlined.hovered).toBe('level0');
  });
});
