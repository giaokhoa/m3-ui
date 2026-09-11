import { describe, expect, it } from 'vitest';
import { getDialogOverlayStyle, getDialogStyle } from './Dialog.defaults';

describe('Dialog runtime boundary', () => {
  it('leaves immutable defaults to generated CSS', () => {
    expect(getDialogStyle()).toEqual({});
    expect(getDialogOverlayStyle()).toEqual({});
  });

  it('projects only surface, scrim and size overrides', () => {
    expect(getDialogStyle({ actionColor: 'gold', shape: 20 })).toMatchObject({
      '--_dialog-action-color': 'gold',
      '--_dialog-action-pressed-color': 'gold',
      '--_dialog-radius': '20px',
    });
    expect(getDialogOverlayStyle({ scrimAlpha: 0.5, maxWidth: 480 })).toMatchObject({
      '--_scrim-alpha': 0.5,
      '--_dialog-max-width': '480px',
    });
  });
});
