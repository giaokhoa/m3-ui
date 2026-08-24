import { describe, expect, it } from 'vitest';
import {
  getPlainTooltipStyle,
  plainTooltipRuntime,
  plainTooltipTokens,
} from './Tooltip.defaults';

describe('PlainTooltip defaults', () => {
  it('projects the complete canonical PlainTooltip token surface', () => {
    expect(plainTooltipTokens).toEqual({
      containerColor: 'var(--inverse-surface)',
      containerShape: 'extraSmall',
      supportingTextColor: 'var(--inverse-on-surface)',
      supportingTextTypography: 'bodySmall',
    });
  });

  it('keeps Compose renderer geometry outside the canonical token graph', () => {
    expect(plainTooltipRuntime.minimumWidth).toBe(40);
    expect(plainTooltipRuntime.minimumHeight).toBe(24);
    expect(plainTooltipRuntime.maximumWidth).toBe(200);
    expect(plainTooltipRuntime.paddingInline).toBe(8);
    expect(plainTooltipRuntime.paddingBlock).toBe(4);
    expect(plainTooltipRuntime.spacingBetweenTooltipAndAnchor).toBe(4);
    expect(plainTooltipRuntime.hiddenScale).toBe(0.8);
  });

  it('uses the canonical fast spatial/effects spring projections for Compose tooltip motion', () => {
    expect(plainTooltipRuntime.motion.scale.duration).toBe('137ms');
    expect(plainTooltipRuntime.motion.opacity.duration).toBe('108ms');
    expect(plainTooltipRuntime.motion.scale.easing).toContain('linear(');
    expect(plainTooltipRuntime.motion.opacity.easing).toContain('linear(');
  });

  it('emits Material surface, typography, geometry and motion CSS variables', () => {
    const style = getPlainTooltipStyle();
    expect(style['--_plain-tooltip-container-color']).toBe('var(--inverse-surface)');
    expect(style['--_plain-tooltip-content-color']).toBe('var(--inverse-on-surface)');
    expect(style['--_plain-tooltip-radius']).toBe('4px');
    expect(style['--_plain-tooltip-min-width']).toBe('40px');
    expect(style['--_plain-tooltip-min-height']).toBe('24px');
    expect(style['--_plain-tooltip-max-width']).toBe('200px');
    expect(style['--_plain-tooltip-font-family']).toBe('var(--font-family-plain)');
    expect(style['--_plain-tooltip-font-size']).toBe('12px');
    expect(style['--_plain-tooltip-line-height']).toBe('16px');
    expect(style['--_plain-tooltip-font-weight']).toBe(400);
    expect(style['--_plain-tooltip-letter-spacing']).toBe('0.4px');
  });

  it('keeps public visual overrides local to the renderer projection', () => {
    const style = getPlainTooltipStyle({
      containerColor: 'rebeccapurple',
      contentColor: 'white',
      shape: 10,
      maxWidth: 240,
    });
    expect(style['--_plain-tooltip-container-color']).toBe('rebeccapurple');
    expect(style['--_plain-tooltip-content-color']).toBe('white');
    expect(style['--_plain-tooltip-radius']).toBe('10px');
    expect(style['--_plain-tooltip-max-width']).toBe('240px');
  });
});
