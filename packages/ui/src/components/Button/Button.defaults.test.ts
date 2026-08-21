import {
  buttonVariantTokens,
  elevatedButtonTokens,
  filledButtonTokens,
  filledTonalButtonTokens,
  outlinedButtonTokens,
  textButtonTokens,
} from '@m3/tokens/button';
import { describe, expect, it } from 'vitest';
import {
  filledButtonBaseStyle,
  getButtonStyle,
  resolveButtonElevation,
} from './Button.defaults';

const idleState = {
  isDisabled: false,
  interaction: null,
} as const;

describe('Button parity', () => {
  it('matches the shared current AndroidX baseline geometry and typography', () => {
    for (const tokens of Object.values(buttonVariantTokens)) {
      expect(tokens.minWidth).toBe(58);
      expect(tokens.minHeight).toBe(40);
      expect(tokens.containerShape).toBe('full');
      expect(tokens.iconSize).toBe(18);
      expect(tokens.iconSpacing).toBe(8);
      expect(tokens.labelTypography).toEqual({
        fontFamily: 'plain',
        fontSize: 14,
        lineHeight: 20,
        fontWeight: 500,
        letterSpacing: 0.1,
      });
    }

    expect(filledButtonTokens.contentPadding).toEqual({
      block: 8,
      inlineStart: 24,
      inlineEnd: 24,
    });
    expect(textButtonTokens.contentPadding).toEqual({
      block: 8,
      inlineStart: 12,
      inlineEnd: 12,
    });
  });

  it('matches current Compose colors and elevations for all five variants', () => {
    expect(filledButtonTokens).toMatchObject({
      containerColor: 'primary',
      contentColor: 'onPrimary',
      disabledContainerColor: 'onSurface',
      disabledContentColor: 'onSurfaceVariant',
      defaultElevation: 'level0',
      hoveredElevation: 'level1',
      focusedElevation: 'level0',
      pressedElevation: 'level0',
      disabledElevation: 'level0',
    });

    expect(elevatedButtonTokens).toMatchObject({
      containerColor: 'surfaceContainerLow',
      contentColor: 'primary',
      disabledContainerColor: 'onSurface',
      disabledContentColor: 'onSurfaceVariant',
      defaultElevation: 'level1',
      hoveredElevation: 'level2',
      focusedElevation: 'level1',
      pressedElevation: 'level1',
      disabledElevation: 'level0',
    });

    expect(filledTonalButtonTokens).toMatchObject({
      containerColor: 'secondaryContainer',
      contentColor: 'onSecondaryContainer',
      defaultElevation: 'level0',
      hoveredElevation: 'level1',
      focusedElevation: 'level0',
      pressedElevation: 'level0',
    });

    expect(outlinedButtonTokens).toMatchObject({
      containerColor: 'transparent',
      contentColor: 'onSurfaceVariant',
      outlineColor: 'outlineVariant',
      outlineWidth: 1,
      disabledOutlineOpacity: 0.1,
    });

    expect(textButtonTokens).toMatchObject({
      containerColor: 'transparent',
      contentColor: 'primary',
      disabledContentColor: 'onSurfaceVariant',
    });
  });

  it('maps Material roles to ThemeProvider CSS variables', () => {
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

  it('resolves elevation from the latest active interaction supplied by the tracker', () => {
    expect(resolveButtonElevation(elevatedButtonTokens, idleState)).toBe('level1');
    expect(
      resolveButtonElevation(elevatedButtonTokens, {
        ...idleState,
        interaction: 'hover',
      }),
    ).toBe('level2');
    expect(
      resolveButtonElevation(elevatedButtonTokens, {
        ...idleState,
        interaction: 'focus',
      }),
    ).toBe('level1');
    expect(
      resolveButtonElevation(elevatedButtonTokens, {
        ...idleState,
        isDisabled: true,
        interaction: 'hover',
      }),
    ).toBe('level0');
  });

  it('uses the theme shadow role for elevated hover elevation', () => {
    const style = getButtonStyle('elevated', {
      ...idleState,
      interaction: 'hover',
    });

    expect(style.boxShadow).toContain('var(--shadow)');
  });
});
