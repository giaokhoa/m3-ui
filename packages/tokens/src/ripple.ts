import * as token from '@m3/tokens/generated';
import { colorRole, msNumber, pxNumber } from './value.js';

export const rippleTokens = {
  radiusDurationMs: msNumber(token.RippleRadiusDuration),
  minimumPressDurationMs: msNumber(token.RippleMinimumPressDuration),
  hoverTransitionDurationMs: msNumber(token.RippleHoverTransitionDuration),
  focusInTransitionDurationMs: msNumber(token.RippleFocusInTransitionDuration),
  fadeInDurationMs: msNumber(token.RippleFadeInDuration),
  fadeOutDurationMs: msNumber(token.RippleFadeOutDuration),
  boundedExtraRadius: pxNumber(token.RippleBoundedExtraRadius),
  startRadiusLargestDimensionFactor: token.RippleStartRadiusLargestDimensionFactor,
  radiusEasing: token.RippleRadiusEasing,
  centerEasing: token.RippleCenterEasing,
  opacityEasing: token.RippleOpacityEasing,
  focusRing: {
    outerStrokeInset: pxNumber(token.RippleFocusRingOuterStrokeInset),
    outerStrokeWidth: pxNumber(token.RippleFocusRingOuterStrokeWidth),
    innerStrokeInset: pxNumber(token.RippleFocusRingInnerStrokeInset),
    innerStrokeWidth: pxNumber(token.RippleFocusRingInnerStrokeWidth),
    outerStrokeColorRole: colorRole(token.RippleFocusRingOuterStrokeColor),
    innerStrokeColorRole: colorRole(token.RippleFocusRingInnerStrokeColor),
    focusIn: { durationMs: msNumber(token.RippleFocusRingFocusInDuration), easing: token.RippleFocusRingFocusInEasing },
    focusOut: { durationMs: msNumber(token.RippleFocusRingFocusOutDuration), easing: token.RippleFocusRingFocusOutEasing },
  },
} as const;
