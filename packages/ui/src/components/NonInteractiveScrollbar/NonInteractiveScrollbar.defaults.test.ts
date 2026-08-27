import { describe, expect, it } from 'vitest';
import {
  getNonInteractiveScrollbarStyle,
  nonInteractiveScrollbarDefaults,
} from './NonInteractiveScrollbar.defaults';

describe('NonInteractiveScrollbar defaults', () => {
  it('mirrors the pinned AndroidX component defaults', () => {
    expect(nonInteractiveScrollbarDefaults).toMatchObject({
      thumbOpacity: 0.7,
      fadeDuration: 250,
      fadeDelay: 400,
      thickness: 4,
      thumbMinLength: 24,
      thumbMaxLengthFraction: 0.9,
      mainAxisTrackInset: 2,
      crossAxisTrackInset: 0,
    });
  });

  it('projects numeric web defaults into CSS variables', () => {
    expect(getNonInteractiveScrollbarStyle()).toMatchObject({
      '--_non-interactive-scrollbar-thickness': '4px',
      '--_non-interactive-scrollbar-fade-duration': '250ms',
      '--_non-interactive-scrollbar-main-axis-inset': '2px',
      '--_non-interactive-scrollbar-cross-axis-inset': '0px',
    });
  });
});
