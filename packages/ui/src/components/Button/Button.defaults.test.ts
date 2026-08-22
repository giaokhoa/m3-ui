import { describe, expect, it } from 'vitest';
import { elevationMotionTokens } from '../../internal/elevation';
import {
  buttonShapesForSize,
  buttonSizeTokens,
  buttonVariantTokens,
  elevatedButtonTokens,
  filledButtonBaseStyle,
  filledButtonTokens,
  filledTonalButtonTokens,
  getButtonSizeStyle,
  getButtonStyle,
  outlinedButtonTokens,
  resolveButtonElevation,
  resolveButtonElevationTransition,
  textButtonTokens,
} from './Button.defaults';

const idleState = { isDisabled: false, interaction: null } as const;

describe('Button parity', () => {
  it('projects baseline geometry and typography from generated DTCG tokens', () => {
    for (const tokens of Object.values(buttonVariantTokens)) {
      expect(tokens.minWidth).toBe('58px');
      expect(tokens.minHeight).toBe('40px');
      expect(tokens.containerShape).toBe('full');
      expect(tokens.iconSize).toBe('18px');
      expect(tokens.iconSpacing).toBe('8px');
      expect(tokens.labelTypography).toEqual({ fontFamily: 'plain', fontSize: '14px', lineHeight: '20px', fontWeight: 500, letterSpacing: '0.1px' });
    }
    expect(filledButtonTokens.contentPadding).toEqual({ block: '8px', inlineStart: '24px', inlineEnd: '24px' });
    expect(textButtonTokens.contentPadding).toEqual({ block: '8px', inlineStart: '12px', inlineEnd: '12px' });
  });

  it('projects current expressive size helpers from generated DTCG tokens', () => {
    expect(buttonSizeTokens.medium).toEqual({
      minHeight: '56px',
      contentPadding: { block: '16px', inlineStart: '24px', inlineEnd: '24px' },
      iconContentPadding: { block: '16px', inlineStart: '24px', inlineEnd: '24px' },
      iconSize: '24px', iconSpacing: '8px',
      typography: { fontFamily: 'plain', fontSize: '16px', lineHeight: '24px', fontWeight: 500, letterSpacing: '0.2px' },
      pressedShape: 'medium',
    });
    expect(getButtonSizeStyle('medium')).toMatchObject({ '--_button-min-height': '56px', '--_button-padding-block': '16px', '--_button-padding-inline-start': '24px', '--_button-icon-size': '24px', '--_button-font-size': '16px', '--_button-line-height': '24px' });
  });

  it('resolves generated shape tokens for expressive pressed shapes', () => {
    expect(buttonShapesForSize('extraSmall')).toEqual({ shape: '9999px', pressedShape: '8px' });
    expect(buttonShapesForSize('medium')).toEqual({ shape: '9999px', pressedShape: '12px' });
    expect(buttonShapesForSize('extraLarge')).toEqual({ shape: '9999px', pressedShape: '16px' });
  });

  it('applies expressive pressed shapes without changing baseline defaults', () => {
    const shapes = buttonShapesForSize('medium');
    const idle = getButtonStyle('filled', idleState, { size: 'medium', shapes });
    const pressed = getButtonStyle('filled', { ...idleState, interaction: 'press' }, { size: 'medium', shapes });
    expect(idle['--_button-container-radius']).toBe('9999px');
    expect(pressed['--_button-container-radius']).toBe('12px');
    expect(pressed.transition).toContain('border-radius 166ms linear(');
    expect(filledButtonBaseStyle['--_button-container-radius']).toBe('9999px');
  });

  it('uses generated runtime CSS-variable colors and elevation roles', () => {
    expect(filledButtonTokens).toMatchObject({ containerColor: 'var(--primary)', contentColor: 'var(--on-primary)', disabledContainerColor: 'var(--on-surface)', disabledContentColor: 'var(--on-surface-variant)', defaultElevation: 'level0', hoveredElevation: 'level1' });
    expect(elevatedButtonTokens).toMatchObject({ containerColor: 'var(--surface-container-low)', contentColor: 'var(--primary)', defaultElevation: 'level1', hoveredElevation: 'level2' });
    expect(filledTonalButtonTokens).toMatchObject({ containerColor: 'var(--secondary-container)', contentColor: 'var(--on-secondary-container)' });
    expect(outlinedButtonTokens).toMatchObject({ containerColor: 'transparent', contentColor: 'var(--on-surface-variant)', outlineColor: 'var(--outline-variant)', outlineWidth: '1px', disabledOutlineOpacity: 0.1 });
    expect(textButtonTokens).toMatchObject({ containerColor: 'transparent', contentColor: 'var(--primary)', disabledContentColor: 'var(--on-surface-variant)' });
  });

  it('passes dynamic colors through without remapping roles in the UI', () => {
    expect(filledButtonBaseStyle).toMatchObject({ '--_button-container-color': 'var(--primary)', '--_button-content-color': 'var(--on-primary)', '--_button-disabled-container-color': 'var(--on-surface)', '--_button-disabled-container-opacity': '10%', '--_button-disabled-content-color': 'var(--on-surface-variant)', '--_button-disabled-content-opacity': '38%', '--_button-font-family': 'var(--font-family-plain)' });
    expect(JSON.stringify(filledButtonBaseStyle)).not.toMatch(/#[0-9a-f]{3,8}/i);
  });

  it('resolves elevation from the latest active interaction', () => {
    expect(resolveButtonElevation(elevatedButtonTokens, idleState)).toBe('level1');
    expect(resolveButtonElevation(elevatedButtonTokens, { ...idleState, interaction: 'hover' })).toBe('level2');
    expect(resolveButtonElevation(elevatedButtonTokens, { ...idleState, interaction: 'focus' })).toBe('level1');
    expect(resolveButtonElevation(elevatedButtonTokens, { ...idleState, isDisabled: true, interaction: 'hover' })).toBe('level0');
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

  it('uses the theme shadow role for elevated hover elevation', () => {
    const style = getButtonStyle('elevated', { ...idleState, interaction: 'hover' });
    expect(style.boxShadow).toContain('var(--shadow)');
  });
});
