import { rippleTokens } from '@m3/tokens/ripple';
import { stateLayerOpacity } from '@m3/tokens/state';
import { describe, expect, it } from 'vitest';

describe('ripple tokens', () => {
  it('matches current Material 3 state-layer opacity', () => {
    expect(stateLayerOpacity).toEqual({
      dragged: 0.16,
      focus: 0.1,
      hover: 0.08,
      pressed: 0.1,
    });
  });

  it('matches current Compose Material3 ripple motion', () => {
    expect(rippleTokens.radiusDurationMs).toBe(225);
    expect(rippleTokens.minimumPressDurationMs).toBe(225);
    expect(rippleTokens.hoverTransitionDurationMs).toBe(15);
    expect(rippleTokens.focusInTransitionDurationMs).toBe(45);
    expect(rippleTokens.fadeInDurationMs).toBe(75);
    expect(rippleTokens.fadeOutDurationMs).toBe(150);
    expect(rippleTokens.boundedExtraRadius).toBe(10);
    expect(rippleTokens.startRadiusLargestDimensionFactor).toBe(0.3);
    expect(rippleTokens.radiusEasing).toBe('cubic-bezier(0.4, 0, 0.2, 1)');
    expect(rippleTokens.centerEasing).toBe('linear');
    expect(rippleTokens.opacityEasing).toBe('linear');
  });

  it('matches the pinned AndroidX inset focus ring theme defaults', () => {
    expect(rippleTokens.focusRing.outerStrokeInset).toBe(0);
    expect(rippleTokens.focusRing.outerStrokeWidth).toBe(2);
    expect(rippleTokens.focusRing.innerStrokeInset).toBe(1);
    expect(rippleTokens.focusRing.innerStrokeWidth).toBe(3);
    expect(rippleTokens.focusRing.outerStrokeColorRole).toBe('secondary');
    expect(rippleTokens.focusRing.innerStrokeColorRole).toBe('onSecondary');
    expect(rippleTokens.focusRing.focusIn.durationMs).toBe(137);
    expect(rippleTokens.focusRing.focusOut.durationMs).toBe(108);
    expect(rippleTokens.focusRing.focusIn.easing).toContain('linear(');
    expect(rippleTokens.focusRing.focusOut.easing).toContain('linear(');
  });
});
