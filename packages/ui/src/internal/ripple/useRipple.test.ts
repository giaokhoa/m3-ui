import { describe, expect, it, vi } from 'vitest';
import { chainRipplePressHandlers, type RippleController } from './useRipple';
import type { RipplePressEvent } from './types';

const event = {
  pointerType: 'mouse',
  target: {} as Element,
  x: 12,
  y: 18,
} satisfies RipplePressEvent;

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
});
