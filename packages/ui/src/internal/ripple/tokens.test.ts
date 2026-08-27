import * as token from '@m3-ui/tokens';
import { describe, expect, it } from 'vitest';

describe('ripple generated tokens', () => {
  it('matches current Material 3 state-layer opacity', () => {
    expect({
      dragged: token.StateLayerOpacityDragged,
      focus: token.StateLayerOpacityFocus,
      hover: token.StateLayerOpacityHover,
      pressed: token.StateLayerOpacityPressed,
    }).toEqual({ dragged: 0.16, focus: 0.1, hover: 0.08, pressed: 0.1 });
  });

  it('matches current Compose Material3 ripple motion', () => {
    expect(token.RippleRadiusDuration).toBe('225ms');
    expect(token.RippleMinimumPressDuration).toBe('225ms');
    expect(token.RippleHoverTransitionDuration).toBe('15ms');
    expect(token.RippleFocusInTransitionDuration).toBe('45ms');
    expect(token.RippleFadeInDuration).toBe('75ms');
    expect(token.RippleFadeOutDuration).toBe('150ms');
    expect(token.RippleBoundedExtraRadius).toBe('10px');
    expect(token.RippleStartRadiusLargestDimensionFactor).toBe(0.3);
    expect(token.RippleRadiusEasing).toBe('cubic-bezier(0.4, 0, 0.2, 1)');
    expect(token.RippleCenterEasing).toBe('cubic-bezier(0, 0, 1, 1)');
    expect(token.RippleOpacityEasing).toBe('cubic-bezier(0, 0, 1, 1)');
  });

  it('matches the pinned AndroidX inset focus ring theme defaults', () => {
    expect(token.RippleFocusRingOuterStrokeInset).toBe('0px');
    expect(token.RippleFocusRingOuterStrokeWidth).toBe('2px');
    expect(token.RippleFocusRingInnerStrokeInset).toBe('1px');
    expect(token.RippleFocusRingInnerStrokeWidth).toBe('3px');
    expect(token.RippleFocusRingOuterStrokeColor).toBe('var(--secondary)');
    expect(token.RippleFocusRingInnerStrokeColor).toBe('var(--on-secondary)');
    expect(token.RippleFocusRingFocusInDuration).toBe('137ms');
    expect(token.RippleFocusRingFocusOutDuration).toBe('108ms');
    expect(token.RippleFocusRingFocusInEasing).toContain('linear(');
    expect(token.RippleFocusRingFocusOutEasing).toContain('linear(');
  });
});
