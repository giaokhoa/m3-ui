export const rippleTokens = {
  radiusDurationMs: 225,
  minimumPressDurationMs: 225,
  hoverTransitionDurationMs: 15,
  focusInTransitionDurationMs: 45,
  fadeInDurationMs: 75,
  fadeOutDurationMs: 150,
  boundedExtraRadius: 10,
  startRadiusLargestDimensionFactor: 0.3,
  radiusEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  centerEasing: 'linear',
  opacityEasing: 'linear',

  // AndroidX RippleDefaults.InsetFocusRingThemeConfiguration at revision
  // 160825094a81825468a95b115bfb1b541e549856. Colors are resolved from
  // MaterialTheme at runtime; dimensions and standard motion remain immutable.
  focusRing: {
    outerStrokeInset: 0,
    outerStrokeWidth: 2,
    innerStrokeInset: 1,
    innerStrokeWidth: 3,
    outerStrokeColorRole: 'secondary',
    innerStrokeColorRole: 'onSecondary',
    focusIn: {
      // MotionScheme FastSpatial sampled to its 1% settle point.
      durationMs: 137,
      easing:
        'linear(0, 0.0969 10%, 0.2872 20%, 0.4827 30%, 0.6472 40%, 0.7719 50%, 0.8598 60%, 0.9183 70%, 0.9552 80%, 0.9774 90%, 1)',
    },
    focusOut: {
      // MotionScheme FastEffects sampled to its 1% settle point.
      durationMs: 108,
      easing:
        'linear(0, 0.1434 10%, 0.383 20%, 0.5917 30%, 0.7432 40%, 0.8438 50%, 0.9072 60%, 0.9459 70%, 0.9688 80%, 0.9823 90%, 1)',
    },
  },
} as const;
