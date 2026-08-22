import { describe, expect, it } from 'vitest';
import { radioButtonBaseStyle, radioGroupBaseStyle } from './RadioButton.defaults';
import { radioButtonTokens } from './RadioButton.tokens';

const style = radioButtonBaseStyle as Record<string, string | number>;
const groupStyle = radioGroupBaseStyle as Record<string, string | number>;

describe('RadioButton defaults', () => {
  it('matches the pinned Compose geometry', () => {
    expect(radioButtonTokens.iconSize).toBe(20);
    expect(radioButtonTokens.stateLayerSize).toBe(40);
    expect(radioButtonTokens.minimumInteractiveSize).toBe(48);
    expect(radioButtonTokens.padding).toBe(2);
    expect(radioButtonTokens.strokeWidth).toBe(2);
    expect(radioButtonTokens.dotSize).toBe(12);
  });

  it('maps runtime control colors through ThemeProvider roles', () => {
    expect(style['--_radio-label-color']).toBe('var(--on-surface)');
    expect(style['--_radio-selected-color']).toBe('var(--primary)');
    expect(style['--_radio-unselected-color']).toBe('var(--on-surface-variant)');
    expect(style['--_radio-disabled-selected-color']).toBe('var(--on-surface)');
    expect(style['--_radio-disabled-unselected-color']).toBe('var(--on-surface)');
    expect(style['--_radio-disabled-opacity']).toBe(0.38);
    expect(style['--_radio-selected-state-layer']).toBeUndefined();
    expect(style['--_radio-unselected-state-layer']).toBeUndefined();
  });

  it('keeps web RadioGroup colors in the canonical component contract', () => {
    expect(groupStyle['--_radio-group-content-color']).toBe('var(--on-surface)');
    expect(groupStyle['--_radio-group-error-color']).toBe('var(--error)');
  });

  it('maps pinned DefaultEffects color and FastSpatial dot motion', () => {
    expect(style['--_radio-color-duration']).toBe('166ms');
    expect(style['--_radio-dot-duration']).toBe('137ms');
    expect(String(style['--_radio-color-easing'])).toContain('linear(');
    expect(String(style['--_radio-dot-easing'])).toContain('linear(');
  });
});
