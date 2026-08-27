import * as token from '@m3-ui/tokens';
import { describe, expect, it } from 'vitest';
import { dividerTokens, getDividerStyle } from './Divider.defaults';

describe('Divider defaults', () => {
  it('projects canonical Material 3 divider tokens', () => {
    expect(dividerTokens).toEqual({
      color: token.ComponentDividerColor,
      thickness: 1,
    });
  });

  it('emits canonical CSS variables by default', () => {
    expect(getDividerStyle()).toEqual({
      '--_divider-color': token.ComponentDividerColor,
      '--_divider-thickness': '1px',
    });
  });

  it('accepts numeric thickness overrides as CSS pixels', () => {
    expect(getDividerStyle({ color: 'red', thickness: 3 })).toEqual({
      '--_divider-color': 'red',
      '--_divider-thickness': '3px',
    });
  });

  it('preserves CSS length overrides', () => {
    expect(getDividerStyle({ thickness: '0.125rem' })).toMatchObject({
      '--_divider-thickness': '0.125rem',
    });
  });
});
