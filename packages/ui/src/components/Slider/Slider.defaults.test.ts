import { describe, expect, it } from 'vitest';
import {
  getSliderStyle,
  sliderRuntime,
  sliderSizeTokens,
  sliderTokens,
} from './Slider.defaults';

describe('Material 3 Slider defaults', () => {
  it('projects all five current slider size families', () => {
    expect(sliderSizeTokens.xSmall).toMatchObject({
      handleLength: 44,
      activeTrackThickness: 16,
      inactiveTrackThickness: 16,
      activeOuterRadius: 8,
      inactiveOuterRadius: 8,
    });
    expect(sliderSizeTokens.small.activeTrackThickness).toBe(24);
    expect(sliderSizeTokens.medium).toMatchObject({
      handleLength: 44,
      activeTrackThickness: 40,
      iconSize: 24,
      iconPadding: 6,
    });
    expect(sliderSizeTokens.large).toMatchObject({
      handleLength: 68,
      activeTrackThickness: 56,
      iconSize: 24,
    });
    expect(sliderSizeTokens.xLarge).toMatchObject({
      handleLength: 108,
      activeTrackThickness: 96,
      iconSize: 32,
      iconPadding: 8,
    });
  });

  it('keeps the current Compose interaction width contract', () => {
    expect(sliderTokens.handleWidth).toBe(4);
    expect(sliderTokens.hoverHandleWidth).toBe(4);
    expect(sliderTokens.focusHandleWidth).toBe(2);
    expect(sliderTokens.pressedHandleWidth).toBe(2);
    expect(sliderTokens.disabledHandleWidth).toBe(4);
  });

  it('uses the current Web stop-indicator semantics without erasing source drift', () => {
    expect(sliderTokens.stopSize).toBe(4);
    expect(sliderTokens.stopColor).toBe('var(--on-secondary-container)');
    expect(sliderTokens.selectedStopColor).toBe('var(--on-primary)');
    expect(sliderTokens.disabledActiveStopColor).toBe('var(--inverse-on-surface)');
    expect(sliderTokens.disabledInactiveStopColor).toBe('var(--on-surface)');
    expect(sliderTokens.stopTrailingSpace).toBe(4);
  });

  it('keeps source-level web mechanics outside canonical DTCG', () => {
    expect(sliderRuntime).toMatchObject({
      minimumInteractiveTarget: 48,
      webMinimumInlineSize: 200,
      trackInnerRadius: 2,
      baselineTrackGap: 6,
    });
  });

  it('emits size-aware CSS variables and resolved runtime gaps', () => {
    const style = getSliderStyle('xLarge');
    expect(style['--_slider-handle-length']).toBe('108px');
    expect(style['--_slider-active-track-thickness']).toBe('96px');
    expect(style['--_slider-inactive-track-thickness']).toBe('96px');
    expect(style['--_slider-active-outer-radius']).toBe('28px');
    expect(style['--_slider-handle-color']).toBe('var(--primary)');
    expect(style['--_slider-disabled-active-track-opacity']).toBe(0.38);
    expect(style['--_slider-disabled-inactive-track-opacity']).toBe(0.12);
    expect(style['--_slider-default-thumb-track-gap']).toBe('8px');
    expect(style['--_slider-focus-thumb-track-gap']).toBe('7px');
    expect(style['--_slider-pressed-thumb-track-gap']).toBe('7px');
    expect(style['--_slider-disabled-thumb-track-gap']).toBe('8px');
    expect(style['--_slider-stop-trailing-space']).toBe('4px');
    expect(style['--_slider-stop-center-inset']).toBe('6px');
  });
});
