import * as token from '@m3/tokens';
import { describe, expect, it } from 'vitest';
import {
  switchBaseStyle,
  switchStateLayerRadius,
  switchTrackFocusRingRadius,
} from './Switch.defaults';

const style = switchBaseStyle as Record<string, string | number>;

describe('Switch defaults', () => {
  it('consumes generated canonical geometry', () => {
    expect(token.ComponentSwitchTrackWidth).toBe('52px');
    expect(token.ComponentSwitchTrackHeight).toBe('32px');
    expect(token.ComponentSwitchTrackOutlineWidth).toBe('2px');
    expect(token.ComponentSwitchMinimumInteractiveSize).toBe('48px');
    expect(token.ComponentSwitchStateLayerSize).toBe('40px');
    expect(token.ComponentSwitchHandleUnselectedSize).toBe('16px');
    expect(token.ComponentSwitchHandleSelectedSize).toBe('24px');
    expect(token.ComponentSwitchHandlePressedSize).toBe('28px');
    expect(token.ComponentSwitchHandleIconSize).toBe('16px');
    expect(style['--_switch-unchecked-thumb-offset']).toBe('8px');
    expect(style['--_switch-content-thumb-offset']).toBe('4px');
    expect(style['--_switch-checked-thumb-offset']).toBe('24px');
    expect(style['--_switch-pressed-unchecked-thumb-offset']).toBe('2px');
    expect(style['--_switch-pressed-checked-thumb-offset']).toBe('22px');
    expect(switchStateLayerRadius).toBe(20);
    expect(switchTrackFocusRingRadius).toBe('16px');
  });

  it('derives wrapper label color from the canonical runtime role', () => {
    expect(token.ColorRoleOnSurface).toBe('var(--on-surface)');
    expect(style['--_switch-label-color']).toBe('var(--on-surface)');
  });

  it('passes enabled dynamic color variables through unchanged', () => {
    expect(style['--_switch-checked-thumb-color']).toBe('var(--on-primary)');
    expect(style['--_switch-checked-track-color']).toBe('var(--primary)');
    expect(style['--_switch-checked-border-color']).toBe('transparent');
    expect(style['--_switch-checked-icon-color']).toBe('var(--on-primary-container)');
    expect(style['--_switch-unchecked-thumb-color']).toBe('var(--outline)');
    expect(style['--_switch-unchecked-track-color']).toBe('var(--surface-container-highest)');
    expect(style['--_switch-unchecked-border-color']).toBe('var(--outline)');
  });

  it('composites generated disabled colors over the canonical Surface role', () => {
    expect(token.ColorRoleSurface).toBe('var(--surface)');
    expect(style['--_switch-disabled-checked-thumb-color']).toBe('var(--surface)');
    expect(style['--_switch-disabled-checked-track-color']).toBe('color-mix(in srgb, var(--on-surface) 12%, var(--surface))');
    expect(style['--_switch-disabled-unchecked-thumb-color']).toBe('color-mix(in srgb, var(--on-surface) 38%, var(--surface))');
    expect(style['--_switch-disabled-unchecked-track-color']).toBe('color-mix(in srgb, var(--surface-container-highest) 12%, var(--surface))');
    expect(style['--_switch-disabled-unchecked-border-color']).toBe('color-mix(in srgb, var(--on-surface) 12%, var(--surface))');
  });

  it('uses canonical FastSpatial web adaptation values', () => {
    expect(style['--_switch-geometry-duration']).toBe('137ms');
    expect(String(style['--_switch-geometry-easing'])).toContain('linear(');
  });
});
