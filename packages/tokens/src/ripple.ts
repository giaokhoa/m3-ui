import { motionEasing } from './motion';

export const rippleTokens = {
  growDurationMs: 450,
  minimumPressDurationMs: 225,
  fadeInDurationMs: 105,
  fadeOutDurationMs: 375,
  easing: motionEasing.standard,
} as const;
