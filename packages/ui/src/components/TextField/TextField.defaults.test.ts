import { filledTextFieldTokens } from '@m3/tokens/text-field';
import { describe, expect, it } from 'vitest';
import { filledTextFieldBaseStyle } from './TextField.defaults';

const style = filledTextFieldBaseStyle as Record<string, string | number>;

describe('filled TextField defaults', () => {
  it('matches the current Compose size, shape and indicator defaults', () => {
    expect(filledTextFieldTokens.minWidth).toBe(280);
    expect(filledTextFieldTokens.minHeight).toBe(56);
    expect(filledTextFieldTokens.containerShape).toEqual({
      topStartRadius: 4,
      topEndRadius: 4,
      bottomEndRadius: 0,
      bottomStartRadius: 0,
    });
    expect(filledTextFieldTokens.indicator).toEqual({
      unfocusedThickness: 1,
      focusedThickness: 2,
    });
  });

  it('matches current internal layout spacing', () => {
    expect(filledTextFieldTokens.contentPadding).toEqual({
      inline: 16,
      blockWithLabel: 8,
      blockWithoutLabel: 16,
      supportingTop: 4,
      affix: 2,
      afterIcon: 4,
    });
    expect(filledTextFieldTokens.iconSize).toBe(24);
    expect(filledTextFieldTokens.iconSlotSize).toBe(48);
    expect(filledTextFieldTokens.lineHeight).toEqual({
      inputMin: 24,
      focusedLabelMin: 16,
      supportingMin: 16,
    });
  });

  it('uses BodyLarge for input and BodySmall for minimized/supporting text', () => {
    expect(filledTextFieldTokens.typography.bodyLarge).toEqual({
      fontFamilyRole: 'plain',
      fontSize: 16,
      lineHeight: 24,
      fontWeight: 400,
      letterSpacing: 0.5,
    });
    expect(filledTextFieldTokens.typography.bodySmall).toEqual({
      fontFamilyRole: 'plain',
      fontSize: 12,
      lineHeight: 16,
      fontWeight: 400,
      letterSpacing: 0.4,
    });
  });

  it('maps Material color roles through short ThemeProvider variables', () => {
    expect(style['--_text-field-container-color']).toBe(
      'var(--surface-container-highest)',
    );
    expect(style['--_text-field-disabled-container-color']).toBe('var(--on-surface)');
    expect(style['--_text-field-disabled-container-opacity']).toBe(0.04);
    expect(style['--_text-field-disabled-opacity']).toBe(0.38);
    expect(style['--_text-field-text-color']).toBe('var(--on-surface)');
    expect(style['--_text-field-focused-indicator-color']).toBe('var(--primary)');
    expect(style['--_text-field-error-indicator-color']).toBe('var(--error)');
    expect(style['--_text-field-focused-label-color']).toBe('var(--primary)');
    expect(style['--_text-field-error-label-color']).toBe('var(--error)');
  });

  it('maps current standard FastEffects and FastSpatial motion', () => {
    expect(style['--_text-field-fast-effects-duration']).toBe('108ms');
    expect(style['--_text-field-fast-spatial-duration']).toBe('137ms');
    expect(String(style['--_text-field-fast-effects-easing'])).toContain('linear(');
    expect(String(style['--_text-field-fast-spatial-easing'])).toContain('linear(');
  });
});
