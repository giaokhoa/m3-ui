import { describe, expect, it } from 'vitest';
import { elevationMotionTokens } from '../../internal/elevation';
import {
  buttonShapesForSize,
  getButtonStyle,
  resolveButtonElevation,
  resolveButtonElevationTransition,
} from './Button.defaults';

const idleState = { isDisabled: false, interaction: null } as const;
const primitiveElevation = { legacyInlineElevation: false } as const;

describe('Button runtime defaults', () => {
  it('keeps expressive shape resolution in runtime because shapes may be supplied by props', () => {
    expect(buttonShapesForSize('extraSmall')).toEqual({ shape: '9999px', pressedShape: '8px' });
    expect(buttonShapesForSize('medium')).toEqual({ shape: '9999px', pressedShape: '12px' });
    expect(buttonShapesForSize('extraLarge')).toEqual({ shape: '9999px', pressedShape: '16px' });
  });

  it('only emits runtime shape overrides when shapes are supplied', () => {
    const baseline = getButtonStyle('filled', idleState, {
      size: 'medium',
      ...primitiveElevation,
    });
    expect(baseline['--_button-container-radius']).toBeUndefined();
    expect(baseline['--_button-container-color']).toBeUndefined();
    expect(baseline['--_button-min-height']).toBeUndefined();
    expect(baseline.boxShadow).toBeUndefined();

    const shapes = buttonShapesForSize('medium');
    const idle = getButtonStyle('filled', idleState, {
      size: 'medium',
      shapes,
      ...primitiveElevation,
    });
    const pressed = getButtonStyle(
      'filled',
      { ...idleState, interaction: 'press' },
      { size: 'medium', shapes, ...primitiveElevation },
    );
    expect(idle['--_button-container-radius']).toBe('9999px');
    expect(pressed['--_button-container-radius']).toBe('12px');
    expect(pressed.transition).toContain('border-radius 166ms linear(');
    expect(pressed.transition).not.toContain('box-shadow');
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

  it('keeps inline shadow serialization only as transitional compatibility', () => {
    const legacy = getButtonStyle('elevated', {
      ...idleState,
      interaction: 'hover',
    });
    expect(legacy.boxShadow).toContain('var(--shadow)');

    const migrated = getButtonStyle(
      'elevated',
      { ...idleState, interaction: 'hover' },
      primitiveElevation,
    );
    expect(migrated.boxShadow).toBeUndefined();
    expect(migrated.transition).toBe('none');
  });
});
