import { describe, expect, it } from 'vitest';
import { rippleTokens } from '@m3/tokens/ripple';
import { stateLayerOpacity } from '@m3/tokens/state';

describe('ripple tokens', () => {
  it('matches current Material 3 state-layer opacity', () => {
    expect(stateLayerOpacity).toEqual({
      dragged: 0.16,
      focus: 0.1,
      hover: 0.08,
      pressed: 0.1,
    });
  });

  it('keeps web ripple timing outside ThemeProvider', () => {
    expect(rippleTokens).toEqual({
      growDurationMs: 450,
      minimumPressDurationMs: 225,
      hoverTransitionDurationMs: 15,
      fadeInDurationMs: 105,
      fadeOutDurationMs: 375,
      growEasing: 'cubic-bezier(0.2, 0, 0, 1)',
      opacityEasing: 'linear',
    });
  });
});
