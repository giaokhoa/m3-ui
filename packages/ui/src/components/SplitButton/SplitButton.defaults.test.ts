import { describe, expect, it } from 'vitest';
import {
  getSplitButtonStyle,
  splitButtonRuntime,
  splitButtonSizeTokens,
} from './SplitButton.defaults';

describe('SplitButton defaults', () => {
  it('projects all five canonical size geometries', () => {
    expect(splitButtonSizeTokens.extraSmall.containerHeight).toBe('32px');
    expect(splitButtonSizeTokens.small.containerHeight).toBe('40px');
    expect(splitButtonSizeTokens.medium.containerHeight).toBe('56px');
    expect(splitButtonSizeTokens.large.containerHeight).toBe('96px');
    expect(splitButtonSizeTokens.extraLarge.containerHeight).toBe('136px');
  });

  it('keeps the canonical 2px gap across the family', () => {
    for (const tokens of Object.values(splitButtonSizeTokens)) {
      expect(tokens.spacing).toBe('2px');
    }
  });

  it('maps representative paddings and trailing icon sizes from split-button tokens', () => {
    expect(splitButtonSizeTokens.extraSmall.leadingPaddingStart).toBe('12px');
    expect(splitButtonSizeTokens.small.leadingPaddingEnd).toBe('12px');
    expect(splitButtonSizeTokens.medium.trailingPaddingStart).toBe('15px');
    expect(splitButtonSizeTokens.large.trailingIconSize).toBe('38px');
    expect(splitButtonSizeTokens.extraLarge.trailingIconSize).toBe('50px');
  });

  it('exposes normal and pressed inner corners independently', () => {
    const style = getSplitButtonStyle('small');
    expect(style['--_split-button-inner-corner']).toBe('4px');
    expect(style['--_split-button-inner-pressed-corner']).toBe('12px');
    expect(style['--_split-button-outer-corner']).toBe('9999px');
  });

  it('keeps AndroidX runtime-only minimum target and checked overlay beside the consumer', () => {
    expect(splitButtonRuntime.minInteractiveSize).toBe(48);
    expect(splitButtonRuntime.checkedStateLayerOpacity).toBe(0.1);
    const style = getSplitButtonStyle('extraSmall');
    expect(style['--_split-button-min-interactive-size']).toBe('48px');
    expect(style['--_split-button-checked-state-layer-opacity']).toBe('10%');
  });
});
