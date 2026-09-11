import { describe, expect, it } from 'vitest';
import { calculateAnimationSpringDurationMs } from './animationSpring';

const ComposeMaxLongMillis = 9_223_372_036_854;

describe('animation spring zero-damping duration parity', () => {
  it('uses the SpringEstimation Long-safe infinite duration sentinel', () => {
    const spec = { dampingRatio: 0, stiffness: 380 } as const;
    expect(calculateAnimationSpringDurationMs(spec, 100, 0, 1)).toBe(
      ComposeMaxLongMillis,
    );
    expect(calculateAnimationSpringDurationMs(spec, 0, 0, 1)).toBe(
      ComposeMaxLongMillis,
    );
  });
});
