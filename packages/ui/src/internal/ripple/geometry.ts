import type { RippleOrigin, RipplePressEvent } from './types';

export interface RippleBounds {
  readonly width: number;
  readonly height: number;
}

export interface RippleWaveGeometry {
  readonly x: number;
  readonly y: number;
  readonly diameter: number;
}

export function getRippleWaveGeometry(
  event: RipplePressEvent,
  bounds: RippleBounds,
  origin: RippleOrigin,
): RippleWaveGeometry {
  const shouldCenter =
    origin === 'center' ||
    event.pointerType === 'keyboard' ||
    event.pointerType === 'virtual';

  const x = shouldCenter ? bounds.width / 2 : event.x;
  const y = shouldCenter ? bounds.height / 2 : event.y;
  const radius = Math.hypot(
    Math.max(x, bounds.width - x),
    Math.max(y, bounds.height - y),
  );

  return { x, y, diameter: radius * 2 };
}
