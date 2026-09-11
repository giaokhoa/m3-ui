import { describe, expect, it } from 'vitest';
import { getSnackbarStyle, snackbarRuntime } from './Snackbar.defaults';

describe('Snackbar runtime boundary', () => {
  it('keeps immutable defaults out of the TS projector', () => {
    expect(getSnackbarStyle()).toEqual({});
    expect(snackbarRuntime.maximumWidth).toBe(600);
  });

  it('projects only caller overrides', () => {
    expect(getSnackbarStyle({ actionColor: 'gold', shape: 12, maxWidth: 420 })).toMatchObject({
      '--_snackbar-action-color': 'gold',
      '--_snackbar-action-pressed-color': 'gold',
      '--_snackbar-action-pressed-state-layer-color': 'gold',
      '--_snackbar-radius': '12px',
      '--_snackbar-max-width': '420px',
    });
  });
});
