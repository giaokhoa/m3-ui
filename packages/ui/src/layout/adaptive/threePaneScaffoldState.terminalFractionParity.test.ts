import { describe, expect, it, vi } from 'vitest';
import { defaultThreePaneScaffoldProgressAnimation } from './threePaneScaffoldState';

describe('defaultThreePaneScaffoldProgressAnimation terminal parity', () => {
  it('emits the terminal fraction once on the final frame', async () => {
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

    try {
      const updates: number[] = [];
      const controller = new AbortController();
      const running = defaultThreePaneScaffoldProgressAnimation({
        from: 0,
        to: 1,
        durationMs: 16,
        signal: controller.signal,
        update: (fraction) => updates.push(fraction),
      });

      frames.shift()!(0);
      frames.shift()!(16);
      await running;

      expect(updates.filter((fraction) => fraction === 1)).toHaveLength(1);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
