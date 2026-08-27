import { describe, expect, it } from 'vitest';
import * as token from '@m3-ui/tokens';
import {
  getScrimStyle,
  scrimTokens,
} from './Scrim.defaults';

describe('Material 3 Scrim defaults', () => {
  it('projects the complete canonical Scrim token pair', () => {
    expect(scrimTokens).toEqual({
      containerColor: token.ScrimContainerColor,
      containerOpacity: token.ScrimContainerOpacity,
    });
    expect(scrimTokens.containerColor).toBe('var(--scrim)');
    expect(scrimTokens.containerOpacity).toBe(0.32);
  });

  it('emits the canonical color and opacity by default', () => {
    expect(getScrimStyle()).toEqual({
      '--_scrim-container-color': 'var(--scrim)',
      '--_scrim-container-opacity': 0.32,
    });
  });

  it('clamps renderer alpha and multiplies it by the container opacity', () => {
    expect(getScrimStyle({ alpha: 0.5 })['--_scrim-container-opacity']).toBe(
      0.16,
    );
    expect(getScrimStyle({ alpha: 2 })['--_scrim-container-opacity']).toBe(
      0.32,
    );
    expect(getScrimStyle({ alpha: -1 })['--_scrim-container-opacity']).toBe(0);
    expect(
      getScrimStyle({ containerOpacity: 0.5, alpha: 0.5 })[
        '--_scrim-container-opacity'
      ],
    ).toBe(0.25);
  });

  it('keeps local visual overrides out of the canonical token graph', () => {
    const style = getScrimStyle({
      containerColor: 'rebeccapurple',
      containerOpacity: 0.6,
    });

    expect(style['--_scrim-container-color']).toBe('rebeccapurple');
    expect(style['--_scrim-container-opacity']).toBe(0.6);
    expect(scrimTokens.containerColor).toBe(token.ScrimContainerColor);
    expect(scrimTokens.containerOpacity).toBe(token.ScrimContainerOpacity);
  });
});
