import { describe, expect, it } from 'vitest';
import {
  getPlainTooltipStyle,
  getRichTooltipStyle,
  plainTooltipRuntime,
  plainTooltipTokens,
  richTooltipRuntime,
  richTooltipTokens,
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

describe('RichTooltip defaults', () => {
  it('projects the complete canonical RichTooltip surface including Web state/shadow aliases', () => {
    expect(richTooltipTokens).toEqual({
      actionFocusLabelTextColor: 'var(--primary)',
      actionFocusStateLayerColor: 'var(--primary)',
      actionFocusStateLayerOpacity: 0.1,
      actionHoverLabelTextColor: 'var(--primary)',
      actionHoverStateLayerColor: 'var(--primary)',
      actionHoverStateLayerOpacity: 0.08,
      actionLabelTextColor: 'var(--primary)',
      actionLabelTextTypography: 'labelLarge',
      actionPressedLabelTextColor: 'var(--primary)',
      actionPressedStateLayerColor: 'var(--primary)',
      actionPressedStateLayerOpacity: 0.1,
      containerColor: 'var(--surface-container)',
      containerElevation: 'level2',
      containerShadowColor: 'var(--shadow)',
      containerShape: 'medium',
      subheadColor: 'var(--on-surface-variant)',
      subheadTypography: 'titleSmall',
      supportingTextColor: 'var(--on-surface-variant)',
      supportingTextTypography: 'bodyMedium',
    });
  });

  it('keeps Compose RichTooltip layout constants beside the renderer', () => {
    expect(richTooltipRuntime).toMatchObject({
      minimumWidth: 40,
      minimumHeight: 24,
      maximumWidth: 320,
      paddingInline: 16,
      titleFirstBaseline: 28,
      textFirstBaseline: 24,
      textBottomPadding: 16,
      actionMinimumHeight: 36,
      actionBottomPadding: 8,
      textOnlyPaddingBlock: 4,
      spacingBetweenTooltipAndAnchor: 4,
      hiddenScale: 0.8,
    });
  });

  it('shares the canonical FastSpatial/FastEffects tooltip motion projection', () => {
    expect(richTooltipRuntime.motion).toBe(plainTooltipRuntime.motion);
    expect(richTooltipRuntime.motion.scale.duration).toBe('137ms');
    expect(richTooltipRuntime.motion.opacity.duration).toBe('108ms');
  });

  it('emits surface, level2 elevation, typography and geometry CSS variables', () => {
    const style = getRichTooltipStyle();
    expect(style['--_rich-tooltip-container-color']).toBe('var(--surface-container)');
    expect(style['--_rich-tooltip-content-color']).toBe('var(--on-surface-variant)');
    expect(style['--_rich-tooltip-title-color']).toBe('var(--on-surface-variant)');
    expect(style['--_rich-tooltip-action-color']).toBe('var(--primary)');
    expect(style['--_rich-tooltip-radius']).toBe('12px');
    expect(style['--_rich-tooltip-box-shadow']).toContain('var(--shadow)');
    expect(style['--_rich-tooltip-min-width']).toBe('40px');
    expect(style['--_rich-tooltip-min-height']).toBe('24px');
    expect(style['--_rich-tooltip-max-width']).toBe('320px');
    expect(style['--_rich-tooltip-padding-inline']).toBe('16px');
    expect(style['--_rich-tooltip-title-font-size']).toBe('14px');
    expect(style['--_rich-tooltip-title-line-height']).toBe('20px');
    expect(style['--_rich-tooltip-text-font-size']).toBe('14px');
    expect(style['--_rich-tooltip-text-line-height']).toBe('20px');
    expect(style['--_rich-tooltip-action-font-size']).toBe('14px');
    expect(style['--_rich-tooltip-action-line-height']).toBe('20px');
  });

  it('keeps RichTooltip visual overrides local to the renderer projection', () => {
    const style = getRichTooltipStyle({
      containerColor: 'navy',
      contentColor: 'white',
      titleColor: 'gold',
      actionColor: 'cyan',
      shadowColor: 'black',
      shape: 20,
      maxWidth: 360,
    });
    expect(style['--_rich-tooltip-container-color']).toBe('navy');
    expect(style['--_rich-tooltip-content-color']).toBe('white');
    expect(style['--_rich-tooltip-title-color']).toBe('gold');
    expect(style['--_rich-tooltip-action-color']).toBe('cyan');
    expect(style['--_rich-tooltip-radius']).toBe('20px');
    expect(style['--_rich-tooltip-max-width']).toBe('360px');
    expect(style['--_rich-tooltip-box-shadow']).toContain('black');
  });
});
