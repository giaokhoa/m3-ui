import { describe, expect, it } from 'vitest';
import { getDividerStyle } from './Divider.defaults';

describe('Divider runtime defaults', () => {
  it('leaves immutable color and thickness to generated CSS', () => {
    expect(getDividerStyle()).toEqual({});
  });

  it('accepts numeric thickness overrides as CSS pixels', () => {
    expect(getDividerStyle({ color: 'red', thickness: 3 })).toEqual({
      '--_divider-color': 'red',
      '--_divider-thickness': '3px',
    });
  });

  it('preserves CSS length overrides', () => {
    expect(getDividerStyle({ thickness: '0.125rem' })).toEqual({
      '--_divider-thickness': '0.125rem',
    });
  });
});
