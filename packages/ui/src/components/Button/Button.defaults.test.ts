import { filledButtonTokens } from '@m3/tokens/button';
import { describe, expect, it } from 'vitest';
import {
  filledButtonBaseStyle,
  getFilledButtonStyle,
  resolveFilledButtonElevation,
} from './Button.defaults';

const idleState = {
  isDisabled: false,
  isPressed: false,
  isFocused: false,
  isHovered: false,
} as const;

describe('Filled Button parity', () => {
  it('matches the current AndroidX baseline tokens', () => {
    expect(filledButtonTokens).toEqual({
      minWidth: 58,
      minHeight: 40,
      contentPadding: { block: 8, inline: 24 },
      containerShape: 'full',
      containerColor: 'primary',
      contentColor: 'onPrimary',
      disabledContainerColor: 'onSurface',
      disabledContainerOpacity: 0.1,
      disabledContentColor: 'onSurfaceVariant',
      disabledContentOpacity: 0.38,
      defaultElevation: 'level0',
      hoveredElevation: 'level1',
      focusedElevation: 'level0',
      pressedElevation: 'level0',
      disabledElevation: 'level0',
      iconSize: 18,
      iconSpacing: 8,
      labelTypography: {
        fontFamily: 'plain',
        fontSize: 14,
        lineHeight: 20,
        fontWeight: 500,
        letterSpacing: 0.1,
      },
    });
  });

  it('maps Material color and typeface roles to ThemeProvider CSS variables', () => {
    expect(filledButtonBaseStyle).toMatchObject({
      '--_button-container-color': 'var(--primary)',
      '--_button-content-color': 'var(--on-primary)',
      '--_button-disabled-container-color': 'var(--on-surface)',
      '--_button-disabled-container-opacity': '10%',
      '--_button-disabled-content-color': 'var(--on-surface-variant)',
      '--_button-disabled-content-opacity': '38%',
      '--_button-font-family': 'var(--font-family-plain)',
    });
    expect(JSON.stringify(filledButtonBaseStyle)).not.toMatch(/#[0-9a-f]{3,8}/i);
  });

  it('matches the filled button elevation states', () => {
    expect(resolveFilledButtonElevation(idleState)).toBe('level0');
    expect(
      resolveFilledButtonElevation({ ...idleState, isHovered: true }),
    ).toBe('level1');
    expect(
      resolveFilledButtonElevation({ ...idleState, isFocused: true }),
    ).toBe('level0');
    expect(
      resolveFilledButtonElevation({
        ...idleState,
        isHovered: true,
        isPressed: true,
      }),
    ).toBe('level0');
    expect(
      resolveFilledButtonElevation({
        ...idleState,
        isDisabled: true,
        isHovered: true,
      }),
    ).toBe('level0');
  });

  it('uses the theme shadow role for hover elevation', () => {
    const style = getFilledButtonStyle({ ...idleState, isHovered: true });

    expect(style.boxShadow).toContain('var(--shadow)');
    expect(style.boxShadow).toContain('0px 2px 1px -1px');
  });
});
