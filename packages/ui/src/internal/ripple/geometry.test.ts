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
  const endRadius = Math.hypot(100, 40) / 2 + 10;

  it('starts pointer ripples at RAC coordinates and moves them to center', () => {
    const geometry = getRippleWaveGeometry(
      pressEvent('mouse', 20, 10),
      bounds,
      'press',
    );

    expect(geometry.x).toBe(20);
    expect(geometry.y).toBe(10);
    expect(geometry.targetX).toBe(50);
    expect(geometry.targetY).toBe(20);
    expect(geometry.diameter).toBeCloseTo(endRadius * 2);
    expect(geometry.startScale).toBeCloseTo(30 / endRadius);
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
      expect(geometry.targetX).toBe(50);
      expect(geometry.targetY).toBe(20);
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

  it('supports the fixed unbounded radius used by Material Checkbox', () => {
    const checkboxBounds = { width: 48, height: 48 };
    const geometry = getRippleWaveGeometry(
      pressEvent('mouse', 24, 24),
      checkboxBounds,
      'center',
      { radius: 20 },
    );

    expect(geometry.diameter).toBe(40);
    expect(geometry.startScale).toBeCloseTo(14.4 / 20);
  });
});
