import { describe, expect, it } from 'vitest';
import { elevationMotionTokens } from '../../internal/elevation';
import {
  buttonShapesForSize,
  getButtonStyle,
  resolveButtonElevation,
  resolveButtonElevationTransition,
} from './Button.defaults';

const idleState = { isDisabled: false, interaction: null } as const;

describe('Button runtime defaults', () => {
  it('keeps expressive shape resolution in runtime because shapes may be supplied by props', () => {
    expect(buttonShapesForSize('extraSmall')).toEqual({ shape: '9999px', pressedShape: '8px' });
    expect(buttonShapesForSize('medium')).toEqual({ shape: '9999px', pressedShape: '12px' });
    expect(buttonShapesForSize('extraLarge')).toEqual({ shape: '9999px', pressedShape: '16px' });
  });

  it('only emits a radius override when runtime shapes are supplied', () => {
    const baseline = getButtonStyle('filled', idleState, { size: 'medium' });
    expect(baseline['--_button-container-radius']).toBeUndefined();
    expect(baseline['--_button-container-color']).toBeUndefined();
    expect(baseline['--_button-min-height']).toBeUndefined();

    const shapes = buttonShapesForSize('medium');
    const idle = getButtonStyle('filled', idleState, { size: 'medium', shapes });
    const pressed = getButtonStyle(
      'filled',
      { ...idleState, interaction: 'press' },
      { size: 'medium', shapes },
    );
    expect(idle['--_button-container-radius']).toBe('9999px');
    expect(pressed['--_button-container-radius']).toBe('12px');
    expect(pressed.transition).toContain('border-radius 166ms linear(');
  });

  it('resolves elevation from canonical variant tokens and runtime interaction state', () => {
    expect(resolveButtonElevation('elevated', idleState)).toBe('level1');
    expect(resolveButtonElevation('elevated', { ...idleState, interaction: 'hover' })).toBe('level2');
    expect(resolveButtonElevation('elevated', { ...idleState, interaction: 'focus' })).toBe('level1');
    expect(resolveButtonElevation('elevated', { ...idleState, isDisabled: true, interaction: 'hover' })).toBe('level0');
    expect(resolveButtonElevation('filled', { ...idleState, interaction: 'hover' })).toBe('level1');
    expect(resolveButtonElevation('outlined', { ...idleState, interaction: 'hover' })).toBe('level0');
  });

  it('keeps the current AndroidX elevation animation specs', () => {
    expect(elevationMotionTokens).toEqual({
      incoming: { durationMs: 120, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
      outgoing: { durationMs: 150, easing: 'cubic-bezier(0.4, 0, 0.6, 1)' },
      hoveredOutgoing: { durationMs: 120, easing: 'cubic-bezier(0.4, 0, 0.6, 1)' },
    });
    expect(resolveButtonElevationTransition({ ...idleState, interaction: 'hover' })).toBe('box-shadow 120ms cubic-bezier(0.4, 0, 0.2, 1)');
    expect(resolveButtonElevationTransition({ ...idleState, previousInteraction: 'hover' })).toBe('box-shadow 120ms cubic-bezier(0.4, 0, 0.6, 1)');
    expect(resolveButtonElevationTransition({ ...idleState, previousInteraction: 'press' })).toBe('box-shadow 150ms cubic-bezier(0.4, 0, 0.6, 1)');
  });

  it('uses the ThemeProvider shadow role for elevated runtime elevation', () => {
    const style = getButtonStyle('elevated', { ...idleState, interaction: 'hover' });
    expect(style.boxShadow).toContain('var(--shadow)');
  });
});
