import { describe, expect, it } from 'vitest';
import { getRippleWaveGeometry } from './geometry';
import type { RipplePressEvent } from './types';

function pressEvent(
  pointerType: RipplePressEvent['pointerType'],
  x: number,
  y: number,
): RipplePressEvent {
  return {
    pointerType,
    x,
    y,
    target: {} as Element,
  };
}

describe('ripple geometry', () => {
  const bounds = { width: 100, height: 40 };

  it('uses RAC pointer coordinates for pointer presses', () => {
    const geometry = getRippleWaveGeometry(
      pressEvent('mouse', 20, 10),
      bounds,
      'press',
    );

    expect(geometry.x).toBe(20);
    expect(geometry.y).toBe(10);
    expect(geometry.diameter).toBeCloseTo(Math.hypot(80, 30) * 2);
  });

  it.each(['keyboard', 'virtual'] as const)(
    'centers %s presses',
    (pointerType) => {
      const geometry = getRippleWaveGeometry(
        pressEvent(pointerType, 0, 0),
        bounds,
        'press',
      );

      expect(geometry.x).toBe(50);
      expect(geometry.y).toBe(20);
    },
  );

  it('supports centered visual targets such as checkbox indicators', () => {
    const geometry = getRippleWaveGeometry(
      pressEvent('touch', 90, 30),
      bounds,
      'center',
    );

    expect(geometry.x).toBe(50);
    expect(geometry.y).toBe(20);
  });
});
