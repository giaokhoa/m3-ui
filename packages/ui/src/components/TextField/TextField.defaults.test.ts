import { describe, expect, it } from 'vitest';
import {
  filledTextFieldBaseStyle,
  outlinedTextFieldBaseStyle,
} from './TextField.defaults';
import {
  filledTextFieldTokens,
  outlinedTextFieldTokens,
} from './TextField.tokens';

const filledStyle = filledTextFieldBaseStyle as Record<string, string | number>;
const outlinedStyle = outlinedTextFieldBaseStyle as Record<string, string | number>;

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
    expect(filledTextFieldTokens.indicator).toEqual({ unfocusedThickness: 1, focusedThickness: 2 });
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
    expect(filledTextFieldTokens.lineHeight).toEqual({ inputMin: 24, focusedLabelMin: 16, supportingMin: 16 });
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
    expect(filledStyle['--_text-field-container-color']).toBe('var(--surface-container-highest)');
    expect(filledStyle['--_text-field-text-color']).toBe('var(--on-surface)');
    expect(filledStyle['--_text-field-focused-indicator-color']).toBe('var(--primary)');
    expect(filledStyle['--_text-field-error-indicator-color']).toBe('var(--error)');
    expect(filledStyle['--_text-field-focused-label-color']).toBe('var(--primary)');
    expect(filledStyle['--_text-field-error-label-color']).toBe('var(--error)');
  });

  it('maps current standard FastEffects and FastSpatial motion', () => {
    expect(filledStyle['--_text-field-fast-effects-duration']).toBe('108ms');
    expect(filledStyle['--_text-field-fast-spatial-duration']).toBe('137ms');
    expect(String(filledStyle['--_text-field-fast-effects-easing'])).toContain('linear(');
    expect(String(filledStyle['--_text-field-fast-spatial-easing'])).toContain('linear(');
  });
});

describe('outlined TextField defaults', () => {
  it('matches the pinned Compose size, shape and outline defaults', () => {
    expect(outlinedTextFieldTokens.minWidth).toBe(280);
    expect(outlinedTextFieldTokens.minHeight).toBe(56);
    expect(outlinedTextFieldTokens.containerShape).toEqual({
      topStartRadius: 4,
      topEndRadius: 4,
      bottomEndRadius: 4,
      bottomStartRadius: 4,
    });
    expect(outlinedTextFieldTokens.outline).toEqual({
      unfocusedThickness: 1,
      focusedThickness: 2,
      disabledOpacity: 0.12,
    });
  });

  it('matches outlined content and cutout spacing', () => {
    expect(outlinedTextFieldTokens.contentPadding).toEqual({
      inline: 16,
      block: 16,
      supportingTop: 4,
      affix: 2,
      afterIcon: 4,
      cutoutInline: 4,
      topPadding: 8,
    });
    expect(outlinedTextFieldTokens.iconSize).toBe(24);
    expect(outlinedTextFieldTokens.iconSlotSize).toBe(48);
  });

  it('shares Material text typography and motion with filled fields', () => {
    expect(outlinedTextFieldTokens.typography).toEqual(filledTextFieldTokens.typography);
    expect(outlinedTextFieldTokens.motion).toEqual(filledTextFieldTokens.motion);
  });

  it('maps outline states through ThemeProvider roles', () => {
    expect(outlinedStyle['--_text-field-container-color']).toBe('transparent');
    expect(outlinedStyle['--_text-field-outline-color']).toBe('var(--outline)');
    expect(outlinedStyle['--_text-field-focused-outline-color']).toBe('var(--primary)');
    expect(outlinedStyle['--_text-field-error-outline-color']).toBe('var(--error)');
    expect(outlinedStyle['--_text-field-disabled-outline-color']).toBe('var(--on-surface)');
    expect(outlinedStyle['--_text-field-disabled-outline-opacity']).toBe(0.12);
    expect(outlinedStyle['--_text-field-outline-width']).toBe('1px');
    expect(outlinedStyle['--_text-field-outline-focused-width']).toBe('2px');
  });

  it('maps cutout geometry without component CSS literals', () => {
    expect(outlinedStyle['--_text-field-cutout-padding-inline']).toBe('4px');
    expect(outlinedStyle['--_text-field-outlined-top-padding']).toBe('8px');
  });
});
