import { describe, expect, it } from 'vitest';
import { getScrimStyle } from './Scrim.defaults';

describe('Scrim runtime boundary', () => {
  it('leaves canonical color and opacity to generated CSS', () => {
    expect(getScrimStyle()).toEqual({});
  });

  it('clamps runtime alpha and caller opacity independently', () => {
    expect(getScrimStyle({ alpha: 0.5 })).toEqual({ '--_scrim-alpha': 0.5 });
    expect(getScrimStyle({ alpha: 2 })).toEqual({ '--_scrim-alpha': 1 });
    expect(getScrimStyle({ alpha: -1 })).toEqual({ '--_scrim-alpha': 0 });
    expect(getScrimStyle({ containerOpacity: 0.6 })).toEqual({ '--_scrim-container-opacity': 0.6 });
  });
});
