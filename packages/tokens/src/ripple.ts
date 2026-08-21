import { motionEasing } from './motion.js';

export const rippleTokens = {
  growDurationMs: 450,
  minimumPressDurationMs: 225,
  hoverTransitionDurationMs: 15,
  fadeInDurationMs: 105,
  fadeOutDurationMs: 375,
  growEasing: motionEasing.standard,
  opacityEasing: motionEasing.linear,
} as const;
