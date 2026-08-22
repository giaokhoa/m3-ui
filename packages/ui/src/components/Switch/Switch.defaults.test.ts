import { switchTokens } from '@m3/tokens/switch';
import { describe, expect, it } from 'vitest';
import { switchBaseStyle } from './Switch.defaults';

const style = switchBaseStyle as Record<string, string | number>;

describe('Switch defaults', () => {
  it('matches pinned Compose geometry', () => {
    expect(switchTokens.trackWidth).toBe(52);
    expect(switchTokens.trackHeight).toBe(32);
    expect(switchTokens.trackOutlineWidth).toBe(2);
    expect(switchTokens.minimumInteractiveSize).toBe(48);
    expect(switchTokens.stateLayerSize).toBe(40);
    expect(switchTokens.uncheckedThumbSize).toBe(16);
    expect(switchTokens.checkedThumbSize).toBe(24);
    expect(switchTokens.pressedThumbSize).toBe(28);
    expect(switchTokens.iconSize).toBe(16);
    expect(style['--_switch-unchecked-thumb-offset']).toBe('8px');
    expect(style['--_switch-content-thumb-offset']).toBe('4px');
    expect(style['--_switch-checked-thumb-offset']).toBe('24px');
    expect(style['--_switch-pressed-unchecked-thumb-offset']).toBe('2px');
    expect(style['--_switch-pressed-checked-thumb-offset']).toBe('22px');
  });

  it('maps enabled colors through ThemeProvider roles', () => {
    expect(style['--_switch-checked-thumb-color']).toBe('var(--on-primary)');
    expect(style['--_switch-checked-track-color']).toBe('var(--primary)');
    expect(style['--_switch-checked-border-color']).toBe('transparent');
    expect(style['--_switch-checked-icon-color']).toBe('var(--on-primary-container)');
    expect(style['--_switch-unchecked-thumb-color']).toBe('var(--outline)');
    expect(style['--_switch-unchecked-track-color']).toBe(
      'var(--surface-container-highest)',
    );
    expect(style['--_switch-unchecked-border-color']).toBe('var(--outline)');
  });

  it('composites disabled colors over Surface like SwitchDefaults.colors', () => {
    expect(style['--_switch-disabled-checked-thumb-color']).toBe('var(--surface)');
    expect(style['--_switch-disabled-checked-track-color']).toBe(
      'color-mix(in srgb, var(--on-surface) 12%, var(--surface))',
    );
    expect(style['--_switch-disabled-unchecked-thumb-color']).toBe(
      'color-mix(in srgb, var(--on-surface) 38%, var(--surface))',
    );
    expect(style['--_switch-disabled-unchecked-track-color']).toBe(
      'color-mix(in srgb, var(--surface-container-highest) 12%, var(--surface))',
    );
    expect(style['--_switch-disabled-unchecked-border-color']).toBe(
      'color-mix(in srgb, var(--on-surface) 12%, var(--surface))',
    );
  });

  it('uses FastSpatial only for non-pressed thumb geometry', () => {
    expect(style['--_switch-geometry-duration']).toBe('137ms');
    expect(String(style['--_switch-geometry-easing'])).toContain('linear(');
  });
});
