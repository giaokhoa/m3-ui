import { radioButtonTokens } from '@m3/tokens/radio-button';
import { describe, expect, it } from 'vitest';
import { radioButtonBaseStyle } from './RadioButton.defaults';

const style = radioButtonBaseStyle as Record<string, string | number>;

describe('RadioButton defaults', () => {
  it('matches the pinned Compose geometry', () => {
    expect(radioButtonTokens.iconSize).toBe(20);
    expect(radioButtonTokens.stateLayerSize).toBe(40);
    expect(radioButtonTokens.minimumInteractiveSize).toBe(48);
    expect(radioButtonTokens.padding).toBe(2);
    expect(radioButtonTokens.strokeWidth).toBe(2);
    expect(radioButtonTokens.dotSize).toBe(12);
  });

  it('maps runtime colors through ThemeProvider roles', () => {
    expect(style['--_radio-selected-color']).toBe('var(--primary)');
    expect(style['--_radio-unselected-color']).toBe('var(--on-surface-variant)');
    expect(style['--_radio-disabled-selected-color']).toBe('var(--on-surface)');
    expect(style['--_radio-disabled-unselected-color']).toBe('var(--on-surface)');
    expect(style['--_radio-selected-state-layer']).toBe('var(--primary)');
    expect(style['--_radio-unselected-state-layer']).toBe('var(--on-surface)');
    expect(style['--_radio-disabled-opacity']).toBe(0.38);
  });

  it('matches the Compose 100ms tween transition', () => {
    expect(style['--_radio-transition-duration']).toBe('100ms');
    expect(style['--_radio-transition-easing']).toBe(
      'cubic-bezier(0.4, 0, 0.2, 1)',
    );
  });
});
