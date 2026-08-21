import { motionEasing } from './motion.js';

export const rippleTokens = {
  growDurationMs: 450,
  minimumPressDurationMs: 225,
  fadeInDurationMs: 105,
  fadeOutDurationMs: 375,
  easing: motionEasing.standard,
} as const;
