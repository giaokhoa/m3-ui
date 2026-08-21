import { rippleTokens } from '@m3/tokens/ripple';
import type { RippleOrigin, RipplePressEvent } from './types';

export interface RippleBounds {
  readonly width: number;
  readonly height: number;
}

export interface RippleWaveGeometry {
  readonly x: number;
  readonly y: number;
  readonly targetX: number;
  readonly targetY: number;
  readonly diameter: number;
  readonly startScale: number;
}

export interface RippleGeometryOptions {
  readonly radius?: number;
}

export function getRippleWaveGeometry(
  event: RipplePressEvent,
  bounds: RippleBounds,
  origin: RippleOrigin,
  { radius }: RippleGeometryOptions = {},
): RippleWaveGeometry {
  const targetX = bounds.width / 2;
  const targetY = bounds.height / 2;
  const shouldCenter =
    origin === 'center' ||
    event.pointerType === 'keyboard' ||
    event.pointerType === 'virtual';

  const x = shouldCenter ? targetX : event.x;
  const y = shouldCenter ? targetY : event.y;
  const endRadius =
    radius ??
    Math.hypot(bounds.width, bounds.height) / 2 +
      rippleTokens.boundedExtraRadius;
  const startRadius =
    Math.max(bounds.width, bounds.height) *
    rippleTokens.startRadiusLargestDimensionFactor;

  return {
    x,
    y,
    targetX,
    targetY,
    diameter: endRadius * 2,
    startScale: Math.min(1, startRadius / endRadius),
  };
}
