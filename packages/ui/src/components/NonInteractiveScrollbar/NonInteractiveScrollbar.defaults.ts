import type { CSSProperties } from 'react';

export const nonInteractiveScrollbarDefaults = {
  thumbOpacity: 0.7,
  fadeDuration: 250,
  fadeDelay: 400,
  thickness: 4,
  thumbMinLength: 24,
  thumbMaxLengthFraction: 0.9,
  mainAxisTrackInset: 2,
  crossAxisTrackInset: 0,
  thumbColor: 'var(--outline)',
  trackColor: 'transparent',
} as const;

export type NonInteractiveScrollbarStyle = CSSProperties &
  Record<`--${string}`, string | number>;

export function getNonInteractiveScrollbarStyle(options: {
  thickness?: number;
  fadeDuration?: number;
  mainAxisTrackInset?: number;
  crossAxisTrackInset?: number;
} = {}): NonInteractiveScrollbarStyle {
  return {
    '--_non-interactive-scrollbar-thickness': `${options.thickness ?? nonInteractiveScrollbarDefaults.thickness}px`,
    '--_non-interactive-scrollbar-fade-duration': `${options.fadeDuration ?? nonInteractiveScrollbarDefaults.fadeDuration}ms`,
    '--_non-interactive-scrollbar-main-axis-inset': `${options.mainAxisTrackInset ?? nonInteractiveScrollbarDefaults.mainAxisTrackInset}px`,
    '--_non-interactive-scrollbar-cross-axis-inset': `${options.crossAxisTrackInset ?? nonInteractiveScrollbarDefaults.crossAxisTrackInset}px`,
  };
}
