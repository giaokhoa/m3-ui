import {
  buttonSizeTokens,
  buttonVariantTokens,
  elevatedButtonTokens,
  filledButtonTokens,
  filledTonalButtonTokens,
  outlinedButtonTokens,
  textButtonTokens,
} from '@m3/tokens/button';
import { elevationMotionTokens } from '@m3/tokens/elevation';
import { describe, expect, it } from 'vitest';
import {
  buttonShapesForSize,
  filledButtonBaseStyle,
  getButtonSizeStyle,
  getButtonStyle,
  resolveButtonElevation,
  resolveButtonElevationTransition,
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

  it('matches current AndroidX expressive size helpers', () => {
    expect(buttonSizeTokens).toEqual({
      extraSmall: {
        minHeight: 32,
        contentPadding: { block: 6, inlineStart: 12, inlineEnd: 12 },
        iconContentPadding: { block: 6, inlineStart: 12, inlineEnd: 12 },
        iconSize: 20,
        iconSpacing: 4,
        typography: {
          fontFamily: 'plain',
          fontSize: 14,
          lineHeight: 20,
          fontWeight: 500,
          letterSpacing: 0.1,
        },
        pressedShape: 'small',
      },
      small: {
        minHeight: 40,
        contentPadding: { block: 10, inlineStart: 16, inlineEnd: 16 },
        iconContentPadding: { block: 10, inlineStart: 16, inlineEnd: 16 },
        iconSize: 20,
        iconSpacing: 8,
        typography: {
          fontFamily: 'plain',
          fontSize: 14,
          lineHeight: 20,
          fontWeight: 500,
          letterSpacing: 0.1,
        },
        pressedShape: 'small',
      },
      medium: {
        minHeight: 56,
        contentPadding: { block: 16, inlineStart: 24, inlineEnd: 24 },
        iconContentPadding: { block: 16, inlineStart: 24, inlineEnd: 24 },
        iconSize: 24,
        iconSpacing: 8,
        typography: {
          fontFamily: 'plain',
          fontSize: 16,
          lineHeight: 24,
          fontWeight: 500,
          letterSpacing: 0.2,
        },
        pressedShape: 'medium',
      },
      large: {
        minHeight: 96,
        contentPadding: { block: 32, inlineStart: 48, inlineEnd: 48 },
        iconContentPadding: { block: 32, inlineStart: 48, inlineEnd: 48 },
        iconSize: 32,
        iconSpacing: 12,
        typography: {
          fontFamily: 'brand',
          fontSize: 24,
          lineHeight: 32,
          fontWeight: 400,
          letterSpacing: 0,
        },
        pressedShape: 'large',
      },
      extraLarge: {
        minHeight: 136,
        contentPadding: { block: 48, inlineStart: 64, inlineEnd: 64 },
        iconContentPadding: { block: 48, inlineStart: 64, inlineEnd: 64 },
        iconSize: 40,
        iconSpacing: 16,
        typography: {
          fontFamily: 'brand',
          fontSize: 32,
          lineHeight: 40,
          fontWeight: 400,
          letterSpacing: 0,
        },
        pressedShape: 'large',
      },
    });

    expect(getButtonSizeStyle('medium')).toMatchObject({
      '--_button-min-height': '56px',
      '--_button-padding-block': '16px',
      '--_button-padding-inline-start': '24px',
      '--_button-icon-size': '24px',
      '--_button-font-size': '16px',
      '--_button-line-height': '24px',
    });
  });

  it('matches recommended expressive pressed shapes by size', () => {
    expect(buttonShapesForSize('extraSmall')).toEqual({
      shape: '9999px',
      pressedShape: '8px',
    });
    expect(buttonShapesForSize('small')).toEqual({
      shape: '9999px',
      pressedShape: '8px',
    });
    expect(buttonShapesForSize('medium')).toEqual({
      shape: '9999px',
      pressedShape: '12px',
    });
    expect(buttonShapesForSize('large')).toEqual({
      shape: '9999px',
      pressedShape: '16px',
    });
    expect(buttonShapesForSize('extraLarge')).toEqual({
      shape: '9999px',
      pressedShape: '16px',
    });
  });

  it('applies expressive pressed shapes without changing baseline defaults', () => {
    const shapes = buttonShapesForSize('medium');
    const idle = getButtonStyle('filled', idleState, {
      size: 'medium',
      shapes,
    });
    const pressed = getButtonStyle(
      'filled',
      { ...idleState, interaction: 'press' },
      { size: 'medium', shapes },
    );

    expect(idle['--_button-container-radius']).toBe('9999px');
    expect(pressed['--_button-container-radius']).toBe('12px');
    expect(pressed.transition).toContain('border-radius 166ms linear(');
    expect(filledButtonBaseStyle['--_button-container-radius']).toBe('9999px');
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

  it('matches current AndroidX elevation animation specs', () => {
    expect(elevationMotionTokens).toEqual({
      incoming: {
        durationMs: 120,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      outgoing: {
        durationMs: 150,
        easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
      },
      hoveredOutgoing: {
        durationMs: 120,
        easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
      },
    });

    expect(
      resolveButtonElevationTransition({
        ...idleState,
        interaction: 'hover',
      }),
    ).toBe('box-shadow 120ms cubic-bezier(0.4, 0, 0.2, 1)');

    expect(
      resolveButtonElevationTransition({
        ...idleState,
        previousInteraction: 'hover',
      }),
    ).toBe('box-shadow 120ms cubic-bezier(0.4, 0, 0.6, 1)');

    expect(
      resolveButtonElevationTransition({
        ...idleState,
        previousInteraction: 'press',
      }),
    ).toBe('box-shadow 150ms cubic-bezier(0.4, 0, 0.6, 1)');

    expect(
      resolveButtonElevationTransition({
        ...idleState,
        isDisabled: true,
        previousInteraction: 'hover',
      }),
    ).toBe('none');
  });

  it('uses the theme shadow role for elevated hover elevation', () => {
    const style = getButtonStyle('elevated', {
      ...idleState,
      interaction: 'hover',
    });

    expect(style.boxShadow).toContain('var(--shadow)');
  });
});
