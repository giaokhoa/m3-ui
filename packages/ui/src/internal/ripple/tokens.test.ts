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
    expect(rippleTokens).toEqual({
      radiusDurationMs: 225,
      minimumPressDurationMs: 225,
      hoverTransitionDurationMs: 15,
      focusInTransitionDurationMs: 45,
      fadeInDurationMs: 75,
      fadeOutDurationMs: 150,
      boundedExtraRadius: 10,
      startRadiusLargestDimensionFactor: 0.3,
      radiusEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      centerEasing: 'linear',
      opacityEasing: 'linear',
    });
  });
});
