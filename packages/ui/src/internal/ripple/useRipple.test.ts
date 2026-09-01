import { describe, expect, it, vi } from 'vitest';
import {
  chainRipplePressHandlers,
  clearRippleTimers,
  getRippleReleaseDelay,
} from './useRipple';
import type { RipplePressEvent } from './types';

function pressEvent(pointerType: RipplePressEvent['pointerType']): RipplePressEvent {
  return {
    pointerType,
    x: 12,
    y: 18,
    target: document.createElement('span'),
  };
}

describe('useRipple helpers', () => {
  it('chains user press handlers after the ripple controller', () => {
    const order: string[] = [];
    const controller = {
      onPressStart: vi.fn(() => order.push('ripple-start')),
      onPressEnd: vi.fn(() => order.push('ripple-end')),
    };
    const handlers = chainRipplePressHandlers(controller, {
      onPressStart: () => order.push('user-start'),
      onPressEnd: () => order.push('user-end'),
    });
    const event = pressEvent('mouse');

    handlers.onPressStart(event);
    handlers.onPressEnd(event);

    expect(order).toEqual([
      'ripple-start',
      'user-start',
      'ripple-end',
      'user-end',
    ]);
  });

  it('does not require user handlers', () => {
    const controller = {
      onPressStart: vi.fn(),
      onPressEnd: vi.fn(),
    };
    const handlers = chainRipplePressHandlers(controller);
    const event = pressEvent('touch');

    handlers.onPressStart(event);
    handlers.onPressEnd(event);

    expect(controller.onPressStart).toHaveBeenCalledWith(event);
    expect(controller.onPressEnd).toHaveBeenCalledTimes(1);
  });

  it('keeps a ripple pressed for the Material minimum duration', () => {
    const startedAt = 1_000;

    expect(getRippleReleaseDelay(startedAt, startedAt)).toBe(
      minimumPressDurationMs,
    );
    expect(
      getRippleReleaseDelay(
        startedAt,
        startedAt + minimumPressDurationMs - 1,
      ),
    ).toBe(1);
    expect(
      getRippleReleaseDelay(
        startedAt,
        startedAt + minimumPressDurationMs + 100,
      ),
    ).toBe(0);
  });

  it('clears pending lifecycle timers during cleanup', () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const timers = new Set<ReturnType<typeof window.setTimeout>>();
    timers.add(window.setTimeout(callback, 100));
    timers.add(window.setTimeout(callback, 200));

    clearRippleTimers(timers);
    vi.runAllTimers();

    expect(timers.size).toBe(0);
    expect(callback).not.toHaveBeenCalled();
  });
});
