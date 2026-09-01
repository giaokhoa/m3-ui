import { RippleMinimumPressDuration } from '@m3-ui/tokens';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { msNumber } from '../tokenValues';
import {
  chainRipplePressHandlers,
  clearRippleTimers,
  getRippleReleaseDelay,
  type RippleController,
} from './useRipple';
import type { RipplePressEvent } from './types';

const event = {
  pointerType: 'mouse',
  target: {} as Element,
  x: 12,
  y: 18,
} satisfies RipplePressEvent;

const minimumPressDurationMs = msNumber(RippleMinimumPressDuration);

afterEach(() => {
  vi.useRealTimers();
});

describe('Ripple RAC press integration', () => {
  it('chains Ripple lifecycle before caller handlers exactly once', () => {
    const calls: string[] = [];
    const controller = {
      onPressStart: vi.fn(() => calls.push('ripple-start')),
      onPressEnd: vi.fn(() => calls.push('ripple-end')),
    } satisfies Pick<RippleController, 'onPressStart' | 'onPressEnd'>;
    const userStart = vi.fn(() => calls.push('user-start'));
    const userEnd = vi.fn(() => calls.push('user-end'));
    const props = chainRipplePressHandlers(controller, {
      onPressStart: userStart,
      onPressEnd: userEnd,
    });

    props.onPressStart(event);
    props.onPressEnd(event);

    expect(calls).toEqual([
      'ripple-start',
      'user-start',
      'ripple-end',
      'user-end',
    ]);
    expect(controller.onPressStart).toHaveBeenCalledOnce();
    expect(controller.onPressEnd).toHaveBeenCalledOnce();
    expect(userStart).toHaveBeenCalledWith(event);
    expect(userEnd).toHaveBeenCalledWith(event);
  });

  it('keeps a wave alive for the remaining minimum press lifetime', () => {
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
    const timers = new Set<ReturnType<typeof setTimeout>>();
    timers.add(setTimeout(callback, 100));
    timers.add(setTimeout(callback, 200));

    clearRippleTimers(timers);
    vi.runAllTimers();

    expect(timers.size).toBe(0);
    expect(callback).not.toHaveBeenCalled();
  });
});
